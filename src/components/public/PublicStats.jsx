import React from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import { Award, CheckCircle2, TrendingUp, Building2, ShieldCheck, Users, ChevronRight, ArrowRight } from 'lucide-react';

export default function PublicStats({ onNavigateSection }) {
  const { stats, certifications, identity } = COMPANY_CONFIG;

  return (
    <section id="logros" className="public-section public-module-section">
      <div className="public-container">
        {/* Breadcrumb de Navegación Modular */}
        <div className="public-breadcrumb">
          <button type="button" onClick={() => onNavigateSection?.('inicio')}>Inicio</button>
          <ChevronRight size={14} />
          <span>Logros y Métricas</span>
        </div>

        {/* Header de Sección Consistente */}
        <div className="section-header">
          <span className="section-tag">Trayectoria Comprobada</span>
          <h2 className="section-title">Métricas de Impacto y Logros Institucionales</h2>
          <p className="section-description">
            Cifras verificables que respaldan nuestro liderazgo en edificación de alta complejidad técnica, cumplimiento normativo y solvencia constructiva.
          </p>
        </div>

        {/* 6 Key Stats Grid con Fuerte Jerarquía Visual */}
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
              <h3 className="public-cert-title">Acreditaciones y Estándares de Calidad Internacional</h3>
              <p className="public-cert-subtitle">
                Operamos bajo rigurosas normativas internacionales de seguridad industrial, calidad de cálculo y edificación ambientalmente sustentable.
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

        {/* Acciones Relacionadas / Continuidad */}
        <div className="public-section-bottom-cta">
          <div className="public-bottom-cta-text">
            <h4>¿Deseas conocer más sobre el equipo que hace posible estas cifras?</h4>
            <p>Descubre la filosofía de CONSTRUCTA y las oportunidades laborales para integrarte a nuestro equipo.</p>
          </div>
          <div className="public-bottom-cta-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateSection?.('empresa')}
            >
              <span>Conocer Nuestra Empresa</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onNavigateSection?.('trabaja-con-nosotros')}
            >
              <span>Ver Oportunidades Laborales</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
