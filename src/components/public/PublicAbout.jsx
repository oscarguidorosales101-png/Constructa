import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  HardHat,
  DollarSign,
  Clock,
  Leaf,
  Users,
  Award,
  CheckCircle2,
  Compass,
  Target,
  History,
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicAbout({ onNavigateSection }) {
  const [imgError, setImgError] = useState(false);

  const getIcon = (name) => {
    switch (name) {
      case 'ShieldCheck': return <ShieldCheck size={20} />;
      case 'HardHat': return <HardHat size={20} />;
      case 'DollarSign': return <DollarSign size={20} />;
      case 'Clock': return <Clock size={20} />;
      case 'Leaf': return <Leaf size={20} />;
      case 'Users': return <Users size={20} />;
      default: return <Building2 size={20} />;
    }
  };

  return (
    <section className="public-section public-module-section" id="empresa">
      <div className="public-container">
        {/* Breadcrumb de Navegación Modular */}
        <div className="public-breadcrumb">
          <button type="button" onClick={() => onNavigateSection?.('inicio')}>Inicio</button>
          <ChevronRight size={14} />
          <span>Empresa</span>
        </div>

        {/* Header de Sección Consistente */}
        <div className="section-header">
          <span className="section-tag">Identidad & Filosofía</span>
          <h2 className="section-title">Quiénes Somos y Nuestra Trayectoria</h2>
          <p className="section-description">
            {COMPANY_CONFIG.identity.longDescription}
          </p>
        </div>

        {/* Bloque 1: Composición Editorial Historia (Texto + Imagen Arquitectónica) */}
        <div className="public-about-editorial-grid">
          <div className="public-about-story-card">
            <div className="public-story-header">
              <div className="public-story-badge">
                <History size={17} />
                <span>Nuestra Historia desde {COMPANY_CONFIG.identity.foundedYear}</span>
              </div>
              <span className="public-story-stat">
                +{COMPANY_CONFIG.identity.yearsOfExperience} Años de Rigor Técnico
              </span>
            </div>

            <h3 className="public-story-heading">
              Casi dos décadas de excelencia estructural y compromiso corporativo
            </h3>

            <p className="public-story-text">
              {COMPANY_CONFIG.philosophy.history}
            </p>

            <div className="public-story-highlights">
              <div className="public-story-highlight-pill">
                <CheckCircle2 size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                <span>+140 desarrollos emblemáticos entregados</span>
              </div>
              <div className="public-story-highlight-pill">
                <CheckCircle2 size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                <span>+850,000 m² construidos con precisión</span>
              </div>
              <div className="public-story-highlight-pill">
                <CheckCircle2 size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                <span>Cero siniestros graves en obra</span>
              </div>
            </div>
          </div>

          <div className="public-about-image-card">
            {!imgError ? (
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80"
                alt="Ingeniería y Supervisión CONSTRUCTA"
                className="public-about-hero-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="public-about-fallback-box">
                <Building2 size={48} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                <span>Dirección Técnica y Supervisión de Obra</span>
              </div>
            )}
            <div className="public-about-img-caption">
              <Sparkles size={14} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
              <span>Garantía de Calidad y Cumplimiento Normativo ISO 9001</span>
            </div>
          </div>
        </div>

        {/* Bloque 2: Misión y Visión en Paneles Diferenciados */}
        <div className="public-about-mission-vision-grid">
          {/* Misión */}
          <div className="public-mission-card">
            <div className="public-mission-header">
              <div className="public-card-icon-box amber">
                <Target size={20} />
              </div>
              <h3 className="public-mission-title">
                Misión Institucional
              </h3>
            </div>
            <p className="public-mission-text">
              {COMPANY_CONFIG.philosophy.mission}
            </p>
          </div>

          {/* Visión */}
          <div className="public-vision-card">
            <div className="public-mission-header">
              <div className="public-card-icon-box cyan">
                <Compass size={20} />
              </div>
              <h3 className="public-mission-title">
                Visión de Futuro
              </h3>
            </div>
            <p className="public-mission-text">
              {COMPANY_CONFIG.philosophy.vision}
            </p>
          </div>
        </div>

        {/* Bloque 3: Valores Fundamentales */}
        <div className="public-about-values-section">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Cultura Operativa</span>
            <h3 className="section-title" style={{ fontSize: '1.85rem' }}>
              Los 6 Pilares Éticos y Técnicos
            </h3>
            <p className="section-description">
              Principios inquebrantables aplicados en cada metro cúbico colado y en cada decisión ejecutiva.
            </p>
          </div>

          <div className="public-values-grid">
            {COMPANY_CONFIG.philosophy.values.map((val) => (
              <div key={val.id} className="public-value-card">
                <div className="public-value-icon">
                  {getIcon(val.icon)}
                </div>
                <h4 className="public-value-title">{val.title}</h4>
                <p className="public-value-desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bloque 4: Certificaciones y Homologaciones */}
        <div className="public-certifications-card">
          <div className="public-cert-header">
            <Award size={26} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
            <div>
              <h4 className="public-cert-main-title">
                Certificaciones Internacionales y Acreditaciones de Calidad
              </h4>
              <p className="public-cert-main-desc">
                Avales oficiales que garantizan nuestro rigor operativo, ambiental y laboral
              </p>
            </div>
          </div>

          <div className="public-cert-items-grid">
            {COMPANY_CONFIG.certifications.map((cert, idx) => (
              <div key={idx} className="public-cert-item-card">
                <div>
                  <span className="public-cert-pill">{cert.badge}</span>
                  <strong className="public-cert-title">{cert.title}</strong>
                </div>
                <div className="public-cert-entity">{cert.entity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
