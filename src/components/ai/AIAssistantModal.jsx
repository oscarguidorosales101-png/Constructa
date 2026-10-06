import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Building2,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import aiService from '../../services/aiService.js';
import accessibilityService from '../../services/accessibilityService.js';
import Texting from '../common/Texting.jsx';

export const AIAssistantModal = () => {
  const {
    currentUser,
    isAIAssistantModalOpen,
    closeAIAssistantModal,
    projects = [],
    expenses = [],
    materials = [],
    schedule = [],
    purchaseOrders = [],
    materialRequests = [],
    suppliers = [],
    employees = [],
    metrics = {},
    settings,
    showAlert
  } = useConstructa();

  // Estados de IA
  const [serverStatus, setServerStatus] = useState({ configured: false, provider: 'Google Gemini' });
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [promptText, setPromptText] = useState('¿Cuál proyecto presenta mayor riesgo y requiere atención prioritaria?');
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState('');
  const [engineType, setEngineType] = useState(null);
  const [providerName, setProviderName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isReadingVoice, setIsReadingVoice] = useState(false);

  // Consultar estado real del servidor backend sin exponer secretos
  useEffect(() => {
    if (isAIAssistantModalOpen) {
      aiService.checkServerStatus().then((status) => {
        if (status) setServerStatus(status);
      });
    }
  }, [isAIAssistantModalOpen]);

  // Si se cierra el modal, detener audio si estaba leyendo
  useEffect(() => {
    if (!isAIAssistantModalOpen && isReadingVoice) {
      accessibilityService.stop();
      setIsReadingVoice(false);
    }
  }, [isAIAssistantModalOpen, isReadingVoice]);

  // Proyecto activo seleccionado
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => String(p.id) === String(selectedProjectId)) || null;
  }, [projects, selectedProjectId]);

  // Paquete de datos operativos reales de CONSTRUCTA
  const operationalData = useMemo(() => ({
    projects,
    expenses,
    materials,
    schedule,
    purchaseOrders,
    materialRequests,
    suppliers,
    employees,
    metrics
  }), [projects, expenses, materials, schedule, purchaseOrders, materialRequests, suppliers, employees, metrics]);

  // Exclusividad estricta para Administrador (Requerimiento 12)
  if (!isAIAssistantModalOpen || (currentUser?.rol !== 'Administrador' && currentUser?.rol !== 'Administrador General')) {
    return null;
  }

  // Preguntas sugeridas de operación corporativa (Requerimiento 3)
  const suggestedQueries = [
    '¿Cuál proyecto presenta mayor riesgo?',
    '¿Qué obras están atrasadas?',
    '¿Dónde se está gastando más de lo presupuestado?',
    '¿Qué materiales presentan riesgo de abastecimiento?',
    '¿Qué proyecto necesita atención prioritaria?',
    '¿Cómo ha cambiado el presupuesto?',
    '¿Qué pasaría si aumentan los gastos 10%?'
  ];

  const handleExecuteAnalysis = async (customQuery = null) => {
    const textQuery = (customQuery || promptText).trim();
    if (!textQuery) {
      showAlert('Por favor ingresa una pregunta para procesar.', 'error');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setResponseResult('');

    if (isReadingVoice) {
      accessibilityService.stop();
      setIsReadingVoice(false);
    }

    try {
      const res = await aiService.analyzeProject({
        project: selectedProject,
        data: operationalData,
        question: textQuery
      });

      if (res && res.ok) {
        setResponseResult(res.text);
        setEngineType(res.engineType);
        setProviderName(res.provider);
      } else {
        setErrorMessage(res?.error || 'No fue posible obtener una respuesta de IA en este momento.');
      }
    } catch (err) {
      setErrorMessage('No fue posible obtener una respuesta de IA en este momento.');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="modal-overlay" onClick={closeAIAssistantModal}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Cabecera */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem', margin: 0 }}>
                Asistente de Inteligencia Artificial para Dirección
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Consultas operativas en tiempo real alimentadas con datos certificados de CONSTRUCTA
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={closeAIAssistantModal} title="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Asistente */}
        <div className="modal-body" style={{ flex: 1, padding: '1.4rem', overflowY: 'auto' }}>
          {/* Selector de Obra / Contexto Dinámico */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="var(--color-gold)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Contexto de Obra Seleccionado:
                </span>
              </div>

              <select
                className="constructa-input"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setResponseResult('');
                  setErrorMessage('');
                }}
                style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '260px', maxWidth: '380px' }}
              >
                <option value="">🌐 Toda la Cartera (Consultas Globales)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo ? `[${p.codigo}] ` : ''}{p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Aviso transparente de estado de backend */}
            <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>
                Motor activo en servidor: <strong>{serverStatus.configured ? 'Google Gemini 1.5 Flash (Conectado)' : 'Motor Analítico Local CONSTRUCTA (Fallback Hechos Reales)'}</strong>
              </span>
              <span className={`badge ${serverStatus.configured ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                {serverStatus.configured ? '✓ Gemini Online' : '⚡ Modo Hechos Operativos'}
              </span>
            </div>
          </div>

          {/* Chips de Preguntas Frecuentes de Dirección */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
              Preguntas de Dirección Rápida:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {suggestedQueries.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(q);
                    handleExecuteAnalysis(q);
                  }}
                  disabled={isLoading}
                  style={{
                    fontSize: '0.76rem',
                    padding: '5px 10px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
                    e.currentTarget.style.borderColor = 'var(--color-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }}
                >
                  💡 {q}
                </button>
              ))}
            </div>
          </div>

          {/* Área de Texto de la Pregunta */}
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
              Pregunta Libre sobre {selectedProject ? `la obra [${selectedProject.nombre}]` : 'la Operación de CONSTRUCTA'}
            </label>
            <textarea
              className="constructa-input"
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Escribe tu consulta analítica (ej. ¿Qué pasaría si el gasto aumenta 10%? o ¿Qué materiales presentan riesgo de desabastecimiento?)..."
              style={{ lineHeight: 1.45 }}
            />
          </div>

          {/* Botón de Ejecución */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
            <button
              type="button"
              onClick={() => handleExecuteAnalysis()}
              disabled={isLoading || !promptText.trim()}
              className="btn btn-primary"
              style={{ minWidth: '170px' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="spin-animation" /> Analizando Datos...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Consultar a la IA
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
                {isReadingVoice ? 'Detener Voz' : '🔊 Leer resultado'}
              </button>
            )}
          </div>

          {/* Mensajes de Error con Reintentar */}
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
                  onClick={() => handleExecuteAnalysis()}
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

          {/* Resultado Generado con Texting */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <Sparkles size={16} color="var(--color-gold)" />
                  Dictamen Analítico {selectedProject ? `— [${selectedProject.nombre}]` : '— Cartera Corporativa'}
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: engineType === 'AI_REAL' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: engineType === 'AI_REAL' ? '#38bdf8' : 'var(--color-gold)',
                    border: `1px solid ${engineType === 'AI_REAL' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}
                >
                  {engineType === 'AI_REAL' ? '✓ Google Gemini (IA Real)' : '⚡ Motor Analítico CONSTRUCTA (Fallback Hechos Reales)'}
                </span>
              </div>

              <div style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                <Texting
                  text={responseResult}
                  speed={15}
                  cursor={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Exclusivo para: <strong>Dirección General (Administrador)</strong>
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
