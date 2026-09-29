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
  Target
} from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicAbout() {
  const getIcon = (name) => {
    switch (name) {
      case 'ShieldCheck': return <ShieldCheck size={22} />;
      case 'HardHat': return <HardHat size={22} />;
      case 'DollarSign': return <DollarSign size={22} />;
      case 'Clock': return <Clock size={22} />;
      case 'Leaf': return <Leaf size={22} />;
      case 'Users': return <Users size={22} />;
      default: return <Building2 size={22} />;
    }
  };

  return (
    <section className="public-section" id="empresa">
      <div className="public-container">
        {/* Header de Sección */}
        <div className="section-header">
          <span className="section-tag">Nuestra Empresa</span>
          <h2 className="section-title">Quiénes Somos y Nuestra Filosofía</h2>
          <p className="section-description">
            {COMPANY_CONFIG.identity.longDescription}
          </p>
        </div>

        {/* Misión y Visión en Paneles Paralelos */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Misión */}
          <div
            className="feature-card"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(17, 23, 36, 0.9) 100%)',
              borderLeft: '4px solid var(--accent-amber, #f59e0b)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-amber, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Misión Institucional
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, margin: 0 }}>
              {COMPANY_CONFIG.philosophy.mission}
            </p>
          </div>

          {/* Visión */}
          <div
            className="feature-card"
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(17, 23, 36, 0.9) 100%)',
              borderLeft: '4px solid var(--color-cyan, #38bdf8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--color-cyan, #38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Visión de Futuro
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, margin: 0 }}>
              {COMPANY_CONFIG.philosophy.vision}
            </p>
          </div>
        </div>

        {/* Valores Fundamentales */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              Pilares y Valores de Nuestra Operación
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
              Principios inquebrantables aplicados en cada metro cúbico colado y en cada decisión ejecutiva.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {COMPANY_CONFIG.philosophy.values.map((val) => (
              <div key={val.id} className="feature-card">
                <div className="feature-card-icon">
                  {getIcon(val.icon)}
                </div>
                <h4 className="feature-card-title">{val.title}</h4>
                <p className="feature-card-desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificaciones y Homologaciones */}
        <div
          style={{
            background: 'rgba(17, 23, 36, 0.45)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Award size={24} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Certificaciones Internacionales y Acreditaciones de Calidad
              </h4>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Avales oficiales que garantizan nuestro rigor operativo y normativo
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {COMPANY_CONFIG.certifications.map((cert, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber, #f59e0b)', fontWeight: 700 }}>
                    {cert.badge}
                  </div>
                  <strong style={{ fontSize: '1rem', color: '#ffffff', display: 'block', marginTop: '2px' }}>
                    {cert.title}
                  </strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  {cert.entity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
