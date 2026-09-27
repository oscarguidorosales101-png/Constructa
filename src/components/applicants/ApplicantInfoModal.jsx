import React from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  X,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Building2,
  FileText,
  CalendarClock,
  Edit,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export default function ApplicantInfoModal({
  applicant,
  isOpen,
  onClose,
  onOpenCurriculum,
  onOpenInterview,
  onOpenEdit,
  onOpenSchedule
}) {
  if (!isOpen || !applicant) return null;

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

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div
        className="constructa-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          width: '95%',
          maxHeight: '88vh',
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 700 }}>
                  {applicant.id}
                </span>
                <h3 className="modal-title" style={{ margin: 0 }}>
                  {applicant.nombre}
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Ficha resumida del postulante • {applicant.puestoSolicitado}
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn-icon" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body with internal scroll */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status & Availability Strip */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                Estado Actual de la Postulación:
              </span>
              <div style={{ marginTop: '2px' }}>{renderStatusBadge(applicant.estado)}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                Disponibilidad:
              </span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-emerald)' }}>
                {applicant.disponibilidad || 'Inmediata'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                Jornada:
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                {applicant.tipoJornada || 'Tiempo Completo'}
              </span>
            </div>
          </div>

          {/* Personal & Contact Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '14px',
              background: 'var(--color-bg-page)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Identificación / DNI</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {applicant.dni || '—'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Teléfono Móvil</span>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Phone size={13} style={{ color: 'var(--color-gold)' }} />
                {applicant.telefono || '—'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Correo Electrónico</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Mail size={13} style={{ color: 'var(--color-gold)' }} />
                {applicant.email || '—'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Ubicación</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <MapPin size={13} style={{ color: 'var(--color-gold)' }} />
                {applicant.ubicacion || '—'}
              </div>
            </div>
          </div>

          {/* Professional Overview */}
          <div
            style={{
              padding: '14px',
              background: 'var(--color-bg-page)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Puesto Solicitado</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '2px' }}>
                  {applicant.puestoSolicitado}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Área / Especialidad</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {applicant.area || 'Operaciones'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Años de Experiencia</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {applicant.experienciaAnios ? `${applicant.experienciaAnios} años comprobados` : 'No especificada'}
                </div>
              </div>
            </div>

            {applicant.perfilProfesional && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                  Extracto de Perfil:
                </span>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  {applicant.perfilProfesional}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Último Cargo</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {applicant.ultimoPuesto || '—'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Última Empresa</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {applicant.ultimaEmpresa || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick shortcuts to other independent views */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Consultas específicas en primer plano:
            </span>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="sm"
                icon={<FileText size={14} />}
                onClick={() => {
                  onClose();
                  onOpenCurriculum(applicant);
                }}
              >
                Ver Currículum
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={<CalendarClock size={14} />}
                onClick={() => {
                  onClose();
                  onOpenInterview(applicant);
                }}
              >
                Ver Entrevista
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon={<Edit size={14} />}
                onClick={() => {
                  onClose();
                  onOpenEdit(applicant);
                }}
              >
                Editar
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
