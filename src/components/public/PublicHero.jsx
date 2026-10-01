import React, { useState } from 'react';
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
  Image as ImageIcon,
  PhoneCall,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Cpu
} from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicHero({ onNavigateSection }) {
  const [imgError, setImgError] = useState(false);

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
      icon: ImageIcon,
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
      {/* Hero Principal con composición asimétrica editorial (Regla 10) */}
      <section className="public-hero">
        <div className="hero-glow-orb" />
        
        <div className="public-container">
          <div className="hero-editorial-grid">
            {/* Columna Izquierda: Mensaje Institucional, CTAs y Métricas */}
            <div className="hero-editorial-left">
              {/* Badge de Certificación */}
              <div className="hero-badge">
                <ShieldCheck size={15} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                <span>{COMPANY_CONFIG.identity.badge}</span>
              </div>

              {/* Título Principal de Gran Formato */}
              <h1 className="hero-title">
                Construcción de Alta Precisión e <br />
                <span className="hero-title-highlight">Ingeniería que Trasciende</span>
              </h1>

              {/* Descripción Institucional */}
              <p className="hero-subtitle">
                {COMPANY_CONFIG.identity.shortDescription}
              </p>

              {/* CTAs Principales con jerarquía visual clara */}
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onNavigateSection('proyectos')}
                >
                  <Building2 size={16} />
                  <span>Ver Proyectos</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onNavigateSection('empresa')}
                >
                  <span>Conocer la Empresa</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onNavigateSection('trabaja-con-nosotros')}
                >
                  <Briefcase size={16} />
                  <span>Trabajar con Nosotros</span>
                </button>
              </div>

              {/* Indicadores Clave (KPIs) en composición horizontal */}
              <div className="hero-kpis-grid">
                <div className="hero-kpi-item">
                  <div className="hero-kpi-value">
                    {COMPANY_CONFIG.stats[0]?.value}{COMPANY_CONFIG.stats[0]?.suffix}
                  </div>
                  <div className="hero-kpi-label">Obras Concluidas</div>
                </div>

                <div className="hero-kpi-item">
                  <div className="hero-kpi-value">
                    {COMPANY_CONFIG.stats[1]?.value}{COMPANY_CONFIG.stats[1]?.suffix}
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

            {/* Columna Derecha: Tarjeta Visual de Obra Insignia / Arquitectura */}
            <div className="hero-editorial-right">
              <div className="hero-showcase-card">
                <div className="hero-showcase-image-box">
                  {!imgError ? (
                    <img
                      src="https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80"
                      alt="Obra Insignia CONSTRUCTA"
                      className="hero-showcase-image"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="hero-showcase-fallback">
                      <Building2 size={48} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                      <span>Frente Activo de Obra Vertical</span>
                    </div>
                  )}
                  <div className="hero-showcase-overlay" />
                  <div className="hero-showcase-live-badge">
                    <span className="live-dot" />
                    <span>Obra en Ejecución • Avance 68%</span>
                  </div>
                </div>

                <div className="hero-showcase-body">
                  <div className="hero-showcase-header">
                    <div>
                      <span className="hero-showcase-tag">Proyecto Insignia</span>
                      <h3 className="hero-showcase-title">Torre Altavista Residencial</h3>
                    </div>
                    <div className="hero-showcase-location">
                      <MapPin size={14} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                      <span>Distrito Metropolitano</span>
                    </div>
                  </div>

                  <p className="hero-showcase-desc">
                    Edificación vertical de 18 niveles habitacionales con cimentación profunda y 3 sótanos de estacionamiento estructurados en hormigón armado sismo-resistente.
                  </p>

                  <div className="hero-showcase-specs">
                    <div className="hero-spec-pill">
                      <Cpu size={13} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                      <span>Modelado BIM 5D</span>
                    </div>
                    <div className="hero-spec-pill">
                      <ShieldCheck size={13} style={{ color: 'var(--accent-emerald, #10b981)' }} />
                      <span>Norma Sísmica CDMX</span>
                    </div>
                    <div className="hero-spec-pill">
                      <TrendingUp size={13} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                      <span>Ruta Crítica al Día</span>
                    </div>
                  </div>

                  <div className="hero-showcase-footer">
                    <button
                      type="button"
                      className="hero-showcase-btn"
                      onClick={() => onNavigateSection('proyectos')}
                    >
                      <span>Ver Ficha Técnica Completa</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directorio de Módulos Corporativos (Hub Interactivo) */}
      <section className="public-section public-hub-section">
        <div className="public-container">
          <div className="section-header">
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
