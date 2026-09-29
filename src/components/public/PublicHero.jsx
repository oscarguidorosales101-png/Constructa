import React from 'react';
import { ArrowRight, HardHat, Building2, Briefcase, Play, Award, ShieldCheck } from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicHero({ onNavigateSection, onPlayVideo }) {
  return (
    <section className="public-hero" id="inicio">
      <div className="hero-glow-orb" />
      
      <div className="public-container">
        <div className="hero-content">
          {/* Badge de Certificación / Estatus */}
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>{COMPANY_CONFIG.identity.badge}</span>
          </div>

          {/* Título Principal de Alto Impacto */}
          <h1 className="hero-title">
            Construcción de Alta Precisión e <br />
            <span className="hero-title-highlight">Ingeniería que Trasciende</span>
          </h1>

          {/* Descripción Breve Institucional */}
          <p className="hero-subtitle">
            {COMPANY_CONFIG.identity.shortDescription}
          </p>

          {/* CTAs Principales */}
          <div className="hero-actions">
            <button
              type="button"
              className="constructa-btn constructa-btn-primary"
              onClick={() => onNavigateSection('proyectos-publicos')}
            >
              <Building2 size={16} />
              <span>Explorar Obras y Proyectos</span>
            </button>

            <button
              type="button"
              className="constructa-btn constructa-btn-secondary"
              onClick={() => onNavigateSection('empresa')}
            >
              <span>Conocer Nuestra Empresa</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="constructa-btn constructa-btn-outline"
              onClick={() => onNavigateSection('vacantes')}
            >
              <Briefcase size={16} />
              <span>Bolsa de Trabajo</span>
            </button>
          </div>

          {/* Indicadores KPI Principales */}
          <div className="hero-kpis">
            <div className="hero-kpi-item">
              <div className="hero-kpi-value">
                {COMPANY_CONFIG.stats[0]?.value}
                {COMPANY_CONFIG.stats[0]?.suffix}
              </div>
              <div className="hero-kpi-label">Obras Concluidas</div>
            </div>

            <div className="hero-kpi-item">
              <div className="hero-kpi-value">
                {COMPANY_CONFIG.stats[1]?.value}
                {COMPANY_CONFIG.stats[1]?.suffix}
              </div>
              <div className="hero-kpi-label">Metros Construidos</div>
            </div>

            <div className="hero-kpi-item">
              <div className="hero-kpi-value">
                {COMPANY_CONFIG.identity.yearsOfExperience} Años
              </div>
              <div className="hero-kpi-label">Trayectoria Técnica</div>
            </div>

            <div className="hero-kpi-item">
              <div className="hero-kpi-value">0%</div>
              <div className="hero-kpi-label">Siniestros / Cero Accidentes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
