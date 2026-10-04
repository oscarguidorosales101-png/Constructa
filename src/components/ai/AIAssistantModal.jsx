import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  FileText,
  HelpCircle,
  ListOrdered,
  BookOpen,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import aiService from '../../services/aiService.js';
import accessibilityService from '../../services/accessibilityService.js';
import Texting from '../common/Texting.jsx';

export const AIAssistantModal = () => {
  const {
    isAIAssistantModalOpen,
    closeAIAssistantModal,
    settings,
    showAlert
  } = useConstructa();

  // Estados de IA
  const [providerStatus, setProviderStatus] = useState(() => aiService.getStatus());
  const [selectedProvider, setSelectedProvider] = useState(() => {
    const status = aiService.getStatus();
    return status.activeProvider || (status.gemini.configured ? 'gemini' : status.openai.configured ? 'openai' : 'gemini');
  });

  const [promptText, setPromptText] = useState(aiService.CONSTRUCTION_SAMPLE_TEXT);
  const [selectedAction, setSelectedAction] = useState('analizar');
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState('');
  const [lastActionExecuted, setLastActionExecuted] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isReadingVoice, setIsReadingVoice] = useState(false);

  // Actualizar estado de configuración al abrir
  useEffect(() => {
    if (isAIAssistantModalOpen) {
      const status = aiService.getStatus();
      setProviderStatus(status);
      if (status.activeProvider) {
        setSelectedProvider(status.activeProvider);
      }
    }
  }, [isAIAssistantModalOpen]);

  // Si se cierra el modal, detener audio si estaba leyendo
  useEffect(() => {
    if (!isAIAssistantModalOpen && isReadingVoice) {
      accessibilityService.stop();
      setIsReadingVoice(false);
    }
  }, [isAIAssistantModalOpen, isReadingVoice]);

  if (!isAIAssistantModalOpen) return null;

  const currentProviderConfigured =
    (selectedProvider === 'gemini' && providerStatus.gemini.configured) ||
    (selectedProvider === 'openai' && providerStatus.openai.configured);

  const handleActionExecute = async () => {
    if (!promptText.trim()) {
      showAlert('Por favor ingresa un texto para procesar.', 'error');
      return;
    }

    if (!providerStatus.anyConfigured || !currentProviderConfigured) {
      setErrorMessage(
        'El análisis no está disponible en este momento.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setResponseResult('');
    setLastActionExecuted(selectedAction);

    // Si estaba reproduciendo voz previa, detenerla
    if (isReadingVoice) {
      accessibilityService.stop();
      setIsReadingVoice(false);
    }

    const res = await aiService.generate({
      prompt: promptText,
      action: selectedAction,
      provider: selectedProvider
    });

    setIsLoading(false);

    if (res.ok) {
      setResponseResult(res.text);
    } else {
      setErrorMessage(res.error || 'No fue posible completar la solicitud de IA.');
      if (res.details) {
        console.error('[CONSTRUCTA AI Error Details]', res.details);
      }
    }
  };

  const handleReadResponseWithVoice = () => {
    if (!responseResult) return;

    if (isReadingVoice) {
      accessibilityService.stop();
      setIsReadingVoice(false);
      return;
    }

    setIsReadingVoice(true);
    accessibilityService.speak(responseResult, {
      voiceURI: settings?.voiceURI,
      rate: settings?.voiceRate || 1,
      volume: settings?.voiceVolume || 1,
      onEnd: () => setIsReadingVoice(false),
      onError: () => setIsReadingVoice(false)
    });
  };

  const handleLoadOfficialText = () => {
    setPromptText(aiService.CONSTRUCTION_SAMPLE_TEXT);
    setErrorMessage('');
  };

  return (
    <div className="modal-overlay" onClick={closeAIAssistantModal}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Cabecera */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)'
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem', margin: 0 }}>
                Asistente de Inteligencia Artificial CONSTRUCTA
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Conectividad real con Gemini & OpenAI — Sin respuestas simuladas
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={closeAIAssistantModal} title="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Asistente */}
        <div className="modal-body" style={{ flex: 1, padding: '1.4rem' }}>
          {/* Barra de Selección de Proveedor y Estado Real */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Proveedor de IA Conectado
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {/* Radio Gemini */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedProvider === 'gemini' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      border: `1px solid ${selectedProvider === 'gemini' ? 'var(--accent-blue)' : 'var(--border-medium)'}`,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}
                  >
                    <input
                      type="radio"
                      name="ai-provider"
                      value="gemini"
                      checked={selectedProvider === 'gemini'}
                      onChange={() => setSelectedProvider('gemini')}
                      style={{ accentColor: 'var(--accent-blue)' }}
                    />
                    Google Gemini
                    <span
                      className={`badge ${providerStatus.gemini.configured ? 'badge-success' : 'badge-neutral'}`}
                      style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                    >
                      {providerStatus.gemini.configured ? '✓ Configurado' : '○ Sin API key'}
                    </span>
                  </label>

                  {/* Radio OpenAI */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedProvider === 'openai' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      border: `1px solid ${selectedProvider === 'openai' ? 'var(--accent-green)' : 'var(--border-medium)'}`,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}
                  >
                    <input
                      type="radio"
                      name="ai-provider"
                      value="openai"
                      checked={selectedProvider === 'openai'}
                      onChange={() => setSelectedProvider('openai')}
                      style={{ accentColor: 'var(--accent-green)' }}
                    />
                    OpenAI (ChatGPT API)
                    <span
                      className={`badge ${providerStatus.openai.configured ? 'badge-success' : 'badge-neutral'}`}
                      style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                    >
                      {providerStatus.openai.configured ? '✓ Configurado' : '○ Sin API key'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Aviso transparente de credenciales */}
            {!providerStatus.anyConfigured && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--accent-amber)' }}>Integración de IA Lista pero sin credencial activa:</strong>
                  <p style={{ margin: '0.2rem 0 0' }}>
                    De acuerdo con los principios de seguridad de la aplicación, no se inventan API keys ni se simulan respuestas. Agrega <code style={{ color: 'var(--accent-amber)' }}>VITE_GEMINI_API_KEY</code> o <code style={{ color: 'var(--accent-amber)' }}>VITE_OPENAI_API_KEY</code> a tu archivo <code style={{ color: 'var(--accent-amber)' }}>.env</code> para habilitar la generación en vivo.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Área de Texto de Entrada */}
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Texto a Analizar / Procesar
              </label>
              <button
                type="button"
                onClick={handleLoadOfficialText}
                className="btn-outline"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', height: 'auto', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <RotateCcw size={12} /> Cargar texto oficial de construcción
              </button>
            </div>
            <textarea
              className="constructa-input"
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Escribe o pega aquí el texto que deseas procesar con Inteligencia Artificial..."
              style={{ lineHeight: 1.45 }}
            />
          </div>

          {/* Selector de Acciones */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
              Acción a Ejecutar con el Modelo de IA
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
              {[
                { id: 'analizar', label: 'Analizar', icon: Sparkles, desc: 'Impacto y viabilidad' },
                { id: 'resumir', label: 'Resumir', icon: FileText, desc: 'Puntos clave sintéticos' },
                { id: 'explicar', label: 'Explicar', icon: HelpCircle, desc: 'Lenguaje claro y didáctico' },
                { id: 'extraer_ideas', label: 'Extraer ideas', icon: ListOrdered, desc: 'Listado estructurado' }
              ].map((act) => {
                const Icon = act.icon;
                const isSelected = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedAction(act.id)}
                    style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-medium)'}`,
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem' }}>
                      <Icon size={16} />
                      {act.label}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{act.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón de Ejecución */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
            <button
              type="button"
              onClick={handleActionExecute}
              disabled={isLoading || !promptText.trim()}
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              {isLoading ? (
                <>
                  <Sparkles size={16} className="animate-spin" /> Analizando...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Ejecutar con {selectedProvider === 'gemini' ? 'Gemini' : 'OpenAI'}
                </>
              )}
            </button>

            {responseResult && !isLoading && (
              <button
                type="button"
                onClick={handleReadResponseWithVoice}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                {isReadingVoice ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {isReadingVoice ? 'Detener Voz' : '🔊 Leer resultado con voz'}
              </button>
            )}
          </div>

          {/* Mensajes de Error Diagnósticos */}
          {errorMessage && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--accent-red)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                fontSize: '0.85rem'
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>No fue posible completar la solicitud de IA:</strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleActionExecute}
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    border: '1px solid var(--accent-red)',
                    background: 'transparent',
                    color: 'var(--accent-red)',
                    cursor: 'pointer'
                  }}
                >
                  Reintentar Solicitud
                </button>
              </div>
            </div>
          )}

          {/* Resultado Generado (Con Componente Propio Texting) */}
          {responseResult && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <Sparkles size={16} color="var(--accent-amber)" />
                  Resultado de IA — {lastActionExecuted.toUpperCase()} ({selectedProvider.toUpperCase()})
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                  ✓ Respuesta Auténtica
                </span>
              </div>

              {/* Animación Texting nativa propia (sin librerías externas) */}
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                <Texting
                  text={responseResult}
                  speed={20}
                  cursor={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Proveedor activo: <strong>{selectedProvider.toUpperCase()}</strong> ({currentProviderConfigured ? 'Conectado' : 'Sin credencial'})
          </div>
          <button className="btn btn-secondary" onClick={closeAIAssistantModal}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;
