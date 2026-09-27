import React, { useState } from 'react';
import Button from '../common/Button';
import { X, UserPlus, HardHat, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext';

export default function ConvertToEmployeeModal({
  isOpen,
  onClose,
  applicant,
  onConvert
}) {
  const { data } = useConstructa();

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    puesto: '',
    especialidad: '',
    email: '',
    telefono: '',
    proyectoId: 'PRJ-001',
    horario: '07:00 - 16:00',
    diasLaborales: 'Lunes a Viernes',
    estado: 'Activo',
    salario: '',
  });

  React.useEffect(() => {
    if (applicant) {
      setFormData({
        nombre: applicant.nombre || '',
        dni: applicant.dni || '',
        puesto: applicant.puestoSolicitado || '',
        especialidad: applicant.area || applicant.puestoSolicitado || '',
        email: applicant.email || '',
        telefono: applicant.telefono || '',
        proyectoId: applicant.proyectoAsignadoTentativo || 'PRJ-001',
        horario: '07:00 - 16:00',
        diasLaborales: 'Lunes a Viernes',
        estado: 'Activo',
        salario: '',
      });
    }
  }, [applicant, isOpen]);

  if (!isOpen || !applicant) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConvert(applicant.id, formData);
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
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--color-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Contratar y Dar de Alta como Empleado
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Incorporación formal a la plantilla activa preservando el expediente de postulación
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
            {/* Applicant Reference Banner */}
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Expediente Origen:</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                  {applicant.nombre} ({applicant.id})
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-emerald)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Candidato Seleccionado
              </span>
            </div>

            {/* General Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Nombre del Empleado *
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="constructa-input"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Identificación / DNI *
                </label>
                <input
                  type="text"
                  name="dni"
                  className="constructa-input"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Puesto en Obra *
                </label>
                <input
                  type="text"
                  name="puesto"
                  className="constructa-input"
                  value={formData.puesto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Especialidad / Cuadrilla
                </label>
                <input
                  type="text"
                  name="especialidad"
                  className="constructa-input"
                  value={formData.especialidad}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Project & Operational Assignment */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Proyecto de Asignación *
                </label>
                <select
                  name="proyectoId"
                  className="constructa-input"
                  value={formData.proyectoId}
                  onChange={handleChange}
                  required
                >
                  {data.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Horario de Trabajo
                </label>
                <select
                  name="horario"
                  className="constructa-input"
                  value={formData.horario}
                  onChange={handleChange}
                >
                  <option value="07:00 - 16:00">07:00 - 16:00 (Turno Matutino)</option>
                  <option value="08:00 - 17:00">08:00 - 17:00 (Turno Regular)</option>
                  <option value="09:00 - 18:00">09:00 - 18:00 (Turno Administrativo)</option>
                  <option value="20:00 - 05:00">20:00 - 05:00 (Turno Nocturno)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Días Laborales
                </label>
                <select
                  name="diasLaborales"
                  className="constructa-input"
                  value={formData.diasLaborales}
                  onChange={handleChange}
                >
                  <option value="Lunes a Viernes">Lunes a Viernes</option>
                  <option value="Lunes a Sábado">Lunes a Sábado</option>
                  <option value="Martes a Sábado">Martes a Sábado</option>
                  <option value="Cuadrilla Rotativa">Cuadrilla Rotativa (4x3)</option>
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  name="telefono"
                  className="constructa-input"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  className="constructa-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
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
              Confirmar Alta en Nómina
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
