import React, { useState, useMemo } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send
} from 'lucide-react';
import PublicApplicationModal from './PublicApplicationModal';

export default function PublicCareers({ config = COMPANY_CONFIG }) {
  const { vacancies } = config;
  const [filterArea, setFilterArea] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVacancyId, setExpandedVacancyId] = useState(null);
  const [activeApplicationVacancy, setActiveApplicationVacancy] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Extract distinct areas
  const areas = ['Todas', ...new Set(vacancies.map((v) => v.area))];

  // Filtering
  const filteredVacancies = useMemo(() => {
    return vacancies.filter((v) => {
      const matchArea = filterArea === 'Todas' || v.area === filterArea;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        v.puesto.toLowerCase().includes(term) ||
        v.descripcion.toLowerCase().includes(term) ||
        v.ubicacion.toLowerCase().includes(term);
      return matchArea && matchSearch;
    });
  }, [vacancies, filterArea, searchTerm]);

  const toggleExpand = (id) => {
    setExpandedVacancyId((prev) => (prev === id ? null : id));
  };

  const handleOpenApplication = (vacancy) => {
    if (vacancy.estado === 'Cerrada') return;
    setActiveApplicationVacancy(vacancy);
    setIsApplicationModalOpen(true);
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Abierta':
        return (
          <span className="public-vacancy-badge badge-open">
            <span className="public-badge-dot dot-green" /> Convocatoria Abierta
          </span>
        );
      case 'En pausa':
        return (
          <span className="public-vacancy-badge badge-paused">
            <span className="public-badge-dot dot-yellow" /> En Evaluación
          </span>
        );
      case 'Cerrada':
        return (
          <span className="public-vacancy-badge badge-closed">
            <span className="public-badge-dot dot-red" /> Concluida
          </span>
        );
      default:
        return <span className="public-vacancy-badge">{estado}</span>;
    }
  };

  return (
    <section id="trabaja-con-nosotros" className="public-section public-careers-section">
      <div className="public-container">
        {/* Section Header */}
        <div className="public-section-header">
          <span className="public-section-badge">Bolsa de Empleo Institucional</span>
          <h2 className="public-section-title">Trabaja con Nosotros</h2>
          <p className="public-section-subtitle">
            Buscamos profesionales apasionados por la ingeniería, la arquitectura y la construcción. Súmate a un equipo comprometido con la excelencia.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="public-careers-filter-bar">
          <div className="public-careers-tabs">
            {areas.map((area) => (
              <button
                key={area}
                type="button"
                className={`public-career-tab ${filterArea === area ? 'active' : ''}`}
                onClick={() => setFilterArea(area)}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="public-search-wrap">
            <Search size={16} className="public-search-icon" />
            <input
              type="text"
              placeholder="Buscar por puesto o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="public-search-input"
            />
          </div>
        </div>

        {/* Vacancies List */}
        {filteredVacancies.length === 0 ? (
          <div className="public-empty-state">
            <Briefcase size={44} className="public-empty-icon" />
            <h3 className="public-empty-title">No encontramos vacantes disponibles</h3>
            <p className="public-empty-desc">
              No hay oportunidades activas que coincidan con el área o término de búsqueda.
            </p>
            <button
              type="button"
              className="public-btn public-btn-outline"
              onClick={() => {
                setFilterArea('Todas');
                setSearchTerm('');
              }}
            >
              Ver todas las convocatorias
            </button>
          </div>
        ) : (
          <div className="public-vacancies-list">
            {filteredVacancies.map((vacancy) => {
              const isExpanded = expandedVacancyId === vacancy.id;
              const isClosed = vacancy.estado === 'Cerrada';

              return (
                <div key={vacancy.id} className={`public-vacancy-card ${isClosed ? 'is-closed' : ''}`}>
                  {/* Vacancy Card Top Strip */}
                  <div className="public-vacancy-header">
                    <div className="public-vacancy-title-wrap">
                      <div className="public-vacancy-meta-top">
                        <span className="public-vacancy-code">{vacancy.id}</span>
                        <span className="public-vacancy-area">{vacancy.area}</span>
                        {getStatusBadge(vacancy.estado)}
                      </div>
                      <h3 className="public-vacancy-role">{vacancy.puesto}</h3>
                    </div>

                    <div className="public-vacancy-actions">
                      <button
                        type="button"
                        className="public-btn public-btn-primary public-btn-apply"
                        disabled={isClosed}
                        onClick={() => handleOpenApplication(vacancy)}
                      >
                        {isClosed ? 'Concluida' : 'Postularme'}
                        <Send size={14} />
                      </button>

                      <button
                        type="button"
                        className="public-btn-icon-subtle"
                        onClick={() => toggleExpand(vacancy.id)}
                        aria-label={isExpanded ? 'Ver menos detalles' : 'Ver más detalles'}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Vacancy Pills Row */}
                  <div className="public-vacancy-pills-row">
                    <div className="public-vacancy-pill">
                      <MapPin size={13} style={{ color: 'var(--color-gold)' }} />
                      <span>{vacancy.ubicacion}</span>
                    </div>
                    <div className="public-vacancy-pill">
                      <Clock size={13} style={{ color: 'var(--color-gold)' }} />
                      <span>{vacancy.tipoJornada} • {vacancy.modalidad}</span>
                    </div>
                    <div className="public-vacancy-pill">
                      <Briefcase size={13} style={{ color: 'var(--color-gold)' }} />
                      <span>Exp: {vacancy.experienciaMinima}</span>
                    </div>
                    {vacancy.rangoSalarial && (
                      <div className="public-vacancy-pill public-pill-salary">
                        <DollarSign size={13} style={{ color: 'var(--color-emerald)' }} />
                        <span>{vacancy.rangoSalarial}</span>
                      </div>
                    )}
                  </div>

                  {/* Brief description */}
                  <p className="public-vacancy-desc">{vacancy.descripcion}</p>

                  {/* Expandable Accordion Body */}
                  {isExpanded && (
                    <div className="public-vacancy-accordion-body">
                      {/* Responsibilities */}
                      {vacancy.responsabilidades && vacancy.responsabilidades.length > 0 && (
                        <div className="public-vacancy-detail-section">
                          <h4 className="public-vacancy-detail-heading">
                            Responsabilidades Principales
                          </h4>
                          <ul className="public-vacancy-checklist">
                            {vacancy.responsabilidades.map((resp, idx) => (
                              <li key={idx}>
                                <CheckCircle2 size={14} className="public-checklist-check" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Requirements */}
                      {vacancy.requisitos && vacancy.requisitos.length > 0 && (
                        <div className="public-vacancy-detail-section">
                          <h4 className="public-vacancy-detail-heading">
                            Perfil y Requisitos del Puesto
                          </h4>
                          <ul className="public-vacancy-checklist">
                            {vacancy.requisitos.map((req, idx) => (
                              <li key={idx}>
                                <CheckCircle2 size={14} className="public-checklist-check" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Benefits */}
                      {vacancy.beneficios && vacancy.beneficios.length > 0 && (
                        <div className="public-vacancy-detail-section">
                          <h4 className="public-vacancy-detail-heading">
                            Lo que Ofrecemos
                          </h4>
                          <div className="public-benefits-grid">
                            {vacancy.beneficios.map((ben, idx) => (
                              <div key={idx} className="public-benefit-badge">
                                <span>{ben}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Apply CTA */}
                      <div className="public-vacancy-bottom-cta">
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          ¿Cumples con los requisitos? Envíanos tu información y expediente curricular.
                        </p>
                        <button
                          type="button"
                          className="public-btn public-btn-primary"
                          disabled={isClosed}
                          onClick={() => handleOpenApplication(vacancy)}
                        >
                          {isClosed ? 'Convocatoria Finalizada' : 'Iniciar Postulación Ahora'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Spontaneous Open Application Banner */}
        <div className="public-spontaneous-banner">
          <div className="public-spontaneous-content">
            <h3 className="public-spontaneous-title">¿No encuentras una vacante afín a tu perfil?</h3>
            <p className="public-spontaneous-text">
              Estamos en constante búsqueda de talento técnico y operativo para futuras aperturas de obra. Envía tu currículum a nuestra bolsa general de talentos.
            </p>
          </div>
          <button
            type="button"
            className="public-btn public-btn-outline"
            onClick={() => handleOpenApplication({
              id: 'VAC-GRAL',
              puesto: 'Candidatura General / Cartera de Talento',
              area: 'Operaciones en General',
              tipoJornada: 'Tiempo Completo',
              estado: 'Abierta'
            })}
          >
            Registrar candidatura general
          </button>
        </div>
      </div>

      {/* Application Modal */}
      {isApplicationModalOpen && (
        <PublicApplicationModal
          vacancy={activeApplicationVacancy}
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false);
            setActiveApplicationVacancy(null);
          }}
        />
      )}
    </section>
  );
}
