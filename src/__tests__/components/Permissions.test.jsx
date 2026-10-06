import { describe, it, expect, beforeEach } from 'vitest';
import { hasPermission, getRolePermissions } from '../../utils/permissions.js';

describe('Sistema de Permisos y Control de Acceso por Roles', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Administrador General tiene acceso universal a todos los módulos y funciones', () => {
    const adminUser = { id: 'USR-001', rol: 'Administrador General' };

    expect(hasPermission(adminUser, 'usuarios-roles')).toBe(true);
    expect(hasPermission(adminUser, 'proyeccion-futuro')).toBe(true);
    expect(hasPermission(adminUser, 'proyectos')).toBe(true);
    expect(hasPermission(adminUser, 'presupuestos')).toBe(true);
    expect(hasPermission(adminUser, 'rrhh')).toBe(true);
    expect(hasPermission(adminUser, 'proveedores')).toBe(true);
  });

  it('2. Gerente de Construcción accede a proyectos y obras pero NO a Usuarios/Roles ni Proyección IA', () => {
    const gerenteUser = { id: 'USR-002', rol: 'Gerente de Construcción' };

    expect(hasPermission(gerenteUser, 'proyectos')).toBe(true);
    expect(hasPermission(gerenteUser, 'avances')).toBe(true);
    expect(hasPermission(gerenteUser, 'materiales')).toBe(true);
    expect(hasPermission(gerenteUser, 'cronograma')).toBe(true);

    // Módulos denegados
    expect(hasPermission(gerenteUser, 'usuarios-roles')).toBe(false);
    expect(hasPermission(gerenteUser, 'proyeccion-futuro')).toBe(false);
    expect(hasPermission(gerenteUser, 'rrhh')).toBe(false);
  });

  it('3. Recursos Humanos accede a reclutamiento y candidatos pero NO a compras ni Proyección IA', () => {
    const rrhhUser = { id: 'USR-003', rol: 'Recursos Humanos / Reclutamiento' };

    expect(hasPermission(rrhhUser, 'candidatos')).toBe(true);
    expect(hasPermission(rrhhUser, 'entrevistas')).toBe(true);
    expect(hasPermission(rrhhUser, 'empleados')).toBe(true);

    // Módulos denegados
    expect(hasPermission(rrhhUser, 'usuarios-roles')).toBe(false);
    expect(hasPermission(rrhhUser, 'proyeccion-futuro')).toBe(false);
    expect(hasPermission(rrhhUser, 'compras')).toBe(false);
    expect(hasPermission(rrhhUser, 'presupuestos')).toBe(false);
  });

  it('4. Entrevistador tiene acceso restringido ÚNICAMENTE a sus entrevistas y candidatos asignados', () => {
    const entrevistadorUser = { id: 'USR-004', rol: 'Entrevistador' };

    expect(hasPermission(entrevistadorUser, 'entrevistas')).toBe(true);
    expect(hasPermission(entrevistadorUser, 'candidatos')).toBe(true);

    // Módulos denegados
    expect(hasPermission(entrevistadorUser, 'usuarios-roles')).toBe(false);
    expect(hasPermission(entrevistadorUser, 'proyeccion-futuro')).toBe(false);
    expect(hasPermission(entrevistadorUser, 'proyectos')).toBe(false);
    expect(hasPermission(entrevistadorUser, 'presupuestos')).toBe(false);
    expect(hasPermission(entrevistadorUser, 'compras')).toBe(false);
    expect(hasPermission(entrevistadorUser, 'empleados')).toBe(false);
  });

  it('5. Cliente tiene acceso restringido exclusivamente a su portal de cliente', () => {
    const clienteUser = { id: 'USR-005', rol: 'Cliente' };

    expect(hasPermission(clienteUser, 'portal-cliente')).toBe(true);

    // Módulos denegados
    expect(hasPermission(clienteUser, 'usuarios-roles')).toBe(false);
    expect(hasPermission(clienteUser, 'proyeccion-futuro')).toBe(false);
    expect(hasPermission(clienteUser, 'dashboard')).toBe(false);
    expect(hasPermission(clienteUser, 'proyectos')).toBe(false);
  });

  it('6. Evalúa permisos dinámicos para roles creados por el Administrador', () => {
    // Simular un rol dinámico guardado en localStorage
    const customRole = {
      id: 'ROL-099',
      nombre: 'Coordinador de Logística',
      permisos: ['materiales', 'proveedores', 'compras']
    };
    localStorage.setItem('constructa_roles', JSON.stringify([customRole]));

    const logisticaUser = { id: 'USR-010', rol: 'Coordinador de Logística' };

    expect(hasPermission(logisticaUser, 'materiales')).toBe(true);
    expect(hasPermission(logisticaUser, 'proveedores')).toBe(true);
    expect(hasPermission(logisticaUser, 'compras')).toBe(true);

    // Denegados
    expect(hasPermission(logisticaUser, 'usuarios-roles')).toBe(false);
    expect(hasPermission(logisticaUser, 'proyeccion-futuro')).toBe(false);
    expect(hasPermission(logisticaUser, 'presupuestos')).toBe(false);
  });
});
