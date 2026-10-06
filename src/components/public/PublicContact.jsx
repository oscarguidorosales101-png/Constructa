import React, { useState } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import { useConstructa } from '../../context/ConstructaContext';
import { sendContactEmail } from '../../services/emailjsService';
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

export default function PublicContact({ config = COMPANY_CONFIG, onNavigateSection }) {
  const { contact, identity } = config;
  const { saveClientRequest } = useConstructa();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'Cotización de Obra Nueva',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSending(true);
    setSendError(null);

    try {
      // 1. Persistencia local de la solicitud
      if (typeof saveClientRequest === 'function') {
        saveClientRequest({
          clienteNombre: formData.nombre.trim(),
          clienteEmail: formData.email.trim(),
          clienteTelefono: formData.telefono.trim(),
          tipo: formData.asunto,
          titulo: `[Web] ${formData.asunto} - ${formData.nombre.trim()}`,
          descripcion: formData.mensaje.trim(),
          ubicacion: 'Contacto Web Público',
          origen: 'Formulario Web'
        });
      }

      // 2. Envío a través de EmailJS con fallback seguro
      const result = await sendContactEmail({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        asunto: formData.asunto,
        mensaje: formData.mensaje.trim()
      });

      if (result.success) {
        setIsSent(true);
      } else {
        setSendError('El mensaje no pudo enviarse. Inténtalo nuevamente.');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[PublicContact] Error procesando contacto:', err);
      }
      setSendError('El mensaje no pudo enviarse. Inténtalo nuevamente.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contacto" className="public-section public-contact-section">
      <div className="public-container">
        {/* Breadcrumb de navegación */}
        <div className="public-breadcrumb">
          <button 
            type="button" 
            onClick={() => onNavigateSection ? onNavigateSection('inicio') : (window.location.hash = 'inicio')}
            className="public-breadcrumb-link"
          >
            Inicio
          </button>
          <span className="public-breadcrumb-separator">/</span>
          <span className="public-breadcrumb-current">Contacto</span>
        </div>

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
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #94a3b8)' }}>Línea directa: {contact.phoneAlt}</span>
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
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-amber, #f59e0b)', fontWeight: 600 }}>
                      {contact.emergencyHours}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            {contact.whatsapp && (
              <div className="public-whatsapp-box">
                <div className="public-whatsapp-info">
                  <div className="public-whatsapp-icon">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h5 className="public-whatsapp-title">Atención Inmediata por WhatsApp</h5>
                    <p className="public-whatsapp-sub">Respuesta directa de nuestro equipo técnico comercial</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${contact.whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline public-btn-wa"
                >
                  <span>Iniciar Conversación</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          {/* Form Column */}
          <div className="public-contact-form-card">
            {isSent ? (
              <div className="public-form-sent-state">
                <div className="public-sent-icon-circle">
                  <CheckCircle2 size={44} />
                </div>
                <h3 className="public-sent-title">Mensaje enviado correctamente</h3>
                <p className="public-sent-desc">
                  Recibimos tu solicitud. Nuestro equipo revisará la información y se pondrá en contacto contigo.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
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

                {sendError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <AlertCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#f87171', display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>
                        No pudimos enviar el mensaje
                      </strong>
                      <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
                        {sendError}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '2px' }}>
                      ¿Desea cotización formal o subir planos preliminares?
                    </strong>
                    Cree una cuenta de Cliente para seguimiento técnico y expediente digital.
                  </div>
                  <a
                    href="#registro"
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none', color: '#f59e0b', borderColor: '#f59e0b', whiteSpace: 'nowrap' }}
                  >
                    Portal Clientes &rarr;
                  </a>
                </div>

                <div className="public-form-field">
                  <label className="public-form-label">
                    Nombre o Razón Social <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ing. Rodrigo Salazar / Grupo Inmobiliario del Norte"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`public-form-input ${errors.nombre ? 'has-error' : ''}`}
                  />
                  {errors.nombre && <span className="public-form-error">{errors.nombre}</span>}
                </div>

                <div className="public-form-grid-2">
                  <div className="public-form-field">
                    <label className="public-form-label">
                      Correo Electrónico <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
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
                    Descripción del Proyecto o Requerimiento <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detalles del proyecto, ubicación estimada, superficie en metros cuadrados, plazos de ejecución requeridos..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className={`public-form-textarea ${errors.mensaje ? 'has-error' : ''}`}
                  />
                  {errors.mensaje && <span className="public-form-error">{errors.mensaje}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem 1.5rem',
                    fontSize: '0.95rem',
                    opacity: isSending ? 0.7 : 1,
                    cursor: isSending ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={16} />
                  <span>{isSending ? 'Enviando...' : 'Enviar Mensaje a Operaciones'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Embed / Location Frame */}
        {contact.googleMapsEmbedUrl && (
          <div className="public-map-wrapper">
            <div className="public-map-header">
              <MapPin size={18} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
              <h4>Ubicación Georreferenciada de la Sede Central</h4>
            </div>
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
