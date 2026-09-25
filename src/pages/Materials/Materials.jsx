import React, { useState, useMemo, useEffect } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import MaterialModal from '../../components/materials/MaterialModal';
import StockMovementModal from '../../components/materials/StockMovementModal';
import { materialImages } from '../../assets/imgs/materiales';
import { 
  Package, 
  Plus, 
  ArrowLeftRight, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  Building2, 
  DollarSign, 
  History, 
  Layers 
} from 'lucide-react';

export default function Materials() {
  const { 
    data, 
    saveMaterial, 
    deleteMaterial, 
    registerStockMovement, 
    requestConfirm,
    navigationIntent,
    clearNavigationIntent 
  } = useConstructa();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'low' | 'ok'
  const [viewTab, setViewTab] = useState('inventory'); // 'inventory' | 'movements'

  // Escuchar si venimos de Dashboard "Revisar Inventario" / "Stock Bajo" (Prompt #9)
  useEffect(() => {
    if (navigationIntent?.filterLowStock) {
      setSelectedStatus('low');
      if (clearNavigationIntent) clearNavigationIntent();
    }
  }, [navigationIntent, clearNavigationIntent]);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedMaterialForMove, setSelectedMaterialForMove] = useState(null);

  // Categories list
  const uniqueCategories = useMemo(() => {
    const cats = new Set(data.materials.map(m => m.categoria));
    return Array.from(cats).sort();
  }, [data.materials]);

  // Low stock materials count
  const lowStockMaterials = useMemo(() => {
    return data.materials.filter(m => m.stock <= m.stockMinimo);
  }, [data.materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return data.materials.filter(m => {
      const matchesSearch = 
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.descripcion && m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'ALL' || m.categoria === selectedCategory;
      const isLow = m.stock <= m.stockMinimo;
      const matchesStatus = 
        selectedStatus === 'ALL' ? true :
        selectedStatus === 'low' ? isLow :
        !isLow;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [data.materials, searchTerm, selectedCategory, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setModalOpen(true);
  };

  const handleOpenMovement = (material) => {
    setSelectedMaterialForMove(material);
    setMovementModalOpen(true);
  };

  const handleDelete = (material) => {
    requestConfirm({
      title: 'Eliminar Material',
      message: `¿Estás seguro de eliminar "${material.nombre}" del catálogo? Se conservará el registro histórico de operaciones pasadas.`,
      confirmText: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: () => deleteMaterial(material.id)
    });
  };

  const getSupplierName = (supplierId) => {
    const sup = data.suppliers.find(s => s.id === supplierId);
    return sup ? sup.nombre : 'Proveedor externo';
  };

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Almacén y Materiales</h1>
          <p className="constructa-page-subtitle">
            Control de insumos de obra, stock de seguridad, catálogo fotográfico y registro de kardex de entradas y salidas.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--color-bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setViewTab('inventory')}
              style={{
                background: viewTab === 'inventory' ? 'var(--color-bg-card-hover)' : 'transparent',
                color: viewTab === 'inventory' ? 'var(--color-gold)' : 'var(--color-text-muted)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Package size={16} /> Catálogo ({data.materials.length})
            </button>
            <button
              onClick={() => setViewTab('movements')}
              style={{
                background: viewTab === 'movements' ? 'var(--color-bg-card-hover)' : 'transparent',
                color: viewTab === 'movements' ? 'var(--color-gold)' : 'var(--color-text-muted)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <History size={16} /> Movimientos ({data.inventoryMovements.length})
            </button>
          </div>

          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreate}>
            Nuevo Material
          </Button>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockMaterials.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '50%', color: 'var(--color-rose)' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-rose)', fontSize: '0.95rem' }}>
                Atención de Abastecimiento: {lowStockMaterials.length} material{lowStockMaterials.length > 1 ? 'es' : ''} con Stock Bajo o Crítico
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                {lowStockMaterials.map(m => `${m.nombre} (${m.stock} ${m.unidad})`).slice(0, 4).join(' • ')}
                {lowStockMaterials.length > 4 && ` y ${lowStockMaterials.length - 4} más.`}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setSelectedStatus(selectedStatus === 'low' ? 'ALL' : 'low')}
          >
            {selectedStatus === 'low' ? 'Ver Todos' : 'Filtrar Críticos'}
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Total Insumos Registrados</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {data.materials.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', marginTop: '4px' }}>
            {uniqueCategories.length} familias de materiales
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Materiales en Stock Normal</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {data.materials.length - lowStockMaterials.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Suministro garantizado
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Alertas de Reorden</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: lowStockMaterials.length > 0 ? 'var(--color-rose)' : 'var(--color-emerald)', marginTop: '4px' }}>
            {lowStockMaterials.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-rose)', marginTop: '4px' }}>
            {lowStockMaterials.length > 0 ? 'Requieren compra urgente' : 'Sin alertas'}
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Valor Estimado en Almacén</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
            ${data.materials.reduce((acc, m) => acc + (m.stock * m.precioUnitario), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Inventario valorizado
          </div>
        </div>
      </div>

      {viewTab === 'inventory' ? (
        <>
          {/* Filters Bar */}
          <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
              <SearchInput
                placeholder="Buscar material o especificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="constructa-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">Todas las Categorías</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                className="constructa-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">Todos los Niveles de Stock</option>
                <option value="low">Stock Bajo / Crítico</option>
                <option value="ok">Stock Normal / Óptimo</option>
              </select>
            </div>
          </div>

          {/* Material Cards Grid */}
          {filteredMaterials.length === 0 ? (
            <EmptyState
              title="Sin materiales coincidentes"
              description="No encontramos insumos que correspondan con los filtros de búsqueda seleccionados."
              actionText="Restablecer filtros"
              onAction={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
            />
          ) : (
            <div className="materials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {filteredMaterials.map(m => {
                const isLow = m.stock <= m.stockMinimo;
                const isZero = m.stock === 0;
                const imgSrc = materialImages[m.imagen || m.imagenKey] || materialImages['cemento-portland'];

                return (
                  <div 
                    key={m.id} 
                    className="constructa-card" 
                    style={{ 
                      padding: '0', 
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: isLow ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--color-border)',
                      boxShadow: isLow ? '0 0 15px rgba(239, 68, 68, 0.08)' : 'none'
                    }}
                  >
                    {/* Material Image Header */}
                    <div style={{
                      height: '160px',
                      background: 'linear-gradient(180deg, #111827 0%, #0a0d14 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                      position: 'relative',
                      borderBottom: '1px solid var(--color-border)'
                    }}>
                      <img
                        src={imgSrc}
                        alt={m.nombre}
                        style={{
                          maxHeight: '130px',
                          maxWidth: '90%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                        }}
                      />
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        {isZero ? (
                          <Badge variant="danger">Agotado</Badge>
                        ) : isLow ? (
                          <Badge variant="danger">Stock Bajo</Badge>
                        ) : (
                          <Badge variant="success">Óptimo</Badge>
                        )}
                      </div>
                      <div style={{ position: 'absolute', bottom: '8px', left: '12px' }}>
                        <span style={{
                          background: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(4px)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          color: 'var(--color-gold)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {m.categoria}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                        {m.nombre}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '14px', flex: 1 }}>
                        {m.descripcion || 'Sin descripción adicional.'}
                      </p>

                      {/* Stock Indicators */}
                      <div style={{
                        background: 'var(--color-bg-page)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                        marginBottom: '16px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        fontSize: '0.85rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Stock Disponible</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isLow ? 'var(--color-rose)' : 'var(--color-text-primary)' }}>
                            {m.stock} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{m.unidad}</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Mínimo de Alerta</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            {m.stockMinimo} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{m.unidad}</span>
                          </div>
                        </div>
                        <div style={{ gridColumn: 'span 2', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Precio unitario ref:</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>${Number(m.precioUnitario).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<ArrowLeftRight size={14} />}
                          onClick={() => handleOpenMovement(m)}
                          style={{ flex: 1 }}
                        >
                          Kardex / Movimiento
                        </Button>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="btn-icon"
                          style={{
                            background: 'var(--color-bg-page)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                          title="Editar"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="btn-icon"
                          style={{
                            background: 'var(--color-bg-page)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-rose)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Movements Log / Kardex Tab */
        <div className="constructa-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Historial de Movimientos de Almacén (Kardex)
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {data.inventoryMovements.length} operaciones registradas
            </span>
          </div>

          <div className="constructa-table-container">
            <table className="constructa-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operación</th>
                  <th>Material</th>
                  <th>Cantidad</th>
                  <th>Destino / Proyecto</th>
                  <th>Justificación</th>
                </tr>
              </thead>
              <tbody>
                {data.inventoryMovements.map(mov => {
                  const mat = data.materials.find(m => m.id === mov.materialId);
                  const prj = data.projects.find(p => p.id === mov.proyectoId);
                  const isEntrada = mov.tipo === 'Entrada';

                  return (
                    <tr key={mov.id}>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        {mov.fecha}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: isEntrada ? 'var(--color-emerald)' : 'var(--color-amber)',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          {isEntrada ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                          {mov.tipo}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {mat ? mat.nombre : 'Material'}
                      </td>
                      <td>
                        <strong style={{ color: isEntrada ? 'var(--color-emerald)' : 'var(--color-amber)' }}>
                          {isEntrada ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                        </strong> {mat?.unidad || 'unidades'}
                      </td>
                      <td>
                        {prj ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={13} style={{ color: 'var(--color-text-muted)' }} />
                            <span>{prj.nombre}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>Recepción en Almacén Central</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        {mov.motivo}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <MaterialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMaterial(null);
        }}
        onSave={saveMaterial}
        material={editingMaterial}
        suppliers={data.suppliers}
      />

      <StockMovementModal
        isOpen={movementModalOpen}
        onClose={() => {
          setMovementModalOpen(false);
          setSelectedMaterialForMove(null);
        }}
        onRegister={registerStockMovement}
        material={selectedMaterialForMove}
        projects={data.projects}
      />
    </div>
  );
}
