import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  PieChart, 
  Building2, 
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export default function Budgets() {
  const { data, metrics } = useConstructa();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Breakdown per project with spent, available and category distribution
  const projectBudgets = useMemo(() => {
    return data.projects.map(prj => {
      const prjExpenses = data.expenses.filter(e => e.proyectoId === prj.id);
      const gastado = prjExpenses.reduce((acc, curr) => acc + Number(curr.monto), 0);
      const presupuesto = Number(prj.presupuesto) || 0;
      const disponible = presupuesto - gastado;
      const porcentaje = presupuesto > 0 ? Math.min(100, Math.round((gastado / presupuesto) * 100)) : 0;
      const isOverBudget = gastado > presupuesto;

      // Group expenses by category
      const categoriesMap = {};
      prjExpenses.forEach(exp => {
        categoriesMap[exp.categoria] = (categoriesMap[exp.categoria] || 0) + Number(exp.monto);
      });

      return {
        ...prj,
        gastado,
        disponible,
        porcentaje,
        isOverBudget,
        categoriesBreakdown: categoriesMap,
        expensesCount: prjExpenses.length
      };
    });
  }, [data.projects, data.expenses]);

  const filteredProjects = useMemo(() => {
    return projectBudgets.filter(prj => {
      const matchesSearch = 
        prj.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prj.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prj.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'ALL' || prj.estado === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [projectBudgets, searchTerm, selectedStatus]);

  const globalTotalBudget = metrics.totalBudget;
  const globalTotalSpent = metrics.totalSpent;
  const globalAvailable = metrics.availableBudget;
  const globalPercentage = metrics.budgetUsagePercent;

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Gestión de Presupuestos</h1>
          <p className="constructa-page-subtitle">
            Supervisión financiera integral de proyectos, fondos asignados, ejecución de partidas y balance disponible en tiempo real.
          </p>
        </div>
      </div>

      {/* Global Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Presupuesto Global Aprobado</span>
            <Wallet size={18} style={{ color: 'var(--color-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            ${globalTotalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {data.projects.length} obras financiadas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Gastos Acumulados Ejecutados</span>
            <TrendingUp size={18} style={{ color: 'var(--color-rose)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '8px' }}>
            ${globalTotalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {data.expenses.length} facturas y comprobantes
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Fondo Disponible Restante</span>
            <ShieldCheck size={18} style={{ color: 'var(--color-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: globalAvailable < 0 ? 'var(--color-rose)' : 'var(--color-emerald)', marginTop: '8px' }}>
            ${globalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '4px' }}>
            Liquidez para continuación
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Tasa Global de Utilización</span>
            <PieChart size={18} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '8px' }}>
            {globalPercentage}%
          </div>
          <div style={{ marginTop: '8px' }}>
            <ProgressBar value={globalPercentage} showLabel={false} height={6} />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <SearchInput
            placeholder="Buscar por proyecto o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="constructa-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Todos los Estados de Obra</option>
            <option value="En construcción">En construcción</option>
            <option value="Planificación">Planificación</option>
            <option value="Pausado">Pausado</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      {/* Project Budgets List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="Sin resultados de presupuesto"
          description="No se encontraron proyectos que coincidan con la búsqueda o filtro aplicado."
          actionText="Limpiar filtros"
          onAction={() => {
            setSearchTerm('');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredProjects.map(prj => {
            const isCritical = prj.porcentaje >= 90;
            const isWarning = prj.porcentaje >= 75 && prj.porcentaje < 90;

            return (
              <div 
                key={prj.id} 
                className="constructa-card" 
                style={{ 
                  padding: '24px',
                  border: prj.isOverBudget 
                    ? '1px solid rgba(239, 68, 68, 0.4)' 
                    : isCritical 
                    ? '1px solid rgba(245, 158, 11, 0.4)' 
                    : '1px solid var(--color-border)'
                }}
              >
                {/* Title & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600 }}>{prj.codigo}</span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {prj.nombre}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Cliente: {prj.cliente} • Responsable: {prj.responsable}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {prj.isOverBudget && (
                      <span style={{ 
                        background: 'rgba(239, 68, 68, 0.15)', 
                        color: 'var(--color-rose)', 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <AlertTriangle size={13} /> Sobrepresupuesto
                      </span>
                    )}
                    <Badge variant={prj.estado === 'Finalizado' ? 'success' : prj.estado === 'En construcción' ? 'primary' : 'warning'}>
                      {prj.estado}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Porcentaje de Presupuesto Consumido</span>
                    <strong style={{ color: prj.isOverBudget ? 'var(--color-rose)' : isCritical ? 'var(--color-amber)' : 'var(--color-emerald)' }}>
                      {prj.porcentaje}%
                    </strong>
                  </div>
                  <ProgressBar 
                    value={prj.porcentaje} 
                    showLabel={false} 
                    height={10}
                    variant={prj.isOverBudget ? 'danger' : isCritical ? 'warning' : 'primary'}
                  />
                </div>

                {/* Financial 3-column stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  background: 'var(--color-bg-page)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Presupuesto Autorizado</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                      ${Number(prj.presupuesto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Monto Ejecutado (Gastado)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '4px' }}>
                      ${prj.gastado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Balance Disponible</div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      color: prj.disponible < 0 ? 'var(--color-rose)' : 'var(--color-emerald)', 
                      marginTop: '4px' 
                    }}>
                      ${prj.disponible.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Category spending tags */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    Distribución de gastos asociados ({prj.expensesCount} transacciones):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.keys(prj.categoriesBreakdown).length > 0 ? (
                      Object.entries(prj.categoriesBreakdown).map(([cat, amount]) => (
                        <div key={cat} style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--color-border)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{cat}:</span>
                          <strong style={{ color: 'var(--color-gold)' }}>
                            ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Sin gastos imputados aún en este proyecto.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
