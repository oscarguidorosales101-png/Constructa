import React from 'react';
import {
  HardHat,
  CheckCircle2,
  Users,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Wallet,
  Clock,
  ArrowRight,
  PlusCircle,
  Receipt,
  Truck,
  UserCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Building2,
  ExternalLink,
  MapPin,
  TrendingUp,
  FileCheck,
  Sparkles,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import DashboardCharts from '../../components/dashboard/DashboardCharts.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import FutureProjection from '../FutureProjection/FutureProjection.jsx';

export const Dashboard = ({ onNavigate }) => {
  const { 
    currentUser,
    metrics, 
    history, 
    materials, 
    projects, 
    applicants,
    interviews,
    agendaActivities,
    formatCurrency, 
    formatNumber,
    navigateTo,
    setActiveView 
  } = useConstructa();

  // Helper unificado de navegación con paso de intenciones/parámetros
  const navigate = (view, intent = null) => {
    if (navigateTo) {
      navigateTo(view, intent);
    } else if (onNavigate) {
      onNavigate(view);
    } else if (setActiveView) {
      setActiveView(view);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Materiales en stock crítico
  const lowStockItems = (materials || []).filter(
    (m) => Number(m.stockActual ?? m.stock) <= Number(m.stockMinimo)
  );

  // =========================================================================
  // VISTA 1: DASHBOARD PARA RRHH / RECLUTAMIENTO
  // =========================================================================
  if (currentUser?.rol === 'RRHH / Reclutamiento') {
    const upcomingList = (interviews || [])
      .filter((i) => i.estado === 'Programada' || i.estado === 'Reprogramada')
      .sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return (a.horaInicio || '').localeCompare(b.horaInicio || '');
      })
      .slice(0, 5);

    const recentApplicants = (applicants || []).slice(0, 6);

    return (
      <div className="dashboard-page">
        {/* Welcome Banner RRHH */}
        <div
          className="constructa-card"
          style={{
            padding: '20px 24px',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(17, 23, 36, 0.95) 100%)',
            borderLeft: '4px solid var(--color-sky)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-sky)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-sky)', fontWeight: 600, textTransform: 'uppercase' }}>
                Gestión de Personal y Selección
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>
              Bienvenida, {currentUser?.nombre || 'Coordinadora de RRHH'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Panel de control para procesos de reclutamiento, entrevistas laborales y altas en la plantilla de CONSTRUCTA.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="primary" icon={CalendarClock} onClick={() => navigate('entrevistas')}>
              Agenda de Entrevistas
            </Button>
            <Button variant="outline" icon={UserCheck} onClick={() => navigate('postulantes')}>
              Registrar Candidato
            </Button>
          </div>
        </div>

        {/* KPI Grid RRHH (6 Tarjetas Dinámicas) */}
        <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
          {/* 1. Candidatos Totales */}
          <div className="kpi-card" onClick={() => navigate('postulantes')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Candidatos Registrados</span>
              <div className="kpi-icon-box blue">
                <UserCheck size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.totalApplicants || 0}</div>
              <div className="kpi-subtext">
                <span>Expedientes en base de datos</span>
              </div>
            </div>
          </div>

          {/* 2. Candidaturas Activas */}
          <div className="kpi-card" onClick={() => navigate('postulantes')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">En Evaluación Activa</span>
              <div className="kpi-icon-box amber">
                <Clock size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.activeApplicants || 0}</div>
              <div className="kpi-subtext">
                <span style={{ color: 'var(--accent-amber)' }}>Procesos en curso</span>
              </div>
            </div>
          </div>

          {/* 3. Entrevistas Programadas */}
          <div className="kpi-card" onClick={() => navigate('entrevistas')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Entrevistas Programadas</span>
              <div className="kpi-icon-box blue">
                <CalendarClock size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.upcomingInterviews || 0}</div>
              <div className="kpi-subtext">
                <span>Citas agendadas por realizar</span>
              </div>
            </div>
          </div>

          {/* 4. Entrevistas de Hoy */}
          <div className="kpi-card" onClick={() => navigate('agenda')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Citas para Hoy</span>
              <div className="kpi-icon-box green">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value" style={{ color: metrics?.todayInterviews > 0 ? '#34d399' : 'inherit' }}>
                {metrics?.todayInterviews || 0}
              </div>
              <div className="kpi-subtext">
                <span style={{ color: 'var(--accent-green)' }}>Compromisos en el día</span>
              </div>
            </div>
          </div>

          {/* 5. Candidatos Seleccionados */}
          <div className="kpi-card" onClick={() => navigate('postulantes')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Seleccionados para Obra</span>
              <div className="kpi-icon-box green">
                <FileCheck size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.selectedApplicants || 0}</div>
              <div className="kpi-subtext">
                <span>Listos para contratación</span>
              </div>
            </div>
          </div>

          {/* 6. Plantilla de Personal */}
          <div className="kpi-card" onClick={() => navigate('empleados')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Plantilla de Personal</span>
              <div className="kpi-icon-box blue">
                <Users size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.totalEmployees || 0}</div>
              <div className="kpi-subtext">
                <span>{metrics?.activeEmployees || 0} activos en nómina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos RRHH */}
        <div className="quick-actions-bar" style={{ marginBottom: '2rem' }}>
          <span className="quick-actions-title">Accesos Rápidos de Selección:</span>
          <Button variant="secondary" size="sm" icon={UserCheck} onClick={() => navigate('postulantes')}>
            Gestionar Candidatos
          </Button>
          <Button variant="secondary" size="sm" icon={CalendarClock} onClick={() => navigate('entrevistas')}>
            Programar / Ver Entrevistas
          </Button>
          <Button variant="secondary" size="sm" icon={CalendarDays} onClick={() => navigate('agenda')}>
            Agenda Centralizada
          </Button>
          <Button variant="secondary" size="sm" icon={Users} onClick={() => navigate('empleados')}>
            Consultar Plantilla de Empleados
          </Button>
        </div>

        {/* Grid: Próximas Entrevistas + Candidatos Recientes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
          {/* Card 1: Próximas Entrevistas */}
          <div className="constructa-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarClock size={20} style={{ color: 'var(--color-sky)' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Próximas Citas de Entrevista
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('entrevistas')}>
                Ver Todas
              </Button>
            </div>

            {upcomingList.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
                No hay entrevistas pendientes programadas.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingList.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>
                        {inv.postulanteNombre}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {inv.puesto} • Entrevistador: <strong style={{ color: 'var(--color-text-secondary)' }}>{inv.entrevistador}</strong>
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontWeight: 600, display: 'block' }}>
                        {inv.fecha}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {inv.horaInicio} - {inv.horaFin}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Candidatos Recientes */}
          <div className="constructa-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} style={{ color: 'var(--color-gold)' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Candidatos en Proceso
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('postulantes')}>
                Ver Expedientes
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentApplicants.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>
                      {app.nombre}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {app.puestoSolicitado} ({app.area || 'Operativo'})
                    </span>
                  </div>

                  <Badge
                    variant={
                      app.estado === 'Seleccionado'
                        ? 'success'
                        : app.estado === 'Entrevista programada'
                        ? 'info'
                        : app.estado === 'En revisión'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {app.estado}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: DASHBOARD PARA GERENTE DE CONSTRUCCIÓN
  // =========================================================================
  if (currentUser?.rol === 'Gerente de Construcción') {
    // Actividades asignadas al gerente de construcción
    const myActivities = (agendaActivities || [])
      .filter(
        (a) =>
          a.responsable &&
          (a.responsable.includes('Carlos Mendoza') || a.responsable.includes('Gerente'))
      )
      .slice(0, 4);

    // Entrevistas donde Carlos Mendoza es entrevistador
    const myInterviews = (interviews || [])
      .filter(
        (i) =>
          i.entrevistador &&
          i.entrevistador.includes('Carlos Mendoza') &&
          i.estado !== 'Cancelada'
      )
      .slice(0, 3);

    return (
      <div className="dashboard-page">
        {/* Alerta de Stock Bajo si existe */}
        {lowStockItems.length > 0 && (
          <div className="dashboard-alert-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Atención en Almacén: {lowStockItems.length} materiales bajo stock mínimo
                </strong>
                <p style={{ color: 'var(--accent-red, #ef4444)', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                  {lowStockItems.map((m) => m.nombre).slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('proveedores', { openRequestModal: true, material: lowStockItems[0] })}
                icon={ShoppingCart}
              >
                Solicitar Reposición
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('materiales', { filterLowStock: true })}
                icon={ArrowRight}
              >
                Revisar Inventario
              </Button>
            </div>
          </div>
        )}

        {/* Banner Gerente */}
        <div
          className="constructa-card"
          style={{
            padding: '20px 24px',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 23, 36, 0.95) 100%)',
            borderLeft: '4px solid var(--color-gold)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <HardHat size={18} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                Dirección y Operaciones de Obra
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>
              Bienvenido, {currentUser?.nombre || 'Ing. Carlos Mendoza Rivas'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Supervisión de frentes constructivos, asignaciones de cuadrillas, control de almacén y compromisos de agenda.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="primary" icon={CalendarDays} onClick={() => navigate('agenda')}>
              Mi Agenda de Hoy
            </Button>
            <Button variant="outline" icon={TrendingUp} onClick={() => navigate('avance')}>
              Actualizar Avance
            </Button>
          </div>
        </div>

        {/* KPI Grid Operativo (7 Tarjetas Dinámicas) */}
        <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
          {/* 1. Proyectos activos */}
          <div className="kpi-card" onClick={() => navigate('proyectos')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Proyectos en Ejecución</span>
              <div className="kpi-icon-box amber">
                <HardHat size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.activeProjects || 0}</div>
              <div className="kpi-subtext">
                <span style={{ color: 'var(--accent-amber)' }}>Obras activas en campo</span>
              </div>
            </div>
          </div>

          {/* 2. Avance Físico Promedio */}
          <div className="kpi-card" onClick={() => navigate('avance')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Avance Físico Promedio</span>
              <div className="kpi-icon-box green">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.averageProgress || metrics?.avgProgress || 0}%</div>
              <div className="kpi-subtext">
                <span style={{ color: 'var(--accent-green)' }}>Ejecución ponderada</span>
              </div>
            </div>
          </div>

          {/* 3. Cuadrillas en Campo */}
          <div className="kpi-card" onClick={() => navigate('empleados')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Personal Operativo</span>
              <div className="kpi-icon-box blue">
                <Users size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.activeEmployees || 0}</div>
              <div className="kpi-subtext">
                <span>De {metrics?.totalEmployees || 0} colaboradores totales</span>
              </div>
            </div>
          </div>

          {/* 4. Materiales e Inventario */}
          <div className="kpi-card" onClick={() => navigate('materiales')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Materiales en Almacén</span>
              <div className="kpi-icon-box blue">
                <Package size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.totalMaterials || 0}</div>
              <div className="kpi-subtext">
                <span>Catálogo de insumos</span>
              </div>
            </div>
          </div>

          {/* 5. Alertas de Stock */}
          <div className="kpi-card" onClick={() => navigate('materiales', { filterLowStock: true })} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Stock Bajo</span>
              <div className="kpi-icon-box red">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value" style={{ color: metrics?.lowStockCount > 0 ? '#f87171' : 'inherit' }}>
                {metrics?.lowStockCount || 0}
              </div>
              <div className="kpi-subtext">
                <span style={{ color: metrics?.lowStockCount > 0 ? '#f87171' : 'var(--color-text-muted)' }}>
                  {metrics?.lowStockCount > 0 ? 'Requieren reposición' : 'Almacén estable'}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Gastos Ejecutados en Obras */}
          <div className="kpi-card" onClick={() => navigate('gastos')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Gastos de Obra</span>
              <div className="kpi-icon-box amber">
                <Receipt size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value" style={{ fontSize: '1.4rem', color: '#fbbf24' }}>
                {formatCurrency(metrics?.totalSpent)}
              </div>
              <div className="kpi-subtext">
                <span>{metrics?.budgetUtilization || 0}% de ejecución</span>
              </div>
            </div>
          </div>

          {/* 7. Compromisos de Hoy */}
          <div className="kpi-card" onClick={() => navigate('agenda')} style={{ cursor: 'pointer' }}>
            <div className="kpi-header">
              <span className="kpi-title">Compromisos de Hoy</span>
              <div className="kpi-icon-box green">
                <Clock size={20} />
              </div>
            </div>
            <div>
              <div className="kpi-value">{metrics?.totalTodayCommitments || 0}</div>
              <div className="kpi-subtext">
                <span style={{ color: 'var(--accent-green)' }}>Reuniones, visitas y entrevistas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos Operativos */}
        <div className="quick-actions-bar" style={{ marginBottom: '2rem' }}>
          <span className="quick-actions-title">Accesos Rápidos Operativos:</span>
          <Button variant="secondary" size="sm" icon={HardHat} onClick={() => navigate('proyectos')}>
            Explorar Proyectos
          </Button>
          <Button variant="secondary" size="sm" icon={TrendingUp} onClick={() => navigate('avance')}>
            Registrar Avance de Obra
          </Button>
          <Button variant="secondary" size="sm" icon={Package} onClick={() => navigate('materiales')}>
            Gestionar Materiales
          </Button>
          <Button variant="secondary" size="sm" icon={Users} onClick={() => navigate('empleados', { viewMode: 'agenda' })}>
            Ver Horarios de Cuadrillas
          </Button>
          <Button variant="secondary" size="sm" icon={Receipt} onClick={() => navigate('gastos', { openCreateModal: true })}>
            Registrar Gasto de Obra
          </Button>
          <Button variant="secondary" size="sm" icon={CalendarDays} onClick={() => navigate('agenda')}>
            Ver Mi Agenda Operativa
          </Button>
        </div>

        {/* Sección: Mi Agenda Operativa y Entrevistas Técnicas */}
        <div className="constructa-card" style={{ padding: '20px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: 'var(--color-gold)' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Mi Agenda Operativa y Entrevistas Asignadas
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Compromisos técnicos agendados para {currentUser?.nombre}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={CalendarDays} onClick={() => navigate('agenda')}>
              Ver Agenda Completa
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {/* Actividades de Obra */}
            {myActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <Badge variant={act.tipo === 'Visitas' ? 'success' : 'warning'}>
                    {act.tipo}
                  </Badge>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block', marginTop: '6px' }}>
                    {act.titulo}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {act.proyectoNombre} • {act.ubicacion}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                    {act.horaInicio} - {act.horaFin}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {act.fecha}
                  </span>
                </div>
              </div>
            ))}

            {/* Entrevistas Asignadas */}
            {myInterviews.map((inv) => (
              <div
                key={inv.id}
                style={{
                  padding: '14px',
                  background: 'rgba(56, 189, 248, 0.03)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <Badge variant="info">Entrevista Técnica</Badge>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block', marginTop: '6px' }}>
                    {inv.postulanteNombre}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Puesto: {inv.puesto}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-sky)', fontWeight: 600 }}>
                    {inv.horaInicio} - {inv.horaFin}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {inv.fecha}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoreo de Abastecimiento Operativo (Gerente) */}
        <div className="constructa-card" style={{ padding: '20px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} style={{ color: 'var(--color-gold)' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Monitoreo de Abastecimiento y Compras de Obra
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Flujo de pedidos, recepciones físicas en campo y solicitudes de materiales
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => navigate('proveedores')}>
              Centro de Abastecimiento
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div onClick={() => navigate('proveedores', { activeTab: 'ordenes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pedidos Pendientes</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>{metrics?.pendingPurchaseOrders || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Por aprobar/enviar</div>
            </div>

            <div onClick={() => navigate('proveedores', { activeTab: 'ordenes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>En Camino</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '4px' }}>{metrics?.inTransitOrders || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>En tránsito a obra</div>
            </div>

            <div onClick={() => navigate('proveedores', { activeTab: 'ordenes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Entregas Próximas</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>{metrics?.upcomingDeliveries || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Próximos 5 días</div>
            </div>

            <div onClick={() => navigate('proveedores', { activeTab: 'recepcion' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Por Recibir en Obra</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{metrics?.pendingReceptions || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Verificación física</div>
            </div>

            <div onClick={() => navigate('proveedores', { activeTab: 'solicitudes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Reposición Pendiente</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{metrics?.pendingMaterialRequests || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Solicitudes activas</div>
            </div>
          </div>
        </div>

        {/* Gráficos de Obras */}
        <DashboardCharts />
      </div>
    );
  }

  // =========================================================================
  // VISTA 3: DASHBOARD GENERAL CORPORATIVO (ADMINISTRADOR)
  // =========================================================================
  return (
    <div className="dashboard-page">
      {/* Alerta si existen materiales en stock crítico */}
      {lowStockItems.length > 0 && (
        <div className="dashboard-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Atención requerida en almacén: {lowStockItems.length} insumos con stock bajo
              </strong>
              <p style={{ color: 'var(--accent-red, #ef4444)', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                {lowStockItems.map((m) => m.nombre).slice(0, 3).join(', ')}
                {lowStockItems.length > 3 ? ` y ${lowStockItems.length - 3} más...` : '.'}
              </p>
            </div>
          </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('proveedores', { openRequestModal: true, material: lowStockItems[0] })}
                icon={ShoppingCart}
              >
                Solicitar Reposición
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('materiales', { filterLowStock: true })}
                icon={ArrowRight}
              >
                Revisar Inventario
              </Button>
            </div>
          </div>
        )}

      {/* KPI GRID DE 8 TARJETAS DINÁMICAS (Visión Global Corporativa) */}
      <div className="kpi-grid">
        {/* 1. Proyectos activos */}
        <div className="kpi-card" onClick={() => navigate('proyectos')} style={{ cursor: 'pointer' }} title="Ir a Proyectos Activos">
          <div className="kpi-header">
            <span className="kpi-title">Proyectos Activos</span>
            <div className="kpi-icon-box amber">
              <HardHat size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.activeProjects || 0}</div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-amber)' }}>En ejecución activa</span>
            </div>
          </div>
        </div>

        {/* 2. Proyectos finalizados */}
        <div className="kpi-card" onClick={() => navigate('proyectos')} style={{ cursor: 'pointer' }} title="Ir a Obras Finalizadas">
          <div className="kpi-header">
            <span className="kpi-title">Proyectos Finalizados</span>
            <div className="kpi-icon-box green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.completedProjects || 0}</div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-green)' }}>Entregados satisfactoriamente</span>
            </div>
          </div>
        </div>

        {/* 3. Total de empleados */}
        <div className="kpi-card" onClick={() => navigate('empleados')} style={{ cursor: 'pointer' }} title="Ir a Personal de Obra">
          <div className="kpi-header">
            <span className="kpi-title">Total de Personal</span>
            <div className="kpi-icon-box blue">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.totalEmployees || 0}</div>
            <div className="kpi-subtext">
              <span>{metrics?.activeEmployees || 0} operativos en campo</span>
            </div>
          </div>
        </div>

        {/* 4. Materiales registrados */}
        <div className="kpi-card" onClick={() => navigate('materiales')} style={{ cursor: 'pointer' }} title="Ir a Catálogo de Materiales">
          <div className="kpi-header">
            <span className="kpi-title">Materiales Registrados</span>
            <div className="kpi-icon-box blue">
              <Package size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.totalMaterials || 0}</div>
            <div className="kpi-subtext">
              <span>Catálogo completo con imagen</span>
            </div>
          </div>
        </div>

        {/* 5. Materiales con stock bajo */}
        <div 
          className="kpi-card" 
          onClick={() => navigate('materiales', { filterLowStock: true })} 
          style={{ cursor: 'pointer' }} 
          title="Ver Insumos en Alerta de Stock"
        >
          <div className="kpi-header">
            <span className="kpi-title">Stock Bajo</span>
            <div className="kpi-icon-box red">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ color: (metrics?.lowStockCount > 0 || lowStockItems.length > 0) ? '#f87171' : 'inherit' }}>
              {metrics?.lowStockCount || lowStockItems.length || 0}
            </div>
            <div className="kpi-subtext">
              <span style={{ color: (metrics?.lowStockCount > 0 || lowStockItems.length > 0) ? '#f87171' : 'var(--text-muted)' }}>
                {(metrics?.lowStockCount > 0 || lowStockItems.length > 0) ? 'Requieren reposición inmediata' : 'Existencias estables'}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Presupuesto total */}
        <div className="kpi-card" onClick={() => navigate('presupuestos')} style={{ cursor: 'pointer' }} title="Ir a Presupuestos">
          <div className="kpi-header">
            <span className="kpi-title">Presupuesto Total</span>
            <div className="kpi-icon-box amber">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.45rem' }}>
              {formatCurrency(metrics?.totalBudget)}
            </div>
            <div className="kpi-subtext">
              <span>Total acumulado de obras</span>
            </div>
          </div>
        </div>

        {/* 7. Gastos acumulados */}
        <div className="kpi-card" onClick={() => navigate('gastos')} style={{ cursor: 'pointer' }} title="Ir a Control de Gastos">
          <div className="kpi-header">
            <span className="kpi-title">Gastos Acumulados</span>
            <div className="kpi-icon-box amber">
              <TrendingDown size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#fbbf24' }}>
              {formatCurrency(metrics?.totalSpent)}
            </div>
            <div className="kpi-subtext">
              <span>{metrics?.budgetUtilization || metrics?.budgetUsagePercent}% del presupuesto</span>
            </div>
          </div>
        </div>

        {/* 8. Presupuesto disponible */}
        <div className="kpi-card" onClick={() => navigate('presupuestos')} style={{ cursor: 'pointer' }} title="Ir a Balance Presupuestario">
          <div className="kpi-header">
            <span className="kpi-title">Presupuesto Disponible</span>
            <div className="kpi-icon-box green">
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#34d399' }}>
              {formatCurrency(metrics?.availableBudget)}
            </div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-green)' }}>Saldo libre para ejecución</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ABASTECIMIENTO, COMPRAS Y PAGOS (Requerimiento #27) */}
      <div className="constructa-card" style={{ padding: '20px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} style={{ color: 'var(--color-gold)' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Monitoreo de Abastecimiento, Compras y Pagos
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Flujo de órdenes de compra, recepciones en obra, control 3-way match y pagos programados
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => navigate('proveedores')}>
            Centro de Abastecimiento
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {/* 1. Pedidos Pendientes */}
          <div onClick={() => navigate('proveedores', { activeTab: 'ordenes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pedidos Pendientes</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>{metrics?.pendingPurchaseOrders || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Por aprobar/enviar</div>
          </div>

          {/* 2. En Camino */}
          <div onClick={() => navigate('proveedores', { activeTab: 'ordenes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>En Camino</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '4px' }}>{metrics?.inTransitOrders || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>En tránsito a obra</div>
          </div>

          {/* 3. Entregas Próximas */}
          <div onClick={() => navigate('proveedores', { activeTab: 'ordenes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Entregas Próximas</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>{metrics?.upcomingDeliveries || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Próximos 5 días</div>
          </div>

          {/* 4. Recepciones Pendientes */}
          <div onClick={() => navigate('proveedores', { activeTab: 'recepcion' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Por Recibir</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{metrics?.pendingReceptions || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Verificación física</div>
          </div>

          {/* 5. Facturas Pendientes */}
          <div onClick={() => navigate('proveedores', { activeTab: 'facturas' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Facturas por Revisar</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>{metrics?.pendingSupplierInvoices || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Validación 3-way</div>
          </div>

          {/* 6. Pagos Programados */}
          <div onClick={() => navigate('proveedores', { activeTab: 'facturas' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pagos Programados</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>{metrics?.scheduledPayments || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', marginTop: '2px' }}>{formatCurrency(metrics?.totalScheduledPaymentsAmount || 0)}</div>
          </div>

          {/* 7. Pagos Vencidos */}
          <div onClick={() => navigate('proveedores', { activeTab: 'facturas' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: (metrics?.overduePayments > 0) ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pagos Vencidos</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: (metrics?.overduePayments > 0) ? 'var(--color-rose)' : 'var(--color-text-muted)', marginTop: '4px' }}>{metrics?.overduePayments || 0}</div>
            <div style={{ fontSize: '0.7rem', color: (metrics?.overduePayments > 0) ? 'var(--color-rose)' : 'var(--color-text-secondary)', marginTop: '2px' }}>{(metrics?.overduePayments > 0) ? 'Urgente tramitar' : 'Al corriente'}</div>
          </div>

          {/* 8. Solicitudes Pendientes */}
          <div onClick={() => navigate('proveedores', { activeTab: 'solicitudes' })} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Reposición Pendiente</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{metrics?.pendingMaterialRequests || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Solicitudes activas</div>
          </div>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS CORPORATIVAS */}
      <div className="quick-actions-bar">
        <span className="quick-actions-title">
          Accesos Rápidos:
        </span>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={HardHat} 
          onClick={() => navigate('proyectos')}
        >
          Explorar Proyectos
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Receipt} 
          onClick={() => navigate('gastos', { openCreateModal: true })}
        >
          Registrar Gasto
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Package} 
          onClick={() => navigate('materiales')}
        >
          Gestionar Materiales
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={CalendarDays} 
          onClick={() => navigate('agenda')}
        >
          Agenda Central
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Users} 
          onClick={() => navigate('empleados', { viewMode: 'agenda' })}
        >
          Ver Horarios de Personal
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={AlertTriangle} 
          onClick={() => navigate('materiales', { filterLowStock: true })}
        >
          Revisar Inventario
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Truck} 
          onClick={() => navigate('proveedores')}
        >
          Abastecimiento y Proveedores
        </Button>
      </div>

      {/* GRÁFICOS DINÁMICOS CONECTADOS */}
      <DashboardCharts />

      {/* HISTORIAL RECIENTE Y ACTIVIDAD EN VIVO */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Clock size={18} style={{ color: 'var(--accent-amber)' }} />
              Historial de Movimientos Recientes
            </h3>
            <p className="card-desc">Registro cronológico de operaciones operativas, financieras y de obra</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('reportes')}>
            Ver Reporte Completo
          </Button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tipo de Evento</th>
                <th>Descripción</th>
                <th>Proyecto Relacionado</th>
                <th style={{ textAlign: 'right' }}>Monto Asociado</th>
              </tr>
            </thead>
            <tbody>
              {history && history.length > 0 ? (
                history.slice(0, 7).map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {item.fecha}
                    </td>
                    <td>
                      <Badge
                        variant={
                          item.tipo.includes('Gasto')
                            ? 'warning'
                            : item.tipo.includes('Avance')
                            ? 'success'
                            : item.tipo.includes('Material')
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {item.tipo}
                      </Badge>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.descripcion}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.proyectoRelacionado}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: item.monto ? '#fbbf24' : 'var(--text-muted)' }}>
                      {item.monto ? formatCurrency(item.monto) : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay movimientos registrados en el historial reciente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN INTEGRADORA: PROYECCIÓN AL FUTURO & ASISTENTE DE OPERACIÓN IA */}
      <section id="proyeccion-futuro" style={{ marginTop: '2.5rem' }}>
        <FutureProjection onNavigate={navigate} embedded={true} />
      </section>
    </div>
  );
};

export default Dashboard;
