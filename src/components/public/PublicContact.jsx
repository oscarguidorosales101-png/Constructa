import React, { useState } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Building2,
  ExternalLink
} from 'lucide-react';

export default function PublicContact({ config = COMPANY_CONFIG }) {
  const { contact, identity } = config;
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'Cotización de Obra Nueva',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.nombre.trim()) errs.nombre = 'Ingresa tu nombre o razón social.';
    if (!formData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'El formato de correo no es válido.';
    }
    if (!formData.mensaje.trim()) errs.mensaje = 'Por favor escribe el mensaje o requerimiento.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSent(true);
    }
  };

  return (
    <section id="contacto" className="public-section public-contact-section">
      <div className="public-container">
        {/* Section Header */}
        <div className="public-section-header">
          <span className="public-section-badge">Atención Empresarial</span>
          <h2 className="public-section-title">Canales de Contacto Directo</h2>
          <p className="public-section-subtitle">
            Ponte en contacto con nuestro equipo directivo, comercial o de compras para cotizaciones, alianzas y requerimientos de obra.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="public-contact-grid">
          {/* Contact Information & Channels */}
          <div className="public-contact-info-card">
            <h3 className="public-contact-info-title">Oficinas Corporativas</h3>
            <p className="public-contact-info-desc">
              Sede central de operaciones y coordinación de ingeniería de {identity.commercialName}.
            </p>

            <div className="public-contact-items-list">
              {/* Address */}
              <div className="public-contact-item">
                <div className="public-contact-item-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="public-contact-item-k">Dirección Física</h4>
                  <p className="public-contact-item-v">{contact.address}</p>
                </div>
              </div>

              {/* Phones */}
              <div className="public-contact-item">
                <div className="public-contact-item-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="public-contact-item-k">Teléfonos de Conmutador</h4>
                  <p className="public-contact-item-v">
                    <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}>{contact.phone}</a>
                    <br />
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Línea directa: {contact.phoneAlt}</span>
                  </p>
                </div>
              </div>

              {/* Emails */}
              <div className="public-contact-item">
                <div className="public-contact-item-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="public-contact-item-k">Correos Institucionales</h4>
                  <p className="public-contact-item-v">
                    General: <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    <br />
                    Ventas y Licitaciones: <a href={`mailto:${contact.commercialEmail}`}>{contact.commercialEmail}</a>
                    <br />
                    Reclutamiento: <a href={`mailto:${contact.recruitmentEmail}`}>{contact.recruitmentEmail}</a>
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="public-contact-item">
                <div className="public-contact-item-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="public-contact-item-k">Horario de Operación</h4>
                  <p className="public-contact-item-v">
                    {contact.businessHours}
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)' }}>
                      {contact.emergencyHours}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            {contact.whatsapp && (
              <div className="public-whatsapp-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} style={{ color: '#25D366' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Atención Ejecutiva WhatsApp</span>
                </div>
                <a
                  href={`https://wa.me/${contact.whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="public-btn public-btn-outline"
                  style={{ fontSize: '0.82rem', padding: '6px 12px', borderColor: '#25D366', color: '#25D366' }}
                >
                  Abrir chat <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Form & Map Column */}
          <div className="public-contact-form-card">
            {isSent ? (
              <div className="public-form-sent-state">
                <div className="public-sent-icon-circle">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="public-sent-title">Mensaje enviado exitosamente</h3>
                <p className="public-sent-desc">
                  Hemos recibido tu consulta técnica o solicitud comercial. Un asesor de ingeniería se pondrá en contacto contigo en un plazo menor a 24 horas hábiles.
                </p>
                <button
                  type="button"
                  className="public-btn public-btn-outline"
                  onClick={() => {
                    setIsSent(false);
                    setFormData({
                      nombre: '',
                      email: '',
                      telefono: '',
                      asunto: 'Cotización de Obra Nueva',
                      mensaje: ''
                    });
                  }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="public-contact-form">
                <h3 className="public-form-title">Envíanos un Mensaje</h3>
                <p className="public-form-subtitle">
                  Describe tu proyecto o requerimiento constructivo y te responderemos a la brevedad.
                </p>

                <div className="public-form-field">
                  <label className="public-form-label">
                    Nombre o Empresa <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ing. Rodrigo Salazar / Grupo Inmobiliario"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`public-form-input ${errors.nombre ? 'has-error' : ''}`}
                  />
                  {errors.nombre && <span className="public-form-error">{errors.nombre}</span>}
                </div>

                <div className="public-form-grid-2">
                  <div className="public-form-field">
                    <label className="public-form-label">
                      Correo Electrónico <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="rodrigo.salazar@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`public-form-input ${errors.email ? 'has-error' : ''}`}
                    />
                    {errors.email && <span className="public-form-error">{errors.email}</span>}
                  </div>

                  <div className="public-form-field">
                    <label className="public-form-label">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="public-form-input"
                    />
                  </div>
                </div>

                <div className="public-form-field">
                  <label className="public-form-label">Tipo de Requerimiento</label>
                  <select
                    value={formData.asunto}
                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    className="public-form-select"
                  >
                    <option value="Cotización de Obra Nueva">Cotización de Obra Nueva</option>
                    <option value="Edificación Vertical Residencial">Edificación Vertical Residencial</option>
                    <option value="Construcción Corporativa / Comercial">Construcción Corporativa / Comercial</option>
                    <option value="Infraestructura y Obra Civil">Infraestructura y Obra Civil</option>
                    <option value="Licitaciones y Alianzas">Licitaciones y Alianzas</option>
                    <option value="Atención a Proveedores y Materiales">Atención a Proveedores y Materiales</option>
                    <option value="Otro Asunto Institucional">Otro Asunto Institucional</option>
                  </select>
                </div>

                <div className="public-form-field">
                  <label className="public-form-label">
                    Descripción del Requerimiento <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detalles del proyecto, ubicación estimada, superficie en metros cuadrados, plazos deseados..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className={`public-form-textarea ${errors.mensaje ? 'has-error' : ''}`}
                  />
                  {errors.mensaje && <span className="public-form-error">{errors.mensaje}</span>}
                </div>

                <button type="submit" className="public-btn public-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Send size={15} /> Enviar Mensaje a Operaciones
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Embed / Location Frame */}
        {contact.googleMapsEmbedUrl && (
          <div className="public-map-wrapper">
            <iframe
              title="Ubicación de Oficinas Centrales"
              src={contact.googleMapsEmbedUrl}
              className="public-map-iframe"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </section>
  );
}
