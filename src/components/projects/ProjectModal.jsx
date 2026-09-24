import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

export const ProjectModal = ({ isOpen, onClose, onSave, project = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    cliente: '',
    responsable: '',
    fechaInicio: '',
    fechaFinEstimada: '',
    estado: 'Planificación',
    presupuesto: '',
    avance: 0,
    ubicacion: '',
    descripcion: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        nombre: project.nombre || '',
        codigo: project.codigo || '',
        cliente: project.cliente || '',
        responsable: project.responsable || '',
        fechaInicio: project.fechaInicio || '',
        fechaFinEstimada: project.fechaFinEstimada || '',
        estado: project.estado || 'Planificación',
        presupuesto: project.presupuesto || '',
        avance: project.avance !== undefined ? project.avance : 0,
        ubicacion: project.ubicacion || '',
        descripcion: project.descripcion || '',
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        cliente: '',
        responsable: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFinEstimada: '',
        estado: 'Planificación',
        presupuesto: '',
        avance: 0,
        ubicacion: '',
        descripcion: '',
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la obra es obligatorio.';
    if (!formData.cliente.trim()) newErrors.cliente = 'El cliente o entidad contratante es obligatorio.';
    if (!formData.responsable.trim()) newErrors.responsable = 'El profesional responsable es obligatorio.';
    if (!formData.fechaInicio) newErrors.fechaInicio = 'La fecha de inicio es requerida.';
    if (!formData.fechaFinEstimada) newErrors.fechaFinEstimada = 'La fecha estimada de finalización es requerida.';

    if (formData.fechaInicio && formData.fechaFinEstimada) {
      if (new Date(formData.fechaFinEstimada) < new Date(formData.fechaInicio)) {
        newErrors.fechaFinEstimada = 'La fecha de finalización no puede ser anterior a la fecha de inicio.';
      }
    }

    const presNum = Number(formData.presupuesto);
    if (isNaN(presNum) || presNum <= 0) {
      newErrors.presupuesto = 'El presupuesto debe ser un valor positivo mayor a cero.';
    }

    const avanceNum = Number(formData.avance);
    if (isNaN(avanceNum) || avanceNum < 0 || avanceNum > 100) {
      newErrors.avance = 'El avance debe encontrarse entre 0 y 100%.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(project ? { id: project.id } : {}),
      ...formData,
      presupuesto: presNum,
      avance: avanceNum,
    });
    onClose();
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSubmit}>
        {project ? 'Guardar Cambios' : 'Registrar Proyecto'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Editar Proyecto de Construcción' : 'Nuevo Proyecto de Construcción'}
      footer={footer}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="nombre">
            Nombre de la Obra *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="form-input"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej. Torre Altavista Residencial"
          />
          {errors.nombre && <span className="form-error">{errors.nombre}</span>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="cliente">
              Cliente / Contratante *
            </label>
            <input
              id="cliente"
              name="cliente"
              type="text"
              className="form-input"
              value={formData.cliente}
              onChange={handleChange}
              placeholder="Ej. Inversiones Urbanas S.A."
            />
            {errors.cliente && <span className="form-error">{errors.cliente}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="responsable">
              Director / Ingeniero Responsable *
            </label>
            <input
              id="responsable"
              name="responsable"
              type="text"
              className="form-input"
              value={formData.responsable}
              onChange={handleChange}
              placeholder="Ej. Ing. Carlos Mendoza Rivas"
            />
            {errors.responsable && (
              <span className="form-error">{errors.responsable}</span>
            )}
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label" htmlFor="estado">
              Estado de la Obra
            </label>
            <select
              id="estado"
              name="estado"
              className="form-select"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="Planificación">Planificación</option>
              <option value="En construcción">En construcción</option>
              <option value="Pausado">Pausado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="presupuesto">
              Presupuesto Total (USD) *
            </label>
            <input
              id="presupuesto"
              name="presupuesto"
              type="number"
              min="0"
              step="1000"
              className="form-input"
              value={formData.presupuesto}
              onChange={handleChange}
              placeholder="Ej. 4500000"
            />
            {errors.presupuesto && (
              <span className="form-error">{errors.presupuesto}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="avance">
              Avance Físico (%)
            </label>
            <input
              id="avance"
              name="avance"
              type="number"
              min="0"
              max="100"
              className="form-input"
              value={formData.avance}
              onChange={handleChange}
              placeholder="0 a 100"
            />
            {errors.avance && <span className="form-error">{errors.avance}</span>}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="fechaInicio">
              Fecha de Inicio *
            </label>
            <input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              className="form-input"
              value={formData.fechaInicio}
              onChange={handleChange}
            />
            {errors.fechaInicio && (
              <span className="form-error">{errors.fechaInicio}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fechaFinEstimada">
              Fecha Estimada de Entrega *
            </label>
            <input
              id="fechaFinEstimada"
              name="fechaFinEstimada"
              type="date"
              className="form-input"
              value={formData.fechaFinEstimada}
              onChange={handleChange}
            />
            {errors.fechaFinEstimada && (
              <span className="form-error">{errors.fechaFinEstimada}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ubicacion">
            Ubicación de la Obra
          </label>
          <input
            id="ubicacion"
            name="ubicacion"
            type="text"
            className="form-input"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ej. Av. Las Palmas #450, Distrito Metropolitano"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="descripcion">
            Descripción Técnica
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows="3"
            className="form-textarea"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Alcance del proyecto, tipología estructural y requerimientos..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
