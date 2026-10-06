import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  ArrowLeft,
  Sparkles,
  BarChart2
} from 'lucide-react';

export const FutureProjection = ({ onNavigate }) => {
  const {
    projects = [],
    expenses = [],
    materials = [],
    schedule = [],
    metrics = {},
    currentUser,
    formatCurrency,
    formatNumber,
    navigateTo,
    setActiveView
  } = useConstructa();

  const navigate = onNavigate || navigateTo || setActiveView;

  const [loading, setLoading] = useState(false);
  const [projection, setProjection] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchProjection = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeOperationalData({
        projects,
        expenses,
        materials,
        schedule,
        metrics
      });

      if (result && result.ok) {
        setProjection(result);
        setLastUpdated(new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setError(result?.error || 'No fue posible generar la proyección analítica en este momento.');
      }
    } catch (err) {
      setError('Ocurrió una interrupción al calcular la proyección. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjection();
  }, [projects.length, expenses.length, materials.length]);

  // Cálculos en tiempo real basados 100% en datos reales de CONSTRUCTA
  const totalBudget = projects.reduce((acc, p) => acc + Number(p.presupuesto || 0), 0);
  const totalSpent = expenses.reduce((acc, e) => acc + Number(e.monto || 0), 0);
  const consumptionRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;
  const avgProgress = projects.length > 0 ? (projects.reduce((acc, p) => acc + Number(p.avance || 0), 0) / projects.length).toFixed(1) : 0;
  const overBudgetCount = projects.filter((p) => {
    const pSpent = expenses.filter((e) => e.proyectoId === p.id).reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    return p.presupuesto > 0 && pSpent > p.presupuesto * 0.9;
  }).length;
  const lowStockCount = materials.filter((m) => Number(m.stockActual ?? m.stock ?? 0) <= Number(m.stockMinimo ?? 0)).length;

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <Sparkles size={14} /> MÓDULO EXCLUSIVO DE DIRECCIÓN GENERAL
          </div>
          <h1 className="constructa-page-title">Proyección al Futuro & Análisis Predictivo</h1>
          <p className="constructa-page-subtitle">
            Análisis predictivo de desviaciones presupuestarias, curva de consumo, riesgos de cronograma y proyecciones de obra.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Actualizado: {lastUpdated}
            </span>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate('dashboard')}
            icon={<ArrowLeft size={16} />}
          >
            Volver al Dashboard
          </Button>
          <Button
            variant="primary"
            onClick={fetchProjection}
            disabled={loading}
            icon={<RefreshCw size={16} className={loading ? 'spin-animation' : ''} />}
          >
            {loading ? 'Calculando...' : 'Recalcular Proyección'}
          </Button>
        </div>
      </div>

      {/* Tarjetas de Hechos Operativos Clave */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color="var(--color-gold)" /> Fondo Global Autorizado
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            ${formatNumber ? formatNumber(totalBudget) : totalBudget.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {projects.length} obras registradas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="#38bdf8" /> Gasto Acumulado en Obra
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
            ${formatNumber ? formatNumber(totalSpent) : totalSpent.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: Number(consumptionRate) > 85 ? 'var(--color-danger)' : 'var(--color-emerald)', marginTop: '2px', fontWeight: 600 }}>
            {consumptionRate}% de consumo financiero
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HardHat size={14} color="var(--color-emerald)" /> Avance Físico Ponderado
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {avgProgress}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Ritmo promedio de obra
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color={overBudgetCount > 0 ? '#f87171' : 'var(--color-emerald)'} /> Obras en Riesgo Presupuestal
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: overBudgetCount > 0 ? '#f87171' : 'var(--color-emerald)', marginTop: '4px' }}>
            {overBudgetCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {overBudgetCount > 0 ? 'Superan 90% del presupuesto' : 'Márgenes financieros saludables'}
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={14} color={lowStockCount > 0 ? 'var(--color-amber)' : 'var(--color-emerald)'} /> Alertas de Abastecimiento
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: lowStockCount > 0 ? 'var(--color-amber)' : 'var(--color-emerald)', marginTop: '4px' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {lowStockCount > 0 ? 'Materiales en o bajo stock mínimo' : 'Stock en niveles óptimos'}
          </div>
        </div>
      </div>

      {/* Contenido Principal de la Proyección */}
      <div className="constructa-card" style={{ padding: '24px', position: 'relative' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <RefreshCw size={36} className="spin-animation" style={{ color: 'var(--color-gold)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Analizando Métricas y Proyectando Escenarios...</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
              Consolidando partidas presupuestales, facturación de materiales, curvas de avance y pronóstico de cierres de obra.
            </p>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <AlertTriangle size={36} style={{ color: 'var(--color-danger)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>No se pudo completar el análisis automático</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{error}</p>
            <Button variant="primary" onClick={fetchProjection}>
              Reintentar Análisis
            </Button>
          </div>
        )}

        {!loading && !error && projection && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold)' }}>
                  Dictamen Ejecutivo de Dirección
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                  Informe de Tendencias y Proyección Financiera
                </h2>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)'
                }}
              >
                {projection.provider || 'Motor Analítico CONSTRUCTA'}
              </span>
            </div>

            <div
              style={{
                fontSize: '0.9rem',
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
                <strong>Aviso de Confidencialidad y Estimación:</strong> Las proyecciones presentadas constituyen estimaciones analíticas fundamentadas en los registros de avance, presupuestos y compras de CONSTRUCTA. No representan compromisos contractuales absolutos y deben validarse con la Dirección de Obra.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureProjection;
