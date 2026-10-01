import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { matchSearch } from '../../utils/searchUtils';

// Modales independientes en primer plano (Foreground Views)
import ApplicantInfoModal from '../../components/applicants/ApplicantInfoModal';
import ApplicantCurriculumModal from '../../components/applicants/ApplicantCurriculumModal';
import ApplicantInterviewModal from '../../components/applicants/ApplicantInterviewModal';
import ApplicantModal from '../../components/applicants/ApplicantModal';
import ScheduleInterviewModal from '../../components/applicants/ScheduleInterviewModal';
import ConvertToEmployeeModal from '../../components/applicants/ConvertToEmployeeModal';
import InterviewResultModal from '../../components/applicants/InterviewResultModal';

import {
  UserCheck,
  UserPlus,
  Users,
  Briefcase,
  Search,
  Filter,
  Calendar,
  Clock,
  Phone,
  Mail,
  Eye,
  FileText,
  Edit,
  Trash2,
  CalendarPlus,
  Building2,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Layers,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

export default function Applicants({ onNavigate }) {
  const {
    data,
    saveApplicant,
    deleteApplicant,
    convertApplicantToEmployee,
    saveInterview,
    recordInterviewResult,
    requestConfirm,
    navigateTo,
    setActiveView
  } = useConstructa();

  const navigate = onNavigate || navigateTo || setActiveView;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [expFilter, setExpFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // =========================================================================
  // MÁQUINA DE ESTADO DE MODAL ÚNICO EN PRIMER PLANO (REGLAS 1, 2, 8, 9)
  // Solo UNA acción activa a la vez: 'info' | 'curriculum' | 'interview' | 'edit' | 'create' | 'schedule' | 'convert' | 'result' | null
  // =========================================================================
  const [activeModal, setActiveModal] = useState(null);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [selectedInterviewForAction, setSelectedInterviewForAction] = useState(null);

  // Entrevista asociada al postulante actual (si existe)
  const currentApplicantInterview = useMemo(() => {
    if (!currentApplicant || !data.interviews) return null;
    return data.interviews.find((i) => i.postulanteId === currentApplicant.id) || null;
  }, [currentApplicant, data.interviews]);

  // Distinct areas
  const uniqueAreas = useMemo(() => {
    const set = new Set((data.applicants || []).map((a) => a.area).filter(Boolean));
    return Array.from(set).sort();
  }, [data.applicants]);

  // Combined real-time search and filters
  const filteredApplicants = useMemo(() => {
    return (data.applicants || []).filter((app) => {
      const skillsStr = (app.habilidades || []).join(' ');
      const expCompanies = (app.experiencias || []).map((e) => `${e.empresa} ${e.puesto}`).join(' ');

      const matchesSearch = matchSearch(searchTerm, [
        app.nombre,
        app.dni,
        app.puestoSolicitado,
        app.area,
        app.ultimoPuesto,
        app.ultimaEmpresa,
        app.email,
        app.telefono,
        app.ubicacion,
        app.estado,
        skillsStr,
        expCompanies,
      ]);

      const matchesStatus = statusFilter === 'ALL' || app.estado === statusFilter;
      const matchesArea = areaFilter === 'ALL' || app.area === areaFilter;

      let matchesExp = true;
      const exp = Number(app.experienciaAnios) || 0;
      if (expFilter === '1-3') matchesExp = exp >= 1 && exp <= 3;
      else if (expFilter === '4-6') matchesExp = exp >= 4 && exp <= 6;
      else if (expFilter === '7+') matchesExp = exp >= 7;

      return matchesSearch && matchesStatus && matchesArea && matchesExp;
    });
  }, [data.applicants, searchTerm, statusFilter, areaFilter, expFilter]);

  // Status badge helper
  const renderStatusBadge = (estado) => {
    switch (estado) {
      case 'Seleccionado':
        return <Badge variant="success">Seleccionado</Badge>;
      case 'Entrevista programada':
        return <Badge variant="info">Entrevista Programada</Badge>;
      case 'Preseleccionado':
        return <Badge variant="warning">Preseleccionado</Badge>;
      case 'En revisión':
        return <Badge variant="warning">En Revisión</Badge>;
      case 'Entrevistado':
        return <Badge variant="info">Entrevistado</Badge>;
      case 'No seleccionado':
        return <Badge variant="danger">No Seleccionado</Badge>;
      case 'Retirado':
        return <Badge variant="neutral">Retirado</Badge>;
      default:
        return <Badge variant="neutral">Recibida</Badge>;
    }
  };

  // Transiciones de modales (Cierran cualquier vista previa sin acumular paneles)
  const closeAllModals = () => {
    setActiveModal(null);
  };

  const handleOpenInfo = (applicant) => {
    setCurrentApplicant(applicant);
    setActiveModal('info');
  };

  const handleOpenCurriculum = (applicant) => {
    setCurrentApplicant(applicant);
    setActiveModal('curriculum');
  };

  const handleOpenInterview = (applicant) => {
    setCurrentApplicant(applicant);
    setActiveModal('interview');
  };

  const handleOpenEdit = (applicant) => {
    setCurrentApplicant(applicant);
    setActiveModal('edit');
  };

  const handleOpenCreate = () => {
    setCurrentApplicant(null);
    setActiveModal('create');
  };

  const handleOpenSchedule = (applicant) => {
    setCurrentApplicant(applicant);
    setActiveModal('schedule');
  };

  const handleOpenConvert = (applicant) => {
    setCurrentApplicant(applicant);
    setActiveModal('convert');
  };

  const handleOpenResult = (interview) => {
    setSelectedInterviewForAction(interview);
    setActiveModal('result');
  };

  const handleDeleteApplicant = (applicant) => {
    requestConfirm({
      title: 'Retirar Candidatura',
      message: `¿Deseas retirar y eliminar el expediente de postulación de ${applicant.nombre}? Las entrevistas asociadas serán canceladas.`,
      confirmText: 'Retirar Candidato',
      confirmVariant: 'danger',
      onConfirm: () => deleteApplicant(applicant.id),
    });
  };

  // Counts for quick metrics chips
  const totalCount = data.applicants?.length || 0;
  const inProcessCount = (data.applicants || []).filter(
    (a) => a.estado === 'En revisión' || a.estado === 'Preseleccionado'
  ).length;
  const interviewCount = (data.applicants || []).filter(
    (a) => a.estado === 'Entrevista programada'
  ).length;
  const selectedCount = (data.applicants || []).filter(
    (a) => a.estado === 'Seleccionado'
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
          <h1 className="constructa-page-title">Módulo de Postulantes y Expedientes</h1>
          <p className="constructa-page-subtitle">
            Registro integral de candidatos, consulta estructurada de currículums en primer plano, evaluación y selección de personal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            icon={<CalendarClock size={16} />}
            onClick={() => navigate('entrevistas')}
          >
            Agenda de Entrevistas
          </Button>
          <Button
            variant="primary"
            icon={<UserPlus size={16} />}
            onClick={handleOpenCreate}
          >
            Nuevo Postulante
          </Button>
        </div>
      </div>

      {/* Recruitment KPI Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total de Postulaciones</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '2px' }}>
            Expedientes registrados
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>En Revisión / Filtro Técnico</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-amber)', marginTop: '4px' }}>
            {inProcessCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Perfiles en evaluación
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Entrevistas Activas</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '4px' }}>
            {interviewCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-sky)', marginTop: '2px' }}>
            Citas agendadas en obra
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Candidatos Seleccionados</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {selectedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '2px' }}>
            Listos para contratación
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid var(--color-gold)',
            color: 'var(--color-gold)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UserCheck size={16} /> Postulantes y Expedientes ({filteredApplicants.length})
        </button>

        <button
          type="button"
          onClick={() => navigate('entrevistas')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid transparent',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CalendarClock size={16} /> Agenda de Entrevistas ({data.interviews?.length || 0})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="constructa-card"
        style={{
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '400px' }}>
            <SearchInput
              placeholder="Buscar postulante, DNI, oficio, empresa o habilidad..."
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
            <option value="Recibida">Recibida</option>
            <option value="En revisión">En revisión</option>
            <option value="Preseleccionado">Preseleccionado</option>
            <option value="Entrevista programada">Entrevista programada</option>
            <option value="Entrevistado">Entrevistado</option>
            <option value="Seleccionado">Seleccionado</option>
            <option value="No seleccionado">No seleccionado</option>
            <option value="Retirado">Retirado</option>
          </select>

          <select
            className="constructa-input"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="ALL">Todas las Áreas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            className="constructa-input"
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="ALL">Toda Experiencia</option>
            <option value="1-3">1 a 3 años</option>
            <option value="4-6">4 a 6 años</option>
            <option value="7+">7+ años (Senior)</option>
          </select>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista de tabla detallada"
            style={{
              background: viewMode === 'table' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: viewMode === 'table' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
            }}
          >
            <TableIcon size={16} />
          </button>
          <button
            type="button"
            className={`btn-icon ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Vista de tarjetas"
            style={{
              background: viewMode === 'cards' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: viewMode === 'cards' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
            }}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Main Content: Table or Cards or Empty State */}
      {filteredApplicants.length === 0 ? (
        <div className="constructa-card" style={{ padding: '20px' }}>
          <EmptyState
            title="No encontramos resultados para tu búsqueda"
            message="No existen postulantes o expedientes que coincidan con los criterios de búsqueda o filtros aplicados."
          />
        </div>
      ) : viewMode === 'table' ? (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Vacante</th>
                  <th>Postulación</th>
                  <th>Estado</th>
                  <th>Entrevista</th>
                  <th style={{ textAlign: 'center', minWidth: '280px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((app) => {
                  const interview = (data.interviews || []).find((i) => i.postulanteId === app.id);
                  return (
                    <tr key={app.id}>
                      {/* Candidato */}
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.8rem' }}>
                              {app.id}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {app.nombre}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {app.dni ? `DNI: ${app.dni} • ` : ''}{app.telefono || app.email || app.ubicacion || 'Sin contacto'}
                          </div>
                        </div>
                      </td>

                      {/* Vacante */}
                      <td>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {app.vacanteTitulo || app.puestoSolicitado}
                          </span>
                          {app.vacanteId && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Ref: {app.vacanteId}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Postulación */}
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {app.fechaPostulacion}
                      </td>

                      {/* Estado */}
                      <td>{renderStatusBadge(app.estado)}</td>

                      {/* Entrevista */}
                      <td>
                        {interview ? (
                          <div>
                            <Badge variant={interview.estado === 'Realizada' ? 'success' : interview.estado === 'Cancelada' ? 'danger' : 'info'}>
                              {interview.estado}
                            </Badge>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              {interview.fecha} {interview.horaInicio ? `• ${interview.horaInicio}` : ''}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            Sin agendar
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Ver currículum vitae completo"
                            icon={<FileText size={13} style={{ color: 'var(--color-gold)' }} />}
                            onClick={() => handleOpenCurriculum(app)}
                            style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600 }}
                          >
                            Ver CV
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Ver ficha del candidato"
                            icon={<Eye size={13} />}
                            onClick={() => handleOpenInfo(app)}
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          >
                            Ficha
                          </Button>

                          {interview ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ver detalle de la entrevista"
                              icon={<CalendarClock size={13} style={{ color: 'var(--color-sapphire)' }} />}
                              onClick={() => handleOpenInterview(app)}
                              style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--color-sapphire)' }}
                            >
                              Entrevista
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Programar entrevista para este postulante"
                              icon={<CalendarPlus size={13} style={{ color: 'var(--color-gold)' }} />}
                              onClick={() => handleOpenSchedule(app)}
                              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            >
                              Agendar
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar expediente del postulante"
                            icon={<Edit size={13} />}
                            onClick={() => handleOpenEdit(app)}
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          >
                            Editar
                          </Button>

                          {app.estado === 'Seleccionado' && !app.empleadoId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Dar de alta como empleado"
                              icon={<UserCheck size={14} style={{ color: 'var(--color-emerald)' }} />}
                              onClick={() => handleOpenConvert(app)}
                              style={{ padding: '4px 6px' }}
                            />
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Retirar postulante"
                            icon={<Trash2 size={13} style={{ color: 'var(--color-rose)' }} />}
                            onClick={() => handleDeleteApplicant(app)}
                            style={{ padding: '4px 6px' }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredApplicants.map((app) => {
            const interview = (data.interviews || []).find((i) => i.postulanteId === app.id);
            return (
              <div
                key={app.id}
                className="constructa-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.8rem' }}>
                      {app.id}
                    </span>
                    {renderStatusBadge(app.estado)}
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                    {app.nombre}
                  </h3>

                  <div style={{ fontSize: '0.88rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '6px' }}>
                    {app.vacanteTitulo || app.puestoSolicitado}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {app.dni && <div><strong>DNI:</strong> {app.dni}</div>}
                    <div><strong>Contacto:</strong> {app.telefono || app.email || 'No registrado'}</div>
                    <div>
                      <strong>Entrevista:</strong>{' '}
                      {interview ? (
                        <span style={{ color: 'var(--color-sapphire)' }}>
                          {interview.estado} ({interview.fecha})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Sin agendar</span>
                      )}
                    </div>
                  </div>
                </div>

              {/* Botones de acción organizados e independientes */}
              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {app.fechaPostulacion}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<CalendarPlus size={13} />}
                      title="Agendar Entrevista"
                      onClick={() => handleOpenSchedule(app)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={13} />}
                      title="Editar Postulante"
                      onClick={() => handleOpenEdit(app)}
                    />
                    {app.estado === 'Seleccionado' && !app.empleadoId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Dar de alta como empleado"
                        icon={<UserCheck size={13} style={{ color: 'var(--color-emerald)' }} />}
                        onClick={() => handleOpenConvert(app)}
                      />
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={12} />}
                    onClick={() => handleOpenInfo(app)}
                    style={{ fontSize: '0.75rem', padding: '6px 4px' }}
                  >
                    Ver Info
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FileText size={12} />}
                    onClick={() => handleOpenCurriculum(app)}
                    style={{ fontSize: '0.75rem', padding: '6px 4px', color: 'var(--color-gold)' }}
                  >
                    Currículum
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<CalendarClock size={12} />}
                    onClick={() => handleOpenInterview(app)}
                    style={{ fontSize: '0.75rem', padding: '6px 4px', color: 'var(--color-sapphire)' }}
                  >
                    Entrevista
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* ========================================================================= */}
      {/* MONTAJE DE MODALES EN PRIMER PLANO (MUTUAMENTE EXCLUYENTES)                */}
      {/* Nunca se acumulan paneles: Solo la acción activa se renderiza.            */}
      {/* ========================================================================= */}

      {/* 1. INFORMACIÓN PERSONAL Y PROFESIONAL */}
      <ApplicantInfoModal
        applicant={currentApplicant}
        isOpen={activeModal === 'info'}
        onClose={closeAllModals}
        onOpenCurriculum={handleOpenCurriculum}
        onOpenInterview={handleOpenInterview}
        onOpenEdit={handleOpenEdit}
        onOpenSchedule={handleOpenSchedule}
      />

      {/* 2. CURRÍCULUM VITAE COMPLETO */}
      <ApplicantCurriculumModal
        applicant={currentApplicant}
        isOpen={activeModal === 'curriculum'}
        onClose={closeAllModals}
        onOpenInfo={handleOpenInfo}
        onOpenInterview={handleOpenInterview}
        onOpenEdit={handleOpenEdit}
        onOpenSchedule={handleOpenSchedule}
      />

      {/* 3. DETALLE DE ENTREVISTA */}
      <ApplicantInterviewModal
        applicant={currentApplicant}
        interview={currentApplicantInterview}
        isOpen={activeModal === 'interview'}
        onClose={closeAllModals}
        onOpenInfo={handleOpenInfo}
        onOpenCurriculum={handleOpenCurriculum}
        onOpenSchedule={handleOpenSchedule}
        onOpenResult={handleOpenResult}
      />

      {/* 4. EDICIÓN / CREACIÓN DE POSTULANTE */}
      <ApplicantModal
        applicant={activeModal === 'edit' ? currentApplicant : null}
        isOpen={activeModal === 'edit' || activeModal === 'create'}
        onClose={closeAllModals}
        onSave={(payload) => {
          saveApplicant(payload);
          closeAllModals();
        }}
      />

      {/* 5. PROGRAMAR / AGENDAR ENTREVISTA (Con validación de conflicto) */}
      <ScheduleInterviewModal
        initialApplicant={currentApplicant}
        isOpen={activeModal === 'schedule'}
        onClose={closeAllModals}
        onSave={(interviewPayload) => {
          saveInterview(interviewPayload);
          closeAllModals();
        }}
      />

      {/* 6. CONVERTIR POSTULANTE A EMPLEADO */}
      <ConvertToEmployeeModal
        applicant={currentApplicant}
        isOpen={activeModal === 'convert'}
        onClose={closeAllModals}
        onConvert={(applicantId, employeePayload) => {
          convertApplicantToEmployee(applicantId, employeePayload);
          closeAllModals();
        }}
      />

      {/* 7. EVALUACIÓN Y RESULTADO DE ENTREVISTA */}
      <InterviewResultModal
        interview={selectedInterviewForAction || currentApplicantInterview}
        isOpen={activeModal === 'result'}
        onClose={closeAllModals}
        onSave={(interviewId, resultPayload) => {
          recordInterviewResult(interviewId, resultPayload);
          closeAllModals();
        }}
      />
    </div>
  );
}
