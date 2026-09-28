import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import BackButton from '../common/BackButton';
import { Phone, Mail, MessageSquare, Users, Copy, Check, Info } from 'lucide-react';

export default function SupplierCommunicationModal({
  isOpen,
  onClose,
  onSave,
  supplier,
  order = null,
  initialMotivo = '',
}) {
  const [copiedField, setCopiedField] = useState(null);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    medio: 'Llamada',
    personaContactada: '',
    motivo: '',
    resultado: 'Disponibilidad confirmada',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setFormData({
        fecha: now.toISOString().split('T')[0],
        hora: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        medio: supplier?.metodoContactoHabitual || 'Llamada',
        personaContactada: supplier?.contacto || '',
        motivo: initialMotivo || (order ? `Seguimiento de orden ${order.numeroOrden}` : 'Consulta de suministro y catálogo'),
        resultado: 'Disponibilidad confirmada',
        observaciones: '',
      });
      setErrors({});
      setCopiedField(null);
    }
  }, [isOpen, supplier, order, initialMotivo]);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.personaContactada.trim()) {
      newErrors.personaContactada = 'Indica el nombre de la persona contactada.';
    }
    if (!formData.motivo.trim()) {
      newErrors.motivo = 'Especifica el motivo de la comunicación.';
    }
    if (!formData.resultado.trim()) {
      newErrors.resultado = 'Registra el resultado obtenido del contacto.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    onSave({
      proveedorId: supplier?.id,
      proveedorNombre: supplier?.nombre || supplier?.nombreComercial,
      ordenCompraId: order?.id || null,
      ordenNumero: order?.numeroOrden || null,
      ...formData,
    });
    onClose();
  };

  if (!supplier) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contacto y Comunicación con Proveedor"
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>
        {/* Banner Informativo y Preparación de Contacto */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                Datos de Enlace Directo
              </div>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', color: '#ffffff' }}>
                {supplier.nombre || supplier.nombreComercial}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Contacto: <strong style={{ color: 'var(--color-text-secondary)' }}>{supplier.contacto}</strong>
              </span>
            </div>
            {order && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--color-gold)',
                  fontWeight: 600,
                }}
              >
                Ref: {order.numeroOrden} ({order.proyectoNombre})
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Teléfono */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <Phone size={14} style={{ color: 'var(--color-emerald)' }} />
                <span>{supplier.telefono || 'Sin teléfono'}</span>
              </div>
              {supplier.telefono && (
                <button
                  type="button"
                  onClick={() => handleCopy(supplier.telefono, 'tel')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedField === 'tel' ? 'var(--color-emerald)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title="Copiar teléfono"
                >
                  {copiedField === 'tel' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>

            {/* Email */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', overflow: 'hidden' }}>
                <Mail size={14} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {supplier.email || 'Sin correo'}
                </span>
              </div>
              {supplier.email && (
                <button
                  type="button"
                  onClick={() => handleCopy(supplier.email, 'email')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedField === 'email' ? 'var(--color-emerald)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    flexShrink: 0,
                  }}
                  title="Copiar email"
                >
                  {copiedField === 'email' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={13} style={{ color: 'var(--color-gold)' }} />
            <span>
              Nota: El sistema registra el contacto realizado de manera administrativa para auditoría y trazabilidad interna.
            </span>
          </div>
        </div>

        {/* Formulario de Registro de Bitácora */}
        <div className="form-grid-2">
          <div className="constructa-form-group">
            <label className="constructa-label">Fecha del Contacto *</label>
            <input
              type="date"
              name="fecha"
              className="constructa-input"
              value={formData.fecha}
              onChange={handleChange}
            />
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Hora *</label>
            <input
              type="time"
              name="hora"
              className="constructa-input"
              value={formData.hora}
              onChange={handleChange}
            />
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Medio Empleado *</label>
            <select
              name="medio"
              className="constructa-input"
              value={formData.medio}
              onChange={handleChange}
            >
              <option value="Llamada">Llamada telefónica</option>
              <option value="Correo electrónico">Correo electrónico</option>
              <option value="Mensaje WhatsApp">Mensaje WhatsApp</option>
              <option value="Contacto presencial">Contacto presencial</option>
              <option value="Otro">Otro medio</option>
            </select>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Persona Contactada *</label>
            <input
              type="text"
              name="personaContactada"
              className={`constructa-input ${errors.personaContactada ? 'input-error' : ''}`}
              value={formData.personaContactada}
              onChange={handleChange}
              placeholder="Nombre del interlocutor"
            />
            {errors.personaContactada && (
              <span className="constructa-error-text">{errors.personaContactada}</span>
            )}
          </div>

          <div className="constructa-form-group form-full-width">
            <label className="constructa-label">Motivo de la Comunicación *</label>
            <input
              type="text"
              name="motivo"
              className={`constructa-input ${errors.motivo ? 'input-error' : ''}`}
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Ej. Confirmación de entrega, negociación de precio, consulta de stock..."
            />
            {errors.motivo && <span className="constructa-error-text">{errors.motivo}</span>}
          </div>

          <div className="constructa-form-group form-full-width">
            <label className="constructa-label">Resultado Obtenido *</label>
            <select
              name="resultado"
              className="constructa-input"
              value={formData.resultado}
              onChange={handleChange}
            >
              <option value="Disponibilidad confirmada">Disponibilidad confirmada</option>
              <option value="Precio y condiciones confirmados">Precio y condiciones confirmados</option>
              <option value="Fecha de entrega acordada">Fecha de entrega acordada</option>
              <option value="Solicitó modificación de fecha">Solicitó modificación de fecha</option>
              <option value="Solicitó modificación de cantidades">Solicitó modificación de cantidades</option>
              <option value="Sin respuesta / Dejó recado">Sin respuesta / Dejó recado</option>
              <option value="Cotización enviada en espera">Cotización enviada en espera</option>
              <option value="Nota de crédito o ajuste pactado">Nota de crédito o ajuste pactado</option>
              <option value="Otro acuerdo">Otro acuerdo</option>
            </select>
          </div>

          <div className="constructa-form-group form-full-width">
            <label className="constructa-label">Observaciones y Acuerdos Registrados</label>
            <textarea
              name="observaciones"
              className="constructa-input"
              rows={3}
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Detalla qué se acordó, tiempos pactados, compromisos verbales o instrucciones para almacén..."
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Contacto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
