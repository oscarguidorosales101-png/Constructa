import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { matchSearch } from '../../utils/searchUtils';

import ScheduleInterviewModal from '../../components/applicants/ScheduleInterviewModal';
import InterviewResultModal from '../../components/applicants/InterviewResultModal';
import ApplicantDetailModal from '../../components/applicants/ApplicantDetailModal';
import ConvertToEmployeeModal from '../../components/applicants/ConvertToEmployeeModal';

import {
  CalendarClock,
  Calendar,
  Clock,
  User,
  Users,
  Building2,
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Eye,
  Layers,
  Table as TableIcon,
  CalendarDays,
  UserCheck,
  ChevronRight,
  Briefcase
} from 'lucide-react';

export default function Interviews({ onNavigate }) {
  const {
    data,
    saveInterview,
    rescheduleInterview,
    cancelInterview,
    recordInterviewResult,
    convertApplicantToEmployee,
    requestConfirm,
    navigateTo,
    setActiveView
  } = useConstructa();

  const navigate = onNavigate || navigateTo || setActiveView;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [interviewerFilter, setInterviewerFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'table'
  const [selectedDay, setSelectedDay] = useState(todayStr);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [evaluatingInterview, setEvaluatingInterview] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [applicantForConvert, setApplicantForConvert] = useState(null);

  // Unique interviewers for filter
  const uniqueInterviewers = useMemo(() => {
    const set = new Set((data.interviews || []).map((i) => i.entrevistador).filter(Boolean));
    return Array.from(set).sort();
  }, [data.interviews]);

  // Combined search and filters for list view
  const filteredInterviews = useMemo(() => {
    return (data.interviews || []).filter((inv) => {
      const matchesSearch = matchSearch(searchTerm, [
        inv.postulanteNombre,
        inv.puesto,
        inv.entrevistador,
        inv.tipo,
        inv.fecha,
        inv.horaInicio,
        inv.horaFin,
        inv.estado,
        inv.observaciones,
        inv.resultado,
      ]);

      const matchesStatus = statusFilter === 'ALL' || inv.estado === statusFilter;
      const matchesInterviewer = interviewerFilter === 'ALL' || inv.entrevistador === interviewerFilter;

      return matchesSearch && matchesStatus && matchesInterviewer;
    });
  }, [data.interviews, searchTerm, statusFilter, interviewerFilter]);

  // Daily agenda interviews sorted by start time
  const dailyInterviews = useMemo(() => {
    return (data.interviews || [])
      .filter((i) => i.fecha === selectedDay && i.estado !== 'Cancelada')
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [data.interviews, selectedDay]);

  // Status badge helper
  const renderStatusBadge = (estado) => {
    switch (estado) {
      case 'Programada':
        return <Badge variant="info">Programada</Badge>;
      case 'Realizada':
        return <Badge variant="success">Realizada</Badge>;
      case 'Reprogramada':
        return <Badge variant="warning">Reprogramada</Badge>;
      case 'Cancelada':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  // Action handlers
  const handleOpenScheduleNew = () => {
    setEditingInterview(null);
    setScheduleModalOpen(true);
  };

  const handleOpenReschedule = (interview) => {
    setEditingInterview(interview);
    setScheduleModalOpen(true);
  };

  const handleOpenEvaluate = (interview) => {
    setEvaluatingInterview(interview);
    setResultModalOpen(true);
  };

  const handleOpenApplicantDetail = (interview) => {
    const found = data.applicants?.find((a) => a.id === interview.postulanteId);
    if (found) {
      setSelectedApplicant(found);
      setDetailModalOpen(true);
    }
  };

  const handleCancelInterview = (interview) => {
    requestConfirm({
      title: 'Cancelar Entrevista',
      message: `¿Deseas cancelar la entrevista de ${interview.postulanteNombre} programada para el ${interview.fecha} a las ${interview.horaInicio}? El horario quedará liberado en la agenda.`,
      confirmText: 'Cancelar Entrevista',
      confirmVariant: 'danger',
      onConfirm: () => cancelInterview(interview.id, 'Cancelada por el administrador'),
    });
  };

  // Metrics counters
  const totalScheduled = (data.interviews || []).filter(
    (i) => i.estado === 'Programada' || i.estado === 'Reprogramada'
  ).length;
  const totalCompleted = (data.interviews || []).filter((i) => i.estado === 'Realizada').length;
  const totalToday = (data.interviews || []).filter(
    (i) => i.fecha === todayStr && i.estado !== 'Cancelada'
  ).length;

  return (
    <div className="constructa-page">
      {/* Page Header */}
      <div className="constructa-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Gestión de Talento y Selección
            </span>
          </div>
          <h1 className="constructa-page-title">Agenda y Control de Entrevistas</h1>
          <p className="constructa-page-subtitle">
            Coordinación de citas presenciales y virtuales con prevención algorítmica de conflictos de horario y evaluación técnica.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            icon={<UserCheck size={16} />}
            onClick={() => navigate('postulantes')}
          >
            Ver Postulantes
          </Button>
          <Button
            variant="primary"
            icon={<CalendarPlus size={16} />}
            onClick={handleOpenScheduleNew}
          >
            Programar Entrevista
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Entrevistas Activas en Agenda</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '4px' }}>
            {totalScheduled}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-sky)', marginTop: '2px' }}>
            Pendientes de realizarse
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Citas para Hoy ({todayStr})</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
            {totalToday}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Programadas para el día de hoy
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Entrevistas Realizadas</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {totalCompleted}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '2px' }}>
            Evaluadas y documentadas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Prevención de Conflictos</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            100%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '2px' }}>
            Validación de agenda activa
          </div>
        </div>
      </div>

      {/* Subtabs and View Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: viewMode === 'agenda' ? '2px solid var(--color-gold)' : '2px solid transparent',
              color: viewMode === 'agenda' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: viewMode === 'agenda' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CalendarDays size={16} /> Vista de Agenda Diaria
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: viewMode === 'table' ? '2px solid var(--color-gold)' : '2px solid transparent',
              color: viewMode === 'table' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: viewMode === 'table' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <TableIcon size={16} /> Listado General ({filteredInterviews.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('postulantes')}
          style={{
            fontSize: '0.82rem',
            color: 'var(--color-gold)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Volver a Postulantes <ChevronRight size={14} />
        </button>
      </div>

      {/* VISTA 1: AGENDA DIARIA */}
      {viewMode === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Day Selector Bar */}
          <div
            className="constructa-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <label style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Consultar Fecha:
              </label>
              <input
                type="date"
                className="constructa-input"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                style={{ width: 'auto' }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDay(todayStr)}
              >
                Ir a Hoy
              </Button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {dailyInterviews.length === 0
                ? 'No hay entrevistas programadas en esta fecha'
                : `${dailyInterviews.length} entrevista(s) programada(s) para este día`}
            </div>
          </div>

          {/* Daily Schedule Timeline */}
          {dailyInterviews.length === 0 ? (
            <div className="constructa-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <CalendarClock size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px auto' }} />
              <h4 style={{ color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
                Agenda libre para el {selectedDay}
              </h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                No hay citas agendadas que generen conflicto en este horario.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<CalendarPlus size={14} />}
                onClick={handleOpenScheduleNew}
              >
                Agendar Entrevista para este Día
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dailyInterviews.map((inv) => (
                <div
                  key={inv.id}
                  className="constructa-card"
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                    borderLeft: inv.estado === 'Realizada' ? '4px solid var(--color-emerald)' : '4px solid var(--color-gold)',
                  }}
                >
                  {/* Time and Candidate */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '280px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        minWidth: '110px',
                      }}
                    >
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                        {inv.horaInicio}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        hasta {inv.horaFin}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {inv.postulanteNombre}
                        </h4>
                        {renderStatusBadge(inv.estado)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Postulación: <strong style={{ color: 'var(--color-gold)' }}>{inv.puesto}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Entrevistador: {inv.entrevistador} • {inv.tipo}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this slot */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={() => handleOpenApplicantDetail(inv)}
                      title="Ver expediente del postulante"
                    >
                      Ver Expediente
                    </Button>

                    {inv.estado !== 'Realizada' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<FileCheck size={14} />}
                          onClick={() => handleOpenEvaluate(inv)}
                        >
                          Evaluar
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CalendarClock size={14} />}
                          onClick={() => handleOpenReschedule(inv)}
                          title="Reprogramar horario"
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<XCircle size={14} style={{ color: 'var(--color-rose)' }} />}
                          onClick={() => handleCancelInterview(inv)}
                          title="Cancelar entrevista"
                        />
                      </>
                    )}

                    {inv.estado === 'Realizada' && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: inv.resultado === 'Favorable' ? 'var(--color-emerald)' : 'var(--color-rose)',
                          background: inv.resultado === 'Favorable' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${inv.resultado === 'Favorable' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2 size={14} /> Dictamen: {inv.resultado || 'Concluida'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: LISTADO GENERAL TABULAR */}
      {viewMode === 'table' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div
            className="constructa-card"
            style={{
              padding: '14px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
              <SearchInput
                placeholder="Buscar por postulante, entrevistador o puesto..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>

            <select
              className="constructa-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Programada">Programada</option>
              <option value="Realizada">Realizada</option>
              <option value="Reprogramada">Reprogramada</option>
              <option value="Cancelada">Cancelada</option>
            </select>

            <select
              className="constructa-input"
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '200px' }}
            >
              <option value="ALL">Todos los Entrevistadores</option>
              {uniqueInterviewers.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="constructa-card" style={{ padding: '20px' }}>
              <EmptyState
                title="No encontramos resultados para tu búsqueda"
                message="No se encontraron entrevistas que coincidan con los criterios de búsqueda aplicados."
              />
            </div>
          ) : (
            <div className="constructa-card" style={{ overflow: 'hidden' }}>
              <div className="constructa-table-container">
                <table className="constructa-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Fecha y Hora</th>
                      <th>Postulante</th>
                      <th>Puesto Solicitado</th>
                      <th>Entrevistador</th>
                      <th>Tipo / Modalidad</th>
                      <th>Estado</th>
                      <th>Resultado</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterviews.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.82rem' }}>
                          {inv.id}
                        </td>

                        <td>
                          <div>
                            <strong style={{ color: 'var(--color-text-primary)' }}>{inv.fecha}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-gold)' }}>
                              {inv.horaInicio} — {inv.horaFin} ({inv.duracionMinutos}m)
                            </div>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => handleOpenApplicantDetail(inv)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-text-primary)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'left',
                              padding: 0,
                              textDecoration: 'underline',
                              textUnderlineOffset: '3px',
                            }}
                            title="Ver expediente del postulante"
                          >
                            {inv.postulanteNombre}
                          </button>
                        </td>

                        <td style={{ fontSize: '0.85rem' }}>{inv.puesto}</td>

                        <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          {inv.entrevistador}
                        </td>

                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {inv.tipo}
                        </td>

                        <td>{renderStatusBadge(inv.estado)}</td>

                        <td>
                          {inv.resultado ? (
                            <span
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: inv.resultado === 'Favorable' ? 'var(--color-emerald)' : 'var(--color-rose)',
                              }}
                            >
                              {inv.resultado}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Consultar expediente del postulante"
                              icon={<Eye size={15} />}
                              onClick={() => handleOpenApplicantDetail(inv)}
                            />

                            {inv.estado !== 'Realizada' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Evaluar y asentar resultado"
                                  icon={<FileCheck size={15} style={{ color: 'var(--color-emerald)' }} />}
                                  onClick={() => handleOpenEvaluate(inv)}
                                />

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Reprogramar entrevista"
                                  icon={<CalendarClock size={15} />}
                                  onClick={() => handleOpenReschedule(inv)}
                                />

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Cancelar entrevista"
                                  icon={<XCircle size={15} style={{ color: 'var(--color-rose)' }} />}
                                  onClick={() => handleCancelInterview(inv)}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals Mounting */}
      <ScheduleInterviewModal
        initialInterview={editingInterview}
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setEditingInterview(null);
        }}
        onSave={(payload) => {
          if (editingInterview) {
            rescheduleInterview(editingInterview.id, payload);
          } else {
            saveInterview(payload);
          }
        }}
      />

      <InterviewResultModal
        interview={evaluatingInterview}
        isOpen={resultModalOpen}
        onClose={() => {
          setResultModalOpen(false);
          setEvaluatingInterview(null);
        }}
        onSave={(id, resultData) => recordInterviewResult(id, resultData)}
      />

      <ApplicantDetailModal
        applicant={selectedApplicant}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedApplicant(null);
        }}
        onOpenScheduleInterview={(app) => {
          setEditingInterview(null);
          setScheduleModalOpen(true);
        }}
        onOpenConvertToEmployee={(app) => {
          setApplicantForConvert(app);
          setConvertModalOpen(true);
        }}
        onOpenEdit={(app) => navigate('postulantes')}
      />

      <ConvertToEmployeeModal
        applicant={applicantForConvert}
        isOpen={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setApplicantForConvert(null);
        }}
        onConvert={(applicantId, employeePayload) => convertApplicantToEmployee(applicantId, employeePayload)}
      />
    </div>
  );
}
