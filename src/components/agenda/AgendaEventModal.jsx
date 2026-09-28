import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { 
  X, 
  CalendarPlus, 
  Clock, 
  AlertTriangle, 
  User, 
  Building2, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext';

const EVENT_TYPES = [
  'Reuniones',
  'Visitas',
  'Coordinación Técnica',
  'Capacitación y Seguridad',
];

const DEFAULT_RESPONSIBLES = [
  'Ing. Carlos Mendoza Rivas',
  'Arq. Sofía Valenzuela Morales',
  'Ing. Roberto Guillén Ortiz',
  'Ing. Andrés Castro Ramos',
  'Ing. Fernando Mendoza',
  'Lic. Mariana Morales Solís',
];

export default function AgendaEventModal({
  isOpen,
  onClose,
  initialEvent = null,
  initialDate = null,
  onSave
}) {
  const { data, checkInterviewConflict, calculateEndTime } = useConstructa();

  const tomorrowStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: EVENT_TYPES[0],
    fecha: initialDate || tomorrowStr,
    horaInicio: '09:00',
    duracionMinutos: 60,
    responsable: DEFAULT_RESPONSIBLES[0],
    proyectoId: '',
    proyectoNombre: 'General / Corporativo',
    ubicacion: 'Oficina Técnica de Obra',
    estado: 'Programada',
    descripcion: '',
  });

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        id: initialEvent.id,
        titulo: initialEvent.titulo || '',
        tipo: initialEvent.tipo || EVENT_TYPES[0],
        fecha: initialEvent.fecha || tomorrowStr,
        horaInicio: initialEvent.horaInicio || '09:00',
        duracionMinutos: Number(initialEvent.duracionMinutos) || 60,
        responsable: initialEvent.responsable || DEFAULT_RESPONSIBLES[0],
        proyectoId: initialEvent.proyectoId || '',
        proyectoNombre: initialEvent.proyectoNombre || 'General / Corporativo',
        ubicacion: initialEvent.ubicacion || 'Oficina Técnica de Obra',
        estado: initialEvent.estado || 'Programada',
        descripcion: initialEvent.descripcion || '',
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        fecha: initialDate || prev.fecha || tomorrowStr,
      }));
    }
  }, [initialEvent, initialDate, isOpen, tomorrowStr]);

  if (!isOpen) return null;

  const horaFinCalculada = calculateEndTime(formData.horaInicio, formData.duracionMinutos);

  // Verificación reactiva de conflictos de agenda para el responsable seleccionado
  const conflict = checkInterviewConflict(
    {
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      duracionMinutos: formData.duracionMinutos,
      entrevistador: formData.responsable,
    },
    initialEvent?.id || null
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e) => {
    const pId = e.target.value;
    if (!pId) {
      setFormData((prev) => ({
        ...prev,
        proyectoId: '',
        proyectoNombre: 'General / Corporativo',
      }));
    } else {
      const p = data.projects.find((proj) => proj.id === pId);
      setFormData((prev) => ({
        ...prev,
        proyectoId: pId,
        proyectoNombre: p ? p.nombre : 'Proyecto',
      }));
    }
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
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                {initialEvent ? 'Editar Actividad de Agenda' : 'Programar Actividad / Reunión en Agenda'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Registro centralizado con verificación de disponibilidad de horarios
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Titulo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                Título / Asunto de la Actividad *
              </label>
              <input
                type="text"
                name="titulo"
                className="constructa-input"
                placeholder="Ej. Reunión de coordinación de cimentación, Visita técnica de inspección..."
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </div>

            {/* Tipo y Responsable */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Tipo de Actividad *
                </label>
                <select
                  name="tipo"
                  className="constructa-input"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Responsable Asignado *
                </label>
                <select
                  name="responsable"
                  className="constructa-input"
                  value={formData.responsable}
                  onChange={handleChange}
                  required
                >
                  {DEFAULT_RESPONSIBLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fecha, Hora Inicio y Duración */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Fecha *
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
                  Duración
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
                  <option value={120}>120 minutos (2 horas)</option>
                </select>
              </div>
            </div>

            {/* Ventana horaria calculada */}
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={16} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Horario proyectado:
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {formData.horaInicio} — {horaFinCalculada}
              </strong>
            </div>

            {/* Proyecto y Ubicación */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Proyecto Relacionado
                </label>
                <select
                  name="proyectoId"
                  className="constructa-input"
                  value={formData.proyectoId}
                  onChange={handleProjectChange}
                >
                  <option value="">General / Corporativo</option>
                  {data.projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Ubicación / Sala / Frente de Obra
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  className="constructa-input"
                  placeholder="Ej. Sala de Juntas, Frente de Torre Altavista..."
                  value={formData.ubicacion}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                Descripción / Puntos a Tratar
              </label>
              <textarea
                name="descripcion"
                className="constructa-input"
                rows="2"
                placeholder="Objetivo de la reunión, temas a inspeccionar, acuerdos previos..."
                value={formData.descripcion}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Live Conflict Warning */}
            {conflict.conflict && (
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
            )}
          </div>

          {/* Footer Buttons */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={conflict.conflict}
              icon={CalendarPlus}
            >
              {initialEvent ? 'Guardar Cambios' : 'Agendar Actividad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
