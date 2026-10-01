import React, { useState, useEffect } from 'react';
import { X, Building2, Calendar, MapPin, User, DollarSign, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PublicProjectModal({ project, isOpen, onClose, onNavigateContact }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setImgFailed(false);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Finalizado':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#34d399' };
      case 'En construcción':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' };
      case 'Planificación':
        return { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)', text: '#cbd5e1' };
    }
  };

  const statusStyle = getStatusColor(project.estado);

  const fallbackImage = '/imgs/proyectos/torre_altavista.jpg';
  const primaryImage = (!imgFailed && project.imagen) ? project.imagen : fallbackImage;

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div 
        className="constructa-modal public-project-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--accent-amber, #f59e0b)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                {project.codigo}
              </span>
              <span 
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: statusStyle.bg,
                  border: `1px solid ${statusStyle.border}`,
                  color: statusStyle.text
                }}
              >
                {project.estado}
              </span>
            </div>
            <h3 className="modal-title" style={{ fontSize: '1.35rem', margin: 0 }}>
              {project.nombre}
            </h3>
          </div>
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onClose} 
            aria-label="Cerrar detalle de proyecto"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '22px', padding: '24px' }}>
          {/* Main Visual */}
          <div className="public-modal-hero-img-wrap">
            <img 
              src={primaryImage} 
              alt={project.nombre} 
              className="public-modal-hero-img"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
            <div className="public-modal-hero-gradient">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.88rem', fontWeight: 500 }}>
                <MapPin size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                <span>{project.ubicacion}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="public-project-metrics-grid">
            <div className="public-metric-box">
              <span className="public-metric-lbl">Avance Físico de Obra</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
                <strong style={{ fontSize: '1.4rem', color: 'var(--accent-amber, #f59e0b)' }}>
                  {project.avance}%
                </strong>
              </div>
              <div className="public-project-progress-track">
                <div 
                  className="public-project-progress-fill" 
                  style={{ width: `${project.avance}%` }}
                />
              </div>
            </div>

            <div className="public-metric-box">
              <span className="public-metric-lbl">Presupuesto Asignado</span>
              <strong style={{ fontSize: '1.25rem', color: '#ffffff', display: 'block', margin: '4px 0' }}>
                {formatCurrency(project.presupuesto)}
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                Costo base contratado
              </span>
            </div>

            <div className="public-metric-box">
              <span className="public-metric-lbl">Plazo Programado</span>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, margin: '4px 0' }}>
                {project.fechaInicio} ➔ {project.fechaFinEstimada || project.fechaFin}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald, #10b981)', fontWeight: 600 }}>
                Cronograma de Ejecución Vigente
              </span>
            </div>
          </div>

          {/* Project Details Description */}
          <div className="public-project-info-block">
            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-amber, #f59e0b)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Descripción Técnica del Desarrollo
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.7' }}>
              {project.descripcion || 'Obra civil de alta especificación ejecutada bajo supervisión y estándares normativos rigurosos.'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="public-project-meta-table">
            <div className="public-meta-row">
              <div className="public-meta-col">
                <span className="public-meta-k">Cliente / Entidad Contratante:</span>
                <span className="public-meta-v">{project.cliente}</span>
              </div>
              <div className="public-meta-col">
                <span className="public-meta-k">Responsable de Residencia:</span>
                <span className="public-meta-v">{project.responsable}</span>
              </div>
            </div>
            <div className="public-meta-row">
              <div className="public-meta-col">
                <span className="public-meta-k">Ubicación Geográfica:</span>
                <span className="public-meta-v">{project.ubicacion}</span>
              </div>
              <div className="public-meta-col">
                <span className="public-meta-k">Control de Calidad:</span>
                <span className="public-meta-v" style={{ color: 'var(--accent-emerald, #10b981)' }}>
                  Supervisión y Ensayos de Laboratorio Acreditados
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
          <button 
            type="button"
            onClick={() => {
              if (onNavigateContact) onNavigateContact();
              else onClose();
            }}
            className="btn btn-outline btn-sm" 
          >
            Consultar obra similar
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-sm" 
            onClick={onClose}
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
}
