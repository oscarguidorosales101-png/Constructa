import React from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import { Award, CheckCircle2, TrendingUp, Building2, ShieldCheck, Users } from 'lucide-react';

export default function PublicStats({ config = COMPANY_CONFIG }) {
  const { stats, certifications, identity } = config;

  return (
    <section id="logros" className="public-section public-stats-section">
      <div className="public-container">
        {/* Header */}
        <div className="public-section-header">
          <span className="public-section-badge">Trayectoria Comprobada</span>
          <h2 className="public-section-title">
            Métricas de Impacto y Logros Institucionales
          </h2>
          <p className="public-section-subtitle">
            Cifras verificables que respaldan nuestro liderazgo en edificación de alta complejidad técnica y cumplimiento riguroso.
          </p>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="public-stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="public-stat-card">
              <div className="public-stat-number-wrap">
                <span className="public-stat-number">{stat.value}</span>
                <span className="public-stat-suffix">{stat.suffix}</span>
              </div>
              <h3 className="public-stat-label">{stat.label}</h3>
              <p className="public-stat-sublabel">{stat.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Certifications Banner */}
        <div className="public-certifications-banner">
          <div className="public-cert-header">
            <div className="public-cert-icon">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="public-cert-title">Acreditaciones y Estándares de Calidad</h3>
              <p className="public-cert-subtitle">
                Operamos bajo rigurosas normativas internacionales de seguridad industrial, calidad y sustentabilidad.
              </p>
            </div>
          </div>

          <div className="public-cert-grid">
            {certifications.map((cert, idx) => (
              <div key={idx} className="public-cert-item">
                <div className="public-cert-badge-wrap">
                  <CheckCircle2 size={16} className="public-cert-check" />
                  <span className="public-cert-badge">{cert.badge}</span>
                </div>
                <h4 className="public-cert-name">{cert.title}</h4>
                <p className="public-cert-entity">{cert.entity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
