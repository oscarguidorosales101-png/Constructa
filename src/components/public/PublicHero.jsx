import React from 'react';
import {
  ArrowRight,
  HardHat,
  Building2,
  Briefcase,
  Play,
  Award,
  ShieldCheck,
  Film,
  Layers,
  Image,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicHero({ onNavigateSection }) {
  const sectionsHub = [
    {
      id: 'empresa',
      title: 'Nuestra Empresa',
      tag: 'Institucional',
      desc: 'Trayectoria, historia, misión, visión y los 6 valores rectores que sustentan nuestra solidez.',
      icon: ShieldCheck,
      actionText: 'Conocer Empresa'
    },
    {
      id: 'especialidades',
      title: 'Especialidades',
      tag: 'Capacidad Técnica',
      desc: 'Edificación vertical, complejos corporativos, naves industriales y obra civil de alta complejidad.',
      icon: Layers,
      actionText: 'Ver Especialidades'
    },
    {
      id: 'proyectos',
      title: 'Portafolio de Obras',
      tag: 'Proyectos Activos',
      desc: 'Obras en ejecución y finalizadas con fichas técnicas, presupuestos y control de avance físico.',
      icon: Building2,
      actionText: 'Explorar Obras'
    },
    {
      id: 'video',
      title: 'Metodología en Video',
      tag: 'En Frente de Obra',
      desc: 'Recorrido audiovisual por nuestros procesos constructivos y protocolos de seguridad en obra.',
      icon: Film,
      actionText: 'Ver Video'
    },
    {
      id: 'logros',
      title: 'Logros y Métricas',
      tag: 'Rendimiento',
      desc: 'Cifras verificables de impacto, certificaciones ISO 9001, ISO 14001, LEED y ESR vigentes.',
      icon: Award,
      actionText: 'Ver Métricas'
    },
    {
      id: 'galeria',
      title: 'Galería de Obras',
      tag: 'Registro Visual',
      desc: 'Inspección fotográfica de frentes de colado, estructuras metálicas y acabados arquitectónicos.',
      icon: Image,
      actionText: 'Abrir Galería'
    },
    {
      id: 'trabaja-con-nosotros',
      title: 'Trabaja con Nosotros',
      tag: 'Oportunidades',
      desc: 'Convocatorias laborales activas, requisitos y proceso de postulación directa sin cuenta.',
      icon: Briefcase,
      actionText: 'Ver Vacantes'
    },
    {
      id: 'contacto',
      title: 'Atención y Contacto',
      tag: 'Comunicación',
      desc: 'Oficinas corporativas, teléfonos directos, cotizaciones y atención técnica a desarrolladores.',
      icon: PhoneCall,
      actionText: 'Contactar'
    }
  ];

  return (
    <div className="public-hero-view" id="inicio">
      {/* Hero Principal */}
      <section className="public-hero">
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
                onClick={() => onNavigateSection('proyectos')}
              >
                <Building2 size={16} />
                <span>Ver Proyectos</span>
              </button>

              <button
                type="button"
                className="constructa-btn constructa-btn-secondary"
                onClick={() => onNavigateSection('empresa')}
              >
                <span>Conocer la Empresa</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="constructa-btn constructa-btn-outline"
                onClick={() => onNavigateSection('trabaja-con-nosotros')}
              >
                <Briefcase size={16} />
                <span>Trabajar con Nosotros</span>
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
                <div className="hero-kpi-label">Cero Siniestros Graves</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directorio de Módulos Corporativos (Hub Interactivo) */}
      <section className="public-section public-hub-section">
        <div className="public-container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Directorio Corporativo</span>
            <h2 className="section-title">Ecosistema Institucional CONSTRUCTA</h2>
            <p className="section-description">
              Accede de forma directa e independiente a cada área técnica, portafolio de obras, cultura organizacional y canales de atención de nuestra constructora.
            </p>
          </div>

          <div className="public-hub-grid">
            {sectionsHub.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="public-hub-card"
                  onClick={() => onNavigateSection(item.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="public-hub-card-header">
                    <div className="public-hub-icon-box">
                      <Icon size={20} />
                    </div>
                    <span className="public-hub-tag">{item.tag}</span>
                  </div>

                  <h3 className="public-hub-title">{item.title}</h3>
                  <p className="public-hub-desc">{item.desc}</p>

                  <div className="public-hub-cta">
                    <span>{item.actionText}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
