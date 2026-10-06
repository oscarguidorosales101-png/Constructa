/**
 * CONSTRUCTA - roleService
 * Gestión paramétrica y persistente de roles y permisos del sistema
 * Flujo: UI -> roleService -> API (/api/roles) -> db.json -> UI
 */

import storageService from './storageService.js';

const STORAGE_KEY = 'constructa_roles';

export const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard Ejecutivo', category: 'General' },
  { id: 'usuarios-roles', label: 'Gestión de Usuarios y Roles', category: 'Administración' },
  { id: 'proyectos', label: 'Proyectos de Construcción', category: 'Operaciones' },
  { id: 'solicitudes-clientes', label: 'Solicitudes y Soporte', category: 'Clientes' },
  { id: 'portal-cliente', label: 'Portal del Cliente', category: 'Clientes' },
  { id: 'empleados', label: 'Personal de Obra y Cuadrillas', category: 'Talento' },
  { id: 'postulantes', label: 'Candidatos y Reclutamiento', category: 'Talento' },
  { id: 'entrevistas', label: 'Agenda de Entrevistas', category: 'Talento' },
  { id: 'agenda', label: 'Agenda Central de Obras', category: 'Operaciones' },
  { id: 'materiales', label: 'Materiales e Inventario', category: 'Suministros' },
  { id: 'proveedores', label: 'Gestión de Proveedores', category: 'Suministros' },
  { id: 'presupuestos', label: 'Presupuestos y Partidas', category: 'Finanzas' },
  { id: 'gastos', label: 'Control de Gastos de Obra', category: 'Finanzas' },
  { id: 'cronograma', label: 'Cronograma y Fases', category: 'Operaciones' },
  { id: 'avance', label: 'Avance Físico de Obra', category: 'Operaciones' },
  { id: 'reportes', label: 'Reportes y Estadísticas', category: 'General' },
  { id: 'proyeccion-futuro', label: 'Proyección al Futuro (IA)', category: 'Administración' }
];

export const BASE_SYSTEM_ROLES = [
  {
    id: 'ROL-001',
    codigo: 'ADMIN',
    nombre: 'Administrador General',
    descripcion: 'Control total de la plataforma, usuarios, roles, finanzas, proyección de IA y configuración.',
    permisos: ALL_MODULES.map((m) => m.id),
    esSistema: true,
    activo: true
  },
  {
    id: 'ROL-002',
    codigo: 'GERENTE',
    nombre: 'Gerente de Construcción',
    descripcion: 'Gestión técnica y operativa de proyectos, avances, materiales, gastos, cronogramas y personal.',
    permisos: [
      'dashboard',
      'proyectos',
      'solicitudes-clientes',
      'empleados',
      'materiales',
      'proveedores',
      'gastos',
      'cronograma',
      'avance',
      'avances',
      'reportes',
      'agenda'
    ],
    esSistema: true,
    activo: true
  },
  {
    id: 'ROL-003',
    codigo: 'RRHH',
    nombre: 'Recursos Humanos / Reclutamiento',
    descripcion: 'Gestión integral de talento humano, candidatos, programación de entrevistas y nómina operativa.',
    permisos: [
      'dashboard',
      'postulantes',
      'candidatos',
      'entrevistas',
      'agenda',
      'empleados'
    ],
    esSistema: true,
    activo: true
  },
  {
    id: 'ROL-004',
    codigo: 'ENTREVISTADOR',
    nombre: 'Entrevistador',
    descripcion: 'Evaluación técnica de candidatos, retroalimentación de entrevistas laborales y agenda.',
    permisos: [
      'dashboard',
      'entrevistas',
      'postulantes',
      'candidatos',
      'agenda'
    ],
    esSistema: true,
    activo: true
  },
  {
    id: 'ROL-005',
    codigo: 'CLIENTE',
    nombre: 'Cliente',
    descripcion: 'Acceso exclusivo al Portal del Cliente, seguimiento de avance de sus obras y solicitudes.',
    permisos: [
      'portal-cliente',
      'solicitudes-clientes',
      'mis-solicitudes',
      'mis-proyectos',
      'reuniones-cliente',
      'documentos-cliente',
      'pagos-cliente',
      'mensajes-cliente',
      'perfil-cliente'
    ],
    esSistema: true,
    activo: true
  },
  {
    id: 'ROL-006',
    codigo: 'PROVEEDOR',
    nombre: 'Proveedor',
    descripcion: 'Consulta de órdenes de compra, catálogo de insumos y comunicación de despacho.',
    permisos: [
      'portal-proveedor',
      'solicitudes-clientes',
      'proveedores',
      'materiales'
    ],
    esSistema: true,
    activo: true
  },
  {
    id: 'ROL-007',
    codigo: 'INVITADO',
    nombre: 'Usuario / Invitado',
    descripcion: 'Acceso de consulta básica sin permisos de modificación ni operaciones financieras.',
    permisos: [
      'dashboard',
      'proyectos'
    ],
    esSistema: false,
    activo: true
  }
];

export const roleService = {
  /**
   * Obtiene la lista completa de roles persistidos en el sistema
   */
  async getRoles() {
    try {
      const res = await fetch('/api/roles');
      if (res.ok) {
        const roles = await res.json();
        if (Array.isArray(roles) && roles.length > 0) {
          storageService.set(STORAGE_KEY, roles);
          return roles;
        }
      }
    } catch (_) {}

    const cached = storageService.get(STORAGE_KEY, null);
    if (Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    storageService.set(STORAGE_KEY, BASE_SYSTEM_ROLES);
    return BASE_SYSTEM_ROLES;
  },

  /**
   * Valida la información requerida para crear un rol
   */
  validateRoleData(roleData) {
    const errors = {};
    if (!roleData.nombre || !roleData.nombre.trim()) {
      errors.nombre = 'El nombre del rol es obligatorio.';
    }
    if (!Array.isArray(roleData.permisos) || roleData.permisos.length === 0) {
      errors.permisos = 'Debe seleccionar al menos un permiso para el rol.';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Crea o actualiza un rol persistiendo en db.json
   */
  async saveRole(roleData) {
    const validation = this.validateRoleData(roleData);
    if (!validation.isValid) {
      const first = Object.values(validation.errors)[0];
      return { ok: false, error: first, errors: validation.errors };
    }

    const isNew = !roleData.id;
    const url = isNew ? '/api/roles' : `/api/roles/${roleData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...roleData,
      nombre: roleData.nombre.trim(),
      codigo: roleData.codigo || roleData.nombre.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 15),
      descripcion: roleData.descripcion ? roleData.descripcion.trim() : '',
      permisos: Array.isArray(roleData.permisos) ? roleData.permisos : ['dashboard'],
      activo: roleData.activo !== undefined ? Boolean(roleData.activo) : true,
      esSistema: Boolean(roleData.esSistema)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        return { ok: false, error: `Error ${res.status} al guardar rol` };
      }

      const result = await res.json();
      const savedRole = result.data || result.item || result.role || payload;

      // Sincronizar cache local
      const current = await this.getRoles();
      const exists = current.some((r) => r.id === savedRole.id);
      const updated = exists
        ? current.map((r) => (r.id === savedRole.id ? savedRole : r))
        : [...current, savedRole];
      storageService.set(STORAGE_KEY, updated);

      return Object.assign(savedRole, { ok: true, role: savedRole });
    } catch (err) {
      console.error('roleService.saveRole error:', err);
      // Fallback local garantizado
      const current = storageService.get(STORAGE_KEY, BASE_SYSTEM_ROLES);
      const newId = roleData.id || `ROL-${String(Date.now()).slice(-3)}`;
      const fallbackRole = { ...payload, id: newId };
      const exists = current.some((r) => r.id === fallbackRole.id);
      const updated = exists
        ? current.map((r) => (r.id === fallbackRole.id ? fallbackRole : r))
        : [...current, fallbackRole];
      storageService.set(STORAGE_KEY, updated);
      return Object.assign(fallbackRole, { ok: true, role: fallbackRole });
    }
  },

  /**
   * Elimina un rol custom (los roles de sistema están protegidos)
   */
  async deleteRole(id) {
    const roles = await this.getRoles();
    const target = roles.find((r) => r.id === id);

    if (target && target.esSistema) {
      return { ok: false, error: 'No es posible eliminar un rol base del sistema.' };
    }

    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.warn(`Error ${res.status} al eliminar rol`);
      }
    } catch (err) {
      console.warn('roleService.deleteRole API delete fallback:', err.message);
    }

    const updated = roles.filter((r) => r.id !== id);
    storageService.set(STORAGE_KEY, updated);
    return { ok: true };
  }
};

export default roleService;
