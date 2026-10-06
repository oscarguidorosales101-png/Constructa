import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import BackButton from '../common/BackButton';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import { Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

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
  const { consultarHacienda } = useConstructa();

  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    especialidad: 'Cementos y Hormigones',
    telefono: '',
    email: '',
    direccion: '',
    rfc: '',
    identificacion: '',
    tipoIdentificacion: '02',
    tipoIdentificacionDescripcion: 'Cédula Jurídica',
    estado: 'Activo',
    condicionesPago: 'Crédito 30 días',
    tiempoEntregaEstimado: '48 a 72 horas hábiles',
    metodoContactoHabitual: 'Llamada telefónica',
    horarioAtencion: 'Lunes a Viernes 08:00 - 18:00',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [haciendaLoading, setHaciendaLoading] = useState(false);
  const [haciendaResult, setHaciendaResult] = useState(null);

  useEffect(() => {
    if (supplier) {
      setFormData({
        nombre: supplier.nombre || supplier.nombreComercial || '',
        contacto: supplier.contacto || '',
        especialidad: supplier.especialidad || supplier.categoria || 'Cementos y Hormigones',
        telefono: supplier.telefono || '',
        email: supplier.email || '',
        direccion: supplier.direccion || '',
        rfc: supplier.rfc || supplier.identificacion || supplier.cif || '',
        identificacion: supplier.identificacion || supplier.rfc || '',
        tipoIdentificacion: supplier.tipoIdentificacion || '02',
        tipoIdentificacionDescripcion: supplier.tipoIdentificacionDescripcion || 'Cédula Jurídica',
        estado: supplier.estado || 'Activo',
        condicionesPago: supplier.condicionesPago || 'Crédito 30 días',
        tiempoEntregaEstimado: supplier.tiempoEntregaEstimado || '48 a 72 horas hábiles',
        metodoContactoHabitual: supplier.metodoContactoHabitual || 'Llamada telefónica',
        horarioAtencion: supplier.horarioAtencion || 'Lunes a Viernes 08:00 - 18:00',
        observaciones: supplier.observaciones || '',
      });
      setHaciendaResult(null);
    } else {
      setFormData({
        nombre: '',
        contacto: '',
        especialidad: 'Cementos y Hormigones',
        telefono: '',
        email: '',
        direccion: '',
        rfc: '',
        identificacion: '',
        tipoIdentificacion: '02',
        tipoIdentificacionDescripcion: 'Cédula Jurídica',
        estado: 'Activo',
        condicionesPago: 'Crédito 30 días',
        tiempoEntregaEstimado: '48 a 72 horas hábiles',
        metodoContactoHabitual: 'Llamada telefónica',
        horarioAtencion: 'Lunes a Viernes 08:00 - 18:00',
        observaciones: '',
      });
      setHaciendaResult(null);
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

  const handleConsultarHacienda = async () => {
    if (!formData.identificacion || !formData.identificacion.trim()) {
      setErrors(prev => ({
        ...prev,
        identificacion: 'Ingresa la cédula física o jurídica del proveedor para consultar en Hacienda.'
      }));
      return;
    }

    setHaciendaLoading(true);
    setHaciendaResult(null);
    setErrors(prev => ({ ...prev, identificacion: null }));

    try {
      const res = await consultarHacienda(formData.identificacion);

      if (res && res.ok) {
        setFormData(prev => ({
          ...prev,
          nombre: res.nombre || prev.nombre,
          rfc: res.identificacion,
          tipoIdentificacion: res.tipoIdentificacion || '02',
          tipoIdentificacionDescripcion: res.tipoDescripcion || 'Cédula Registrada'
        }));

        setHaciendaResult({
          success: true,
          message: `Verificado en Hacienda CR: ${res.nombre} (${res.tipoDescripcion || 'Válido'})`
        });
      } else {
        setHaciendaResult({
          success: false,
          message: res?.error || 'No se localizó la identificación en Hacienda. Puedes ingresar los datos manualmente.'
        });
      }
    } catch (_) {
      setHaciendaResult({
        success: false,
        message: 'No fue posible conectar con Hacienda. Puedes completar el registro manualmente.'
      });
    } finally {
      setHaciendaLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...(supplier ? { id: supplier.id } : {}),
      ...formData,
      nombreComercial: formData.nombre,
      categoria: formData.especialidad,
      identificacion: formData.identificacion || formData.rfc,
      rfc: formData.identificacion || formData.rfc,
    };

    const res = await onSave(payload);
    if (res === false || (res && res.ok === false)) {
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>

        {/* Sección Consulta Tributaria Hacienda */}
        <div style={{ background: 'var(--color-bg-card-hover)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--color-border)' }}>
          <label className="constructa-label" style={{ fontWeight: 700, color: 'var(--color-gold)', display: 'block', marginBottom: '4px' }}>
            Identificación Fiscal & Consulta Hacienda (Costa Rica)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '8px', alignItems: 'flex-start' }}>
            <div>
              <input
                type="text"
                name="identificacion"
                className={`constructa-input ${errors.identificacion ? 'input-error' : ''}`}
                value={formData.identificacion}
                onChange={handleChange}
                placeholder="Ej. 3101123456"
              />
              {errors.identificacion && <span className="constructa-error-text">{errors.identificacion}</span>}
            </div>

            <div>
              <select
                name="tipoIdentificacion"
                className="constructa-input"
                value={formData.tipoIdentificacion}
                onChange={(e) => {
                  const val = e.target.value;
                  const descMap = { '01': 'Cédula Física', '02': 'Cédula Jurídica', '03': 'DIMEX', '04': 'NITE' };
                  setFormData(prev => ({
                    ...prev,
                    tipoIdentificacion: val,
                    tipoIdentificacionDescripcion: descMap[val] || 'Identificación Tributaria'
                  }));
                }}
              >
                <option value="02">02 - Cédula Jurídica</option>
                <option value="01">01 - Cédula Física</option>
                <option value="03">03 - DIMEX</option>
                <option value="04">04 - NITE</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleConsultarHacienda}
              disabled={haciendaLoading}
              icon={haciendaLoading ? <RefreshCw size={14} className="spin-animation" /> : <Search size={14} />}
              style={{ whiteSpace: 'nowrap' }}
            >
              {haciendaLoading ? 'Consultando...' : 'Consultar Hacienda'}
            </Button>
          </div>

          {haciendaResult && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: haciendaResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: haciendaResult.success ? '#10b981' : '#f87171',
                border: `1px solid ${haciendaResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {haciendaResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{haciendaResult.message}</span>
            </div>
          )}
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
