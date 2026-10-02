import React from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import { Building2, ShieldCheck, Lock, ArrowUp, Phone, Mail, MapPin } from 'lucide-react';

export default function PublicFooter({ config = COMPANY_CONFIG, onNavigateSection }) {
  const { identity, contact } = config;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      window.location.hash = sectionId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="public-footer">
      <div className="public-container">
        {/* Top Footer Grid */}
        <div className="public-footer-grid">
          {/* Col 1: Identity */}
          <div className="public-footer-col brand-col">
            <div className="public-footer-brand">
              <div className="public-footer-logo-box">
                <Building2 size={24} style={{ color: 'var(--color-gold)' }} />
              </div>
              <span className="public-footer-brand-name">{identity.commercialName}</span>
            </div>
            <p className="public-footer-tagline">{identity.tagline}</p>
            <p className="public-footer-desc">{identity.shortDescription}</p>

            <div className="public-footer-iso">
              <ShieldCheck size={16} style={{ color: 'var(--color-gold)' }} />
              <span>{identity.badge}</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="public-footer-col">
            <h4 className="public-footer-title">Institucional</h4>
            <ul className="public-footer-links">
              <li><a href="#inicio" onClick={(e) => handleLinkClick(e, 'inicio')}>Inicio</a></li>
              <li><a href="#empresa" onClick={(e) => handleLinkClick(e, 'empresa')}>Nuestra Empresa</a></li>
              <li><a href="#empresa" onClick={(e) => handleLinkClick(e, 'empresa')}>Misión y Valores</a></li>
              <li><a href="#logros" onClick={(e) => handleLinkClick(e, 'logros')}>Logros y Métricas</a></li>
              <li><a href="#especialidades" onClick={(e) => handleLinkClick(e, 'especialidades')}>Especialidades</a></li>
              <li><a href="#video" onClick={(e) => handleLinkClick(e, 'video')}>Video Institucional</a></li>
            </ul>
          </div>

          {/* Col 3: Projects & Careers */}
          <div className="public-footer-col">
            <h4 className="public-footer-title">Obras y Talento</h4>
            <ul className="public-footer-links">
              <li><a href="#proyectos-publicos" onClick={(e) => handleLinkClick(e, 'proyectos-publicos')}>Portafolio de Obras</a></li>
              <li><a href="#galeria" onClick={(e) => handleLinkClick(e, 'galeria')}>Galería Fotográfica</a></li>
              <li><a href="#trabaja-con-nosotros" onClick={(e) => handleLinkClick(e, 'trabaja-con-nosotros')}>Bolsa de Empleo</a></li>
              <li><a href="#contacto" onClick={(e) => handleLinkClick(e, 'contacto')}>Atención a Clientes</a></li>
              <li>
                <a href="#login" className="public-footer-login-link">
                  <Lock size={12} />
                  <span>Acceso a Sistema Interno</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Contact */}
          <div className="public-footer-col">
            <h4 className="public-footer-title">Sede Central</h4>
            <div className="public-footer-contact-brief">
              <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '3px' }} />
                <span>{contact.address}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>{contact.phone}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>{contact.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="public-footer-bottom">
          <p className="public-footer-copyright">
            © {new Date().getFullYear()} {identity.legalName}. Todos los derechos reservados.
          </p>

          <div className="public-footer-bottom-links">
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              Plataforma de Gestión Integral de Construcción
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="public-footer-back-to-top"
              aria-label="Volver al inicio de la página"
            >
              <span>Subir</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
