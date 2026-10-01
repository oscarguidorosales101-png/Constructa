import Dashboard from '../pages/Dashboard/Dashboard';
import Projects from '../pages/Projects/Projects';
import Employees from '../pages/Employees/Employees';
import Applicants from '../pages/Applicants/Applicants';
import Interviews from '../pages/Interviews/Interviews';
import Materials from '../pages/Materials/Materials';
import Suppliers from '../pages/Suppliers/Suppliers';
import Budgets from '../pages/Budgets/Budgets';
import Expenses from '../pages/Expenses/Expenses';
import Schedule from '../pages/Schedule/Schedule';
import Progress from '../pages/Progress/Progress';
import Reports from '../pages/Reports/Reports';
import Agenda from '../pages/Agenda/Agenda';

import Login from '../pages/Login/Login';
import Status401 from '../pages/Status/Status401';
import Status403 from '../pages/Status/Status403';
import Status404 from '../pages/Status/Status404';

import PublicLanding from '../pages/Public/PublicLanding';

export const PRIVATE_MODULES = [
  'dashboard',
  'proyectos',
  'empleados',
  'postulantes',
  'entrevistas',
  'agenda',
  'materiales',
  'proveedores',
  'presupuestos',
  'gastos',
  'cronograma',
  'avance',
  'reportes'
];

export const PUBLIC_ROUTES = [
  'inicio',
  'empresa',
  'especialidades',
  'video',
  'logros',
  'galeria',
  'trabaja-con-nosotros',
  'contacto',
  'login',
  '401',
  '403',
  '404'
];

export const routeConfig = {
  // Sitio Público Institucional
  inicio: {
    path: 'inicio',
    label: 'Inicio',
    component: PublicLanding,
    isPrivate: false,
  },
  empresa: {
    path: 'empresa',
    label: 'Empresa',
    component: PublicLanding,
    isPrivate: false,
  },
  especialidades: {
    path: 'especialidades',
    label: 'Especialidades',
    component: PublicLanding,
    isPrivate: false,
  },
  video: {
    path: 'video',
    label: 'Video',
    component: PublicLanding,
    isPrivate: false,
  },
  logros: {
    path: 'logros',
    label: 'Logros',
    component: PublicLanding,
    isPrivate: false,
  },
  galeria: {
    path: 'galeria',
    label: 'Galería',
    component: PublicLanding,
    isPrivate: false,
  },
  'trabaja-con-nosotros': {
    path: 'trabaja-con-nosotros',
    label: 'Trabaja con Nosotros',
    component: PublicLanding,
    isPrivate: false,
  },
  contacto: {
    path: 'contacto',
    label: 'Contacto',
    component: PublicLanding,
    isPrivate: false,
  },
  // Rutas Privadas
  dashboard: {
    path: 'dashboard',
    label: 'Dashboard',
    component: Dashboard,
    isPrivate: true,
    requiredRole: null, // Todos los autenticados
  },
  proyectos: {
    path: 'proyectos',
    label: 'Proyectos',
    component: Projects,
    isPrivate: true,
    requiredRole: null,
  },
  empleados: {
    path: 'empleados',
    label: 'Personal y Cuadrillas',
    component: Employees,
    isPrivate: true,
    requiredRole: null,
  },
  postulantes: {
    path: 'postulantes',
    label: 'Postulantes y Selección',
    component: Applicants,
    isPrivate: true,
    requiredRole: null,
  },
  entrevistas: {
    path: 'entrevistas',
    label: 'Agenda de Entrevistas',
    component: Interviews,
    isPrivate: true,
    requiredRole: null,
  },
  agenda: {
    path: 'agenda',
    label: 'Agenda Central de Actividades',
    component: Agenda,
    isPrivate: true,
    requiredRole: null,
  },
  materiales: {
    path: 'materiales',
    label: 'Materiales e Inventario',
    component: Materials,
    isPrivate: true,
    requiredRole: null,
  },
  proveedores: {
    path: 'proveedores',
    label: 'Proveedores',
    component: Suppliers,
    isPrivate: true,
    requiredRole: null,
  },
  presupuestos: {
    path: 'presupuestos',
    label: 'Presupuestos',
    component: Budgets,
    isPrivate: true,
    requiredRole: null,
  },
  gastos: {
    path: 'gastos',
    label: 'Gastos de Obra',
    component: Expenses,
    isPrivate: true,
    requiredRole: null,
  },
  cronograma: {
    path: 'cronograma',
    label: 'Cronograma',
    component: Schedule,
    isPrivate: true,
    requiredRole: null,
  },
  avance: {
    path: 'avance',
    label: 'Avance de Obra',
    component: Progress,
    isPrivate: true,
    requiredRole: null,
  },
  reportes: {
    path: 'reportes',
    label: 'Reportes y Estadísticas',
    component: Reports,
    isPrivate: true,
    requiredRole: null,
  },

  // Rutas Públicas y Estados HTTP
  login: {
    path: 'login',
    label: 'Iniciar Sesión',
    component: Login,
    isPrivate: false,
  },
  401: {
    path: '401',
    label: 'Sesión no iniciada',
    component: Status401,
    isPrivate: false,
  },
  403: {
    path: '403',
    label: 'Acceso no autorizado',
    component: Status403,
    isPrivate: false,
  },
  404: {
    path: '404',
    label: 'Página no encontrada',
    component: Status404,
    isPrivate: false,
  },
};

export default routeConfig;
