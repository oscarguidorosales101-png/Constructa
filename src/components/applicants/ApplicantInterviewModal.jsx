import React from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  X,
  CalendarClock,
  Calendar,
  Clock,
  User,
  Briefcase,
  UserCheck,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Edit,
  RotateCcw
} from 'lucide-react';

export default function ApplicantInterviewModal({
  applicant,
  interview,
  isOpen,
  onClose,
  onOpenInfo,
  onOpenCurriculum,
  onOpenSchedule,
  onOpenResult
}) {
  if (!isOpen || !applicant) return null;

  const renderStatusBadge = (estado) => {
    switch (estado) {
      case 'Completada':
        return <Badge variant="success">Completada</Badge>;
      case 'Programada':
        return <Badge variant="info">Programada</Badge>;
      case 'Reprogramada':
        return <Badge variant="warning">Reprogramada</Badge>;
      case 'Cancelada':
        return <Badge variant="danger">Cancelada</Badge>;
      case 'No asistió':
        return <Badge variant="neutral">No Asistió</Badge>;
      default:
        return <Badge variant="neutral">{estado || 'Sin agendar'}</Badge>;
    }
  };

  const renderResultBadge = (resultado) => {
    if (!resultado) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          color: 'var(--color-text-muted)',
          fontSize: '0.84rem'
        }}>
          <Clock size={14} /> Pendiente de evaluación
        </span>
      );
    }
    if (resultado === 'Aprobado') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          color: 'var(--color-emerald)',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontWeight: 600,
          fontSize: '0.86rem'
        }}>
          <CheckCircle2 size={15} /> Aprobado para contratación
        </span>
      );
    }
    if (resultado === 'Rechazado') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          color: 'var(--color-ruby)',
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          fontWeight: 600,
          fontSize: '0.86rem'
        }}>
          <XCircle size={15} /> No Aprobado
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        color: 'var(--color-amber)',
        background: 'rgba(245, 158, 11, 0.1)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        fontWeight: 600,
        fontSize: '0.86rem'
      }}>
        <HelpCircle size={15} /> {resultado}
      </span>
    );
  };

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div
        className="constructa-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--color-sapphire)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CalendarClock size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--color-sapphire)', fontSize: '0.8rem', fontWeight: 700 }}>
                  ENTREVISTA {interview ? `• ${interview.id}` : ''}
                </span>
                <h3 className="modal-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                  Detalle de la Entrevista
                </h3>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                {applicant.nombre} • {applicant.puestoSolicitado}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{ color: 'var(--color-text-muted)' }}
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Navigation Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            {onOpenInfo && (
              <Button
                variant="ghost"
                size="sm"
                icon={<User size={13} />}
                onClick={() => {
                  onClose();
                  onOpenInfo(applicant);
                }}
              >
                Ficha General
              </Button>
            )}
            {onOpenCurriculum && (
              <Button
                variant="ghost"
                size="sm"
                icon={<FileText size={13} />}
                onClick={() => {
                  onClose();
                  onOpenCurriculum(applicant);
                }}
              >
                Ver Currículum
              </Button>
            )}
          </div>

          {interview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estado:</span>
              {renderStatusBadge(interview.estado)}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="modal-body"
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {!interview ? (
            /* NO INTERVIEW SCHEDULED STATE */
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: 'var(--color-bg-page)',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--color-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                  Sin entrevista agendada
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-secondary)', maxWidth: '420px', lineHeight: '1.5' }}>
                  El candidato <strong style={{ color: 'var(--color-text-primary)' }}>{applicant.nombre}</strong> actualmente no cuenta con una cita de entrevista programada en el sistema.
                </p>
              </div>

              {onOpenSchedule && (
                <Button
                  variant="primary"
                  icon={<CalendarClock size={16} />}
                  onClick={() => {
                    onClose();
                    onOpenSchedule(applicant);
                  }}
                  style={{ marginTop: '8px' }}
                >
                  Programar Entrevista Ahora
                </Button>
              )}
            </div>
          ) : (
            /* INTERVIEW DETAILS VIEW */
            <>
              {/* Applicant & Position Header Card */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--color-bg-page)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Postulante</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <User size={14} style={{ color: 'var(--color-gold)' }} />
                    {interview.postulanteNombre || applicant.nombre}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Puesto Solicitado</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Briefcase size={14} />
                    {interview.puesto || applicant.puestoSolicitado}
                  </strong>
                </div>
              </div>

              {/* Schedule and Interviewer Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}
              >
                <div style={{ padding: '14px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Fecha Programada</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    <Calendar size={15} style={{ color: 'var(--color-sapphire)' }} />
                    {interview.fecha}
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Horario & Duración</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    <Clock size={15} style={{ color: 'var(--color-gold)' }} />
                    {interview.horaInicio} - {interview.horaFin}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                    Duración: {interview.duracionMinutos || 45} minutos
                  </span>
                </div>

                <div style={{ padding: '14px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Hora de Finalización</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {interview.horaFin || 'No calculada'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                    Límite estimado de sala
                  </span>
                </div>

                <div style={{ padding: '14px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Entrevistador Asignado</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-gold)', marginTop: '4px' }}>
                    {interview.entrevistador}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                    Tipo: {interview.tipo || 'Evaluación Técnica'}
                  </span>
                </div>
              </div>

              {/* Status & Outcome Summary */}
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    Resultado de la Evaluación
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    {renderResultBadge(interview.resultado)}
                  </div>
                </div>

                {interview.evaluacion && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                      Calificación Técnica
                    </span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-gold)', marginTop: '2px', display: 'block' }}>
                      {interview.evaluacion} / 10
                    </strong>
                  </div>
                )}
              </div>

              {/* Observations */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Observaciones e Instrucciones
                </h4>
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--color-bg-page)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    lineHeight: '1.6',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {interview.observaciones || 'Sin observaciones registradas para esta entrevista.'}
                </div>
              </div>

              {/* Result Comments if any */}
              {interview.comentarios && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-emerald)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Dictamen y Conclusiones del Entrevistador
                  </h4>
                  <div
                    style={{
                      padding: '14px 16px',
                      background: 'rgba(16, 185, 129, 0.04)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {interview.comentarios}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.01)',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            {interview && onOpenSchedule && (
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw size={14} />}
                onClick={() => {
                  onClose();
                  onOpenSchedule(applicant, interview);
                }}
              >
                Reprogramar
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {interview && onOpenResult && (
              <Button
                variant="secondary"
                size="sm"
                icon={<CheckCircle2 size={14} />}
                onClick={() => {
                  onClose();
                  onOpenResult(interview);
                }}
              >
                {interview.resultado ? 'Actualizar Resultado' : 'Registrar Resultado'}
              </Button>
            )}

            <Button variant="primary" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
