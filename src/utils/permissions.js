/**
 * Sistema de Permisos Paramétricos y Dinámicos de CONSTRUCTA
 * 
 * Centraliza la matriz de control de acceso por roles empresariales:
 * - Soporta roles base del sistema y roles personalizados creados por el Administrador.
 * - Verifica permisos tanto de forma estática como dinámica mediante db.json/storage.
 */

export const ROLES = {
  ADMIN: 'Administrador General',
  ADMIN_ALT: 'Administrador',
  GERENTE: 'Gerente de Construcción',
  RRHH: 'Recursos Humanos / Reclutamiento',
  ENTREVISTADOR: 'Entrevistador',
  CLIENTE: 'Cliente',
  PROVEEDOR: 'Proveedor',
  INVITADO: 'Usuario / Invitado'
};

export const ROLE_PERMISSIONS = {
  'Administrador General': [
    'dashboard',
    'usuarios-roles',
    'proyectos',
    'solicitudes-clientes',
    'portal-cliente',
    'empleados',
    'postulantes',
    'candidatos',
    'rrhh',
    'entrevistas',
    'agenda',
    'materiales',
    'proveedores',
    'presupuestos',
    'gastos',
    'cronograma',
    'avance',
    'avances',
    'reportes',
    'proyeccion-futuro',
    'compras'
  ],
  'Administrador': [
    'dashboard',
    'usuarios-roles',
    'proyectos',
    'solicitudes-clientes',
    'portal-cliente',
    'empleados',
    'postulantes',
    'candidatos',
    'rrhh',
    'entrevistas',
    'agenda',
    'materiales',
    'proveedores',
    'presupuestos',
    'gastos',
    'cronograma',
    'avance',
    'avances',
    'reportes',
    'proyeccion-futuro',
    'compras'
  ],
  'Gerente de Construcción': [
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
  'Recursos Humanos / Reclutamiento': [
    'dashboard',
    'postulantes',
    'candidatos',
    'rrhh',
    'entrevistas',
    'agenda',
    'empleados'
  ],
  'Entrevistador': [
    'dashboard',
    'entrevistas',
    'postulantes',
    'candidatos',
    'agenda'
  ],
  'Cliente': [
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
  'Proveedor': [
    'portal-proveedor',
    'solicitudes-clientes',
    'proveedores',
    'materiales'
  ],
  'Usuario / Invitado': [
    'dashboard',
    'proyectos'
  ]
};

/**
 * Verifica si un rol o usuario cuenta con permiso de acceso a una ruta o módulo específico.
 * @param {string|object} userOrRole - Rol del usuario (string) o el objeto usuario ({ rol: '...' })
 * @param {string} routeKey - Clave de la ruta (ej. 'proyectos', 'usuarios-roles')
 * @param {Array} customRoles - Lista opcional de roles dinámicos en memoria
 * @returns {boolean}
 */
export const hasPermission = (userOrRole, routeKey, customRoles = null) => {
  if (!userOrRole || !routeKey) return false;
  const roleStr = typeof userOrRole === 'object' && userOrRole !== null ? (userOrRole.rol || userOrRole.role) : userOrRole;
  if (!roleStr) return false;
  const cleanRole = String(roleStr).trim();

  // El Administrador General siempre posee acceso a todo el sistema
  if (cleanRole === 'Administrador' || cleanRole === 'Administrador General') {
    return true;
  }

  // 1. Intentar evaluar contra roles dinámicos persistidos
  let rolesList = customRoles;
  if (!rolesList && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('constructa_roles');
      if (stored) {
        rolesList = JSON.parse(stored);
      }
    } catch (_) {}
  }

  if (Array.isArray(rolesList)) {
    const foundRole = rolesList.find(
      (r) =>
        (r.nombre && r.nombre.toLowerCase() === cleanRole.toLowerCase()) ||
        (r.codigo && r.codigo.toLowerCase() === cleanRole.toLowerCase())
    );

    if (foundRole) {
      if (foundRole.activo === false) {
        return false;
      }
      if (Array.isArray(foundRole.permisos)) {
        return foundRole.permisos.includes(routeKey);
      }
    }
  }

  // 2. Fallback a la matriz base de permisos estáticos
  const directMatch = ROLE_PERMISSIONS[cleanRole];
  if (directMatch) {
    return directMatch.includes(routeKey);
  }

  // Búsqueda insensible a mayúsculas
  const matchedKey = Object.keys(ROLE_PERMISSIONS).find(
    (k) => k.toLowerCase() === cleanRole.toLowerCase()
  );
  if (matchedKey) {
    return ROLE_PERMISSIONS[matchedKey].includes(routeKey);
  }

  return false;
};

/**
 * Retorna las rutas permitidas para un rol específico.
 * @param {string|object} userOrRole 
 * @param {Array} customRoles
 * @returns {string[]}
 */
export const getAllowedRoutesForRole = (userOrRole, customRoles = null) => {
  if (!userOrRole) return [];
  const roleStr = typeof userOrRole === 'object' && userOrRole !== null ? (userOrRole.rol || userOrRole.role) : userOrRole;
  if (!roleStr) return [];
  const cleanRole = String(roleStr).trim();

  if (cleanRole === 'Administrador' || cleanRole === 'Administrador General') {
    return ROLE_PERMISSIONS['Administrador General'];
  }

  let rolesList = customRoles;
  if (!rolesList && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('constructa_roles');
      if (stored) {
        rolesList = JSON.parse(stored);
      }
    } catch (_) {}
  }

  if (Array.isArray(rolesList)) {
    const foundRole = rolesList.find(
      (r) =>
        (r.nombre && r.nombre.toLowerCase() === cleanRole.toLowerCase()) ||
        (r.codigo && r.codigo.toLowerCase() === cleanRole.toLowerCase())
    );
    if (foundRole && Array.isArray(foundRole.permisos)) {
      return foundRole.permisos;
    }
  }

  return ROLE_PERMISSIONS[cleanRole] || [];
};

/**
 * Retorna la ruta inicial recomendada para cada rol.
 * @param {string|object} userOrRole 
 * @returns {string}
 */
export const getDefaultRouteForRole = (userOrRole) => {
  const roleStr = typeof userOrRole === 'object' && userOrRole !== null ? (userOrRole.rol || userOrRole.role) : userOrRole;
  if (!roleStr) return 'login';
  const clean = String(roleStr).trim();

  switch (clean) {
    case 'Cliente':
      return 'portal-cliente';
    case 'Proveedor':
      return 'portal-proveedor';
    case 'Entrevistador':
      return 'entrevistas';
    case 'Recursos Humanos / Reclutamiento':
      return 'postulantes';
    case 'Gerente de Construcción':
      return 'proyectos';
    case 'Administrador':
    case 'Administrador General':
    default:
      return 'dashboard';
  }
};
