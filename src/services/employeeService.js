/**
 * CONSTRUCTA - employeeService
 * Arquitectura: Componente -> employeeService -> API (/api/employees) -> db.json
 * 
 * Gestiona el alta, edición y baja de colaboradores con persistencia real en db.json.
 */

import storageService from './storageService.js';
import dataService from './dataService.js';

const STORAGE_KEY = 'empleados';

export const employeeService = {
  /**
   * Obtiene todos los empleados desde el backend simulado
   */
  async getEmployees() {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const employees = await res.json();
        if (Array.isArray(employees)) {
          storageService.set(STORAGE_KEY, employees);
          return employees;
        }
      }
    } catch (_) {}
    return dataService.getEmployees();
  },

  /**
   * Crea o actualiza un colaborador en el backend simulado (db.json)
   */
  async saveEmployee(employeeData) {
    const isNew = !employeeData.id;
    const url = isNew ? '/api/employees' : `/api/employees/${employeeData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...employeeData,
      nombre: (employeeData.nombre || '').trim(),
      puesto: employeeData.puesto || 'Especialista de Obra',
      estado: employeeData.estado || 'Activo',
      fechaIngreso: employeeData.fechaIngreso || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        return {
          ok: false,
          error: 'No se pudo guardar la información. Verifica la conexión con el sistema.'
        };
      }

      const result = await res.json();
      const savedEmployee = result.employee || result.data || payload;
      const updatedList = result.employees || (await this.getEmployees());

      // Sincronizar cache local
      storageService.set(STORAGE_KEY, updatedList);

      return {
        ok: true,
        employee: savedEmployee,
        employees: updatedList
      };
    } catch (err) {
      return {
        ok: false,
        error: 'No se pudo guardar la información. Verifica la conexión con el sistema.'
      };
    }
  },

  /**
   * Elimina un colaborador en el backend simulado (db.json)
   */
  async deleteEmployee(id) {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        return {
          ok: false,
          error: 'No se pudo eliminar el colaborador. Verifica la conexión con el sistema.'
        };
      }

      const result = await res.json();
      const updatedList = result.employees || (await this.getEmployees());
      storageService.set(STORAGE_KEY, updatedList);

      return {
        ok: true,
        employees: updatedList
      };
    } catch (err) {
      return {
        ok: false,
        error: 'No se pudo eliminar el colaborador. Verifica la conexión con el sistema.'
      };
    }
  }
};

export default employeeService;
