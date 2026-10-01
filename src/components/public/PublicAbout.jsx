import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicAbout({ onNavigateSection }) {
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

        {/* Bloque 1: Historia y Quiénes Somos */}
        <div className="public-about-story-card">
          <div className="public-story-header">
            <div className="public-story-badge">
              <History size={18} />
              <span>Nuestra Historia desde {COMPANY_CONFIG.identity.foundedYear}</span>
            </div>
            <span className="public-story-stat">
              +{COMPANY_CONFIG.identity.yearsOfExperience} Años de Rigor Técnico
            </span>
          </div>
          <p className="public-story-text">
            {COMPANY_CONFIG.philosophy.history}
          </p>
          <div className="public-story-highlights">
            <div className="public-story-highlight-pill">
              <CheckCircle2 size={15} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
              <span>+140 desarrollos emblemáticos entregados</span>
            </div>
            <div className="public-story-highlight-pill">
              <CheckCircle2 size={15} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
              <span>+850,000 m² construidos con precisión</span>
            </div>
            <div className="public-story-highlight-pill">
              <CheckCircle2 size={15} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
              <span>Cero siniestros graves en obra</span>
            </div>
          </div>
        </div>

        {/* Bloque 2: Misión y Visión en Paneles Paralelos */}
        <div className="public-about-mission-vision-grid">
          {/* Misión */}
          <div className="feature-card public-mission-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="public-card-icon-box amber">
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Misión Institucional
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.65, margin: 0 }}>
              {COMPANY_CONFIG.philosophy.mission}
            </p>
          </div>

          {/* Visión */}
          <div className="feature-card public-vision-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="public-card-icon-box cyan">
                <Compass size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Visión de Futuro
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.65, margin: 0 }}>
              {COMPANY_CONFIG.philosophy.vision}
            </p>
          </div>
        </div>

        {/* Bloque 3: Valores Fundamentales */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              Los 6 Pilares Éticos y Operativos
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Award size={26} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Certificaciones Internacionales y Acreditaciones de Calidad
              </h4>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Avales oficiales que garantizan nuestro rigor operativo, ambiental y laboral
              </span>
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

        {/* Bloque 5: Acciones Relacionadas / Continuidad */}
        <div className="public-section-bottom-cta">
          <div className="public-bottom-cta-text">
            <h4>¿Deseas conocer más sobre nuestras líneas de ejecución?</h4>
            <p>Descubre las especialidades y tecnologías constructivas que aplicamos en cada frente de obra.</p>
          </div>
          <div className="public-bottom-cta-actions">
            <button
              type="button"
              className="constructa-btn constructa-btn-primary"
              onClick={() => onNavigateSection?.('especialidades')}
            >
              <span>Ver Especialidades</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="constructa-btn constructa-btn-outline"
              onClick={() => onNavigateSection?.('proyectos')}
            >
              <span>Explorar Obras</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
