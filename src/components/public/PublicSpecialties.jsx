import React from 'react';
import {
  Building2,
  Briefcase,
  Warehouse,
  Truck,
  Hammer,
  FileCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicSpecialties({ onNavigateSection }) {
  const getIcon = (name) => {
    switch (name) {
      case 'Building2': return <Building2 size={22} />;
      case 'Briefcase': return <Briefcase size={22} />;
      case 'Warehouse': return <Warehouse size={22} />;
      case 'Truck': return <Truck size={22} />;
      case 'Hammer': return <Hammer size={22} />;
      case 'FileCheck': return <FileCheck size={22} />;
      default: return <Layers size={22} />;
    }
  };

  return (
    <section className="public-section public-module-section" id="especialidades">
      <div className="public-container">
        {/* Breadcrumb de Navegación Modular */}
        <div className="public-breadcrumb">
          <button type="button" onClick={() => onNavigateSection?.('inicio')}>Inicio</button>
          <ChevronRight size={14} />
          <span>Especialidades</span>
        </div>

        {/* Header de Sección Consistente */}
        <div className="section-header">
          <span className="section-tag">Capacidad Operativa</span>
          <h2 className="section-title">Nuestras Líneas de Especialidad</h2>
          <p className="section-description">
            Abarcamos todas las etapas de la edificación e infraestructura pesada,
            garantizando solvencia técnica, maquinaria especializada y cuadrillas altamente capacitadas.
          </p>
        </div>

        {/* 6 Especialidades Grid con Imágenes Arquitectónicas */}
        <div className="public-specialties-card-grid">
          {COMPANY_CONFIG.specialties.map((esp) => (
            <div key={esp.id} className="public-specialty-card">
              {/* Imagen Arquitectónica de Encabezado */}
              <div className="public-specialty-img-wrap">
                <img
                  src={esp.image}
                  alt={esp.title}
                  className="public-specialty-img"
                  loading="lazy"
                />
                <div className="public-specialty-img-overlay">
                  <span className="public-specialty-tag">{esp.tag}</span>
                </div>
              </div>

              {/* Contenido de la Especialidad */}
              <div className="public-specialty-body">
                <div className="public-specialty-title-row">
                  <div className="public-specialty-icon-box">
                    {getIcon(esp.icon)}
                  </div>
                  <h3 className="public-specialty-title">{esp.title}</h3>
                </div>

                <p className="public-specialty-desc">
                  {esp.description}
                </p>

                {/* Capacidades Destacadas */}
                <div className="public-specialty-features">
                  <div className="public-specialty-features-title">
                    Capacidades Destacadas:
                  </div>
                  <ul className="public-specialty-checklist">
                    {esp.features.map((feat, i) => (
                      <li key={i}>
                        <CheckCircle2 size={13} className="public-specialty-check" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Acción para ver proyectos afines */}
                <div className="public-specialty-footer">
                  <button
                    type="button"
                    className="public-specialty-action-btn"
                    onClick={() => onNavigateSection?.('proyectos')}
                  >
                    <span>Ver Proyectos de esta Línea</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones Relacionadas / Continuidad */}
        <div className="public-section-bottom-cta">
          <div className="public-bottom-cta-text">
            <h4>¿Requieres asesoría técnica para una obra específica?</h4>
            <p>Nuestros directores de proyecto evalúan especificaciones, viabilidad y estimación de costos sin compromiso.</p>
          </div>
          <div className="public-bottom-cta-actions">
            <button
              type="button"
              className="constructa-btn constructa-btn-primary"
              onClick={() => onNavigateSection?.('contacto')}
            >
              <span>Solicitar Asesoría o Cotización</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="constructa-btn constructa-btn-outline"
              onClick={() => onNavigateSection?.('proyectos')}
            >
              <span>Ver Portafolio de Obras</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
