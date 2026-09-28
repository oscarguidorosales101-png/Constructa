/**
 * Sistema de Permisos Paramétricos de CONSTRUCTA
 * 
 * Centraliza la matriz de control de acceso por roles empresariales:
 * - Administrador: Gestión general corporativa, finanzas, proyectos, materiales y operaciones globales.
 * - Gerente de Construcción: Operación de obras, cuadrillas, inventario, gastos de proyectos y agenda.
 * - RRHH / Reclutamiento: Candidatos, entrevistas laborales, agenda de citas y contratación.
 */

export const ROLES = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente de Construcción',
  RRHH: 'RRHH / Reclutamiento',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'dashboard',
    'proyectos',
    'empleados',
    'materiales',
    'proveedores',
    'presupuestos',
    'gastos',
    'cronograma',
    'avance',
    'reportes',
    'agenda',
  ],
  [ROLES.GERENTE]: [
    'dashboard',
    'proyectos',
    'empleados',
    'materiales',
    'proveedores',
    'gastos',
    'cronograma',
    'avance',
    'reportes',
    'agenda',
  ],
  [ROLES.RRHH]: [
    'dashboard',
    'postulantes',
    'entrevistas',
    'agenda',
    'empleados',
  ],
};

/**
 * Verifica si un rol cuenta con permiso de acceso a una ruta o módulo específico.
 * @param {string} userRole - Rol del usuario actual
 * @param {string} routeKey - Clave de la ruta (ej. 'proyectos', 'entrevistas')
 * @returns {boolean}
 */
export const hasPermission = (userRole, routeKey) => {
  if (!userRole || !routeKey) return false;
  const allowedRoutes = ROLE_PERMISSIONS[userRole] || [];
  return allowedRoutes.includes(routeKey);
};

/**
 * Retorna las rutas permitidas para un rol específico.
 * @param {string} userRole 
 * @returns {string[]}
 */
export const getAllowedRoutesForRole = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

export default {
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  getAllowedRoutesForRole,
};
