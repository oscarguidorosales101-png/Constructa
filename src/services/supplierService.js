/**
 * CONSTRUCTA - supplierService
 * Arquitectura: Componente -> supplierService -> API (/api/suppliers) -> db.json
 * 
 * Gestiona el ciclo de vida completo de proveedores con persistencia real en db.json.
 */

import storageService from './storageService.js';
import dataService from './dataService.js';

const STORAGE_KEY = 'proveedores';

export const supplierService = {
  /**
   * Obtiene todos los proveedores desde el backend simulado
   */
  async getSuppliers() {
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const suppliers = await res.json();
        if (Array.isArray(suppliers)) {
          storageService.set(STORAGE_KEY, suppliers);
          return suppliers;
        }
      }
    } catch (_) {}
    return dataService.getSuppliers();
  },

  /**
   * Valida los campos de un proveedor
   */
  validateSupplierData(supplierData) {
    const errors = {};
    const name = (supplierData.nombre || supplierData.nombreComercial || '').trim();
    if (!name) {
      errors.nombre = 'El nombre o razón social del proveedor es obligatorio.';
    }
    const email = (supplierData.email || '').trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'El formato de correo no es válido.';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Crea o actualiza un proveedor en el backend simulado (db.json)
   */
  async saveSupplier(supplierData) {
    const isNew = !supplierData.id;
    const url = isNew ? '/api/suppliers' : `/api/suppliers/${supplierData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...supplierData,
      nombreComercial: supplierData.nombreComercial || supplierData.nombre || '',
      categoria: supplierData.categoria || supplierData.especialidad || 'General',
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
      const savedSupplier = result.supplier || result.data || payload;
      const updatedList = result.suppliers || (await this.getSuppliers());

      // Sincronizar cache local
      storageService.set(STORAGE_KEY, updatedList);

      return {
        ok: true,
        supplier: savedSupplier,
        suppliers: updatedList
      };
    } catch (err) {
      return {
        ok: false,
        error: 'No se pudo guardar la información. Verifica la conexión con el sistema.'
      };
    }
  },

  /**
   * Elimina un proveedor en el backend simulado (db.json)
   */
  async deleteSupplier(id) {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        return {
          ok: false,
          error: 'No se pudo eliminar el proveedor. Verifica la conexión con el sistema.'
        };
      }

      const result = await res.json();
      const updatedList = result.suppliers || (await this.getSuppliers());
      storageService.set(STORAGE_KEY, updatedList);

      return {
        ok: true,
        suppliers: updatedList
      };
    } catch (err) {
      return {
        ok: false,
        error: 'No se pudo eliminar el proveedor. Verifica la conexión con el sistema.'
      };
    }
  }
};

export default supplierService;
