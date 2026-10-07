import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sun,
  Moon,
  Type,
  Eye,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  Check,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  ZapOff,
  Gauge,
  Contrast,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import accessibilityService, { SPEECH_RATES } from '../../services/accessibilityService.js';

export const AccessibilityModal = () => {
  const {
    isAccessibilityModalOpen,
    closeAccessibilityModal,
    settings,
    updateSettings,
    showAlert
  } = useConstructa();

  // Voces reales del navegador
  const [voices, setVoices] = useState([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [activeTab, setActiveTab] = useState('apariencia'); // 'apariencia' | 'texto' | 'vision' | 'movimiento' | 'voz'
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Guardar elemento que tenía foco antes de abrir para restaurarlo al cerrar
  useEffect(() => {
    if (isAccessibilityModalOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
    }
  }, [isAccessibilityModalOpen]);

  // Cargar voces del navegador con orden preferente
  useEffect(() => {
    const loadVoices = () => {
      const realVoices = accessibilityService.getAvailableVoices();
      setVoices(realVoices);
      if (settings?.voice?.voiceURI) {
        setSelectedVoiceUri(settings.voice.voiceURI);
      } else if (realVoices.length > 0) {
        const defaultSpanish = realVoices.find((v) => v.isSpanish) || realVoices[0];
        setSelectedVoiceUri(defaultSpanish.voiceURI);
      }
    };

    loadVoices();
    const cleanup = accessibilityService.onVoicesChanged(loadVoices);
    return cleanup;
  }, [settings?.voice?.voiceURI]);

  // Sincronizar estado local con settings y servicio de voz
  useEffect(() => {
    if (settings) {
      if (settings.voice?.rate) setSpeechRate(settings.voice.rate);
      if (settings.voice?.voiceURI) setSelectedVoiceUri(settings.voice.voiceURI);
    }
  }, [settings]);

  // Suscribirse al estado reactivo del servicio de voz
  useEffect(() => {
    const unsub = accessibilityService.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
      setIsPaused(state.isPaused);
    });
    return unsub;
  }, []);

  // Manejo de foco atrapado y tecla ESC
  useEffect(() => {
    if (!isAccessibilityModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAccessibilityModal();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAccessibilityModalOpen, closeAccessibilityModal]);

  if (!isAccessibilityModalOpen) return null;

  // Manejadores de cambios
  const handleThemeChange = async (theme) => {
    setIsSaving(true);
    await updateSettings({ theme });
    setIsSaving(false);
  };

  const handleContrastChange = async (highContrast) => {
    setIsSaving(true);
    await updateSettings({ highContrast });
    setIsSaving(false);
  };

  const handleTextSizeChange = async (textSize) => {
    setIsSaving(true);
    await updateSettings({ textSize, fontSize: textSize });
    setIsSaving(false);
  };

  const handleColorVisionChange = async (colorVision) => {
    setIsSaving(true);
    await updateSettings({ colorVision });
    setIsSaving(false);
  };

  const handleReducedMotionChange = async (reducedMotion) => {
    setIsSaving(true);
    await updateSettings({ reducedMotion });
    setIsSaving(false);
  };

  const handleVoiceToggle = async (enabled) => {
    setIsSaving(true);
    if (!enabled) {
      accessibilityService.stop();
    }
    await updateSettings({
      voice: {
        ...(settings?.voice || {}),
        enabled
      }
    });
    setIsSaving(false);
    if (enabled) {
      accessibilityService.speak('Asistencia de voz activada en CONSTRUCTA.', { rate: speechRate, voiceURI: selectedVoiceUri });
    }
  };

  const handleVoiceUriChange = async (uri) => {
    setSelectedVoiceUri(uri);
    setIsSaving(true);
    await updateSettings({
      voice: {
        ...(settings?.voice || {}),
        voiceURI: uri
      }
    });
    setIsSaving(false);
  };

  const handleRateChange = async (rateVal) => {
    const rate = Number(rateVal);
    setSpeechRate(rate);
    setIsSaving(true);
    await updateSettings({
      voice: {
        ...(settings?.voice || {}),
        rate
      }
    });
    setIsSaving(false);
  };

  // Controles de audio
  const handlePlayVoice = () => {
    if (isPaused) {
      accessibilityService.resume();
      return;
    }

    accessibilityService.speak(accessibilityService.SAMPLE_TEXT, {
      voiceURI: selectedVoiceUri,
      rate: speechRate,
      onError: (err) => {
        showAlert?.('No se pudo reproducir la voz: ' + (err.message || 'Error del sintetizador'), 'error');
      }
    });
  };

  const handlePauseVoice = () => {
    accessibilityService.pause();
  };

  const handleStopVoice = () => {
    accessibilityService.stop();
  };

  const handleResetToDefaults = async () => {
    accessibilityService.stop();
    setIsSaving(true);
    await updateSettings({
      theme: 'dark',
      textSize: 'normal',
      fontSize: 'normal',
      highContrast: false,
      colorVision: 'normal',
      reducedMotion: false,
      voice: {
        enabled: false,
        voiceURI: '',
        rate: 1,
        pitch: 1,
        volume: 1
      }
    });
    setIsSaving(false);
    showAlert?.('Preferencias de accesibilidad restablecidas a los valores de fábrica.', 'success');
  };

  const activeTextSize = settings?.textSize || settings?.fontSize || 'normal';
  const isHighContrast = Boolean(settings?.highContrast);
  const activeColorVision = settings?.colorVision || 'normal';
  const isReducedMotion = Boolean(settings?.reducedMotion);
  const isVoiceActive = Boolean(settings?.voice?.enabled);

  return (
    <div
      className="accessibility-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAccessibilityModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
      aria-describedby="accessibility-modal-desc"
    >
      <div
        ref={modalRef}
        className="accessibility-modal-container"
        style={{
          width: '94%',
          maxWidth: '740px',
          maxHeight: '90vh',
          background: 'var(--bg-card, #131922)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border-card, rgba(255,255,255,0.12))',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card, #131922)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-amber, #f59e0b)'
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h2
                id="accessibility-modal-title"
                style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #ffffff)' }}
              >
                Centro de Accesibilidad y Adaptabilidad
              </h2>
              <p
                id="accessibility-modal-desc"
                style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', margin: 0 }}
              >
                Personaliza la apariencia, tamaño, contraste, colores y asistencia por voz de forma no destructiva.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-icon"
            onClick={closeAccessibilityModal}
            aria-label="Cerrar ventana de accesibilidad"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Pestañas Accesibles */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            background: 'var(--bg-app, #0b0f14)',
            padding: '0.4rem 1.25rem 0',
            gap: '0.35rem',
            overflowX: 'auto'
          }}
          role="tablist"
          aria-label="Categorías de accesibilidad"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'apariencia'}
            onClick={() => setActiveTab('apariencia')}
            style={{
              padding: '0.65rem 0.9rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'apariencia' ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary, #94a3b8)',
              borderBottom: activeTab === 'apariencia' ? '2px solid var(--accent-amber, #f59e0b)' : '2px solid transparent'
            }}
          >
            <Sun size={15} /> Apariencia & Contraste
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'texto'}
            onClick={() => setActiveTab('texto')}
            style={{
              padding: '0.65rem 0.9rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'texto' ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary, #94a3b8)',
              borderBottom: activeTab === 'texto' ? '2px solid var(--accent-amber, #f59e0b)' : '2px solid transparent'
            }}
          >
            <Type size={15} /> Tamaño de Letra
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'vision'}
            onClick={() => setActiveTab('vision')}
            style={{
              padding: '0.65rem 0.9rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'vision' ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary, #94a3b8)',
              borderBottom: activeTab === 'vision' ? '2px solid var(--accent-amber, #f59e0b)' : '2px solid transparent'
            }}
          >
            <Eye size={15} /> Daltonismo & Percepción
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'voz'}
            onClick={() => setActiveTab('voz')}
            style={{
              padding: '0.65rem 0.9rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'voz' ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary, #94a3b8)',
              borderBottom: activeTab === 'voz' ? '2px solid var(--accent-amber, #f59e0b)' : '2px solid transparent'
            }}
          >
            <Volume2 size={15} /> Voz y Lectura
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'movimiento'}
            onClick={() => setActiveTab('movimiento')}
            style={{
              padding: '0.65rem 0.9rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'movimiento' ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary, #94a3b8)',
              borderBottom: activeTab === 'movimiento' ? '2px solid var(--accent-amber, #f59e0b)' : '2px solid transparent'
            }}
          >
            <ZapOff size={15} /> Movimiento
          </button>
        </div>

        {/* Cuerpo del Modal con scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem' }}>
          {/* ================= 1. PESTAÑA: APARIENCIA & CONTRASTE ================= */}
          {activeTab === 'apariencia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Tema Global (Modo Oscuro / Claro)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  El modo oscuro conserva la identidad obsidiana de CONSTRUCTA; el modo claro utiliza tokens semánticos de alto contraste evitando páginas blancas desprovistas de jerarquía.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  {/* Tema Oscuro */}
                  <div
                    onClick={() => handleThemeChange('dark')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleThemeChange('dark')}
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md, 10px)',
                      border: `2px solid ${settings?.theme === 'dark' ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                      background: '#0b0f14',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {settings?.theme === 'dark' && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent-amber, #f59e0b)' }}>
                        <Check size={18} />
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <Moon size={18} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                      <strong style={{ fontSize: '0.9rem' }}>Modo Oscuro (Predeterminado)</strong>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>
                      Fondo obsidiana, superficies antracita y acentos ámbar corporativos.
                    </span>
                  </div>

                  {/* Tema Claro */}
                  <div
                    onClick={() => handleThemeChange('light')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleThemeChange('light')}
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md, 10px)',
                      border: `2px solid ${settings?.theme === 'light' ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {settings?.theme === 'light' && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', color: '#d97706' }}>
                        <Check size={18} />
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <Sun size={18} style={{ color: '#d97706' }} />
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Modo Claro Corporativo</strong>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#475569', display: 'block' }}>
                      Fondo gris slate suave con tarjetas blancas y tipografía de máxima legibilidad.
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección Contraste */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Nivel de Contraste
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  El alto contraste acentúa bordes, textos secundarios, inputs y botones sin destruir el diseño estructural.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div
                    onClick={() => handleContrastChange(false)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleContrastChange(false)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md, 10px)',
                      border: `2px solid ${!isHighContrast ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                      background: 'var(--bg-surface, rgba(255,255,255,0.03))',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Contraste Normal</strong>
                      {!isHighContrast && <Check size={16} style={{ color: 'var(--accent-amber)' }} />}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Gradientes sutiles y bordes refinados estándar.
                    </span>
                  </div>

                  <div
                    onClick={() => handleContrastChange(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleContrastChange(true)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md, 10px)',
                      border: `2px solid ${isHighContrast ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                      background: 'var(--bg-surface, rgba(255,255,255,0.03))',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Alto Contraste</strong>
                      {isHighContrast && <Check size={16} style={{ color: 'var(--accent-amber)' }} />}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Bordes reforzados a 2px y texto con luminancia optimizada.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. PESTAÑA: TAMAÑO DE LETRA ================= */}
          {activeTab === 'texto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Escala Tipográfica Controlada (Sin rompimiento visual)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  El ajuste de tamaño utiliza multiplicadores jerárquicos basados en variables CSS controladas. No utiliza <code>transform: scale</code> ni <code>zoom</code>, respetando el ancho de columnas, tarjetas y tablas.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'small', label: '1. Pequeño', scale: '0.88x', desc: 'Para pantallas compactas con alta densidad de datos' },
                    { id: 'normal', label: '2. Normal', scale: '1.00x', desc: 'Tamaño estándar equilibrado' },
                    { id: 'large', label: '3. Grande', scale: '1.14x', desc: 'Mayor legibilidad y descanso visual' },
                    { id: 'xlarge', label: '4. Muy grande', scale: '1.30x', desc: 'Máxima escala accesible para baja visión' }
                  ].map((lvl) => {
                    const isSelected = activeTextSize === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleTextSizeChange(lvl.id)}
                        style={{
                          padding: '1rem 0.85rem',
                          borderRadius: 'var(--radius-md, 10px)',
                          border: `2px solid ${isSelected ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                          background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface, rgba(255,255,255,0.03))',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.3rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {lvl.label}
                          </span>
                          {isSelected && <Check size={16} style={{ color: 'var(--accent-amber)' }} />}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                          Multiplicador {lvl.scale}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {lvl.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Previsualización en tiempo real */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md, 10px)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app, #0b0f14)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-amber)', fontWeight: 700 }}>
                    Vista Previa en Vivo (Nivel Actual: {activeTextSize.toUpperCase()})
                  </span>
                  <h4 style={{ margin: 0, fontSize: 'var(--font-h3, 1.25rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Construcción de Infraestructura Hospitalaria Norte
                  </h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-body, 0.92rem)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    El presupuesto autorizado presenta un 72% de ejecución física con 4 cuadrillas activas en obra civil y cero desviaciones críticas.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="symbol-tag symbol-success">[✓] OBRA AL DÍA</span>
                    <span className="symbol-tag symbol-warning">[!] REVISIÓN PENDIENTE</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. PESTAÑA: DALTONISMO & PERCEPCIÓN ================= */}
          {activeTab === 'vision' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Perfiles Semánticos de Percepción del Color
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  No utiliza filtros destructivos (como <code>hue-rotate</code> o inversión) sobre fotografías ni planos. Adapta semánticamente los indicadores de estado, badges y gráficos, combinando además color con símbolos textuales e iconografía.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'normal', label: '1. Visión Normal', desc: 'Paleta corporativa estándar (Ámbar, Verde, Rojo, Azul)' },
                    { id: 'red-green', label: '2. Rojo - Verde', desc: 'Sustituye verdes y rojos confusos por ámbar y cian de alto contraste' },
                    { id: 'green-red', label: '3. Verde - Rojo', desc: 'Diferenciación reforzada para deuteranomalía con texturas semánticas' },
                    { id: 'blue-yellow', label: '4. Azul - Amarillo', desc: 'Esquema adaptado para tritanomalía evitando confusión cromática' }
                  ].map((p) => {
                    const isSelected = activeColorVision === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleColorVisionChange(p.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleColorVisionChange(p.id)}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md, 10px)',
                          border: `2px solid ${isSelected ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                          background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface, rgba(255,255,255,0.03))',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{p.label}</strong>
                          {isSelected && <Check size={16} style={{ color: 'var(--accent-amber)' }} />}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{p.desc}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Demostración de accesibilidad sin dependencia exclusiva del color */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md, 10px)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app, #0b0f14)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    Comprobación de Estados Accesibles (Símbolo + Texto + Color adaptado):
                  </strong>
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span className="symbol-tag symbol-success">
                      <CheckCircle2 size={13} /> [✓] COMPLETADO AL 100%
                    </span>
                    <span className="symbol-tag symbol-warning">
                      <AlertTriangle size={13} /> [!] ATENCIÓN: STOCK BAJO
                    </span>
                    <span className="symbol-tag symbol-danger">
                      <XCircle size={13} /> [×] DESVIACIÓN CRÍTICA
                    </span>
                    <span className="symbol-tag symbol-info">
                      <AlertCircle size={13} /> [i] EN PROCESO DE AUDITORÍA
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Cualquier persona puede identificar el significado del estado gracias al tag explícito y al icono, sin requerir discriminación visual de longitud de onda.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. PESTAÑA: VOZ Y LECTURA NATIVA ================= */}
          {activeTab === 'voz' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Sistema Global de Asistencia por Voz (Web Speech API)
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle(!isVoiceActive)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm, 6px)',
                      border: `1px solid ${isVoiceActive ? 'var(--accent-amber)' : 'var(--border-card)'}`,
                      background: isVoiceActive ? 'var(--accent-amber)' : 'rgba(255,255,255,0.06)',
                      color: isVoiceActive ? '#0b0f14' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    {isVoiceActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    {isVoiceActive ? 'Lectura activada' : 'Lectura desactivada'}
                  </button>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Permite escuchar títulos, botones, tarjetas o textos seleccionados al tocarlos o hacer clic sobre ellos, utilizando el sintetizador nativo de tu dispositivo.
                </p>

                {/* Controles de Configuración de Voz */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 'var(--radius-md, 10px)', border: '1px solid var(--border-subtle)' }}>
                  {/* Selector de Voz */}
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                      Voz Nativa del Sistema (Prioridad Español: México, España, Latinoamérica):
                    </label>
                    <select
                      className="constructa-input"
                      value={selectedVoiceUri}
                      onChange={(e) => handleVoiceUriChange(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      {voices.length === 0 ? (
                        <option value="">Cargando voces del navegador...</option>
                      ) : (
                        voices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang}) — {v.gender} {v.isSpanish ? '(Español)' : ''}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Selector de Velocidad */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Velocidad de Reproducción:
                      </label>
                      <span style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                        {speechRate}x
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {SPEECH_RATES.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleRateChange(rate)}
                          style={{
                            flex: 1,
                            minWidth: '50px',
                            padding: '0.5rem 0',
                            borderRadius: 'var(--radius-sm, 6px)',
                            border: `1px solid ${speechRate === rate ? 'var(--accent-amber)' : 'var(--border-card)'}`,
                            background: speechRate === rate ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                            color: speechRate === rate ? 'var(--accent-amber)' : 'var(--text-primary)',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botones de Prueba y Control */}
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handlePlayVoice}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                      <Play size={15} /> Probar Voz con Muestra
                    </button>

                    {isSpeaking && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handlePauseVoice}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Pause size={15} /> Pausar
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleStopVoice}
                      disabled={!isSpeaking}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                      <Square size={14} /> Detener
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. PESTAÑA: MOVIMIENTO ================= */}
          {activeTab === 'movimiento' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Preferencia de Movimiento y Animaciones
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Reduce o elimina transiciones y efectos de movimiento para evitar mareos o fatiga visual en usuarios con trastornos vestibulares.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div
                    onClick={() => handleReducedMotionChange(false)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleReducedMotionChange(false)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md, 10px)',
                      border: `2px solid ${!isReducedMotion ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                      background: 'var(--bg-surface, rgba(255,255,255,0.03))',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Animaciones Normales</strong>
                      {!isReducedMotion && <Check size={16} style={{ color: 'var(--accent-amber)' }} />}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Microinteracciones fluidas y transiciones corporativas completas.
                    </span>
                  </div>

                  <div
                    onClick={() => handleReducedMotionChange(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleReducedMotionChange(true)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md, 10px)',
                      border: `2px solid ${isReducedMotion ? 'var(--accent-amber, #f59e0b)' : 'var(--border-card)'}`,
                      background: 'var(--bg-surface, rgba(255,255,255,0.03))',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Movimiento Reducido</strong>
                      {isReducedMotion && <Check size={16} style={{ color: 'var(--accent-amber)' }} />}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Elimina traslaciones y animaciones continuas; mantiene transiciones instantáneas.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleResetToDefaults}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={14} /> Restablecer Fábrica
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={closeAccessibilityModal}
          >
            Aceptar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityModal;
