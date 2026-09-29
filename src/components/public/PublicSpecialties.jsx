import React from 'react';
import {
  Building2,
  Briefcase,
  Warehouse,
  Truck,
  Hammer,
  FileCheck,
  CheckCircle2,
  Layers
} from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicSpecialties({ onSelectSpecialty }) {
  const getIcon = (name) => {
    switch (name) {
      case 'Building2': return <Building2 size={24} />;
      case 'Briefcase': return <Briefcase size={24} />;
      case 'Warehouse': return <Warehouse size={24} />;
      case 'Truck': return <Truck size={24} />;
      case 'Hammer': return <Hammer size={24} />;
      case 'FileCheck': return <FileCheck size={24} />;
      default: return <Layers size={24} />;
    }
  };

  return (
    <section className="public-section public-section-alt" id="especialidades">
      <div className="public-container">
        <div className="section-header">
          <span className="section-tag">Capacidad Operativa</span>
          <h2 className="section-title">Especialidades Constructivas</h2>
          <p className="section-description">
            Abarcamos todas las etapas de la edificación e infraestructura pesada,
            garantizando solvencia técnica, maquinaria especializada y cuadrillas altamente capacitadas.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {COMPANY_CONFIG.specialties.map((esp) => (
            <div key={esp.id} className="feature-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div className="feature-card-icon" style={{ marginBottom: 0 }}>
                  {getIcon(esp.icon)}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--accent-amber, #f59e0b)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  {esp.tag}
                </span>
              </div>

              <h3 className="feature-card-title">{esp.title}</h3>
              <p className="feature-card-desc" style={{ marginBottom: '1.25rem' }}>
                {esp.description}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Capacidades Destacadas:
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {esp.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)' }}>
                      <CheckCircle2 size={13} style={{ color: 'var(--accent-emerald, #10b981)', flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
