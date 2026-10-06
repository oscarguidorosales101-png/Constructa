import React from 'react';
import { Menu, Calendar, ShieldCheck, User, Sliders, Bot, Sun, Moon, Globe, LayoutDashboard } from 'lucide-react';
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
  postulantes: {
    title: 'Candidatos y Selección',
    description: 'Gestión de postulaciones, perfiles laborales y estado de contratación',
  },
  entrevistas: {
    title: 'Gestión de Entrevistas',
    description: 'Coordinación de entrevistas laborales, evaluaciones y control de horarios',
  },
  agenda: {
    title: 'Agenda Central de Actividades',
    description: 'Reuniones de obra, visitas técnicas, entrevistas y compromisos integrados',
  },
};

export const Header = ({ currentRoute, onToggleMobileMenu, onNavigate }) => {
  const { currentUser, openAccessibilityModal, openAIAssistantModal, settings, navigateTo, setActiveView } = useConstructa();
  const navigate = onNavigate || navigateTo || setActiveView;
  
  let routeMeta = ROUTE_INFO[currentRoute] || {
    title: 'CONSTRUCTA',
    description: 'Sistema de Gestión para Empresa Constructora',
  };

  // Personalización del título del Dashboard según el rol del usuario conectado
  if (currentRoute === 'dashboard') {
    if (currentUser?.rol === 'Gerente de Construcción') {
      routeMeta = {
        title: 'Panel Operativo de Obras',
        description: 'Supervisión de proyectos en ejecución, cuadrillas de campo, inventario y agenda operativa',
      };
    } else if (currentUser?.rol === 'RRHH / Reclutamiento') {
      routeMeta = {
        title: 'Panel de Talento y Selección',
        description: 'Control de candidatos, citas de entrevistas laborales y nómina de personal',
      };
    } else {
      routeMeta = {
        title: 'Panel Principal Corporativo',
        description: 'Resumen ejecutivo de obras, presupuestos autorizados, personal y almacén general',
      };
    }
  }

  const info = routeMeta;

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

        {currentRoute !== 'dashboard' && (
          <button
            type="button"
            className="hide-mobile"
            onClick={() => navigate('dashboard')}
            title="Volver al Panel Principal (Dashboard)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.7rem',
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
              color: 'var(--color-gold, #f59e0b)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginRight: '0.6rem'
            }}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>
        )}

        <div className="header-title-group">
          <h1>{info.title}</h1>
          <p>{info.description}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Acceso directo al Sitio Web Público */}
        <button
          type="button"
          onClick={() => navigate('inicio')}
          title="Ver Sitio Web Público Institucional"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(217, 119, 6, 0.12)',
            border: '1px solid rgba(217, 119, 6, 0.35)',
            color: 'var(--color-gold, #f59e0b)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.15s'
          }}
        >
          <Globe size={15} />
          <span className="hide-mobile">Sitio Web</span>
        </button>

        {/* Acceso directo Asistente de IA (EXCLUSIVO ADMINISTRADOR) */}
        {currentUser?.rol === 'Administrador' && (
          <button
            type="button"
            onClick={openAIAssistantModal}
            title="Asistente de Inteligencia Artificial (Gemini / OpenAI)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: 'var(--accent-blue)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.15s'
            }}
          >
            <Bot size={15} />
            <span className="hide-mobile">Asistente IA</span>
          </button>
        )}

        {/* Acceso directo Centro de Accesibilidad & Tema */}
        <button
          type="button"
          onClick={openAccessibilityModal}
          title="Centro de Accesibilidad, Tema y Voz"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-amber)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.15s'
          }}
        >
          {settings?.theme === 'light' ? <Sun size={15} /> : <Sliders size={15} />}
          <span className="hide-mobile">Accesibilidad</span>
        </button>

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
