import React, { useState, useMemo, useEffect } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import {
  Building2,
  Search,
  ArrowRight,
  Calendar,
  DollarSign,
  MapPin,
  Eye,
  CheckCircle2,
  ChevronRight,
  Filter,
  X,
  ChevronLeft,
  Maximize2
} from 'lucide-react';
import PublicProjectModal from './PublicProjectModal';

export default function PublicProjects({ onNavigateSection }) {
  const { projects = [], expenses = [] } = useConstructa();
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [lightboxData, setLightboxData] = useState(null); // { project, images: [], activeIndex: 0 }

  // Lightbox keyboard controls & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxData) return;
      if (e.key === 'Escape') setLightboxData(null);
      if (e.key === 'ArrowLeft') handleLightboxPrev();
      if (e.key === 'ArrowRight') handleLightboxNext();
    };
    if (lightboxData) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxData]);

  const handleLightboxPrev = () => {
    setLightboxData((prev) => {
      if (!prev) return null;
      const nextIdx = prev.activeIndex > 0 ? prev.activeIndex - 1 : prev.images.length - 1;
      return { ...prev, activeIndex: nextIdx };
    });
  };

  const handleLightboxNext = () => {
    setLightboxData((prev) => {
      if (!prev) return null;
      const nextIdx = prev.activeIndex < prev.images.length - 1 ? prev.activeIndex + 1 : 0;
      return { ...prev, activeIndex: nextIdx };
    });
  };

  const openLightboxForProject = (proj, projIdx) => {
    const primary = proj.imagen || sampleImages[projIdx % sampleImages.length];
    const galleryImgs = proj.galeria && proj.galeria.length > 0
      ? proj.galeria
      : [
          primary,
          sampleImages[(projIdx + 1) % sampleImages.length],
          sampleImages[(projIdx + 2) % sampleImages.length]
        ];
    const uniqueImgs = Array.from(new Set([primary, ...galleryImgs]));
    setLightboxData({
      project: proj,
      images: uniqueImgs,
      activeIndex: 0
    });
  };

  // Compute spent amount for project from existing expenses
  const getProjectSpent = (projectId) => {
    return expenses
      .filter((e) => e.proyectoId === projectId || e.proyecto === projectId)
      .reduce((sum, e) => sum + (Number(e.monto) || 0), 0);
  };

  // Image bank for projects
  const sampleImages = [
    '/imgs/proyectos/torre_altavista.jpg',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    '/imgs/proyectos/residencia_lomas.jpg',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  ];

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchStatus = filterStatus === 'Todos' || p.estado === filterStatus;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        p.nombre?.toLowerCase().includes(term) ||
        p.codigo?.toLowerCase().includes(term) ||
        p.ubicacion?.toLowerCase().includes(term) ||
        p.cliente?.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [projects, filterStatus, searchTerm]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'Finalizado':
        return 'public-proj-status-finished';
      case 'En construcción':
        return 'public-proj-status-progress';
      case 'Planificación':
        return 'public-proj-status-planning';
      default:
        return 'public-proj-status-default';
    }
  };

  return (
    <section id="proyectos" className="public-section public-module-section">
      <div className="public-container">
        {/* Breadcrumb de Navegación Modular */}
        <div className="public-breadcrumb">
          <button type="button" onClick={() => onNavigateSection?.('inicio')}>Inicio</button>
          <ChevronRight size={14} />
          <span>Proyectos</span>
        </div>

        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Portafolio Operativo</span>
          <h2 className="section-title">Nuestras Obras y Desarrollos</h2>
          <p className="section-description">
            Edificación vertical, centros corporativos y obras de infraestructura ejecutadas con rigor normativo, control analítico de avance y precisión estructural.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="public-projects-filter-bar">
          <div className="public-filter-tabs">
            {[
              { id: 'Todos', label: 'Todos', icon: null },
              { id: 'En construcción', label: 'En construcción', icon: '●' },
              { id: 'Planificación', label: 'Planificación', icon: '◷' },
              { id: 'Finalizado', label: 'Finalizado', icon: '✓' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`public-filter-tab ${filterStatus === tab.id ? 'active' : ''}`}
                onClick={() => setFilterStatus(tab.id)}
                aria-pressed={filterStatus === tab.id}
              >
                {tab.icon && <span className="public-filter-tab-icon" aria-hidden="true">{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="public-search-wrap">
            <Search size={16} className="public-search-icon" />
            <input
              type="text"
              placeholder="Buscar por obra, código o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="public-search-input"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="public-empty-state">
            <Building2 size={44} className="public-empty-icon" />
            <h3 className="public-empty-title">No encontramos resultados</h3>
            <p className="public-empty-desc">
              No hay proyectos que coincidan con los filtros o término de búsqueda seleccionado.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setFilterStatus('Todos');
                setSearchTerm('');
              }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="public-projects-grid">
            {filteredProjects.map((project, idx) => {
              const spent = getProjectSpent(project.id);
              const imgUrl = project.imagen || sampleImages[idx % sampleImages.length];

              return (
                <article
                  key={project.id}
                  className="public-project-card"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Card Image */}
                  <div
                    className="public-proj-card-img-wrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightboxForProject(project, idx);
                    }}
                    style={{ cursor: 'zoom-in' }}
                    title="Clic para ampliar fotografía de la obra"
                  >
                    <img
                      src={imgUrl}
                      alt={project.nombre}
                      className="public-proj-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/imgs/proyectos/torre_altavista.jpg';
                      }}
                    />
                    <div className="public-proj-card-overlay">
                      <span className={`public-proj-badge ${getStatusBadgeClass(project.estado)}`}>
                        {project.estado === 'En construcción' && <span className="public-status-dot" aria-hidden="true">●</span>}
                        {project.estado === 'Planificación' && <span className="public-status-dot" aria-hidden="true">◷</span>}
                        {project.estado === 'Finalizado' && <span className="public-status-dot" aria-hidden="true">✓</span>}
                        <span>{project.estado}</span>
                      </span>
                      <span className="public-proj-code">{project.codigo}</span>
                      <div
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(10, 15, 25, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          color: '#ffffff'
                        }}
                      >
                        <Maximize2 size={12} />
                        <span>Ver foto</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="public-proj-card-body">
                    <h3 className="public-proj-card-title">{project.nombre}</h3>

                    <div className="public-proj-card-location">
                      <MapPin size={13} style={{ color: 'var(--accent-amber, #f59e0b)', flexShrink: 0 }} />
                      <span className="public-truncate-1">{project.ubicacion}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="public-proj-progress-row">
                      <div className="public-proj-progress-info">
                        <span className="public-proj-progress-lbl">Avance de obra</span>
                        <strong className="public-proj-progress-val">{project.avance}%</strong>
                      </div>
                      <div className="public-project-progress-track">
                        <div
                          className="public-project-progress-fill"
                          style={{ width: `${project.avance}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial & Timeline Metrics */}
                    <div className="public-proj-specs-grid">
                      <div className="public-proj-spec">
                        <span className="public-proj-spec-k">Presupuesto Base</span>
                        <strong className="public-proj-spec-v">{formatCurrency(project.presupuesto)}</strong>
                      </div>
                      <div className="public-proj-spec">
                        <span className="public-proj-spec-k">Plazo Programado</span>
                        <strong className="public-proj-spec-v">{project.fechaFinEstimada || project.fechaFin}</strong>
                      </div>
                    </div>

                    {/* Action Link */}
                    <div className="public-proj-card-footer">
                      <span className="public-proj-card-btn">
                        Ver Ficha Completa
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Acciones Relacionadas / Continuidad */}
        <div className="public-section-bottom-cta">
          <div className="public-bottom-cta-text">
            <h4>¿Tienes en mente un desarrollo o licitación similar?</h4>
            <p>Nuestro equipo multidisciplinario evalúa planos arquitectónicos, volumetrías y especificaciones técnicas.</p>
          </div>
          <div className="public-bottom-cta-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateSection?.('contacto')}
            >
              <span>Consultar u Obra Similar</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onNavigateSection?.('galeria')}
            >
              <span>Ver Galería de Obras</span>
            </button>
          </div>
        </div>

        {/* Modal Detail */}
        {selectedProject && (
          <PublicProjectModal
            project={selectedProject}
            isOpen={Boolean(selectedProject)}
            onClose={() => setSelectedProject(null)}
            onNavigateContact={() => {
              setSelectedProject(null);
              onNavigateSection?.('contacto');
            }}
          />
        )}

        {/* Lightbox Modal para Fotografías de Obras */}
        {lightboxData && (
          <div className="public-lightbox-overlay" onClick={() => setLightboxData(null)}>
            <div className="public-lightbox-content" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                type="button"
                className="public-lightbox-close"
                onClick={() => setLightboxData(null)}
                aria-label="Cerrar vista ampliada"
              >
                <X size={22} />
              </button>

              {/* Navigation Arrows */}
              {lightboxData.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="public-lightbox-nav prev"
                    onClick={handleLightboxPrev}
                    aria-label="Fotografía anterior"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    className="public-lightbox-nav next"
                    onClick={handleLightboxNext}
                    aria-label="Siguiente fotografía"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}

              {/* Main Visual */}
              <div className="public-lightbox-img-wrap">
                <img
                  src={lightboxData.images[lightboxData.activeIndex]}
                  alt={lightboxData.project.nombre}
                  className="public-lightbox-img"
                />
              </div>

              {/* Caption Bar */}
              <div className="public-lightbox-caption">
                <div className="public-lightbox-tags">
                  <span className="public-lightbox-category">
                    {lightboxData.project.codigo} • {lightboxData.project.estado}
                  </span>
                  <span className="public-lightbox-counter">
                    {lightboxData.activeIndex + 1} de {lightboxData.images.length}
                  </span>
                </div>
                <h3 className="public-lightbox-title">{lightboxData.project.nombre}</h3>
                <p className="public-lightbox-desc">
                  {lightboxData.project.descripcion || 'Obra civil de alta especificación técnica y control de calidad.'}
                </p>
                <div className="public-lightbox-loc">
                  <MapPin size={14} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                  <span>{lightboxData.project.ubicacion}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
