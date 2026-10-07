import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, MousePointerClick, FileText, ChevronUp, ChevronDown, Gauge } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import accessibilityService, { SPEECH_RATES } from '../../services/accessibilityService.js';

export const VoiceReaderWidget = () => {
  const { settings, updateSettings, showAlert } = useConstructa();
  const [speechState, setSpeechState] = useState(() => accessibilityService.getState());
  const [isMinimized, setIsMinimized] = useState(false);
  const widgetRef = useRef(null);

  const isVoiceEnabled = Boolean(settings?.voice?.enabled);
  const currentRate = Number(settings?.voice?.rate || 1);

  // Suscribirse al estado reactivo del servicio de voz
  useEffect(() => {
    const unsubscribe = accessibilityService.subscribe((state) => {
      setSpeechState(state);
    });
    return unsubscribe;
  }, []);

  // Listener inteligente de clicks/toques para lectura al tocar elementos textuales cuando la voz está activada
  useEffect(() => {
    if (!isVoiceEnabled) return;

    const handleDocumentClick = (e) => {
      // Ignorar clicks dentro del propio widget de voz o dentro de modales de configuración
      if (widgetRef.current && widgetRef.current.contains(e.target)) return;
      if (e.target.closest('.accessibility-modal-backdrop') || e.target.closest('.modal-backdrop')) return;
      if (e.target.closest('input, textarea, select, [contenteditable="true"], .search-box')) return;

      // Ignorar si el usuario está seleccionando texto libre
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 1) {
        return; // Permitir que use el botón "Leer selección"
      }

      // Detectar elementos legibles de alto valor informativo
      const targetElement = e.target.closest(
        'h1, h2, h3, h4, h5, h6, p, label, .badge, .status-badge, .constructa-card, .metric-card, .public-hero-title, .public-hero-description, .public-about-card, .public-hub-card, button, th, td'
      );

      if (targetElement) {
        // Evitar triggers repetitivos sobre contenedores anidados
        const isSelfButtonOrText =
          targetElement === e.target ||
          targetElement.contains(e.target) && ['h1', 'h2', 'h3', 'p', 'label', 'span'].includes(e.target.tagName.toLowerCase());

        if (isSelfButtonOrText) {
          accessibilityService.readElement(targetElement);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isVoiceEnabled]);

  const handleToggleVoice = async () => {
    const nextEnabled = !isVoiceEnabled;
    if (!nextEnabled) {
      accessibilityService.stop();
    }
    await updateSettings({
      voice: {
        ...(settings?.voice || {}),
        enabled: nextEnabled
      }
    });
    if (nextEnabled) {
      accessibilityService.speak('Asistencia de voz activada. Toca cualquier título, tarjeta o texto para escucharlo.', {
        sourceType: 'custom'
      });
    }
  };

  const handleReadSelection = () => {
    const success = accessibilityService.readSelection();
    if (!success) {
      showAlert?.('Selecciona primero un texto en la pantalla con el cursor o el dedo para escucharlo.', 'info');
    }
  };

  const handlePlayPause = () => {
    if (speechState.isSpeaking) {
      if (speechState.isPaused) {
        accessibilityService.resume();
      } else {
        accessibilityService.pause();
      }
    } else {
      // Si no hay lectura en curso, leer muestra introductoria
      accessibilityService.speak(accessibilityService.SAMPLE_TEXT, { sourceType: 'sample' });
    }
  };

  const handleStop = () => {
    accessibilityService.stop();
  };

  const handleRateChange = async (newRate) => {
    const parsedRate = Number(newRate);
    await updateSettings({
      voice: {
        ...(settings?.voice || {}),
        rate: parsedRate
      }
    });
    accessibilityService.speak(`Velocidad ajustada a ${parsedRate}x`, { rate: parsedRate });
  };

  if (!isVoiceEnabled) {
    // Botón flotante accesible discreto para activar voz
    return (
      <aside aria-label="Control de asistencia de voz">
        <button
          type="button"
          onClick={handleToggleVoice}
          className="voice-floating-trigger"
          title="Activar lectura por voz nativa (SpeechSynthesis)"
          aria-label="Activar asistencia de voz nativa"
        >
          <Volume2 size={16} />
          <span>Lectura</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      ref={widgetRef}
      className={`voice-reader-bar ${isMinimized ? 'minimized' : ''}`}
      aria-label="Barra de control de lectura por voz"
      role="region"
    >
      <div className="voice-bar-header">
        <div className="voice-status-group">
          <div className={`voice-status-indicator ${speechState.isSpeaking && !speechState.isPaused ? 'active' : ''}`}>
            <Volume2 size={16} />
          </div>
          <div className="voice-status-text">
            <span className="voice-title">Lectura activada</span>
            <span className="voice-subtitle">
              {speechState.isSpeaking
                ? speechState.isPaused
                  ? 'Lectura en pausa'
                  : 'Reproduciendo texto...'
                : 'Toca un texto para escucharlo'}
            </span>
          </div>
        </div>

        <div className="voice-bar-actions">
          <button
            type="button"
            className="voice-btn-sm"
            onClick={handleReadSelection}
            title="Leer el texto actualmente seleccionado en la pantalla"
          >
            <FileText size={14} />
            <span className="hide-mobile">Leer selección</span>
          </button>

          <button
            type="button"
            className={`voice-btn-icon ${speechState.isSpeaking && !speechState.isPaused ? 'active' : ''}`}
            onClick={handlePlayPause}
            title={speechState.isPaused ? 'Reanudar lectura' : speechState.isSpeaking ? 'Pausar lectura' : 'Probar lectura'}
            aria-label={speechState.isPaused ? 'Reanudar lectura' : speechState.isSpeaking ? 'Pausar lectura' : 'Probar lectura'}
          >
            {speechState.isSpeaking && !speechState.isPaused ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button
            type="button"
            className="voice-btn-icon"
            onClick={handleStop}
            title="Detener lectura"
            aria-label="Detener lectura"
            disabled={!speechState.isSpeaking}
          >
            <Square size={14} />
          </button>

          {/* Selector de velocidad */}
          <div className="voice-rate-picker" title="Velocidad de reproducción de voz">
            <Gauge size={13} style={{ opacity: 0.7 }} />
            <select
              value={currentRate}
              onChange={(e) => handleRateChange(e.target.value)}
              aria-label="Velocidad de lectura"
              className="voice-rate-select"
            >
              {SPEECH_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </div>

          {/* Minimizar / Desactivar */}
          <button
            type="button"
            className="voice-btn-icon"
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? 'Expandir barra de lectura' : 'Minimizar barra de lectura'}
            aria-label={isMinimized ? 'Expandir barra de lectura' : 'Minimizar barra de lectura'}
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <button
            type="button"
            className="voice-btn-icon text-danger"
            onClick={handleToggleVoice}
            title="Desactivar asistencia de voz"
            aria-label="Desactivar asistencia de voz"
          >
            <VolumeX size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default VoiceReaderWidget;
