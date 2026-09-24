import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { useConstructa } from '../../context/ConstructaContext.jsx';

const ROLES_LIST = [
  'Maestro de obra',
  'Albañil de primera',
  'Albañil de segunda',
  'Electricista industrial',
  'Fontanero especialista',
  'Soldador homologado',
  'Carpintero de encofrados',
  'Pintor de acabados',
  'Ingeniero residente',
  'Ingeniero calculista',
  'Arquitecto de obra',
  'Supervisor de campo',
  'Operador de grúa torre',
  'Operador de retroexcavadora',
  'Técnico en seguridad industrial',
  'Ayudante general',
  'Encargado de seguridad en obra',
  'Administrador de proyecto',
  'Topógrafo de precisión',
  'Fierrero armador de estructuras',
];

const SCHEDULES_LIST = [
  'Lunes a viernes — 7:00 a. m. a 4:00 p. m.',
  'Lunes a sábado — 6:00 a. m. a 2:00 p. m.',
  'Lunes a viernes — 8:00 a. m. a 5:00 p. m.',
  'Lunes a viernes — 6:30 a. m. a 3:30 p. m.',
  'Lunes a sábado — 7:00 a. m. a 3:00 p. m.',
  'Lunes a viernes — 7:30 a. m. a 4:30 p. m.',
];

export const EmployeeModal = ({ isOpen, onClose, onSave, employee = null }) => {
  const { projects } = useConstructa();

  const [formData, setFormData] = useState({
    nombre: '',
    puesto: ROLES_LIST[0],
    proyectoId: projects[0]?.id || '',
    horario: SCHEDULES_LIST[0],
    diasLaborales: 'Lunes a Viernes',
    telefono: '',
    email: '',
    estado: 'Activo',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        nombre: employee.nombre || '',
        puesto: employee.puesto || ROLES_LIST[0],
        proyectoId: employee.proyectoId || projects[0]?.id || '',
        horario: employee.horario || SCHEDULES_LIST[0],
        diasLaborales: employee.diasLaborales || 'Lunes a Viernes',
        telefono: employee.telefono || '',
        email: employee.email || '',
        estado: employee.estado || 'Activo',
      });
    } else {
      setFormData({
        nombre: '',
        puesto: ROLES_LIST[0],
        proyectoId: projects[0]?.id || '',
        horario: SCHEDULES_LIST[0],
        diasLaborales: 'Lunes a Viernes',
        telefono: '',
        email: '',
        estado: 'Activo',
      });
    }
    setErrors({});
  }, [employee, isOpen, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'horario') {
        next.diasLaborales = value.includes('Lunes a sábado') ? 'Lunes a Sábado' : 'Lunes a Viernes';
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre completo del colaborador es obligatorio.';
    }
    if (!formData.proyectoId) {
      newErrors.proyectoId = 'Debes asignar un proyecto de construcción.';
    }
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Ingresa un formato de correo corporativo válido.';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono de contacto es requerido para emergencias de obra.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(employee ? { id: employee.id } : {}),
      ...formData,
    });
    onClose();
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSubmit}>
        {employee ? 'Guardar Cambios' : 'Registrar Colaborador'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Modificar Ficha de Colaborador' : 'Registrar Nuevo Colaborador'}
      footer={footer}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="emp-nombre">
            Nombre Completo *
          </label>
          <input
            id="emp-nombre"
            name="nombre"
            type="text"
            className="form-input"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej. Roberto Morales Guillén"
          />
          {errors.nombre && <span className="form-error">{errors.nombre}</span>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="emp-puesto">
              Puesto / Especialidad *
            </label>
            <select
              id="emp-puesto"
              name="puesto"
              className="form-select"
              value={formData.puesto}
              onChange={handleChange}
            >
              {ROLES_LIST.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-proyectoId">
              Proyecto Asignado *
            </label>
            <select
              id="emp-proyectoId"
              name="proyectoId"
              className="form-select"
              value={formData.proyectoId}
              onChange={handleChange}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {errors.proyectoId && (
              <span className="form-error">{errors.proyectoId}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="emp-horario">
            Jornada y Horario de Trabajo *
          </label>
          <select
            id="emp-horario"
            name="horario"
            className="form-select"
            value={formData.horario}
            onChange={handleChange}
          >
            {SCHEDULES_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="emp-telefono">
              Teléfono de Contacto *
            </label>
            <input
              id="emp-telefono"
              name="telefono"
              type="text"
              className="form-input"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+52 55 2000-1000"
            />
            {errors.telefono && (
              <span className="form-error">{errors.telefono}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-email">
              Correo Electrónico
            </label>
            <input
              id="emp-email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="nombre.apellido@constructa.com"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="emp-estado">
            Estado Operativo
          </label>
          <select
            id="emp-estado"
            name="estado"
            className="form-select"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="Activo">Activo en Obra</option>
            <option value="En descanso">En descanso programado</option>
            <option value="Licencia">Licencia médica / permiso</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
