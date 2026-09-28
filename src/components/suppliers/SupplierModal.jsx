import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import BackButton from '../common/BackButton';

const SPECIALTIES = [
  'Cementos y Hormigones',
  'Acero y Estructuras Metálicas',
  'Maquinaria y Movimiento de Tierras',
  'Instalaciones Eléctricas y Climatización',
  'Fontanería y Tuberías',
  'Acabados y Pinturas',
  'Vidriería y Fachadas Ligeras',
  'Fijaciones y Ferretería Industrial'
];

export default function SupplierModal({ isOpen, onClose, onSave, supplier }) {
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    especialidad: 'Cementos y Hormigones',
    telefono: '',
    email: '',
    direccion: '',
    rfc: '',
    estado: 'Activo',
    condicionesPago: 'Crédito 30 días',
    tiempoEntregaEstimado: '48 a 72 horas hábiles',
    metodoContactoHabitual: 'Llamada telefónica',
    horarioAtencion: 'Lunes a Viernes 08:00 - 18:00',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        nombre: supplier.nombre || supplier.nombreComercial || '',
        contacto: supplier.contacto || '',
        especialidad: supplier.especialidad || supplier.categoria || 'Cementos y Hormigones',
        telefono: supplier.telefono || '',
        email: supplier.email || '',
        direccion: supplier.direccion || '',
        rfc: supplier.rfc || supplier.cif || '',
        estado: supplier.estado || 'Activo',
        condicionesPago: supplier.condicionesPago || 'Crédito 30 días',
        tiempoEntregaEstimado: supplier.tiempoEntregaEstimado || '48 a 72 horas hábiles',
        metodoContactoHabitual: supplier.metodoContactoHabitual || 'Llamada telefónica',
        horarioAtencion: supplier.horarioAtencion || 'Lunes a Viernes 08:00 - 18:00',
        observaciones: supplier.observaciones || '',
      });
    } else {
      setFormData({
        nombre: '',
        contacto: '',
        especialidad: 'Cementos y Hormigones',
        telefono: '',
        email: '',
        direccion: '',
        rfc: '',
        estado: 'Activo',
        condicionesPago: 'Crédito 30 días',
        tiempoEntregaEstimado: '48 a 72 horas hábiles',
        metodoContactoHabitual: 'Llamada telefónica',
        horarioAtencion: 'Lunes a Viernes 08:00 - 18:00',
        observaciones: '',
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'La razón social o nombre comercial es obligatorio.';
    if (!formData.contacto.trim()) newErrors.contacto = 'Indica el nombre de la persona de contacto.';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono de contacto es obligatorio.';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Indica un correo electrónico válido.';
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
      ...(supplier ? { id: supplier.id } : {}),
      ...formData,
      nombreComercial: formData.nombre,
      categoria: formData.especialidad,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>

        <div className="form-grid-2">
          <div className="constructa-form-group form-full-width">
            <label className="constructa-label">Razón Social / Proveedor *</label>
            <input
              type="text"
              name="nombre"
              className={`constructa-input ${errors.nombre ? 'input-error' : ''}`}
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Aceros & Estructuras del Norte S.A."
            />
            {errors.nombre && <span className="constructa-error-text">{errors.nombre}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Representante de Contacto *</label>
            <input
              type="text"
              name="contacto"
              className={`constructa-input ${errors.contacto ? 'input-error' : ''}`}
              value={formData.contacto}
              onChange={handleChange}
              placeholder="Ej. Ing. Carlos Mendoza"
            />
            {errors.contacto && <span className="constructa-error-text">{errors.contacto}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Especialidad de Suministro *</label>
            <select
              name="especialidad"
              className="constructa-input"
              value={formData.especialidad}
              onChange={handleChange}
            >
              {SPECIALTIES.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Teléfono de Enlace *</label>
            <input
              type="text"
              name="telefono"
              className={`constructa-input ${errors.telefono ? 'input-error' : ''}`}
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+52 55 4321 9876"
            />
            {errors.telefono && <span className="constructa-error-text">{errors.telefono}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              className={`constructa-input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="contacto@empresa.com"
            />
            {errors.email && <span className="constructa-error-text">{errors.email}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Condiciones de Pago</label>
            <select
              name="condicionesPago"
              className="constructa-input"
              value={formData.condicionesPago}
              onChange={handleChange}
            >
              <option value="Contado">Contado / Inmediato</option>
              <option value="Crédito 15 días">Crédito 15 días</option>
              <option value="Crédito 30 días">Crédito 30 días</option>
              <option value="Crédito 60 días">Crédito 60 días</option>
              <option value="50% anticipo, 50% entrega">50% anticipo, 50% entrega</option>
            </select>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Tiempo Estimado de Entrega</label>
            <input
              type="text"
              name="tiempoEntregaEstimado"
              className="constructa-input"
              value={formData.tiempoEntregaEstimado}
              onChange={handleChange}
              placeholder="Ej. 24 a 48 horas hábiles"
            />
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Método Habitual de Contacto</label>
            <select
              name="metodoContactoHabitual"
              className="constructa-input"
              value={formData.metodoContactoHabitual}
              onChange={handleChange}
            >
              <option value="Llamada telefónica">Llamada telefónica</option>
              <option value="Correo electrónico">Correo electrónico</option>
              <option value="Mensaje WhatsApp">Mensaje WhatsApp</option>
              <option value="Contacto presencial">Contacto presencial</option>
              <option value="Otro">Otro medio</option>
            </select>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Horario de Atención</label>
            <input
              type="text"
              name="horarioAtencion"
              className="constructa-input"
              value={formData.horarioAtencion}
              onChange={handleChange}
              placeholder="Ej. Lunes a Viernes 08:00 - 18:00"
            />
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Identificación Fiscal / CIF / RFC</label>
            <input
              type="text"
              name="rfc"
              className="constructa-input"
              value={formData.rfc}
              onChange={handleChange}
              placeholder="RFC o CIF fiscal"
            />
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Estado de Relación</label>
            <select
              name="estado"
              className="constructa-input"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="Activo">Activo (Homologado)</option>
              <option value="En Evaluación">En Evaluación</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
            
          <div className="constructa-form-group form-full-width">
            <label className="constructa-label">Dirección / Centro Logístico</label>
            <input
              type="text"
              name="direccion"
              className="constructa-input"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Parque Industrial, Nave o Dirección Comercial"
            />
          </div>

          <div className="constructa-form-group form-full-width">
            <label className="constructa-label">Observaciones y Convenios Especiales</label>
            <textarea
              name="observaciones"
              className="constructa-input"
              rows={2}
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Detalles sobre acuerdos de precios, volúmenes de entrega o notas comerciales..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {supplier ? 'Guardar Cambios' : 'Registrar Proveedor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
