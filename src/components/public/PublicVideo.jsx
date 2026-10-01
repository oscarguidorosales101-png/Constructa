import React, { useState, useRef } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Film,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function PublicVideo({ onNavigateSection }) {
  const { video } = COMPANY_CONFIG;
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <section id="video" className="public-section public-module-section">
      <div className="public-container">
        {/* Breadcrumb de Navegación Modular */}
        <div className="public-breadcrumb">
          <button type="button" onClick={() => onNavigateSection?.('inicio')}>Inicio</button>
          <ChevronRight size={14} />
          <span>Video Institucional</span>
        </div>

        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Film size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Recorrido en Frente de Obra
          </span>
          <h2 className="section-title">{video.title}</h2>
          <p className="section-description">{video.subtitle}</p>
        </div>

        {/* Video & Info Layout */}
        <div className="public-video-wrapper-card">
          <div className="public-video-player-container">
            {!hasError ? (
              <div className="public-video-inner">
                <video
                  ref={videoRef}
                  src={video.src}
                  controls
                  playsInline
                  preload="metadata"
                  poster={video.poster || undefined}
                  className="public-html5-video"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setHasError(true)}
                >
                  <source src={video.src} type={video.mimeType || 'video/mp4'} />
                  Tu navegador no soporta la reproducción de video HTML5.
                </video>
              </div>
            ) : (
              <div className="public-video-fallback">
                <AlertCircle size={40} className="public-video-fallback-icon" />
                <h4 className="public-video-fallback-title">Video temporalmente no disponible</h4>
                <p className="public-video-fallback-desc">
                  El archivo audiovisual institucional está en proceso de sincronización. Le invitamos a conocer nuestras obras en la sección de Proyectos.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onNavigateSection?.('proyectos')}
                  style={{ marginTop: '14px' }}
                >
                  Explorar Proyectos
                </button>
              </div>
            )}
          </div>

          {/* Video Information Side / Bottom Panel */}
          <div className="public-video-details-panel">
            <div className="public-video-badge-row">
              <span className="public-video-pill">Metodología de Obra</span>
              {video.duration && (
                <span className="public-video-duration">Duración: {video.duration}</span>
              )}
            </div>

            <h3 className="public-video-subheading">
              Ingeniería de vanguardia y rigor operativo en cada frente
            </h3>

            <p className="public-video-text">
              Cada estructura ejecutada por nuestra firma responde a estrictos estándares sismo-resistentes, supervisión geotécnica independiente y coordinación continua con las cuadrillas de obra.
            </p>

            <div className="public-video-highlights">
              {video.highlights.map((highlight, idx) => (
                <div key={idx} className="public-video-highlight-item">
                  <CheckCircle2 size={16} className="public-video-check" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            <div className="public-video-footer-cta">
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onNavigateSection?.('trabaja-con-nosotros')}
              >
                <span>Formar parte de nuestro equipo</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Acciones Relacionadas / Continuidad */}
        <div className="public-section-bottom-cta">
          <div className="public-bottom-cta-text">
            <h4>¿Quieres ver los desarrollos y estructuras terminadas?</h4>
            <p>Conoce los proyectos finalizados y en proceso de construcción en nuestro portafolio de obras.</p>
          </div>
          <div className="public-bottom-cta-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateSection?.('proyectos')}
            >
              <span>Ver Portafolio de Obras</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onNavigateSection?.('galeria')}
            >
              <span>Ver Galería Fotográfica</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
