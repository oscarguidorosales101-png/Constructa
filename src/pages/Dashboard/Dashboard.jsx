import React from 'react';
import {
  HardHat,
  CheckCircle2,
  Users,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Wallet,
  Clock,
  ArrowRight,
  PlusCircle,
  Receipt,
  Truck,
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import DashboardCharts from '../../components/dashboard/DashboardCharts.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';

export const Dashboard = ({ onNavigate }) => {
  const { metrics, history, materials, projects, formatCurrency, formatNumber } = useConstructa();

  // Materiales en stock crítico
  const lowStockItems = materials.filter(
    (m) => Number(m.stockActual) <= Number(m.stockMinimo)
  );

  return (
    <div className="dashboard-page">
      {/* Alerta si existen materiales en stock crítico */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                Atención requerida en almacén: {lowStockItems.length} materiales con stock bajo
              </strong>
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', margin: 0 }}>
                {lowStockItems.map((m) => m.nombre).slice(0, 3).join(', ')}
                {lowStockItems.length > 3 ? ` y ${lowStockItems.length - 3} más...` : '.'}
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onNavigate('materiales')}
            icon={ArrowRight}
          >
            Revisar Inventario
          </Button>
        </div>
      )}

      {/* KPI GRID DE 8 TARJETAS DINÁMICAS (Requerimiento Prompt #13) */}
      <div className="kpi-grid">
        {/* 1. Proyectos activos */}
        <div className="kpi-card" onClick={() => onNavigate('proyectos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Proyectos Activos</span>
            <div className="kpi-icon-box amber">
              <HardHat size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.activeProjects || 0}</div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-amber)' }}>En ejecución activa</span>
            </div>
          </div>
        </div>

        {/* 2. Proyectos finalizados */}
        <div className="kpi-card" onClick={() => onNavigate('proyectos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Proyectos Finalizados</span>
            <div className="kpi-icon-box green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.completedProjects || 0}</div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-green)' }}>Entregados satisfactoriamente</span>
            </div>
          </div>
        </div>

        {/* 3. Total de empleados */}
        <div className="kpi-card" onClick={() => onNavigate('empleados')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Total de Personal</span>
            <div className="kpi-icon-box blue">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.totalEmployees || 0}</div>
            <div className="kpi-subtext">
              <span>{metrics?.activeEmployees || 0} operativos en campo</span>
            </div>
          </div>
        </div>

        {/* 4. Materiales registrados */}
        <div className="kpi-card" onClick={() => onNavigate('materiales')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Materiales Registrados</span>
            <div className="kpi-icon-box blue">
              <Package size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.totalMaterials || 0}</div>
            <div className="kpi-subtext">
              <span>Catálogo completo con imagen</span>
            </div>
          </div>
        </div>

        {/* 5. Materiales con stock bajo */}
        <div className="kpi-card" onClick={() => onNavigate('materiales')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Stock Bajo</span>
            <div className="kpi-icon-box red">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ color: metrics?.lowStockCount > 0 ? '#f87171' : 'inherit' }}>
              {metrics?.lowStockCount || 0}
            </div>
            <div className="kpi-subtext">
              <span style={{ color: metrics?.lowStockCount > 0 ? '#f87171' : 'var(--text-muted)' }}>
                {metrics?.lowStockCount > 0 ? 'Requieren reposición inmediata' : 'Existencias estables'}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Presupuesto total */}
        <div className="kpi-card" onClick={() => onNavigate('presupuestos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Presupuesto Total</span>
            <div className="kpi-icon-box amber">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.45rem' }}>
              {formatCurrency(metrics?.totalBudget)}
            </div>
            <div className="kpi-subtext">
              <span>Total acumulado de obras</span>
            </div>
          </div>
        </div>

        {/* 7. Gastos acumulados */}
        <div className="kpi-card" onClick={() => onNavigate('gastos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Gastos Acumulados</span>
            <div className="kpi-icon-box amber">
              <TrendingDown size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#fbbf24' }}>
              {formatCurrency(metrics?.totalSpent)}
            </div>
            <div className="kpi-subtext">
              <span>{metrics?.budgetUtilization}% del presupuesto utilizado</span>
            </div>
          </div>
        </div>

        {/* 8. Presupuesto disponible */}
        <div className="kpi-card" onClick={() => onNavigate('presupuestos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Presupuesto Disponible</span>
            <div className="kpi-icon-box green">
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#34d399' }}>
              {formatCurrency(metrics?.availableBudget)}
            </div>
            <div className="kpi-subtext">
              <span style={{ color: 'var(--accent-green)' }}>Saldo libre para ejecución</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS EMPRESARIALES */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)',
        }}
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '0.5rem' }}>
          Accesos Rápidos:
        </span>
        <Button variant="secondary" size="sm" icon={HardHat} onClick={() => onNavigate('proyectos')}>
          Explorar Proyectos
        </Button>
        <Button variant="secondary" size="sm" icon={Receipt} onClick={() => onNavigate('gastos')}>
          Registrar Gasto
        </Button>
        <Button variant="secondary" size="sm" icon={Package} onClick={() => onNavigate('materiales')}>
          Gestionar Materiales
        </Button>
        <Button variant="secondary" size="sm" icon={Users} onClick={() => onNavigate('empleados')}>
          Ver Horarios de Personal
        </Button>
      </div>

      {/* GRÁFICOS DINÁMICOS CONECTADOS */}
      <DashboardCharts />

      {/* HISTORIAL RECIENTE Y ACTIVIDAD EN VIVO */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Clock size={18} style={{ color: 'var(--accent-amber)' }} />
              Historial de Movimientos Recientes
            </h3>
            <p className="card-desc">Registro cronológico de operaciones operativas, financieras y de personal</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('reportes')}>
            Ver Reporte Completo
          </Button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tipo de Evento</th>
                <th>Descripción</th>
                <th>Proyecto Relacionado</th>
                <th style={{ textAlign: 'right' }}>Monto Asociado</th>
              </tr>
            </thead>
            <tbody>
              {history && history.length > 0 ? (
                history.slice(0, 7).map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {item.fecha}
                    </td>
                    <td>
                      <Badge
                        variant={
                          item.tipo.includes('Gasto')
                            ? 'warning'
                            : item.tipo.includes('Avance')
                            ? 'success'
                            : item.tipo.includes('Material')
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {item.tipo}
                      </Badge>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.descripcion}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.proyectoRelacionado}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: item.monto ? '#fbbf24' : 'var(--text-muted)' }}>
                      {item.monto ? formatCurrency(item.monto) : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay movimientos registrados en el historial reciente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
