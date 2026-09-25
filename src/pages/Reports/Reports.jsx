import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Building2, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  History,
  Briefcase,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function Reports() {
  const { data, metrics } = useConstructa();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'projects' | 'expenses' | 'materials' | 'employees' | 'history'
  const [projectFilter, setProjectFilter] = useState('ALL');

  // Filtered data based on project
  const filteredProjects = useMemo(() => {
    if (projectFilter === 'ALL') return data.projects;
    return data.projects.filter(p => p.id === projectFilter);
  }, [data.projects, projectFilter]);

  const filteredExpenses = useMemo(() => {
    if (projectFilter === 'ALL') return data.expenses;
    return data.expenses.filter(e => e.proyectoId === projectFilter);
  }, [data.expenses, projectFilter]);

  const filteredEmployees = useMemo(() => {
    if (projectFilter === 'ALL') return data.employees;
    return data.employees.filter(e => e.proyectoId === projectFilter);
  }, [data.employees, projectFilter]);

  // Expenses grouped by category
  const expensesByCategory = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      map[e.categoria] = (map[e.categoria] || 0) + Number(e.monto);
    });
    return map;
  }, [filteredExpenses]);

  // Handle CSV export of the currently active tab
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `constructa_reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'summary' || activeTab === 'projects') {
      csvContent += "Codigo,Proyecto,Cliente,Responsable,Estado,Presupuesto,Gastado,Disponible,Avance\r\n";
      filteredProjects.forEach(p => {
        const spent = data.expenses.filter(e => e.proyectoId === p.id).reduce((acc, curr) => acc + Number(curr.monto), 0);
        const available = p.presupuesto - spent;
        csvContent += `"${p.codigo}","${p.nombre}","${p.cliente}","${p.responsable}","${p.estado}",${p.presupuesto},${spent},${available},${p.avance}%\r\n`;
      });
    } else if (activeTab === 'expenses') {
      csvContent += "Fecha,Concepto,Proyecto,Categoria,Proveedor,Comprobante,Monto\r\n";
      filteredExpenses.forEach(e => {
        const prj = data.projects.find(p => p.id === e.proyectoId);
        const desc = e.concepto || e.descripcion || 'Gasto operativo';
        csvContent += `"${e.fecha}","${desc}","${prj ? prj.nombre : ''}","${e.categoria}","${e.proveedor || ''}","${e.comprobante || ''}",${e.monto}\r\n`;
      });
    } else if (activeTab === 'materials') {
      csvContent += "Material,Categoria,Unidad,Stock_Actual,Stock_Minimo,Precio_Unitario,Valor_Total,Estado\r\n";
      data.materials.forEach(m => {
        const val = m.stock * m.precioUnitario;
        const est = m.stock <= m.stockMinimo ? 'Stock Bajo' : 'Normal';
        csvContent += `"${m.nombre}","${m.categoria}","${m.unidad}",${m.stock},${m.stockMinimo},${m.precioUnitario},${val},"${est}"\r\n`;
      });
    } else if (activeTab === 'employees') {
      csvContent += "Nombre,Puesto,DNI,Proyecto,Horario,Dias_Laborales,Estado,Telefono,Email\r\n";
      filteredEmployees.forEach(emp => {
        const prj = data.projects.find(p => p.id === emp.proyectoId);
        csvContent += `"${emp.nombre}","${emp.puesto}","${emp.dni}","${prj ? prj.nombre : ''}","${emp.horario}","${emp.diasLaborales}","${emp.estado}","${emp.telefono}","${emp.email}"\r\n`;
      });
    } else {
      csvContent += "Fecha,Tipo,Descripcion,Proyecto,Monto\r\n";
      data.history.forEach(h => {
        csvContent += `"${h.fecha}","${h.tipo}","${h.descripcion}","${h.proyecto || ''}",${h.monto || ''}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Centro de Reportes y Estadísticas</h1>
          <p className="constructa-page-subtitle">
            Consolidado empresarial tipo hoja de cálculo con exportación de datos, estados financieros y auditoría operativa.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={<Printer size={16} />} onClick={handlePrint}>
            Imprimir
          </Button>
          <Button variant="primary" icon={<Download size={16} />} onClick={handleExportCSV}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {[
          { id: 'summary', label: 'Resumen Ejecutivo', icon: <FileSpreadsheet size={15} /> },
          { id: 'projects', label: 'Proyectos y Avance', icon: <Building2 size={15} /> },
          { id: 'expenses', label: 'Costos y Gastos', icon: <DollarSign size={15} /> },
          { id: 'materials', label: 'Inventario de Insumos', icon: <Package size={15} /> },
          { id: 'employees', label: 'Plantilla y Cuadrillas', icon: <Users size={15} /> },
          { id: 'history', label: 'Bitácora de Auditoría', icon: <History size={15} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-gold)' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.88rem'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global Filter Bar */}
      <div className="constructa-card" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Filtrar información por proyecto:</span>
          <select
            className="constructa-input"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '200px', maxWidth: '100%' }}
          >
            <option value="ALL">Consolidado General (Todos los Proyectos)</option>
            {data.projects.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Datos sincronizados con la memoria corporativa interna
        </div>
      </div>

      {/* TAB 1: RESUMEN EJECUTIVO */}
      {activeTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive KPI Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="constructa-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Presupuesto Autorizado</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                ${metrics.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Total 6 proyectos</div>
            </div>

            <div className="constructa-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Gasto Acumulado</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '4px' }}>
                ${metrics.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{metrics.budgetUsagePercent}% de ejecución</div>
            </div>

            <div className="constructa-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Remanente Disponible</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
                ${metrics.availableBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '4px' }}>Liquidez operativa</div>
            </div>

            <div className="constructa-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Avance Físico Global</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
                {metrics.avgProgress}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Promedio ponderado</div>
            </div>
          </div>

          {/* Excel-style summary table */}
          <div className="constructa-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Matriz Consolidada de Obras y Finanzas
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {filteredProjects.length} proyectos en análisis
              </span>
            </div>

            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Proyecto</th>
                    <th>Estado</th>
                    <th>Avance Físico</th>
                    <th style={{ textAlign: 'right' }}>Presupuesto ($)</th>
                    <th style={{ textAlign: 'right' }}>Gastado ($)</th>
                    <th style={{ textAlign: 'right' }}>Disponible ($)</th>
                    <th style={{ textAlign: 'right' }}>% Consumo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(p => {
                    const spent = data.expenses.filter(e => e.proyectoId === p.id).reduce((acc, curr) => acc + Number(curr.monto), 0);
                    const available = p.presupuesto - spent;
                    const percent = p.presupuesto > 0 ? Math.round((spent / p.presupuesto) * 100) : 0;

                    return (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{p.codigo}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.nombre}</td>
                        <td>
                          <Badge variant={p.estado === 'Finalizado' ? 'success' : p.estado === 'En construcción' ? 'primary' : 'warning'}>
                            {p.estado}
                          </Badge>
                        </td>
                        <td style={{ width: '150px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ProgressBar value={p.avance} showLabel={false} height={6} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.avance}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ${Number(p.presupuesto).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-rose)', fontWeight: 600 }}>
                          ${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: available < 0 ? 'var(--color-rose)' : 'var(--color-emerald)', fontWeight: 600 }}>
                          ${available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ color: percent > 90 ? 'var(--color-rose)' : percent > 75 ? 'var(--color-amber)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {percent}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROYECTOS */}
      {activeTab === 'projects' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Proyecto</th>
                  <th>Cliente</th>
                  <th>Responsable</th>
                  <th>Período</th>
                  <th>Avance</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{p.codigo}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.nombre}</td>
                    <td>{p.cliente}</td>
                    <td>{p.responsable}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {p.fechaInicio} al {p.fechaFin}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ProgressBar value={p.avance} showLabel={false} height={6} />
                        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{p.avance}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={p.estado === 'Finalizado' ? 'success' : p.estado === 'En construcción' ? 'primary' : 'warning'}>
                        {p.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GASTOS */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Categories summary chips */}
          <div className="constructa-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
              Subtotales por Partida / Categoría:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(expensesByCategory).map(([cat, val]) => (
                <div key={cat} style={{ background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{cat}: </span>
                  <strong style={{ color: 'var(--color-gold)' }}>${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="constructa-card" style={{ overflow: 'hidden' }}>
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Proyecto</th>
                    <th>Categoría</th>
                    <th>Proveedor</th>
                    <th>Comprobante</th>
                    <th style={{ textAlign: 'right' }}>Monto ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(e => {
                    const prj = data.projects.find(p => p.id === e.proyectoId);
                    return (
                      <tr key={e.id}>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{e.fecha}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{e.concepto || e.descripcion || 'Gasto operativo'}</td>
                        <td>{prj ? prj.nombre : 'Proyecto general'}</td>
                        <td>{e.categoria}</td>
                        <td style={{ fontSize: '0.85rem' }}>{e.proveedor || '—'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{e.comprobante || '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-rose)' }}>
                          ${Number(e.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MATERIALES */}
      {activeTab === 'materials' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th style={{ textAlign: 'right' }}>Precio Unitario ($)</th>
                  <th style={{ textAlign: 'right' }}>Valor Total en Almacén ($)</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.materials.map(m => {
                  const isLow = m.stock <= m.stockMinimo;
                  const totalVal = m.stock * m.precioUnitario;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.nombre}</td>
                      <td>{m.categoria}</td>
                      <td>{m.unidad}</td>
                      <td style={{ fontWeight: 700, color: isLow ? 'var(--color-rose)' : 'var(--color-text-primary)' }}>
                        {m.stock}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{m.stockMinimo}</td>
                      <td style={{ textAlign: 'right' }}>${Number(m.precioUnitario).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-gold)' }}>
                        ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <Badge variant={isLow ? 'danger' : 'success'}>
                          {isLow ? 'Stock Bajo' : 'Normal'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EMPLEADOS */}
      {activeTab === 'employees' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Nombre y Apellidos</th>
                  <th>Especialidad / Puesto</th>
                  <th>DNI</th>
                  <th>Proyecto Asignado</th>
                  <th>Días Laborales</th>
                  <th>Horario</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const prj = data.projects.find(p => p.id === emp.proyectoId);
                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{emp.nombre}</td>
                      <td style={{ color: 'var(--color-gold)' }}>{emp.puesto}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{emp.dni}</td>
                      <td>{prj ? prj.nombre : 'Sin asignar'}</td>
                      <td>{emp.diasLaborales}</td>
                      <td style={{ fontSize: '0.85rem' }}>{emp.horario}</td>
                      <td>
                        <Badge variant={emp.estado === 'Activo' ? 'success' : emp.estado === 'Descanso' ? 'warning' : 'neutral'}>
                          {emp.estado}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: HISTORIAL AUDITORIA */}
      {activeTab === 'history' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Tipo de Operación</th>
                  <th>Descripción del Movimiento</th>
                  <th>Proyecto Relacionado</th>
                  <th style={{ textAlign: 'right' }}>Monto Afectado ($)</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map(h => (
                  <tr key={h.id}>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{h.fecha}</td>
                    <td>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        color: 'var(--color-gold)',
                        fontWeight: 600
                      }}>
                        {h.tipo}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-primary)' }}>{h.descripcion}</td>
                    <td>{h.proyecto || 'General'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: h.monto ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                      {h.monto ? `$${Number(h.monto).toLocaleString('en-US')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
