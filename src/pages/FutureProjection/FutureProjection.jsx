import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import { aiService } from '../../services/aiService.js';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  HardHat,
  Package,
  Calendar,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Send,
  MessageSquare,
  Building2,
  Clock,
  Trash2,
  Bot,
  User,
  HelpCircle
} from 'lucide-react';

export const FutureProjection = ({ onNavigate, embedded = false }) => {
  const {
    projects = [],
    expenses = [],
    materials = [],
    schedule = [],
    purchaseOrders = [],
    materialRequests = [],
    suppliers = [],
    employees = [],
    metrics = {},
    currentUser,
    formatCurrency,
    formatNumber,
    navigateTo,
    setActiveView
  } = useConstructa();

  const navigate = onNavigate || navigateTo || setActiveView;

  // Estado del selector de obra (vacío "" = Consolidado General)
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Estados de IA para la proyección principal
  const [loading, setLoading] = useState(false);
  const [projection, setProjection] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [aiStatus, setAiStatus] = useState('Verificando...');

  // Estados de conversación interactiva sobre la obra seleccionada
  const [conversationHistory, setConversationHistory] = useState([]);
  const [questionInput, setQuestionInput] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Verificar estado de conexión de IA y n8n al montar
  useEffect(() => {
    aiService.checkServerStatus().then((res) => {
      if (res && res.n8nConnected) {
        setAiStatus('IA CONECTADA');
      } else if (res && res.configured) {
        setAiStatus('IA CONECTADA');
      } else {
        setAiStatus('IA NO DISPONIBLE');
      }
    }).catch(() => {
      setAiStatus('IA NO DISPONIBLE');
    });
  }, []);

  // Proyecto activo seleccionado
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => String(p.id) === String(selectedProjectId)) || null;
  }, [projects, selectedProjectId]);

  // Consolidación de datos operativos para alimentar el motor de IA
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

  // Ejecución de la Proyección Principal (Obra individual o Cartera completa)
  const fetchProjection = useCallback(async (projectTarget = selectedProject) => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeProject({
        project: projectTarget,
        data: operationalData
      });

      if (result && result.ok) {
        setProjection(result);
        setLastUpdated(new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setError(result?.error || 'No fue posible obtener una respuesta de IA en este momento.');
      }
    } catch (err) {
      setError('No fue posible obtener una respuesta de IA en este momento.');
    } finally {
      setLoading(false);
    }
  }, [selectedProject, operationalData]);

  // Cambio de obra: Reset de memoria conversacional y ejecución inmediata de nueva consulta
  const handleProjectChange = (e) => {
    const newProjectId = e.target.value;
    setSelectedProjectId(newProjectId);

    // Limpiar memoria al cambiar de obra para evitar contaminación
    setConversationHistory([]);
    setQuestionInput('');
    setChatError(null);

    const newProject = newProjectId ? projects.find((p) => String(p.id) === String(newProjectId)) : null;
    fetchProjection(newProject);
  };

  // Cargar proyección inicial al montar o cuando se actualicen los proyectos
  useEffect(() => {
    fetchProjection(selectedProject);
  }, [selectedProjectId, projects.length, expenses.length, schedule.length]);

  // Enviar pregunta interactiva libre conectada directamente a N8N
  const handleAskQuestion = async (predefinedQuestion = null) => {
    const query = (predefinedQuestion || questionInput).trim();
    if (!query || askingQuestion) return;

    setAskingQuestion(true);
    setChatError(null);

    const userMessage = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...conversationHistory, userMessage];
    setConversationHistory(updatedHistory);
    setQuestionInput('');

    try {
      const result = await aiService.askAiOperation({
        question: query,
        role: currentUser?.rol || 'Administrador',
        project: selectedProject,
        data: operationalData
      });

      if (result && (result.ok || result.success)) {
        // Conexión dinámica: si la pregunta mencionó una obra existente, seleccionarla automáticamente
        if (result.targetProject && String(result.targetProject.id) !== String(selectedProjectId)) {
          setSelectedProjectId(String(result.targetProject.id));
        }

        const aiMessage = {
          role: 'assistant',
          text: result.answer || result.text,
          provider: 'n8n (Gemini AI Real)',
          engineType: 'AI_REAL',
          isRealGemini: true,
          analysisType: result.analysisType,
          risks: result.risks || [],
          recommendations: result.recommendations || [],
          timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
        };
        setConversationHistory([...updatedHistory, aiMessage]);
        setAiStatus('IA CONECTADA');
      } else {
        setChatError(result?.error || 'N8N no responde en http://localhost:5678/webhook/constructa-ai.');
        setAiStatus('IA NO DISPONIBLE');
      }
    } catch (err) {
      setChatError('N8N no responde en http://localhost:5678/webhook/constructa-ai.');
      setAiStatus('IA NO DISPONIBLE');
    } finally {
      setAskingQuestion(false);
    }
  };

  // Verificación estricta de rol (Requerimiento 12: Exclusivo para Administrador)
  if (currentUser && currentUser.rol !== 'Administrador' && currentUser.rol !== 'Administrador General') {
    return (
      <div className="constructa-page">
        <div className="constructa-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <ShieldAlert size={48} style={{ color: 'var(--color-danger)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Acceso Restringido a Dirección General</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
            El módulo de Inteligencia Artificial y Proyección al Futuro está reservado exclusivamente para el Administrador de CONSTRUCTA.
          </p>
          <Button variant="primary" onClick={() => navigate(currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard')}>
            Volver a la Zona Autorizada
          </Button>
        </div>
      </div>
    );
  }

  // Métricas dinámicas calculadas 100% sobre la obra seleccionada o la cartera
  let budgetDisplay = 0;
  let spentDisplay = 0;
  let progressDisplay = 0;
  let balanceDisplay = 0;
  let consumptionRate = 0;
  let delayedStagesCount = 0;
  let pendingOrdersCount = 0;

  if (selectedProject) {
    const pId = selectedProject.id;
    budgetDisplay = Number(selectedProject.presupuesto || 0);
    const pExpenses = expenses.filter((e) => String(e.proyectoId) === String(pId));
    spentDisplay = pExpenses.reduce((sum, e) => sum + Number(e.monto || 0), 0);
    balanceDisplay = budgetDisplay - spentDisplay;
    consumptionRate = budgetDisplay > 0 ? ((spentDisplay / budgetDisplay) * 100).toFixed(1) : 0;
    progressDisplay = Number(selectedProject.avance ?? selectedProject.progreso ?? 0);

    const pSchedule = schedule.filter((s) => String(s.proyectoId) === String(pId));
    delayedStagesCount = pSchedule.filter((s) => s.estado === 'Retrasada').length;

    const pOrders = purchaseOrders.filter((o) => String(o.proyectoId) === String(pId));
    pendingOrdersCount = pOrders.filter((o) => o.estado !== 'Entregada' && o.estado !== 'Cancelada').length;
  } else {
    budgetDisplay = projects.reduce((acc, p) => acc + Number(p.presupuesto || 0), 0);
    spentDisplay = expenses.reduce((acc, e) => acc + Number(e.monto || 0), 0);
    balanceDisplay = budgetDisplay - spentDisplay;
    consumptionRate = budgetDisplay > 0 ? ((spentDisplay / budgetDisplay) * 100).toFixed(1) : 0;
    progressDisplay = projects.length > 0 ? (projects.reduce((acc, p) => acc + Number(p.avance || 0), 0) / projects.length).toFixed(1) : 0;
    delayedStagesCount = schedule.filter((s) => s.estado === 'Retrasada').length;
    pendingOrdersCount = purchaseOrders.filter((o) => o.estado !== 'Entregada' && o.estado !== 'Cancelada').length;
  }

  // Chips sugeridos de preguntas
  const suggestedQuestions = [
    '¿Qué riesgos tiene actualmente?',
    '¿Está dentro del presupuesto?',
    '¿Qué podría retrasarla?',
    '¿Qué debería revisar primero?',
    '¿Qué pasa si el gasto aumenta 10%?',
    '¿Qué materiales pueden convertirse en un problema?'
  ];

  return (
    <div className={embedded ? "constructa-future-projection-embedded" : "constructa-page"}>
      {/* Header */}
      <div className="constructa-page-header" style={embedded ? { marginTop: '1rem', paddingBottom: '1rem' } : {}}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Sparkles size={14} /> PROYECCIÓN AL FUTURO
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: aiStatus === 'IA CONECTADA' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: aiStatus === 'IA CONECTADA' ? 'var(--status-success, #10b981)' : 'var(--status-danger, #ef4444)',
              border: `1px solid ${aiStatus === 'IA CONECTADA' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
            }}>
              {aiStatus === 'IA CONECTADA' ? '✓ ' : '× '} {aiStatus}
            </span>
          </div>
          <h2 className="constructa-page-title" style={{ fontSize: embedded ? '1.5rem' : '1.85rem' }}>Proyección al Futuro & Asistente de Operación</h2>
          <p className="constructa-page-subtitle">
            Análisis predictivo de desviaciones presupuestarias, cronogramas y consultas de operación con IA real vía N8N.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Actualizado: {lastUpdated}
            </span>
          )}
          {!embedded && (
            <Button
              variant="secondary"
              onClick={() => navigate('dashboard')}
              icon={<ArrowLeft size={16} />}
            >
              Volver al Dashboard
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => fetchProjection(selectedProject)}
            disabled={loading}
            icon={<RefreshCw size={16} className={loading ? 'spin-animation' : ''} />}
          >
            {loading ? 'Calculando...' : 'Recalcular Proyección'}
          </Button>
        </div>
      </div>

      {/* Selector de Obra / Contexto Dinámico */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '20px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={22} style={{ color: 'var(--color-gold)' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Contexto Operativo de Análisis
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                {selectedProject ? `${selectedProject.codigo || ''} ${selectedProject.nombre}` : 'Consolidado General de Obras'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '280px', flex: '1', maxWidth: '480px' }}>
            <label htmlFor="select-obra" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              Seleccionar Obra:
            </label>
            <select
              id="select-obra"
              className="constructa-input"
              value={selectedProjectId}
              onChange={handleProjectChange}
              style={{ padding: '8px 12px', fontSize: '0.88rem' }}
            >
              <option value="">🌐 Consolidado General (Toda la Cartera)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo ? `[${p.codigo}] ` : ''}{p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas de Hechos Operativos Clave de la Obra o Cartera */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color="var(--color-gold)" /> Presupuesto Autorizado
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            ${formatNumber ? formatNumber(budgetDisplay) : budgetDisplay.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {selectedProject ? `Cliente: ${selectedProject.cliente || 'N/A'}` : `${projects.length} obras registradas`}
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="#38bdf8" /> Gasto Real Acumulado
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
            ${formatNumber ? formatNumber(spentDisplay) : spentDisplay.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: Number(consumptionRate) > 90 ? 'var(--color-danger)' : 'var(--color-emerald)', marginTop: '2px', fontWeight: 700 }}>
            {consumptionRate}% de consumo financiero
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HardHat size={14} color="var(--color-emerald)" /> Avance Físico Actual
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {progressDisplay}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {selectedProject ? `Estado: ${selectedProject.estado || 'En planeación'}` : 'Promedio ponderado'}
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color={balanceDisplay < 0 ? 'var(--color-danger)' : 'var(--color-emerald)'} /> Variación / Saldo Restante
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: balanceDisplay < 0 ? 'var(--color-danger)' : 'var(--color-emerald)', marginTop: '4px' }}>
            ${formatNumber ? formatNumber(balanceDisplay) : balanceDisplay.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {balanceDisplay < 0 ? 'Sobregiro presupuestario' : 'Margen financiero disponible'}
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color={delayedStagesCount > 0 ? 'var(--color-danger)' : 'var(--color-emerald)'} /> Etapas de Cronograma
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: delayedStagesCount > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)', marginTop: '4px' }}>
            {delayedStagesCount > 0 ? `${delayedStagesCount} retrasadas` : 'Al día'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {delayedStagesCount > 0 ? 'Atención urgente en fechas' : 'Hitos en curso normal'}
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={14} color={pendingOrdersCount > 0 ? 'var(--color-amber)' : 'var(--color-emerald)'} /> Pedidos en Tránsito
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: pendingOrdersCount > 0 ? 'var(--color-amber)' : 'var(--color-emerald)', marginTop: '4px' }}>
            {pendingOrdersCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {pendingOrdersCount > 0 ? 'Órdenes pendientes de recepción' : 'Sin compras en espera'}
          </div>
        </div>
      </div>

      {/* Dictamen Analítico de la Obra o Cartera */}
      <div className="constructa-card" style={{ padding: '24px', marginBottom: '24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <RefreshCw size={36} className="spin-animation" style={{ color: 'var(--color-gold)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Analizando Métricas y Proyectando Escenarios con IA...
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto' }}>
              Extrayendo partidas de gasto, avance certificado, compromisos de compra y contingencias de cronograma para {selectedProject ? selectedProject.nombre : 'toda la cartera'}.
            </p>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <AlertTriangle size={36} style={{ color: 'var(--color-danger)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>No fue posible obtener una respuesta de IA en este momento</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{error}</p>
            <Button variant="primary" onClick={() => fetchProjection(selectedProject)}>
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && projection && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold)' }}>
                  Dictamen Ejecutivo de Dirección
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                  Proyección al Futuro & Diagnóstico: {selectedProject ? selectedProject.nombre : 'Cartera Corporativa Global'}
                </h2>
              </div>

              {/* Distintivo estricto de motor: IA Real vs Fallback de Hechos */}
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: projection.engineType === 'AI_REAL' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                  color: projection.engineType === 'AI_REAL' ? '#38bdf8' : 'var(--color-gold)',
                  border: `1px solid ${projection.engineType === 'AI_REAL' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}
              >
                {projection.engineType === 'AI_REAL' ? (
                  <>
                    <Sparkles size={14} /> {projection.provider || 'Google Gemini 1.5 Flash (IA Real)'}
                  </>
                ) : (
                  <>
                    <Bot size={14} /> {projection.provider || 'Motor Analítico CONSTRUCTA (Fallback Hechos Operativos)'}
                  </>
                )}
              </span>
            </div>

            <div
              style={{
                fontSize: '0.92rem',
                lineHeight: 1.7,
                color: 'var(--color-text-primary)',
                whiteSpace: 'pre-line'
              }}
            >
              {projection.text}
            </div>

            <div
              style={{
                marginTop: '28px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)'
              }}
            >
              <ShieldAlert size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
              <span>
                <strong>Aviso de Confidencialidad y Estimación:</strong> Las proyecciones presentadas constituyen estimaciones analíticas fundamentadas estrictamente en los registros de avance, presupuestos y compras de CONSTRUCTA. No representan compromisos contractuales absolutos y deben validarse con la Dirección de Obra.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sección Interactiva: Pregúntale a la IA sobre esta obra */}
      <div className="constructa-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} style={{ color: 'var(--color-gold)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Pregúntale a la IA sobre {selectedProject ? selectedProject.nombre : 'la Cartera de Obras'}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Consultas libres con contexto dinámico y memoria conversacional de {selectedProject ? `la obra [${selectedProject.codigo || selectedProject.id}]` : 'todas las obras'}.
            </p>
          </div>

          {conversationHistory.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConversationHistory([])}
              icon={<Trash2 size={14} />}
            >
              Limpiar Conversación
            </Button>
          )}
        </div>

        {/* Chips de Preguntas Rápidas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskQuestion(q)}
              disabled={askingQuestion}
              style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
                e.currentTarget.style.borderColor = 'var(--color-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Historial de Conversación */}
        {conversationHistory.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
            {conversationHistory.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: isUser ? 'rgba(56, 189, 248, 0.12)' : 'var(--color-surface)',
                    border: `1px solid ${isUser ? 'rgba(56, 189, 248, 0.3)' : 'var(--color-border)'}`,
                    borderRadius: '10px',
                    padding: '12px 16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: isUser ? '#38bdf8' : 'var(--color-gold)' }}>
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                      {isUser ? 'Administrador' : msg.provider || 'IA CONSTRUCTA'}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-primary)', whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error en el chat interactivo */}
        {chatError && (
          <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{chatError}</span>
            <button
              type="button"
              onClick={() => handleAskQuestion()}
              style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Input de Pregunta */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input
            type="text"
            className="constructa-input"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Pregunta Libre sobre la Operación de CONSTRUCTA..."
            disabled={askingQuestion}
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem' }}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={askingQuestion || !questionInput.trim()}
            icon={askingQuestion ? <RefreshCw size={16} className="spin-animation" /> : <Send size={16} />}
          >
            {askingQuestion ? 'Analizando información...' : 'Preguntar a la IA'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FutureProjection;
