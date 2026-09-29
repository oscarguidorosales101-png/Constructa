import React, { useState, useRef } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import { Play, Pause, Volume2, VolumeX, Maximize2, CheckCircle2, Film, AlertCircle } from 'lucide-react';

export default function PublicVideo({ config = COMPANY_CONFIG }) {
  const { video } = config;
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <section id="video" className="public-section public-video-section">
      <div className="public-container">
        {/* Section Header */}
        <div className="public-section-header">
          <span className="public-section-badge">
            <Film size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Recorrido Institucional
          </span>
          <h2 className="public-section-title">{video.title}</h2>
          <p className="public-section-subtitle">{video.subtitle}</p>
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
                <a href="#proyectos" className="public-btn public-btn-primary" style={{ marginTop: '14px' }}>
                  Explorar Proyectos
                </a>
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
              <a href="#trabaja-con-nosotros" className="public-btn public-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Formar parte de nuestro equipo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
