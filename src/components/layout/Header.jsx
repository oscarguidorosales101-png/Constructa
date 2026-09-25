import React from 'react';
import { Menu, Calendar, ShieldCheck, User } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';

const ROUTE_INFO = {
  dashboard: {
    title: 'Panel Principal',
    description: 'Resumen ejecutivo de obras, presupuestos, personal y almacén',
  },
  proyectos: {
    title: 'Gestión de Proyectos',
    description: 'Control de obras activas, presupuestos asignados y estado de ejecución',
  },
  empleados: {
    title: 'Personal y Cuadrillas',
    description: 'Registro de colaboradores, asignación por proyecto y horarios de trabajo',
  },
  materiales: {
    title: 'Control de Materiales e Inventario',
    description: 'Catálogo de insumos, control de existencias mínimas y movimientos',
  },
  proveedores: {
    title: 'Directorio de Proveedores',
    description: 'Empresas suministradoras de insumos y subcontratas de servicios',
  },
  presupuestos: {
    title: 'Control Presupuestario',
    description: 'Seguimiento de montos autorizados, fondos utilizados y saldos disponibles',
  },
  gastos: {
    title: 'Registro de Gastos',
    description: 'Contabilidad de compras de materiales, nómina, fletes y servicios de obra',
  },
  cronograma: {
    title: 'Cronograma de Obra',
    description: 'Planificación de etapas constructivas, hitos y fechas clave de entrega',
  },
  avance: {
    title: 'Seguimiento de Avance',
    description: 'Medición de progreso físico porcentual por proyecto y fases de ejecución',
  },
  reportes: {
    title: 'Reportes y Estadísticas',
    description: 'Análisis detallado de rendimiento operativo, costos y movimientos',
  },
};

export const Header = ({ currentRoute, onToggleMobileMenu }) => {
  const { currentUser } = useConstructa();
  const info = ROUTE_INFO[currentRoute] || {
    title: 'CONSTRUCTA',
    description: 'Sistema de Gestión para Empresa Constructora',
  };

  // Fecha actual en español corporativo
  const todayStr = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const capitalizedDate = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="btn-icon mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Abrir menú de navegación"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-group">
          <h1>{info.title}</h1>
          <p>{info.description}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-date-badge">
          <Calendar size={14} style={{ color: 'var(--accent-amber)' }} />
          <span>{capitalizedDate}</span>
        </div>

        <div className="header-status-pill">
          <ShieldCheck size={14} />
          <span>{currentUser?.rol || 'Administrador'}</span>
        </div>

        <div className="header-user-avatar-tag" title={currentUser?.nombre || 'Administrador'}>
          <div className="avatar-mini">
            {currentUser?.nombre ? currentUser.nombre.charAt(0) : 'A'}
          </div>
          <span className="user-short-name">
            {currentUser?.nombre ? currentUser.nombre.split(' ')[0] : 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
