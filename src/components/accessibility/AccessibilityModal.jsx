import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  Moon,
  Monitor,
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
  ZapOff
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import accessibilityService from '../../services/accessibilityService.js';

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
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [testText, setTestText] = useState(accessibilityService.SAMPLE_TEXT);
  const [activeTab, setActiveTab] = useState('apariencia'); // 'apariencia' | 'texto' | 'vision' | 'voz'
  const [isSaving, setIsSaving] = useState(false);

  // Cargar voces del navegador
  useEffect(() => {
    const loadVoices = () => {
      const realVoices = accessibilityService.getVoices();
      setVoices(realVoices);
      if (settings?.voiceURI) {
        setSelectedVoiceUri(settings.voiceURI);
      } else if (realVoices.length > 0) {
        const defaultV = realVoices.find((v) => v.default || v.lang.startsWith('es')) || realVoices[0];
        setSelectedVoiceUri(defaultV.voiceURI);
      }
    };

    loadVoices();
    accessibilityService.onVoicesChanged(loadVoices);
  }, [settings?.voiceURI]);

  // Sincronizar estado local con settings globales
  useEffect(() => {
    if (settings) {
      if (settings.voiceRate) setSpeechRate(settings.voiceRate);
      if (settings.voicePitch) setSpeechPitch(settings.voicePitch);
      if (settings.voiceVolume) setSpeechVolume(settings.voiceVolume);
      if (settings.voiceURI) setSelectedVoiceUri(settings.voiceURI);
    }
  }, [settings]);

  if (!isAccessibilityModalOpen) return null;

  // Manejador de cambio inmediato de tema
  const handleThemeChange = async (theme) => {
    setIsSaving(true);
    await updateSettings({ theme });
    setIsSaving(false);
  };

  // Manejador de cambio de tamaño de fuente
  const handleFontSizeChange = async (fontSize) => {
    setIsSaving(true);
    await updateSettings({ fontSize });
    setIsSaving(false);
  };

  // Manejador de cambio de visión de color / daltonismo
  const handleColorVisionChange = async (colorVision) => {
    setIsSaving(true);
    await updateSettings({ colorVision });
    setIsSaving(false);
  };

  // Manejador de cambio de reducción de movimiento
  const handleReducedMotionChange = async (reducedMotion) => {
    setIsSaving(true);
    await updateSettings({ reducedMotion });
    setIsSaving(false);
  };

  // Controles de Voz Nativos
  const handlePlayVoice = () => {
    if (isPaused) {
      accessibilityService.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    setIsSpeaking(true);
    setIsPaused(false);

    accessibilityService.speak(testText, {
      voiceURI: selectedVoiceUri,
      rate: speechRate,
      pitch: speechPitch,
      volume: speechVolume,
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: (err) => {
        setIsSpeaking(false);
        setIsPaused(false);
        showAlert('No se pudo reproducir la voz: ' + (err.message || 'Error del sintetizador'), 'error');
      }
    });
  };

  const handlePauseVoice = () => {
    accessibilityService.pause();
    setIsPaused(true);
  };

  const handleStopVoice = () => {
    accessibilityService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleVoiceSelect = async (uri) => {
    setSelectedVoiceUri(uri);
    await updateSettings({ voiceURI: uri });
  };

  const handleRateChange = async (rate) => {
    const val = parseFloat(rate);
    setSpeechRate(val);
    await updateSettings({ voiceRate: val });
  };

  const handleToggleVoiceEnabled = async () => {
    const newEnabled = !settings.voiceEnabled;
    if (!newEnabled) {
      handleStopVoice();
    }
    await updateSettings({ voiceEnabled: newEnabled });
  };

  return (
    <div className="modal-overlay" onClick={closeAccessibilityModal}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0b0f17'
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem', margin: 0 }}>Centro de Accesibilidad & Preferencias</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Configuraciones globales con persistencia real en db.json
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={closeAccessibilityModal} title="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Navegación del Centro de Accesibilidad */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            padding: '0.4rem 1.25rem 0',
            gap: '0.5rem',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveTab('apariencia')}
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: activeTab === 'apariencia' ? 'var(--accent-amber)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'apariencia' ? '2px solid var(--accent-amber)' : '2px solid transparent'
            }}
          >
            <Sun size={16} /> Apariencia
          </button>

          <button
            onClick={() => setActiveTab('texto')}
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: activeTab === 'texto' ? 'var(--accent-amber)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'texto' ? '2px solid var(--accent-amber)' : '2px solid transparent'
            }}
          >
            <Type size={16} /> Tamaño de Letra
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: activeTab === 'vision' ? 'var(--accent-amber)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'vision' ? '2px solid var(--accent-amber)' : '2px solid transparent'
            }}
          >
            <Eye size={16} /> Visión y Daltonismo
          </button>

          <button
            onClick={() => setActiveTab('voz')}
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: activeTab === 'voz' ? 'var(--accent-amber)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'voz' ? '2px solid var(--accent-amber)' : '2px solid transparent'
            }}
          >
            <Volume2 size={16} /> Voz y Lectura Nativa
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body" style={{ flex: 1, padding: '1.4rem' }}>
          {/* ================= PESTAÑA: APARIENCIA ================= */}
          {activeTab === 'apariencia' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Tema Global de la Aplicación
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Afecta centralizadamente fondos, paneles, tarjetas, formularios, tablas, modales y textos.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {/* Opción Oscuro */}
                <div
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${settings?.theme === 'dark' ? 'var(--accent-amber)' : 'var(--border-card)'}`,
                    background: '#0d121c',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Moon size={20} color="#f59e0b" />
                      <span style={{ fontWeight: 700 }}>Tema Oscuro</span>
                    </div>
                    {settings?.theme === 'dark' && <Check size={18} color="#f59e0b" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    Negro empresarial elegante con acentos ámbar. Reduce la fatiga visual.
                  </p>
                </div>

                {/* Opción Claro */}
                <div
                  onClick={() => handleThemeChange('light')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${settings?.theme === 'light' ? 'var(--accent-amber)' : 'var(--border-card)'}`,
                    background: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sun size={20} color="#d97706" />
                      <span style={{ fontWeight: 700 }}>Tema Claro</span>
                    </div>
                    {settings?.theme === 'light' && <Check size={18} color="#d97706" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
                    Superficies blancas con máxima legibilidad y tipografía contrastante.
                  </p>
                </div>

                {/* Opción Automático / Sistema */}
                <div
                  onClick={() => handleThemeChange('system')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${settings?.theme === 'system' ? 'var(--accent-amber)' : 'var(--border-card)'}`,
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Monitor size={20} color="var(--accent-blue)" />
                      <span style={{ fontWeight: 700 }}>Automático (SO)</span>
                    </div>
                    {settings?.theme === 'system' && <Check size={18} color="var(--accent-amber)" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Sincroniza la apariencia con las preferencias de tu sistema operativo.
                  </p>
                </div>
              </div>

              {/* Reducción de Movimiento */}
              <div
                style={{
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <ZapOff size={18} color="var(--accent-amber)" />
                    Reducción de Movimiento
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                    Desactiva transiciones y animaciones intensas para evitar mareos o distracciones.
                  </p>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!settings?.reducedMotion}
                    onChange={(e) => handleReducedMotionChange(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* ================= PESTAÑA: TAMAÑO DE TEXTO ================= */}
          {activeTab === 'texto' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Escala Tipográfica Global
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Escala de manera proporcional botones, tablas, formularios y navegación sin romper la interfaz ni provocar desbordamiento horizontal.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
                {[
                  { id: 'small', label: 'Pequeña', px: '14px', desc: 'Compacto' },
                  { id: 'normal', label: 'Normal', px: '16px', desc: 'Estándar recomendado' },
                  { id: 'large', label: 'Grande', px: '18px', desc: 'Lectura cómoda' },
                  { id: 'xlarge', label: 'Muy grande', px: '20px', desc: 'Máxima visibilidad' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleFontSizeChange(item.id)}
                    style={{
                      padding: '1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${settings?.fontSize === item.id ? 'var(--accent-amber)' : 'var(--border-card)'}`,
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-amber)', marginBottom: '0.25rem' }}>
                      Aa
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Base: {item.px}
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista previa de texto */}
              <div
                style={{
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Vista Previa en Tiempo Real
                </div>
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                  CONSTRUCTA — Gestión y Obras Inteligentes
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  La tipografía escala con unidades rem preservando las márgenes de los contenedores y el aislamiento de las tablas de datos.
                </p>
              </div>
            </div>
          )}

          {/* ================= PESTAÑA: VISIÓN Y DALTONISMO ================= */}
          {activeTab === 'vision' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Filtros de Color & Alto Contraste
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Ajusta las paletas para daltonismo y garantiza que los estados no dependan únicamente del color.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {[
                  { id: 'normal', name: 'Normal', desc: 'Paleta completa original' },
                  { id: 'high-contrast', name: 'Alto contraste', desc: 'Bordes nítidos y contraste reforzado' },
                  { id: 'protanopia', name: 'Protanopia', desc: 'Ajuste para debilidad al rojo' },
                  { id: 'deuteranopia', name: 'Deuteranopia', desc: 'Ajuste para debilidad al verde' },
                  { id: 'tritanopia', name: 'Tritanopia', desc: 'Ajuste para debilidad al azul' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleColorVisionChange(item.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${settings?.colorVision === item.id ? 'var(--accent-amber)' : 'var(--border-card)'}`,
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</span>
                      {settings?.colorVision === item.id && <Check size={16} color="var(--accent-amber)" />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Muestra de estados universales independientes del color */}
              <div
                style={{
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Garantía de Estados Accesibles (Iconos + Texto + Símbolos)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                  <div className="badge badge-success" style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                    <span className="status-symbol">✓</span> Éxito / Operación completada
                  </div>
                  <div className="badge badge-warning" style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                    <span className="status-symbol">!</span> Advertencia / Revisar
                  </div>
                  <div className="badge badge-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                    <span className="status-symbol">×</span> Error / Acción requerida
                  </div>
                  <div className="badge badge-info" style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                    <span className="status-symbol">i</span> Información general
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PESTAÑA: VOZ Y LECTURA NATIVA ================= */}
          {activeTab === 'voz' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Síntesis de Voz Nativa del Navegador
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                    Usa window.speechSynthesis (sin librerías externas). Detecta voces reales instaladas en su dispositivo.
                  </p>
                </div>
                <button
                  onClick={handleToggleVoiceEnabled}
                  className={`btn ${settings?.voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minHeight: '34px', fontSize: '0.82rem' }}
                >
                  {settings?.voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  {settings?.voiceEnabled ? 'Voz Activada' : 'Voz Desactivada'}
                </button>
              </div>

              {/* Selector de Voz Real */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Voces Detectadas en su Dispositivo ({voices.length})
                </label>
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => handleVoiceSelect(e.target.value)}
                  className="constructa-input"
                  disabled={!settings?.voiceEnabled}
                >
                  {voices.map((v) => {
                    const genderTag = v.genderGuess !== 'Indeterminado' ? ` [${v.genderGuess}]` : '';
                    return (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang}){genderTag} {v.default ? '★ Recomendada' : ''}
                      </option>
                    );
                  })}
                </select>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Nota técnica: La clasificación Hombre/Mujer solo se muestra si los metadatos reales del sistema la confirman. No se inventan voces sintéticas.
                </span>
              </div>

              {/* Velocidad y Parámetros */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <label className="form-label">Velocidad de Lectura</label>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    disabled={!settings?.voiceEnabled}
                    style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>0.5x (Lento)</span>
                    <span>1.0x (Normal)</span>
                    <span>2.0x (Rápido)</span>
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <label className="form-label">Volumen</label>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>{Math.round(speechVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={speechVolume}
                    onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                    disabled={!settings?.voiceEnabled}
                    style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
                  />
                </div>
              </div>

              {/* Texto de Prueba Oficial */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label">Texto de Prueba Oficial</label>
                  <button
                    type="button"
                    onClick={() => setTestText(accessibilityService.SAMPLE_TEXT)}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <RotateCcw size={12} /> Restaurar texto
                  </button>
                </div>
                <textarea
                  className="constructa-input"
                  rows={3}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  disabled={!settings?.voiceEnabled}
                />
              </div>

              {/* Botones de Control de Reproducción */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!isSpeaking || isPaused ? (
                  <button
                    type="button"
                    onClick={handlePlayVoice}
                    disabled={!settings?.voiceEnabled}
                    className="btn btn-primary"
                    style={{ minWidth: '130px' }}
                  >
                    <Play size={16} /> {isPaused ? 'Continuar' : 'Escuchar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseVoice}
                    disabled={!settings?.voiceEnabled}
                    className="btn btn-secondary"
                    style={{ minWidth: '130px' }}
                  >
                    <Pause size={16} /> Pausar
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleStopVoice}
                  disabled={!settings?.voiceEnabled || (!isSpeaking && !isPaused)}
                  className="btn btn-outline"
                >
                  <Square size={16} /> Detener
                </button>

                {isSpeaking && !isPaused && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <Volume2 size={16} /> Reproduciendo audio nativo...
                  </span>
                )}
                {isPaused && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <Pause size={16} /> Audio en pausa
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isSaving ? 'Guardando en db.json...' : '✓ Preferencias sincronizadas con db.json'}
          </div>
          <button className="btn btn-primary" onClick={closeAccessibilityModal}>
            Cerrar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityModal;
