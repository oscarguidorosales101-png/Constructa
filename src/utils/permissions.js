/**
 * Sistema de Permisos Paramétricos y Dinámicos de CONSTRUCTA
 * 
 * Centraliza la matriz de control de acceso por roles empresariales:
 * - Soporta roles base del sistema y roles personalizados creados por el Administrador.
 * - Normaliza variaciones de nombres de roles ('admin', 'Administrador', 'RRHH / Reclutamiento', etc.)
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

/**
 * Normaliza cualquier variante de nombre o código de rol a su forma canónica oficial.
 * @param {string|object} roleInput - Rol en string o entidad de usuario { rol: '...' }
 * @returns {string}
 */
export const normalizeRole = (roleInput) => {
  if (!roleInput) return '';
  const roleStr = typeof roleInput === 'object' && roleInput !== null
    ? (roleInput.rol || roleInput.role || roleInput.nombre || roleInput.codigo || '')
    : roleInput;

  const r = String(roleStr).trim().toLowerCase();
  if (!r) return '';

  if (
    r === 'admin' ||
    r === 'administrador' ||
    r === 'administrador general' ||
    r === 'director general' ||
    r === 'director' ||
    r === 'superadmin'
  ) {
    return 'Administrador';
  }

  if (
    r === 'gerente' ||
    r === 'gerente de construcción' ||
    r === 'gerente de construccion' ||
    r === 'gerente_construccion' ||
    r === 'gerente-construccion' ||
    r === 'gerencia' ||
    r === 'residente'
  ) {
    return 'Gerente de Construcción';
  }

  if (
    r === 'rrhh' ||
    r === 'rrhh / reclutamiento' ||
    r === 'recursos humanos' ||
    r === 'recursos humanos / reclutamiento' ||
    r === 'reclutamiento' ||
    r === 'talento'
  ) {
    return 'Recursos Humanos / Reclutamiento';
  }

  if (r.includes('entrevistador') || r === 'entrevistas') {
    return 'Entrevistador';
  }

  if (r === 'cliente' || r === 'client') {
    return 'Cliente';
  }

  if (r === 'proveedor' || r === 'supplier') {
    return 'Proveedor';
  }

  if (
    r === 'invitado' ||
    r === 'usuario / invitado' ||
    r === 'usuario' ||
    r === 'colaborador' ||
    r === 'user'
  ) {
    return 'Usuario / Invitado';
  }

  // Devolver el rol limpio si es un rol personalizado
  return String(roleStr).trim();
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
  'RRHH / Reclutamiento': [
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
  'Entrevistador Técnico': [
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
    'proveedores',
    'materiales',
    'solicitudes-clientes'
  ],
  'Usuario / Invitado': [
    'dashboard',
    'proyectos'
  ]
};

// Aliases directos para tolerancia completa de mayúsculas/minúsculas y códigos
ROLE_PERMISSIONS['admin'] = ROLE_PERMISSIONS['Administrador'];
ROLE_PERMISSIONS['ADMIN'] = ROLE_PERMISSIONS['Administrador'];
ROLE_PERMISSIONS['gerente'] = ROLE_PERMISSIONS['Gerente de Construcción'];
ROLE_PERMISSIONS['GERENTE'] = ROLE_PERMISSIONS['Gerente de Construcción'];
ROLE_PERMISSIONS['rrhh'] = ROLE_PERMISSIONS['Recursos Humanos / Reclutamiento'];
ROLE_PERMISSIONS['RRHH'] = ROLE_PERMISSIONS['Recursos Humanos / Reclutamiento'];
ROLE_PERMISSIONS['entrevistador'] = ROLE_PERMISSIONS['Entrevistador'];
ROLE_PERMISSIONS['cliente'] = ROLE_PERMISSIONS['Cliente'];
ROLE_PERMISSIONS['proveedor'] = ROLE_PERMISSIONS['Proveedor'];

/**
 * Verifica si un rol o usuario cuenta con permiso de acceso a una ruta o módulo específico.
 * @param {string|object} userOrRole - Rol del usuario (string) o el objeto usuario ({ rol: '...' })
 * @param {string} routeKey - Clave de la ruta (ej. 'proyectos', 'usuarios-roles')
 * @param {Array} customRoles - Lista opcional de roles dinámicos en memoria
 * @returns {boolean}
 */
export const hasPermission = (userOrRole, routeKey, customRoles = null) => {
  if (!userOrRole || !routeKey) return false;
  const rawRole = typeof userOrRole === 'object' && userOrRole !== null
    ? (userOrRole.rol || userOrRole.role || userOrRole.nombre)
    : userOrRole;
  if (!rawRole) return false;

  const normalized = normalizeRole(rawRole);
  const cleanRaw = String(rawRole).trim();

  // El Administrador siempre posee acceso irrestricto a todo el sistema
  if (normalized === 'Administrador') {
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
    const foundRole = rolesList.find((r) => {
      const rNorm = normalizeRole(r.nombre || r.codigo);
      return (
        rNorm === normalized ||
        (r.nombre && r.nombre.toLowerCase() === cleanRaw.toLowerCase()) ||
        (r.codigo && r.codigo.toLowerCase() === cleanRaw.toLowerCase())
      );
    });

    if (foundRole) {
      if (foundRole.activo === false) {
        return false;
      }
      if (Array.isArray(foundRole.permisos)) {
        return foundRole.permisos.includes(routeKey);
      }
    }
  }

  // 2. Coincidencia directa contra la matriz estática por nombre normalizado
  if (ROLE_PERMISSIONS[normalized] && ROLE_PERMISSIONS[normalized].includes(routeKey)) {
    return true;
  }

  // 3. Fallback directo con el string original
  if (ROLE_PERMISSIONS[cleanRaw] && ROLE_PERMISSIONS[cleanRaw].includes(routeKey)) {
    return true;
  }

  // 4. Búsqueda insensible a mayúsculas
  const matchedKey = Object.keys(ROLE_PERMISSIONS).find(
    (k) => k.toLowerCase() === cleanRaw.toLowerCase() || normalizeRole(k) === normalized
  );
  if (matchedKey && ROLE_PERMISSIONS[matchedKey].includes(routeKey)) {
    return true;
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
  const rawRole = typeof userOrRole === 'object' && userOrRole !== null
    ? (userOrRole.rol || userOrRole.role)
    : userOrRole;
  if (!rawRole) return [];

  const normalized = normalizeRole(rawRole);
  if (normalized === 'Administrador') {
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
    const foundRole = rolesList.find((r) => {
      const rNorm = normalizeRole(r.nombre || r.codigo);
      return (
        rNorm === normalized ||
        (r.nombre && r.nombre.toLowerCase() === String(rawRole).trim().toLowerCase())
      );
    });
    if (foundRole && Array.isArray(foundRole.permisos)) {
      return foundRole.permisos;
    }
  }

  return ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS[String(rawRole).trim()] || [];
};

/**
 * Retorna la ruta inicial recomendada para cada rol.
 * @param {string|object} userOrRole 
 * @returns {string}
 */
export const getDefaultRouteForRole = (userOrRole) => {
  if (!userOrRole) return 'login';
  const rawRole = typeof userOrRole === 'object' && userOrRole !== null
    ? (userOrRole.rol || userOrRole.role)
    : userOrRole;
  if (!rawRole) return 'login';

  const normalized = normalizeRole(rawRole);

  switch (normalized) {
    case 'Cliente':
      return 'portal-cliente';
    case 'Proveedor':
      return 'proveedores';
    case 'Entrevistador':
      return 'entrevistas';
    case 'Recursos Humanos / Reclutamiento':
      return 'postulantes';
    case 'Gerente de Construcción':
      return 'proyectos';
    case 'Administrador':
    default:
      return 'dashboard';
  }
};
