import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function ScheduleModal({ isOpen, onClose, onSave, task, projects = [] }) {
  const [formData, setFormData] = useState({
    actividad: '',
    proyectoId: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    estado: 'En progreso',
    responsable: '',
    avance: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        actividad: task.actividad || '',
        proyectoId: task.proyectoId || (projects[0]?.id || ''),
        fechaInicio: task.fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: task.fechaFin || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        estado: task.estado || 'En progreso',
        responsable: task.responsable || '',
        avance: task.avance !== undefined ? task.avance : 0
      });
    } else {
      setFormData({
        actividad: '',
        proyectoId: projects[0]?.id || '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        estado: 'Pendiente',
        responsable: '',
        avance: 0
      });
    }
    setErrors({});
  }, [task, isOpen, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'avance' ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.actividad.trim()) newErrors.actividad = 'El nombre de la actividad es obligatorio.';
    if (!formData.proyectoId) newErrors.proyectoId = 'Selecciona el proyecto al que pertenece la actividad.';
    if (!formData.fechaInicio) newErrors.fechaInicio = 'La fecha de inicio es requerida.';
    if (!formData.fechaFin) newErrors.fechaFin = 'La fecha de fin es requerida.';
    if (formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
      newErrors.fechaFin = 'La fecha de finalización no puede ser anterior al inicio.';
    }
    if (formData.avance < 0 || formData.avance > 100) {
      newErrors.avance = 'El avance debe estar entre 0% y 100%.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...(task ? { id: task.id } : {}),
      ...formData
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Editar Actividad del Cronograma' : 'Agregar Actividad al Cronograma'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Nombre de la Actividad / Hito *</label>
            <input
              type="text"
              name="actividad"
              className={`constructa-input ${errors.actividad ? 'input-error' : ''}`}
              value={formData.actividad}
              onChange={handleChange}
              placeholder="Ej. Encofrado y colado de losas nivel 3"
            />
            {errors.actividad && <span className="constructa-error-text">{errors.actividad}</span>}
          </div>

          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Proyecto *</label>
            <select
              name="proyectoId"
              className={`constructa-input ${errors.proyectoId ? 'input-error' : ''}`}
              value={formData.proyectoId}
              onChange={handleChange}
            >
              <option value="">Selecciona un proyecto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {errors.proyectoId && <span className="constructa-error-text">{errors.proyectoId}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Fecha de Inicio *</label>
            <input
              type="date"
              name="fechaInicio"
              className={`constructa-input ${errors.fechaInicio ? 'input-error' : ''}`}
              value={formData.fechaInicio}
              onChange={handleChange}
            />
            {errors.fechaInicio && <span className="constructa-error-text">{errors.fechaInicio}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Fecha Estimada de Fin *</label>
            <input
              type="date"
              name="fechaFin"
              className={`constructa-input ${errors.fechaFin ? 'input-error' : ''}`}
              value={formData.fechaFin}
              onChange={handleChange}
            />
            {errors.fechaFin && <span className="constructa-error-text">{errors.fechaFin}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Estado de la Tarea</label>
            <select
              name="estado"
              className="constructa-input"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completada">Completada</option>
              <option value="Retrasada">Retrasada</option>
            </select>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Porcentaje de Avance ({formData.avance}%)</label>
            <input
              type="range"
              name="avance"
              min="0"
              max="100"
              step="5"
              className="constructa-input"
              value={formData.avance}
              onChange={handleChange}
              style={{ padding: '8px 0', cursor: 'pointer' }}
            />
          </div>

          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Responsable o Cuadrilla a Cargo</label>
            <input
              type="text"
              name="responsable"
              className="constructa-input"
              value={formData.responsable}
              onChange={handleChange}
              placeholder="Ej. Ing. Martín Santos / Cuadrilla Estructuras"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {task ? 'Guardar Cambios' : 'Crear Actividad'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
