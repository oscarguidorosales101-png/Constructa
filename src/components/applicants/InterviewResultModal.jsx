import React, { useState } from 'react';
import Button from '../common/Button';
import { X, CheckCircle2, User, Star, FileCheck, AlertCircle } from 'lucide-react';

export default function InterviewResultModal({
  isOpen,
  onClose,
  interview,
  onSave
}) {
  const [formData, setFormData] = useState({
    resultado: 'Favorable',
    nuevoEstadoPostulante: 'Seleccionado',
    evaluacion: '',
    comentarios: '',
  });

  if (!isOpen || !interview) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'resultado') {
        if (value === 'Favorable') next.nuevoEstadoPostulante = 'Seleccionado';
        else if (value === 'Desfavorable') next.nuevoEstadoPostulante = 'No seleccionado';
        else next.nuevoEstadoPostulante = 'Entrevistado';
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(interview.id, formData);
    onClose();
  };

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div
        className="constructa-modal constructa-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '580px',
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
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--color-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Registrar Evaluación de Entrevista
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Dictamen técnico, observaciones de desempeño y resultado del proceso
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
            {/* Interview Summary Card */}
            <div
              style={{
                padding: '14px',
                background: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Candidato:</span>
                <strong style={{ color: 'var(--color-gold)' }}>{interview.postulanteNombre}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Puesto Aspirado:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{interview.puesto}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Entrevistador:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{interview.entrevistador}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Fecha y Horario:</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {interview.fecha} ({interview.horaInicio} — {interview.horaFin})
                </span>
              </div>
            </div>

            {/* Resultado Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Dictamen / Calificación *
                </label>
                <select
                  name="resultado"
                  className="constructa-input"
                  value={formData.resultado}
                  onChange={handleChange}
                  required
                >
                  <option value="Favorable">Favorable (Aprobado)</option>
                  <option value="En evaluación">En evaluación (Pendiente)</option>
                  <option value="Desfavorable">Desfavorable (Rechazado)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Nuevo Estado del Candidato
                </label>
                <select
                  name="nuevoEstadoPostulante"
                  className="constructa-input"
                  value={formData.nuevoEstadoPostulante}
                  onChange={handleChange}
                >
                  <option value="Seleccionado">Seleccionado (Listo para contratar)</option>
                  <option value="Entrevistado">Entrevistado (En análisis)</option>
                  <option value="Preseleccionado">Preseleccionado</option>
                  <option value="No seleccionado">No seleccionado (Descartado)</option>
                </select>
              </div>
            </div>

            {/* Technical Evaluation */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                Evaluación Técnica y de Aptitudes *
              </label>
              <textarea
                name="evaluacion"
                className="constructa-input"
                rows="3"
                placeholder="Descripción del desempeño en la prueba técnica, solidez de conocimientos, puntualidad y actitud..."
                value={formData.evaluacion}
                onChange={handleChange}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Observations / Next steps */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                Comentarios y Próximos Pasos
              </label>
              <textarea
                name="comentarios"
                className="constructa-input"
                rows="2"
                placeholder="Recomendación de plaza, asignación a obra específica, condiciones contractuales..."
                value={formData.comentarios}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>
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
            <Button variant="primary" type="submit" icon={<CheckCircle2 size={16} />}>
              Guardar Evaluación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
