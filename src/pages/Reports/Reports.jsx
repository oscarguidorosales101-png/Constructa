import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { matchSearch } from '../../utils/searchUtils';
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
  UserCheck,
  Truck,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';

export default function Reports() {
  const { data, metrics, formatCurrency = (v) => '$' + Number(v || 0).toLocaleString(), formatDate = (d) => d } = useConstructa();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'projects' | 'expenses' | 'procurement' | 'materials' | 'employees' | 'history'
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered data based on project and search
  const filteredProjects = useMemo(() => {
    let list = projectFilter === 'ALL' ? data.projects : data.projects.filter(p => p.id === projectFilter);
    if (searchTerm) {
      list = list.filter(p => matchSearch(searchTerm, [
        p.nombre,
        p.codigo,
        p.cliente,
        p.responsable,
        p.estado,
        p.ubicacion,
      ]));
    }
    return list;
  }, [data.projects, projectFilter, searchTerm]);

  const filteredExpenses = useMemo(() => {
    let list = projectFilter === 'ALL' ? data.expenses : data.expenses.filter(e => e.proyectoId === projectFilter);
    if (searchTerm) {
      list = list.filter(e => {
        const prj = data.projects.find(p => p.id === e.proyectoId);
        return matchSearch(searchTerm, [
          e.concepto,
          e.descripcion,
          e.categoria,
          e.proveedor,
          e.comprobante,
          e.fecha,
          e.monto,
          prj?.nombre,
          prj?.codigo,
        ]);
      });
    }
    return list;
  }, [data.expenses, data.projects, projectFilter, searchTerm]);

  const filteredMaterials = useMemo(() => {
    let list = data.materials;
    if (searchTerm) {
      list = list.filter(m => matchSearch(searchTerm, [
        m.nombre,
        m.codigo,
        m.categoria,
        m.unidad,
        m.stockActual ?? m.stock,
        m.precioUnitario,
      ]));
    }
    return list;
  }, [data.materials, searchTerm]);

  const filteredEmployees = useMemo(() => {
    let list = projectFilter === 'ALL' ? data.employees : data.employees.filter(e => e.proyectoId === projectFilter);
    if (searchTerm) {
      list = list.filter(e => {
        const prj = data.projects.find(p => p.id === e.proyectoId);
        return matchSearch(searchTerm, [
          e.nombre,
          e.puesto,
          e.dni,
          e.email,
          e.telefono,
          e.estado,
          e.horario,
          prj?.nombre,
        ]);
      });
    }
    return list;
  }, [data.employees, data.projects, projectFilter, searchTerm]);

  const filteredHistory = useMemo(() => {
    let list = data.history;
    if (searchTerm) {
      list = list.filter(h => matchSearch(searchTerm, [
        h.descripcion,
        h.tipo,
        h.proyecto,
        h.proyectoRelacionado,
        h.fecha,
        h.monto,
      ]));
    }
    return list;
  }, [data.history, searchTerm]);

  const filteredApplicants = useMemo(() => {
    let list = data.applicants || [];
    if (searchTerm) {
      list = list.filter(a => matchSearch(searchTerm, [
        a.nombre,
        a.dni,
        a.puestoSolicitado,
        a.area,
        a.ultimoPuesto,
        a.ultimaEmpresa,
        a.estado,
        a.disponibilidad,
        (a.habilidades || []).join(' ')
      ]));
    }
    return list;
  }, [data.applicants, searchTerm]);

  // Expenses grouped by category
  const expensesByCategory = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      map[e.categoria] = (map[e.categoria] || 0) + Number(e.monto);
    });
    return map;
  }, [filteredExpenses]);

  // Procurement: Órdenes y Facturas filtradas
  const filteredProcurementOrders = useMemo(() => {
    let list = (data.purchaseOrders || []);
    if (projectFilter !== 'ALL') {
      list = list.filter(o => o.proyectoId === projectFilter);
    }
    if (searchTerm) {
      list = list.filter(o => {
        const prj = (data.projects || []).find(p => p.id === o.proyectoId);
        const sup = (data.suppliers || []).find(s => s.id === o.proveedorId);
        return matchSearch(searchTerm, [
          o.numeroOrden,
          o.proveedorNombre || sup?.nombre,
          prj?.nombre,
          o.estado,
          o.total,
          (o.materiales || []).map(m => m.materialNombre).join(' ')
        ]);
      });
    }
    return list;
  }, [data.purchaseOrders, data.projects, data.suppliers, projectFilter, searchTerm]);

  const filteredProcurementInvoices = useMemo(() => {
    let list = (data.supplierInvoices || []);
    if (projectFilter !== 'ALL') {
      list = list.filter(inv => inv.proyectoId === projectFilter);
    }
    if (searchTerm) {
      list = list.filter(inv => {
        const prj = (data.projects || []).find(p => p.id === inv.proyectoId);
        const sup = (data.suppliers || []).find(s => s.id === inv.proveedorId);
        return matchSearch(searchTerm, [
          inv.numeroFactura,
          inv.ordenNumero,
          inv.proveedorNombre || sup?.nombre,
          prj?.nombre,
          inv.estado,
          inv.total,
          inv.metodoPago
        ]);
      });
    }
    return list;
  }, [data.supplierInvoices, data.projects, data.suppliers, projectFilter, searchTerm]);

  // Agrupado de compras por proyecto
  const purchasesByProject = useMemo(() => {
    const map = {};
    (data.projects || []).forEach(p => {
      map[p.id] = {
        proyecto: p,
        totalOrdenes: 0,
        montoComprometido: 0,
        ordenesCompletadas: 0,
        ordenesParciales: 0,
        totalFacturas: 0,
        totalPagado: 0,
      };
    });

    (data.purchaseOrders || []).forEach(o => {
      if (map[o.proyectoId]) {
        map[o.proyectoId].totalOrdenes += 1;
        map[o.proyectoId].montoComprometido += Number(o.total || 0);
        if (o.estado === 'Entregada') map[o.proyectoId].ordenesCompletadas += 1;
        if (o.estado === 'Recibida parcialmente') map[o.proyectoId].ordenesParciales += 1;
      }
    });

    (data.supplierInvoices || []).forEach(inv => {
      if (map[inv.proyectoId]) {
        map[inv.proyectoId].totalFacturas += Number(inv.total || 0);
        if (inv.estado === 'Pagada') {
          map[inv.proyectoId].totalPagado += Number(inv.total || 0);
        }
      }
    });

    return Object.values(map).filter(item => {
      if (projectFilter !== 'ALL' && item.proyecto.id !== projectFilter) return false;
      if (searchTerm) {
        return matchSearch(searchTerm, [item.proyecto.nombre, item.proyecto.codigo, item.proyecto.cliente]);
      }
      return true;
    });
  }, [data.projects, data.purchaseOrders, data.supplierInvoices, projectFilter, searchTerm]);

  // Agrupado de compras por proveedor
  const purchasesBySupplier = useMemo(() => {
    const map = {};
    (data.suppliers || []).forEach(s => {
      map[s.id] = {
        proveedor: s,
        totalOrdenes: 0,
        montoTotal: 0,
        entregadas: 0,
        parciales: 0,
        totalFacturado: 0,
        totalPagado: 0,
        saldoPendiente: 0,
      };
    });

    (data.purchaseOrders || []).forEach(o => {
      if (projectFilter !== 'ALL' && o.proyectoId !== projectFilter) return;
      if (map[o.proveedorId]) {
        map[o.proveedorId].totalOrdenes += 1;
        map[o.proveedorId].montoTotal += Number(o.total || 0);
        if (o.estado === 'Entregada') map[o.proveedorId].entregadas += 1;
        if (o.estado === 'Recibida parcialmente') map[o.proveedorId].parciales += 1;
      }
    });

    (data.supplierInvoices || []).forEach(inv => {
      if (projectFilter !== 'ALL' && inv.proyectoId !== projectFilter) return;
      if (map[inv.proveedorId]) {
        map[inv.proveedorId].totalFacturado += Number(inv.total || 0);
        if (inv.estado === 'Pagada') {
          map[inv.proveedorId].totalPagado += Number(inv.total || 0);
        } else if (inv.estado !== 'Cancelada' && inv.estado !== 'Rechazada') {
          map[inv.proveedorId].saldoPendiente += Number(inv.total || 0);
        }
      }
    });

    return Object.values(map).filter(item => {
      if (searchTerm) {
        return matchSearch(searchTerm, [item.proveedor.nombre, item.proveedor.contacto, item.proveedor.especialidad]);
      }
      return true;
    });
  }, [data.suppliers, data.purchaseOrders, data.supplierInvoices, projectFilter, searchTerm]);

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
    } else if (activeTab === 'procurement') {
      csvContent += "Numero_Orden,Proveedor,Proyecto,Fecha_Creacion,Entrega_Prevista,Total,Estado,Recepcion,Incidencias\r\n";
      filteredProcurementOrders.forEach(o => {
        const prj = (data.projects || []).find(p => p.id === o.proyectoId);
        const sup = (data.suppliers || []).find(s => s.id === o.proveedorId);
        const recStatus = o.recepcion ? `${o.recepcion.porcentajeRecibido}%` : 'Sin recepcionar';
        const inc = (o.recepcion?.incidencias || []).join('; ') || 'Ninguna';
        csvContent += `"${o.numeroOrden}","${o.proveedorNombre || sup?.nombre || ''}","${prj?.nombre || ''}","${o.fechaCreacion}","${o.fechaPrevistaEntrega}",${o.total},"${o.estado}","${recStatus}","${inc}"\r\n`;
      });
    } else if (activeTab === 'materials') {
      csvContent += "Material,Categoria,Unidad,Stock_Actual,Stock_Minimo,Precio_Unitario,Valor_Total,Estado\r\n";
      filteredMaterials.forEach(m => {
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
    } else if (activeTab === 'recruitment') {
      csvContent += "ID,Nombre,DNI,Puesto,Area,Experiencia,Ultima_Empresa,Disponibilidad,Estado,Empleado_Vinculado\r\n";
      filteredApplicants.forEach(a => {
        csvContent += `"${a.id}","${a.nombre}","${a.dni}","${a.puestoSolicitado}","${a.area}",${a.experienciaAnios},"${a.ultimaEmpresa || ''}","${a.disponibilidad}","${a.estado}","${a.empleadoId || 'No vinculado'}"\r\n`;
      });
    } else {
      csvContent += "Fecha,Tipo,Descripcion,Proyecto,Monto\r\n";
      filteredHistory.forEach(h => {
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
          { id: 'procurement', label: 'Compras y Abastecimiento', icon: <Truck size={15} /> },
          { id: 'materials', label: 'Inventario de Insumos', icon: <Package size={15} /> },
          { id: 'employees', label: 'Plantilla y Cuadrillas', icon: <Users size={15} /> },
          { id: 'recruitment', label: 'Selección y Postulantes', icon: <UserCheck size={15} /> },
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
      <div className="constructa-card" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ minWidth: '220px', flex: 1, maxWidth: '380px' }}>
            <SearchInput
              placeholder="Buscar en el reporte activo..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Filtrar por obra:</span>
            <select
              className="constructa-input"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '200px', maxWidth: '100%' }}
            >
              <option value="ALL">Consolidado General (Todas las Obras)</option>
              {data.projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Datos consolidados y actualizados en tiempo real
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

            {filteredProjects.length === 0 ? (
              <EmptyState
                title="No encontramos resultados para tu búsqueda"
                message="Intenta con otros términos o limpia los filtros para ver el reporte ejecutivo."
              />
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROYECTOS */}
      {activeTab === 'projects' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          {filteredProjects.length === 0 ? (
            <EmptyState
              title="No encontramos resultados para tu búsqueda"
              message="Intenta con otros términos o verifica el filtro de obra seleccionado."
            />
          ) : (
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
          )}
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
            {filteredExpenses.length === 0 ? (
              <EmptyState
                title="No encontramos resultados para tu búsqueda"
                message="No existen gastos que coincidan con los criterios aplicados."
              />
            ) : (
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
            )}
          </div>
        </div>
      )}
    
      {/* TAB 3.5: COMPRAS Y ABASTECIMIENTO (Requerimiento #28) */}
      {activeTab === 'procurement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* KPI Strip de Compras */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Órdenes de Compra Emitidas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
                {filteredProcurementOrders.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Compromiso total: {formatCurrency(filteredProcurementOrders.reduce((sum, o) => sum + Number(o.total || 0), 0))}
              </div>
            </div>

            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Entregas y Recepciones</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
                {filteredProcurementOrders.filter(o => o.estado === 'Entregada').length} / {filteredProcurementOrders.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)' }}>
                {filteredProcurementOrders.filter(o => o.estado === 'Recibida parcialmente').length} entregas parciales registradas
              </div>
            </div>

            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Facturas de Proveedores</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '4px' }}>
                {filteredProcurementInvoices.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Total facturado: {formatCurrency(filteredProcurementInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0))}
              </div>
            </div>

            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pagos a Proveedores</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
                {formatCurrency(filteredProcurementInvoices.filter(i => i.estado === 'Pagada').reduce((sum, i) => sum + Number(i.total || 0), 0))}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)' }}>
                Programados: {formatCurrency(filteredProcurementInvoices.filter(i => i.estado === 'Programada para pago').reduce((sum, i) => sum + Number(i.total || 0), 0))}
              </div>
            </div>
          </div>

          {/* Tabla 1: Compras por Proyecto */}
          <div className="constructa-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  Consolidado de Compras y Abastecimiento por Proyecto
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Impacto de compras, compromisos y facturas imputadas a cada frente constructivo
                </p>
              </div>
            </div>

            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Presupuesto Obra</th>
                    <th>Órdenes Emitidas</th>
                    <th>Monto Comprometido</th>
                    <th>Entregas Completas</th>
                    <th>Entregas Parciales</th>
                    <th>Facturado</th>
                    <th>Pagado Real</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesByProject.map(row => (
                    <tr key={row.proyecto.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>{row.proyecto.nombre}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{row.proyecto.codigo} • {row.proyecto.cliente}</span>
                      </td>
                      <td style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(row.proyecto.presupuesto)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{row.totalOrdenes}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(row.montoComprometido)}</td>
                      <td>
                        <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>{row.ordenesCompletadas}</span>
                      </td>
                      <td>
                        <span style={{ color: row.ordenesParciales > 0 ? 'var(--color-amber)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                          {row.ordenesParciales}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-sky)', fontWeight: 600 }}>{formatCurrency(row.totalFacturas)}</td>
                      <td style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>{formatCurrency(row.totalPagado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla 2: Rendimiento y Saldos por Proveedor */}
          <div className="constructa-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  Rendimiento, Entregas y Saldos por Proveedor
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Evaluación de cumplimiento en obra, órdenes activas, condiciones y estado financiero
                </p>
              </div>
            </div>

            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Especialidad / Insumos</th>
                    <th>Condiciones Pago</th>
                    <th>Órdenes</th>
                    <th>Total Pedido</th>
                    <th>Entregas Completas</th>
                    <th>Parciales</th>
                    <th>Total Pagado</th>
                    <th>Saldo Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesBySupplier.map(row => (
                    <tr key={row.proveedor.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>{row.proveedor.nombre}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Contacto: {row.proveedor.contacto}</span>
                      </td>
                      <td>
                        <Badge variant="neutral">{row.proveedor.especialidad || 'Materiales'}</Badge>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{row.proveedor.condicionesPago || '30 días'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{row.totalOrdenes}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatCurrency(row.montoTotal)}</td>
                      <td>
                        <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>{row.entregadas}</span>
                      </td>
                      <td>
                        <span style={{ color: row.parciales > 0 ? 'var(--color-amber)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                          {row.parciales}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>{formatCurrency(row.totalPagado)}</td>
                      <td style={{ color: row.saldoPendiente > 0 ? 'var(--color-rose)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                        {formatCurrency(row.saldoPendiente)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla 3: Detalle de Órdenes y Recepción Física */}
          <div className="constructa-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  Bitácora de Órdenes de Compra y Recepción de Insumos
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Comparación entre insumos solicitados, recibidos en almacén e incidencias registradas
                </p>
              </div>
              <Badge variant="info">{filteredProcurementOrders.length} órdenes</Badge>
            </div>

            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Proveedor</th>
                    <th>Proyecto</th>
                    <th>Insumos y Cantidades</th>
                    <th>Fecha Prometida</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Recepción en Obra</th>
                    <th>Incidencias</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcurementOrders.map(o => {
                    const prj = (data.projects || []).find(p => p.id === o.proyectoId);
                    return (
                      <tr key={o.id}>
                        <td style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{o.numeroOrden}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{o.proveedorNombre}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{prj?.nombre || 'General'}</td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {(o.materiales || []).map((m, idx) => (
                            <div key={idx} style={{ color: 'var(--color-text-primary)' }}>
                              • {m.materialNombre}: <strong style={{ color: 'var(--color-gold)' }}>{m.cantidad} {m.unidad}</strong>
                              {m.cantidadRecibida !== undefined && (
                                <span style={{ color: m.cantidadRecibida === m.cantidad ? 'var(--color-emerald)' : 'var(--color-amber)', marginLeft: '6px' }}>
                                  (Recibido: {m.cantidadRecibida})
                                </span>
                              )}
                            </div>
                          ))}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{formatDate(o.fechaPrevistaEntrega)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(o.total)}</td>
                        <td>
                          <Badge variant={
                            o.estado === 'Entregada' ? 'success' :
                            o.estado === 'Recibida parcialmente' ? 'warning' :
                            o.estado === 'En camino' ? 'info' :
                            o.estado === 'Cancelada' ? 'danger' : 'neutral'
                          }>
                            {o.estado}
                          </Badge>
                        </td>
                        <td>
                          {o.recepcion ? (
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: o.recepcion.porcentajeRecibido === 100 ? 'var(--color-emerald)' : 'var(--color-amber)' }}>
                              {o.recepcion.porcentajeRecibido}% verificado
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Pendiente</span>
                          )}
                        </td>
                        <td>
                          {o.recepcion?.incidencias && o.recepcion.incidencias.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {o.recepcion.incidencias.map((inc, i) => (
                                <Badge key={i} variant="danger">{inc}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ninguna</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla 4: Facturación de Proveedores y Validación 3-Way Match */}
          <div className="constructa-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  Facturas de Proveedores y Control de Validación 3-Way Match
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Cotejo tripartito entre Orden de Compra, Recepción Física y Facturación Comercial
                </p>
              </div>
              <Badge variant="info">{filteredProcurementInvoices.length} facturas</Badge>
            </div>

            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Factura #</th>
                    <th>Proveedor</th>
                    <th>Orden Asociada</th>
                    <th>Fecha Emisión</th>
                    <th>Vencimiento</th>
                    <th>Total Facturado</th>
                    <th>Validación 3-Way Match</th>
                    <th>Estado de Pago</th>
                    <th>Método</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcurementInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ color: 'var(--color-sky)', fontWeight: 700 }}>{inv.numeroFactura}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{inv.proveedorNombre}</td>
                      <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{inv.ordenNumero}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{formatDate(inv.fechaEmision)}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{formatDate(inv.fechaVencimiento)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(inv.total)}</td>
                      <td>
                        {inv.validacionTresVias ? (
                          inv.validacionTresVias.aprobada ? (
                            <Badge variant="success">Validación Correcta</Badge>
                          ) : (
                            <Badge variant="danger">Discrepancias Detectadas</Badge>
                          )
                        ) : (
                          <Badge variant="neutral">Pendiente</Badge>
                        )}
                      </td>
                      <td>
                        <Badge variant={
                          inv.estado === 'Pagada' ? 'success' :
                          inv.estado === 'Programada para pago' ? 'info' :
                          inv.estado === 'Aprobada' ? 'primary' :
                          inv.estado === 'Rechazada' ? 'danger' : 'warning'
                        }>
                          {inv.estado}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{inv.metodoPago || 'Transferencia'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MATERIALES */}
      {activeTab === 'materials' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          {filteredMaterials.length === 0 ? (
            <EmptyState
              title="No encontramos resultados para tu búsqueda"
              message="No hay materiales o insumos que coincidan con la búsqueda actual."
            />
          ) : (
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
                  {filteredMaterials.map(m => {
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
          )}
        </div>
      )}

      {/* TAB 5: EMPLEADOS */}
      {activeTab === 'employees' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          {filteredEmployees.length === 0 ? (
            <EmptyState
              title="No encontramos resultados para tu búsqueda"
              message="No hay personal asignado que coincida con los criterios de búsqueda."
            />
          ) : (
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
          )}
        </div>
      )}

      {/* TAB 6: HISTORIAL AUDITORIA */}
      {activeTab === 'history' && (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          {filteredHistory.length === 0 ? (
            <EmptyState
              title="No encontramos resultados para tu búsqueda"
              message="No hay eventos en la bitácora que coincidan con tu búsqueda."
            />
          ) : (
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
                  {filteredHistory.map(h => (
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
          )}
        </div>
      )}

      {/* TAB 7: SELECCIÓN Y POSTULANTES */}
      {activeTab === 'recruitment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recruitment Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total Postulantes</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {metrics.totalApplicants || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Candidaturas registradas</div>
            </div>

            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>En Evaluación Activa</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-amber)', marginTop: '4px' }}>
                {metrics.activeApplicants || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)' }}>Filtro de perfil y técnica</div>
            </div>

            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Entrevistas en Agenda</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '4px' }}>
                {metrics.upcomingInterviews || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-sky)' }}>Citas programadas</div>
            </div>

            <div className="constructa-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Seleccionados para Obra</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
                {metrics.selectedApplicants || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)' }}>Aprobados para nómina</div>
            </div>
          </div>

          <div className="constructa-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Matriz Consolidada de Selección y Expedientes Laborales
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {filteredApplicants.length} expedientes analizados
              </span>
            </div>

            {filteredApplicants.length === 0 ? (
              <EmptyState
                title="No encontramos resultados para tu búsqueda"
                message="No hay postulantes que coincidan con la búsqueda actual."
              />
            ) : (
              <div className="constructa-table-container">
                <table className="constructa-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Candidato</th>
                      <th>DNI</th>
                      <th>Puesto Aspirado</th>
                      <th>Área</th>
                      <th>Experiencia</th>
                      <th>Disponibilidad</th>
                      <th>Estado</th>
                      <th>Alta en Nómina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map(a => (
                      <tr key={a.id}>
                        <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{a.id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{a.nombre}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{a.dni}</td>
                        <td style={{ color: 'var(--color-text-primary)' }}>{a.puestoSolicitado}</td>
                        <td>{a.area}</td>
                        <td>{a.experienciaAnios} años ({a.ultimaEmpresa || '—'})</td>
                        <td style={{ color: 'var(--color-emerald)', fontSize: '0.82rem' }}>{a.disponibilidad}</td>
                        <td>
                          <Badge variant={
                            a.estado === 'Seleccionado' ? 'success' :
                            a.estado === 'Entrevista programada' ? 'info' :
                            a.estado === 'Preseleccionado' || a.estado === 'En revisión' ? 'warning' :
                            a.estado === 'No seleccionado' ? 'danger' : 'neutral'
                          }>
                            {a.estado}
                          </Badge>
                        </td>
                        <td>
                          {a.empleadoId ? (
                            <span style={{ color: 'var(--color-emerald)', fontWeight: 600, fontSize: '0.82rem' }}>
                              Activo ({a.empleadoId})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Pendiente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
