import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import AgendaEventModal from '../../components/agenda/AgendaEventModal';
import { matchSearch } from '../../utils/searchUtils';
import {
  CalendarDays,
  Calendar,
  Clock,
  User,
  Users,
  Building2,
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Filter,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Agenda({ onNavigate }) {
  const {
    currentUser,
    data,
    saveAgendaActivity,
    deleteAgendaActivity,
    requestConfirm,
    navigateTo,
    setActiveView
  } = useConstructa();

  const navigate = onNavigate || navigateTo || setActiveView;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtros
  const [activeTypeTab, setActiveTypeTab] = useState('ALL'); // 'ALL' | 'Entrevistas' | 'Proyectos' | 'Reuniones' | 'Visitas'
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'CUSTOM'
  const [customDate, setCustomDate] = useState(todayStr);
  const [responsibleFilter, setResponsibleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewLayout, setViewLayout] = useState('timeline'); // 'timeline' | 'cards'

  // Modal de nueva actividad
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Lista unificada reactiva de todas las fuentes
  const unifiedActivities = useMemo(() => {
    const list = [];

    // 1. Entrevistas de RRHH
    (data.interviews || []).forEach((inv) => {
      list.push({
        id: inv.id,
        titulo: `Entrevista Laboral: ${inv.postulanteNombre}`,
        subtitulo: `Plaza: ${inv.puesto}`,
        tipo: 'Entrevistas',
        fecha: inv.fecha,
        horaInicio: inv.horaInicio,
        horaFin: inv.horaFin || inv.horaInicio,
        duracionMinutos: inv.duracionMinutos || 45,
        responsable: inv.entrevistador,
        proyectoNombre: 'Selección de Personal',
        ubicacion: inv.tipo || 'Presencial / Entrevista',
        estado: inv.estado,
        descripcion: inv.observaciones || 'Entrevista técnica coordinada por Selección',
        source: 'interview',
        raw: inv,
      });
    });

    // 2. Actividades de Agenda (reuniones, visitas de obra)
    (data.agendaActivities || []).forEach((act) => {
      list.push({
        id: act.id,
        titulo: act.titulo,
        subtitulo: act.proyectoNombre || 'Coordinación General',
        tipo: act.tipo || 'Reuniones',
        fecha: act.fecha,
        horaInicio: act.horaInicio,
        horaFin: act.horaFin || act.horaInicio,
        duracionMinutos: act.duracionMinutos || 60,
        responsable: act.responsable,
        proyectoId: act.proyectoId,
        proyectoNombre: act.proyectoNombre || 'General',
        ubicacion: act.ubicacion || 'Oficina Técnica',
        estado: act.estado || 'Programada',
        descripcion: act.descripcion || '',
        source: 'agenda',
        raw: act,
      });
    });

    // 3. Actividades del Cronograma de Proyectos (hitos de obra)
    (data.schedule || []).forEach((task) => {
      const prj = (data.projects || []).find((p) => p.id === task.proyectoId);
      list.push({
        id: `SCH-${task.id}`,
        titulo: `Hito de Cronograma: ${task.actividad}`,
        subtitulo: prj ? prj.nombre : `Obra ${task.proyectoId}`,
        tipo: 'Proyectos',
        fecha: task.fechaInicio,
        horaInicio: '08:00',
        horaFin: '17:00',
        duracionMinutos: 540,
        responsable: task.responsable,
        proyectoId: task.proyectoId,
        proyectoNombre: prj ? prj.nombre : 'Proyecto',
        ubicacion: prj ? prj.ubicacion : 'Frente de Obra',
        estado: task.estado,
        descripcion: `Avance registrado: ${task.avance}%. Hito programado en cronograma general.`,
        source: 'schedule',
        raw: task,
      });
    });

    return list;
  }, [data.interviews, data.agendaActivities, data.schedule, data.projects]);

  // Lista única de responsables para el selector
  const uniqueResponsibles = useMemo(() => {
    const set = new Set(unifiedActivities.map((a) => a.responsable).filter(Boolean));
    return Array.from(set).sort();
  }, [unifiedActivities]);

  // Filtrado de actividades
  const filteredActivities = useMemo(() => {
    return unifiedActivities
      .filter((item) => {
        // Filtro por tipo de actividad
        const matchesType = activeTypeTab === 'ALL' || item.tipo === activeTypeTab;

        // Filtro por fecha
        let matchesDate = true;
        if (selectedDateFilter === 'TODAY') {
          matchesDate = item.fecha === todayStr;
        } else if (selectedDateFilter === 'CUSTOM') {
          matchesDate = item.fecha === customDate;
        }

        // Filtro por responsable
        const matchesResponsible =
          responsibleFilter === 'ALL' ||
          (item.responsable && item.responsable.toLowerCase().includes(responsibleFilter.toLowerCase()));

        // Búsqueda de texto
        const matchesSearch = matchSearch(searchTerm, [
          item.titulo,
          item.subtitulo,
          item.responsable,
          item.ubicacion,
          item.fecha,
          item.horaInicio,
          item.tipo,
          item.estado,
          item.descripcion,
        ]);

        return matchesType && matchesDate && matchesResponsible && matchesSearch;
      })
      .sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return (a.horaInicio || '').localeCompare(b.horaInicio || '');
      });
  }, [unifiedActivities, activeTypeTab, selectedDateFilter, customDate, responsibleFilter, searchTerm, todayStr]);

  // Métricas rápidas de la agenda
  const agendaStats = useMemo(() => {
    const todayCount = unifiedActivities.filter((a) => a.fecha === todayStr).length;
    const interviewsCount = unifiedActivities.filter((a) => a.tipo === 'Entrevistas' && a.estado !== 'Cancelada').length;
    const meetingsCount = unifiedActivities.filter((a) => a.tipo === 'Reuniones' || a.tipo === 'Coordinación Técnica').length;
    const visitsCount = unifiedActivities.filter((a) => a.tipo === 'Visitas').length;
    const projectsCount = unifiedActivities.filter((a) => a.tipo === 'Proyectos').length;

    return { todayCount, interviewsCount, meetingsCount, visitsCount, projectsCount };
  }, [unifiedActivities, todayStr]);

  const handleCreateActivity = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditActivity = (act) => {
    if (act.source === 'agenda') {
      setEditingEvent(act.raw);
      setIsEventModalOpen(true);
    } else if (act.source === 'interview') {
      navigate('entrevistas');
    } else if (act.source === 'schedule') {
      navigate('cronograma');
    }
  };

  const handleDeleteActivity = (act) => {
    if (act.source !== 'agenda') return;
    requestConfirm({
      title: 'Retirar Actividad de Agenda',
      message: `¿Deseas retirar "${act.titulo}" de la agenda central? El horario quedará liberado.`,
      confirmText: 'Retirar Actividad',
      confirmVariant: 'danger',
      onConfirm: () => deleteAgendaActivity(act.id),
    });
  };

  const getTypeBadgeVariant = (tipo) => {
    switch (tipo) {
      case 'Entrevistas':
        return 'info';
      case 'Reuniones':
        return 'warning';
      case 'Visitas':
        return 'success';
      case 'Proyectos':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="constructa-page">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarDays size={26} style={{ color: 'var(--color-gold)' }} />
            Agenda Central de Actividades
          </h2>
          <p className="page-subtitle">
            Coordinación unificada de reuniones de obra, visitas técnicas, entrevistas laborales y compromisos de proyecto
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {currentUser?.rol === 'RRHH / Reclutamiento' && (
            <Button
              variant="outline"
              icon={CalendarPlus}
              onClick={() => navigate('entrevistas')}
            >
              Programar Entrevista
            </Button>
          )}

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreateActivity}
          >
            Nueva Actividad / Reunión
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card" onClick={() => setSelectedDateFilter('TODAY')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Compromisos de Hoy</span>
            <div className="kpi-icon-box amber">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{agendaStats.todayCount}</div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-amber)' }}>Actividades en el día actual</span>
            </div>
          </div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTypeTab('Entrevistas')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Entrevistas Laborales</span>
            <div className="kpi-icon-box blue">
              <User size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{agendaStats.interviewsCount}</div>
            <div className="kpi-subtext">
              <span>Coordinadas por RRHH</span>
            </div>
          </div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTypeTab('Reuniones')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Reuniones de Obra</span>
            <div className="kpi-icon-box green">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{agendaStats.meetingsCount}</div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-green)' }}>Técnicas y de coordinación</span>
            </div>
          </div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTypeTab('Visitas')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Visitas de Inspección</span>
            <div className="kpi-icon-box amber">
              <Building2 size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{agendaStats.visitsCount}</div>
            <div className="kpi-subtext">
              <span>Supervisión en sitio de obra</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter and Controls Container */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '1.5rem' }}>
        {/* Type Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          {[
            { id: 'ALL', label: 'Todas las Actividades' },
            { id: 'Entrevistas', label: 'Entrevistas' },
            { id: 'Reuniones', label: 'Reuniones' },
            { id: 'Visitas', label: 'Visitas a Obra' },
            { id: 'Proyectos', label: 'Proyectos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn-sm ${activeTypeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTypeTab(tab.id)}
              style={{
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '6px 14px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter controls row */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            {/* Search */}
            <div style={{ minWidth: '220px', flex: 1 }}>
              <SearchInput
                placeholder="Buscar por actividad, responsable, proyecto o ubicación..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>

            {/* Date filter pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`btn-sm ${selectedDateFilter === 'ALL' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => setSelectedDateFilter('ALL')}
                style={{ fontSize: '0.78rem' }}
              >
                Todas las fechas
              </button>
              <button
                type="button"
                className={`btn-sm ${selectedDateFilter === 'TODAY' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => setSelectedDateFilter('TODAY')}
                style={{ fontSize: '0.78rem' }}
              >
                Hoy
              </button>
              <button
                type="button"
                className={`btn-sm ${selectedDateFilter === 'CUSTOM' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => setSelectedDateFilter('CUSTOM')}
                style={{ fontSize: '0.78rem' }}
              >
                Fecha específica
              </button>
            </div>

            {selectedDateFilter === 'CUSTOM' && (
              <input
                type="date"
                className="constructa-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            )}

            {/* Responsible filter */}
            <select
              className="constructa-input"
              style={{ width: 'auto', minWidth: '180px', fontSize: '0.82rem' }}
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
            >
              <option value="ALL">Todos los Responsables</option>
              {uniqueResponsibles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* View layout toggle */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn-icon ${viewLayout === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewLayout('timeline')}
              title="Vista Línea de Tiempo / Agenda"
              style={{
                background: viewLayout === 'timeline' ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.05)',
                color: viewLayout === 'timeline' ? '#000000' : 'var(--color-text-secondary)',
              }}
            >
              <Clock size={16} />
            </button>
            <button
              type="button"
              className={`btn-icon ${viewLayout === 'cards' ? 'active' : ''}`}
              onClick={() => setViewLayout('cards')}
              title="Vista Tarjetas"
              style={{
                background: viewLayout === 'cards' ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.05)',
                color: viewLayout === 'cards' ? '#000000' : 'var(--color-text-secondary)',
              }}
            >
              <Layers size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Activities Display */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No encontramos actividades programadas"
          description="No se registran compromisos en la agenda que coincidan con los filtros aplicados. Puedes programar una nueva reunión o visita de obra."
          actionText="Programar Nueva Actividad"
          onAction={handleCreateActivity}
        />
      ) : viewLayout === 'timeline' ? (
        /* Timeline View */
        <div className="constructa-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredActivities.map((act, index) => {
              const isToday = act.fecha === todayStr;
              return (
                <div
                  key={act.id || index}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: isToday ? 'rgba(245, 158, 11, 0.03)' : 'rgba(255, 255, 255, 0.015)',
                    border: isToday ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid var(--color-border)',
                    alignItems: 'flex-start',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Time box */}
                  <div
                    style={{
                      minWidth: '110px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--color-border)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                      {act.horaInicio}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '2px 0' }}>
                      hasta {act.horaFin}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: isToday ? 'var(--color-emerald)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {act.fecha}
                    </span>
                  </div>

                  {/* Info details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <Badge variant={getTypeBadgeVariant(act.tipo)}>
                        {act.tipo}
                      </Badge>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {act.titulo}
                      </h4>
                      {act.estado && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: act.estado === 'Cancelada' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: act.estado === 'Cancelada' ? 'var(--color-rose)' : 'var(--color-text-muted)',
                          }}
                        >
                          {act.estado}
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {act.descripcion}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={14} style={{ color: 'var(--color-gold)' }} />
                        <span>Responsable: <strong style={{ color: 'var(--color-text-primary)' }}>{act.responsable}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={14} />
                        <span>{act.proyectoNombre}</span>
                      </div>

                      {act.ubicacion && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} />
                          <span>{act.ubicacion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignSelf: 'center' }}>
                    {act.source === 'agenda' && (
                      <>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleEditActivity(act)}
                          title="Editar actividad"
                          aria-label="Editar actividad"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteActivity(act)}
                          title="Retirar de agenda"
                          aria-label="Retirar de agenda"
                          style={{ color: 'var(--color-rose)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}

                    {act.source === 'interview' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => navigate('entrevistas')}
                      >
                        Expediente
                      </Button>
                    )}

                    {act.source === 'schedule' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => navigate('cronograma')}
                      >
                        Cronograma
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredActivities.map((act, index) => {
            const isToday = act.fecha === todayStr;
            return (
              <div
                key={act.id || index}
                className="constructa-card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isToday ? '3px solid var(--color-gold)' : '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <Badge variant={getTypeBadgeVariant(act.tipo)}>
                      {act.tipo}
                    </Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      <Clock size={14} />
                      {act.horaInicio} - {act.horaFin}
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {act.titulo}
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {act.descripcion}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    <strong>Responsable:</strong> {act.responsable}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {act.ubicacion}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                    {act.source === 'agenda' ? (
                      <>
                        <Button size="sm" variant="outline" icon={Edit} onClick={() => handleEditActivity(act)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDeleteActivity(act)}>
                          Retirar
                        </Button>
                      </>
                    ) : act.source === 'interview' ? (
                      <Button size="sm" variant="outline" icon={ExternalLink} onClick={() => navigate('entrevistas')}>
                        Ver Entrevista
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" icon={ExternalLink} onClick={() => navigate('cronograma')}>
                        Ver Cronograma
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para agendar nueva actividad o editar existente */}
      <AgendaEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        initialEvent={editingEvent}
        initialDate={selectedDateFilter === 'CUSTOM' ? customDate : todayStr}
        onSave={saveAgendaActivity}
      />
    </div>
  );
}
