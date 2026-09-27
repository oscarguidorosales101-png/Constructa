import React, { useState, useEffect, useMemo } from 'react';
import Button from '../common/Button';
import { 
  X, 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  AlertCircle 
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext';

const INTERVIEWERS = [
  'Ing. Carlos Mendoza Rivas',
  'Arq. Sofía Valenzuela Morales',
  'Ing. Roberto Guillén Ortiz',
  'Ing. Andrés Castro Ramos',
  'Lic. Patricia Gómez - RRHH',
  'Ing. Fernando Mendoza - Dirección General',
];

const INTERVIEW_TYPES = [
  'Técnica / Presencial en Obra',
  'Técnica Especializada',
  'Virtual / Videollamada',
  'Prueba Práctica y de Maniobras',
  'Psicométrica y RRHH',
  'Entrevista de Dirección / Jefatura',
];

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  initialApplicant = null,
  initialInterview = null, // if rescheduling
  onSave
}) {
  const { data, checkInterviewConflict, calculateEndTime } = useConstructa();

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    postulanteId: '',
    postulanteNombre: '',
    puesto: '',
    fecha: tomorrowStr,
    horaInicio: '10:00',
    duracionMinutos: 45,
    entrevistador: INTERVIEWERS[0],
    tipo: INTERVIEW_TYPES[0],
    observaciones: '',
  });

  useEffect(() => {
    if (initialInterview) {
      setFormData({
        id: initialInterview.id,
        postulanteId: initialInterview.postulanteId,
        postulanteNombre: initialInterview.postulanteNombre,
        puesto: initialInterview.puesto,
        fecha: initialInterview.fecha,
        horaInicio: initialInterview.horaInicio,
        duracionMinutos: Number(initialInterview.duracionMinutos) || 45,
        entrevistador: initialInterview.entrevistador,
        tipo: initialInterview.tipo,
        observaciones: initialInterview.observaciones || '',
      });
    } else if (initialApplicant) {
      setFormData((prev) => ({
        ...prev,
        postulanteId: initialApplicant.id,
        postulanteNombre: initialApplicant.nombre,
        puesto: initialApplicant.puestoSolicitado,
        fecha: prev.fecha || tomorrowStr,
        horaInicio: '10:00',
        duracionMinutos: 45,
      }));
    } else if (data.applicants && data.applicants.length > 0) {
      const first = data.applicants[0];
      setFormData((prev) => ({
        ...prev,
        postulanteId: first.id,
        postulanteNombre: first.nombre,
        puesto: first.puestoSolicitado,
      }));
    }
  }, [initialApplicant, initialInterview, isOpen, data.applicants, tomorrowStr]);

  if (!isOpen) return null;

  // Cálculo dinámico de la hora de finalización
  const horaFinCalculada = calculateEndTime(formData.horaInicio, formData.duracionMinutos);

  // Verificación reactiva de conflictos de agenda
  const conflict = checkInterviewConflict(
    {
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      duracionMinutos: formData.duracionMinutos,
      entrevistador: formData.entrevistador,
      postulanteId: formData.postulanteId,
    },
    initialInterview?.id || null
  );

  const handleApplicantSelect = (e) => {
    const applicantId = e.target.value;
    const found = data.applicants.find((a) => a.id === applicantId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        postulanteId: found.id,
        postulanteNombre: found.nombre,
        puesto: found.puestoSolicitado,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (conflict.conflict) return;

    onSave({
      ...formData,
      horaFin: horaFinCalculada,
      duracionMinutos: Number(formData.duracionMinutos),
    });
    onClose();
  };

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div
        className="constructa-modal constructa-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '650px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.1)',
                color: 'var(--color-sky)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarClock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                {initialInterview ? 'Reprogramar Entrevista' : 'Programar Entrevista Laboral'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Coordinación de cita con verificación automática de solapamiento de horarios
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Candidate Selector or Locked Info */}
            {initialApplicant || initialInterview ? (
              <div
                style={{
                  padding: '14px',
                  background: 'var(--color-bg-page)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Candidato Seleccionado:</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                    {formData.postulanteNombre}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    Postulación a: <strong>{formData.puesto}</strong>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  ID: {formData.postulanteId}
                </span>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Seleccionar Postulante *
                </label>
                <select
                  name="postulanteId"
                  className="constructa-input"
                  value={formData.postulanteId}
                  onChange={handleApplicantSelect}
                  required
                >
                  {data.applicants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} — {a.puestoSolicitado} ({a.estado})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date and Time Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Fecha de la Entrevista *
                </label>
                <input
                  type="date"
                  name="fecha"
                  className="constructa-input"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Hora de Inicio *
                </label>
                <input
                  type="time"
                  name="horaInicio"
                  className="constructa-input"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Duración Estimada
                </label>
                <select
                  name="duracionMinutos"
                  className="constructa-input"
                  value={formData.duracionMinutos}
                  onChange={handleChange}
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                  <option value={90}>90 minutos (1.5 horas)</option>
                </select>
              </div>
            </div>

            {/* Calculated End Time Indicator */}
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--color-gold)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Ventana Horaria Programada:
                </span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                  {formData.horaInicio} — {horaFinCalculada}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  ({formData.duracionMinutos} min)
                </span>
              </div>
            </div>

            {/* Interviewer & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Entrevistador Asignado *
                </label>
                <select
                  name="entrevistador"
                  className="constructa-input"
                  value={formData.entrevistador}
                  onChange={handleChange}
                  required
                >
                  {INTERVIEWERS.map((ent) => (
                    <option key={ent} value={ent}>
                      {ent}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Tipo y Modalidad de Entrevista
                </label>
                <select
                  name="tipo"
                  className="constructa-input"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                Instrucciones / Observaciones previas
              </label>
              <textarea
                name="observaciones"
                className="constructa-input"
                rows="2"
                placeholder="Llevar currículum impreso, certificados de seguridad, evaluación en sitio de obra..."
                value={formData.observaciones}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Live Conflict Warning Banner */}
            {conflict.conflict ? (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--color-rose)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>
                    Conflicto de Horario Detectado
                  </strong>
                  {conflict.message}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-emerald)',
                  fontSize: '0.82rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Horario disponible en agenda sin solapamiento de entrevistas.</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.01)',
            }}
          >
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={conflict.conflict}
              icon={<CalendarClock size={16} />}
            >
              {initialInterview ? 'Guardar Reprogramación' : 'Confirmar y Agendar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
