import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import ExpenseModal from '../../components/expenses/ExpenseModal';
import { 
  Receipt, 
  Plus, 
  Filter, 
  Calendar, 
  Building2, 
  Edit, 
  Trash2, 
  DollarSign, 
  FileText,
  Tag,
  ArrowUpRight
} from 'lucide-react';

const CATEGORIES = [
  'Materiales',
  'Mano de obra',
  'Transporte',
  'Herramientas',
  'Servicios',
  'Otros'
];

export default function Expenses() {
  const { data, saveExpense, deleteExpense, requestConfirm } = useConstructa();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(exp => {
      const desc = (exp.concepto || exp.descripcion || '').toLowerCase();
      const prov = (exp.proveedor || '').toLowerCase();
      const comp = (exp.comprobante || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = 
        desc.includes(query) ||
        prov.includes(query) ||
        comp.includes(query);
      
      const matchesProject = selectedProject === 'ALL' || exp.proyectoId === selectedProject;
      const matchesCategory = selectedCategory === 'ALL' || exp.categoria === selectedCategory;

      return matchesSearch && matchesProject && matchesCategory;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [data.expenses, searchTerm, selectedProject, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setModalOpen(true);
  };

  const handleDelete = (exp) => {
    const expenseTitle = exp.concepto || exp.descripcion || 'Gasto';
    requestConfirm({
      title: 'Eliminar Registro de Gasto',
      message: `¿Estás seguro de eliminar el gasto "${expenseTitle}" por $${Number(exp.monto).toLocaleString('en-US')}? Esta acción reintegrará el saldo al presupuesto del proyecto.`,
      confirmText: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: () => deleteExpense(exp.id)
    });
  };

  const getProjectName = (projectId) => {
    const prj = data.projects.find(p => p.id === projectId);
    return prj ? prj.nombre : 'Proyecto general';
  };

  // Stats for filtered view
  const currentTotal = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + Number(e.monto), 0);
  }, [filteredExpenses]);

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Control de Gastos y Costos</h1>
          <p className="constructa-page-subtitle">
            Registro detallado de erogaciones, comprobantes fiscales, costos operativos y afectación a presupuestos ({data.expenses.length} registros).
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreate}>
          Registrar Gasto
        </Button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Gasto Total Filtrado</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
            ${currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {filteredExpenses.length} comprobantes en vista
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Gasto Histórico Total</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '4px' }}>
            ${data.expenses.reduce((acc, e) => acc + Number(e.monto), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Todas las partidas ejecutadas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ticket Promedio de Gasto</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '4px' }}>
            ${data.expenses.length > 0 ? (data.expenses.reduce((acc, e) => acc + Number(e.monto), 0) / data.expenses.length).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Por transacción
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Proyectos con Gastos</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {new Set(data.expenses.map(e => e.proyectoId)).size} de {data.projects.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Frentes de trabajo activos
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <SearchInput
            placeholder="Buscar por concepto, proveedor o folio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="constructa-input"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="ALL">Todos los Proyectos</option>
            {data.projects.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select
            className="constructa-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">Todas las Categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title="Sin gastos encontrados"
          description="No se encontraron erogaciones que coincidan con los criterios de búsqueda aplicados."
          actionText="Limpiar filtros"
          onAction={() => {
            setSearchTerm('');
            setSelectedProject('ALL');
            setSelectedCategory('ALL');
          }}
        />
      ) : (
        <div className="constructa-card" style={{ overflow: 'hidden' }}>
          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto / Descripción</th>
                  <th>Proyecto Destino</th>
                  <th>Categoría</th>
                  <th>Proveedor / Folio</th>
                  <th style={{ textAlign: 'right' }}>Importe ($)</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{exp.fecha}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {exp.concepto || exp.descripcion || 'Gasto operativo'}
                      </div>
                      {exp.notas && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {exp.notas}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Building2 size={14} style={{ color: 'var(--color-gold)' }} />
                        <span>{getProjectName(exp.proyectoId)}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--color-border)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        color: 'var(--color-cyan)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Tag size={11} /> {exp.categoria}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {exp.proveedor || 'Sin proveedor'}
                      </div>
                      {exp.comprobante && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Factura: {exp.comprobante}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                        ${Number(exp.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="btn-icon"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp)}
                          className="btn-icon"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-rose)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={saveExpense}
        expense={editingExpense}
        projects={data.projects}
        suppliers={data.suppliers}
      />
    </div>
  );
}
