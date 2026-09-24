import React from 'react';
import { Menu, Calendar, LogOut, ShieldCheck } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../common/Button.jsx';

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

export const Header = ({ currentRoute, onToggleMobileMenu, onNavigate }) => {
  const { currentUser, requestConfirm, logout } = useConstructa();
  const info = ROUTE_INFO[currentRoute] || {
    title: 'CONSTRUCTA',
    description: 'Sistema de Gestión para Empresa Constructora',
  };

  const handleLogoutClick = () => {
    requestConfirm({
      title: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión actual en CONSTRUCTA?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => {
        logout();
        onNavigate('login');
      },
    });
  };

  // Fecha en español profesional
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
          className="header-status-pill"
        >
          <ShieldCheck size={14} />
          <span>{currentUser?.rol || 'Administrador'}</span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={LogOut}
          onClick={handleLogoutClick}
          className="header-logout-btn"
        >
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
};

export default Header;
