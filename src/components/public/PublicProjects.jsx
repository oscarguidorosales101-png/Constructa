import React, { useState, useMemo } from 'react';
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
  Filter
} from 'lucide-react';
import PublicProjectModal from './PublicProjectModal';

export default function PublicProjects({ onNavigateSection }) {
  const { projects = [], expenses = [] } = useConstructa();
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Compute spent amount for project from existing expenses
  const getProjectSpent = (projectId) => {
    return expenses
      .filter((e) => e.proyectoId === projectId || e.proyecto === projectId)
      .reduce((sum, e) => sum + (Number(e.monto) || 0), 0);
  };

  // Image bank for projects
  const sampleImages = [
    'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
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
            {['Todos', 'En construcción', 'Planificación', 'Finalizado'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`public-filter-tab ${filterStatus === tab ? 'active' : ''}`}
                onClick={() => setFilterStatus(tab)}
              >
                {tab}
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
                  <div className="public-proj-card-img-wrap">
                    <img
                      src={imgUrl}
                      alt={project.nombre}
                      className="public-proj-card-img"
                      loading="lazy"
                    />
                    <div className="public-proj-card-overlay">
                      <span className={`public-proj-badge ${getStatusBadgeClass(project.estado)}`}>
                        {project.estado}
                      </span>
                      <span className="public-proj-code">{project.codigo}</span>
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
      </div>
    </section>
  );
}
