import React from 'react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import { BarChart3, PieChart, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

export const DashboardCharts = () => {
  const { metrics, projects, expenses, formatCurrency, formatNumber } = useConstructa();

  // 1. Datos para Gastos por Categoría
  const categoryColors = {
    Materiales: '#f59e0b',
    'Mano de obra': '#38bdf8',
    Transporte: '#10b981',
    Herramientas: '#a855f7',
    Servicios: '#ec4899',
    Otros: '#94a3b8',
  };

  const totalSpent = metrics?.totalSpent || 1;
  const categoriesData = Object.entries(metrics?.expensesByCategory || {}).map(
    ([category, amount]) => {
      const percentage = Math.round((amount / totalSpent) * 100);
      return {
        category,
        amount,
        percentage,
        color: categoryColors[category] || '#94a3b8',
      };
    }
  );

  // 2. Datos para Gastos por Proyecto
  const projectsBudgetList = (metrics?.expensesByProject || []).sort(
    (a, b) => b.gastado - a.gastado
  );

  // 3. Evolución mensual de gastos
  const monthlyExpenses = {};
  expenses.forEach((g) => {
    const monthKey = g.fecha ? g.fecha.substring(0, 7) : '2025-01';
    monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + (Number(g.monto) || 0);
  });
  const sortedMonths = Object.keys(monthlyExpenses).sort();
  const maxMonthExpense = Math.max(...Object.values(monthlyExpenses), 1);

  // Formatear etiquetas de mes
  const formatMonthLabel = (mKey) => {
    const [y, m] = mKey.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const idx = parseInt(m, 10) - 1;
    return `${months[idx] || m} ${y ? y.slice(2) : ''}`;
  };

  return (
    <div className="dashboard-charts-container">
      {/* SECCIÓN 1: Presupuesto vs Gastos & Categorías */}
      <div className="charts-grid-2">
        {/* Presupuesto Global vs Gastos */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieChart size={18} style={{ color: 'var(--accent-amber)' }} />
                Presupuesto vs Gastos
              </h3>
              <p className="card-desc">Ejecución financiera sobre el total de obras autorizadas</p>
            </div>
            <span className="badge badge-warning" style={{ fontSize: '0.82rem' }}>
              {metrics?.budgetUtilization}% ejecutado
            </span>
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            {/* Barra segmentada */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  height: '24px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  overflow: 'hidden',
                  background: '#192233',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, metrics?.budgetUtilization || 0)}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    transition: 'width 0.6s ease',
                  }}
                  title={`Gastado: ${formatCurrency(metrics?.totalSpent)}`}
                />
                <div
                  style={{
                    width: `${Math.max(0, 100 - (metrics?.budgetUtilization || 0))}%`,
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    transition: 'width 0.6s ease',
                  }}
                  title={`Disponible: ${formatCurrency(metrics?.availableBudget)}`}
                />
              </div>
            </div>

            {/* Desglose de importes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: '#0e1420', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Presupuesto Total
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {formatCurrency(metrics?.totalBudget)}
                </div>
              </div>

              <div style={{ background: '#0e1420', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Gastado
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
                  {formatCurrency(metrics?.totalSpent)}
                </div>
              </div>

              <div style={{ background: '#0e1420', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Saldo Disponible
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                  {formatCurrency(metrics?.availableBudget)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gastos por Categoría */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart3 size={18} style={{ color: 'var(--accent-blue)' }} />
                Gastos por Categoría
              </h3>
              <p className="card-desc">Distribución de egresos según rubro operativo de construcción</p>
            </div>
          </div>

          <div className="custom-chart-wrapper">
            {categoriesData.map((item) => (
              <div key={item.category} className="bar-chart-row">
                <div className="bar-chart-labels">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span className="bar-chart-name">{item.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="bar-chart-value">{formatCurrency(item.amount)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="bar-chart-track">
                  <div
                    className="bar-chart-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Evolución Mensual y Gastos por Proyecto */}
      <div className="charts-grid-2">
        {/* Evolución Mensual de Gastos */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--accent-green)' }} />
                Evolución Histórica de Gastos
              </h3>
              <p className="card-desc">Historial mensual de asignación de capital a obras</p>
            </div>
          </div>

          <div style={{ padding: '1rem 0 0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '180px',
                gap: '0.5rem',
                borderBottom: '1px solid var(--border-medium)',
                paddingBottom: '0.5rem',
              }}
            >
              {sortedMonths.map((mKey) => {
                const amount = monthlyExpenses[mKey];
                const heightPercent = Math.max(12, Math.round((amount / maxMonthExpense) * 100));

                return (
                  <div
                    key={mKey}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                    title={`${formatMonthLabel(mKey)}: ${formatCurrency(amount)}`}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '36px',
                        height: `${heightPercent}%`,
                        background: 'linear-gradient(180deg, #38bdf8 0%, #0369a1 100%)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {formatMonthLabel(mKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ejecución Presupuestaria por Proyecto */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Layers size={18} style={{ color: '#a855f7' }} />
                Presupuesto vs Gasto por Proyecto
              </h3>
              <p className="card-desc">Porcentaje de fondos consumidos por cada obra</p>
            </div>
          </div>

          <div className="custom-chart-wrapper">
            {projectsBudgetList.map((p) => {
              const spentPercent = p.porcentaje;
              let barColor = '#10b981';
              if (spentPercent > 85) barColor = '#ef4444';
              else if (spentPercent > 60) barColor = '#f59e0b';

              return (
                <div key={p.proyectoId} className="bar-chart-row" style={{ marginBottom: '1.1rem' }}>
                  <div className="bar-chart-labels">
                    <span className="bar-chart-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.proyectoNombre}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {formatCurrency(p.gastado)} / {formatCurrency(p.presupuesto)}
                      </span>
                      <span style={{ fontWeight: 700, color: barColor }}>
                        {spentPercent}%
                      </span>
                    </div>
                  </div>
                  <div className="bar-chart-track">
                    <div
                      className="bar-chart-fill"
                      style={{
                        width: `${Math.min(100, spentPercent)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
