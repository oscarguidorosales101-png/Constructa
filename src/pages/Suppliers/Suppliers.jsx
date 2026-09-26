import React, { useState, useMemo } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import SupplierModal from '../../components/suppliers/SupplierModal';
import { matchSearch } from '../../utils/searchUtils';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  FileText, 
  Package 
} from 'lucide-react';

export default function Suppliers() {
  const { data, saveSupplier, deleteSupplier, requestConfirm } = useConstructa();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const specialties = useMemo(() => {
    const list = new Set(data.suppliers.map(s => s.especialidad || s.categoria || 'General'));
    return Array.from(list).sort();
  }, [data.suppliers]);

  const filteredSuppliers = useMemo(() => {
    return data.suppliers.filter(s => {
      // Insumos suministrados por este proveedor
      const suppliedMaterials = (data.materials || [])
        .filter(m => m.proveedorId === s.id)
        .map(m => m.nombre);

      const matchesSearch = matchSearch(searchTerm, [
        s.nombre,
        s.nombreComercial,
        s.contacto,
        s.categoria,
        s.especialidad,
        s.rfc,
        s.cif,
        s.email,
        s.telefono,
        s.direccion,
        suppliedMaterials,
      ]);
      
      const currentSpec = s.especialidad || s.categoria || 'General';
      const matchesSpec = selectedSpecialty === 'ALL' || currentSpec === selectedSpecialty;

      return matchesSearch && matchesSpec;
    });
  }, [data.suppliers, data.materials, searchTerm, selectedSpecialty]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setModalOpen(true);
  };

  const handleDelete = (sup) => {
    requestConfirm({
      title: 'Eliminar Proveedor',
      message: `¿Estás seguro de eliminar a "${sup.nombre}"? Los materiales asociados conservarán sus registros.`,
      confirmText: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: () => deleteSupplier(sup.id)
    });
  };

  const getMaterialsCount = (supplierId) => {
    return data.materials.filter(m => m.proveedorId === supplierId).length;
  };

  return (
    <div className="constructa-page">
      {/* Header */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Directorio de Proveedores</h1>
          <p className="constructa-page-subtitle">
            Gestión de fabricantes, contratistas de servicio y distribuidores autorizados de materiales ({data.suppliers.length} homologados).
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreate}>
          Nuevo Proveedor
        </Button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Proveedores Homologados</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {data.suppliers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '4px' }}>
            Alianzas comerciales activas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Activos y Operativos</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {data.suppliers.filter(s => s.estado === 'Activo').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Disponibilidad de suministro
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Rubros Especializados</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '4px' }}>
            {specialties.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Líneas de suministro
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Insumos Provistos</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-amber)', marginTop: '4px' }}>
            {data.materials.filter(m => m.proveedorId).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Materiales vinculados
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="constructa-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <SearchInput
            placeholder="Buscar por razón social, contacto, RFC, insumo..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <select
            className="constructa-input"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="ALL">Todas las Especialidades</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Suppliers Cards */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          isSearch={Boolean(searchTerm || selectedSpecialty !== 'ALL')}
          title="No encontramos resultados para tu búsqueda"
          message="No se encontraron proveedores que coincidan con la búsqueda o el rubro seleccionado."
          actionText="Limpiar búsqueda y filtros"
          onAction={() => {
            setSearchTerm('');
            setSelectedSpecialty('ALL');
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredSuppliers.map(sup => {
            const matCount = getMaterialsCount(sup.id);

            return (
              <div key={sup.id} className="constructa-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {sup.nombre}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 500, marginTop: '2px' }}>
                      {sup.especialidad}
                    </div>
                  </div>
                  <Badge variant={sup.estado === 'Activo' ? 'success' : 'neutral'}>
                    {sup.estado}
                  </Badge>
                </div>

                <div style={{
                  background: 'var(--color-bg-page)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={14} style={{ color: 'var(--color-gold)' }} />
                    <span><strong>Contacto:</strong> {sup.contacto}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--color-emerald)' }} />
                    <span><strong>Teléfono:</strong> {sup.telefono}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: 'var(--color-cyan)' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Email:</strong> {sup.email}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--color-amber)' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Ubicación:</strong> {sup.direccion}
                    </span>
                  </div>
                  {sup.rfc && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span><strong>RFC / CIF:</strong> {sup.rfc}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    <Package size={14} style={{ color: 'var(--color-gold)' }} />
                    <span>{matCount} material{matCount !== 1 ? 'es' : ''} asignado{matCount !== 1 ? 's' : ''}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="sm" variant="secondary" icon={<Edit size={14} />} onClick={() => handleOpenEdit(sup)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => handleDelete(sup)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupplier(null);
        }}
        onSave={saveSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
}
