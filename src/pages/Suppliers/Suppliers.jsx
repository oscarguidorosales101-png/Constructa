import React, { useState, useMemo, useEffect } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import BackButton from '../../components/common/BackButton';
import { matchSearch } from '../../utils/searchUtils';

// Modales y Vistas Especializadas
import SupplierModal from '../../components/suppliers/SupplierModal';
import SupplierDetailView from '../../components/suppliers/SupplierDetailView';
import MaterialRequestModal from '../../components/suppliers/MaterialRequestModal';
import PurchaseOrderModal from '../../components/suppliers/PurchaseOrderModal';
import OrderTrackingModal from '../../components/suppliers/OrderTrackingModal';
import OrderReceptionModal from '../../components/suppliers/OrderReceptionModal';
import SupplierCommunicationModal from '../../components/suppliers/SupplierCommunicationModal';
import SupplierInvoiceModal from '../../components/suppliers/SupplierInvoiceModal';

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
  Package, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  CreditCard,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Eye
} from 'lucide-react';

export default function Suppliers() {
  const { 
    data, 
    saveSupplier, 
    deleteSupplier, 
    materialRequests = [],
    saveMaterialRequest,
    deleteMaterialRequest,
    updateMaterialRequestStatus,
    purchaseOrders = [],
    savePurchaseOrder,
    deletePurchaseOrder,
    updatePurchaseOrderStatus,
    confirmPurchaseOrder,
    updatePurchaseOrderDeliveryDate,
    registerOrderReception,
    supplierInvoices = [],
    saveSupplierInvoice,
    deleteSupplierInvoice,
    validateThreeWayMatch,
    scheduleInvoicePayment,
    processInvoicePayment,
    supplierCommunications = [],
    saveSupplierCommunication,
    getSupplierFinancialSummary,
    calculateScheduledPaymentDate,
    navigationIntent,
    clearNavigationIntent,
    requestConfirm,
    formatCurrency,
    formatDate,
  } = useConstructa();

  // Vista activa y navegación interna
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [activeTab, setActiveTab] = useState('directorio'); // 'directorio' | 'solicitudes' | 'ordenes' | 'recepcion' | 'facturas'

  // Filtros y búsquedas
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState('ALL');

  // Estados de Modales
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [initialRequestMaterial, setInitialRequestMaterial] = useState(null);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderFromRequest, setOrderFromRequest] = useState(null);

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const [receptionModalOpen, setReceptionModalOpen] = useState(false);
  const [receptionOrder, setReceptionOrder] = useState(null);

  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commSupplier, setCommSupplier] = useState(null);
  const [commOrder, setCommOrder] = useState(null);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceFromOrder, setInvoiceFromOrder] = useState(null);

  // Atender intenciones de navegación cruzada (ej. desde Alerta de Stock en Materiales)
  useEffect(() => {
    if (navigationIntent) {
      if (navigationIntent.openRequestModal) {
        setActiveTab('solicitudes');
        setInitialRequestMaterial(navigationIntent.material || null);
        setEditingRequest(null);
        setRequestModalOpen(true);
      } else if (navigationIntent.activeTab) {
        setActiveTab(navigationIntent.activeTab);
      } else if (navigationIntent.supplierId) {
        setSelectedSupplierId(navigationIntent.supplierId);
      }
      if (clearNavigationIntent) clearNavigationIntent();
    }
  }, [navigationIntent, clearNavigationIntent]);

  // Especialidades únicas de proveedores
  const specialties = useMemo(() => {
    const list = new Set((data.suppliers || []).map((s) => s.especialidad || s.categoria || 'General'));
    return Array.from(list).sort();
  }, [data.suppliers]);

  // Proveedores filtrados
  const filteredSuppliers = useMemo(() => {
    return (data.suppliers || []).filter((s) => {
      const suppliedMaterials = (data.materials || [])
        .filter((m) => m.proveedorId === s.id)
        .map((m) => m.nombre);

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

  // Solicitudes filtradas
  const filteredRequests = useMemo(() => {
    return (materialRequests || []).filter((r) => {
      const matchesSearch = matchSearch(searchTerm, [
        r.numero,
        r.materialNombre,
        r.proyectoNombre,
        r.proveedorSugeridoNombre,
        r.prioridad,
        r.estado,
        r.observaciones,
      ]);
      const matchesStatus = selectedFilterStatus === 'ALL' || r.estado === selectedFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [materialRequests, searchTerm, selectedFilterStatus]);

  // Órdenes filtradas
  const filteredOrders = useMemo(() => {
    return (purchaseOrders || []).filter((o) => {
      const matNames = (o.materiales || []).map((m) => m.materialNombre);
      const matchesSearch = matchSearch(searchTerm, [
        o.numeroOrden,
        o.proveedorNombre,
        o.proyectoNombre,
        o.estado,
        matNames,
        o.observaciones,
      ]);
      const matchesStatus = selectedFilterStatus === 'ALL' || o.estado === selectedFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, selectedFilterStatus]);

  // Facturas filtradas
  const filteredInvoices = useMemo(() => {
    return (supplierInvoices || []).filter((f) => {
      const matchesSearch = matchSearch(searchTerm, [
        f.numero,
        f.proveedorNombre,
        f.ordenNumero,
        f.proyectoNombre,
        f.estado,
        f.metodoPago,
      ]);
      const matchesStatus = selectedFilterStatus === 'ALL' || f.estado === selectedFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [supplierInvoices, searchTerm, selectedFilterStatus]);

  // Métricas agregadas de compras
  const procurementStats = useMemo(() => {
    const orders = purchaseOrders || [];
    const invoices = supplierInvoices || [];
    const requests = materialRequests || [];

    const pendingOrders = orders.filter((o) => !['Entregada', 'Recibida parcialmente', 'Cancelada'].includes(o.estado)).length;
    const inTransit = orders.filter((o) => o.estado === 'En camino').length;
    const partialDeliveries = orders.filter((o) => o.estado === 'Recibida parcialmente').length;
    const scheduledPay = invoices.filter((f) => f.estado === 'Programada para pago').length;
    const totalCommitted = orders.filter((o) => !['Cancelada', 'Borrador'].includes(o.estado)).reduce((a, b) => a + (Number(b.total) || 0), 0);

    return {
      pendingOrders,
      inTransit,
      partialDeliveries,
      scheduledPay,
      totalCommitted,
      pendingRequests: requests.filter((r) => r.estado === 'Pendiente' || r.estado === 'En revisión').length,
    };
  }, [purchaseOrders, supplierInvoices, materialRequests]);

  // Handlers para Proveedores
  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setSupplierModalOpen(true);
  };

  const handleDeleteSupplier = (sup) => {
    requestConfirm({
      title: 'Eliminar Proveedor',
      message: `¿Estás seguro de eliminar a "${sup.nombre || sup.nombreComercial}"? Los materiales y órdenes asociadas conservarán sus registros.`,
      confirmText: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: () => deleteSupplier(sup.id),
    });
  };

  // Handlers para Solicitudes
  const handleOpenCreateRequest = () => {
    setEditingRequest(null);
    setInitialRequestMaterial(null);
    setRequestModalOpen(true);
  };

  const handleConvertRequestToOrder = (req) => {
    setOrderFromRequest(req);
    setEditingOrder(null);
    setOrderModalOpen(true);
  };

  // Handlers para Órdenes
  const handleOpenCreateOrder = (suggestedSup = null) => {
    setEditingOrder(null);
    setOrderFromRequest(null);
    setOrderModalOpen(true);
  };

  const handleOpenTracking = (ord) => {
    setTrackingOrder(ord);
    setTrackingModalOpen(true);
  };

  const handleOpenReception = (ord) => {
    setReceptionOrder(ord);
    setReceptionModalOpen(true);
  };

  const handleOpenComm = (sup, ord = null) => {
    setCommSupplier(sup);
    setCommOrder(ord);
    setCommModalOpen(true);
  };

  const handleOpenInvoiceModal = (inv = null, ord = null) => {
    setEditingInvoice(inv);
    setInvoiceFromOrder(ord);
    setInvoiceModalOpen(true);
  };

  // =========================================================================
  // SUB-VISTA: DETALLE DE PROVEEDOR (Requisitos 1, 24, 30, 33)
  // =========================================================================
  if (selectedSupplierId) {
    return (
      <SupplierDetailView
        supplierId={selectedSupplierId}
        onBack={() => setSelectedSupplierId(null)}
        suppliers={data.suppliers || []}
        materials={data.materials || []}
        purchaseOrders={purchaseOrders}
        supplierInvoices={supplierInvoices}
        supplierCommunications={supplierCommunications}
        onOpenEdit={handleOpenEditSupplier}
        onOpenOrder={(sup) => handleOpenCreateOrder(sup)}
        onOpenCommunication={(sup) => handleOpenComm(sup)}
        onOpenOrderTracking={handleOpenTracking}
        onOpenInvoiceModal={(inv) => handleOpenInvoiceModal(inv)}
        getSupplierSummary={getSupplierFinancialSummary}
      />
    );
  }

  // =========================================================================
  // VISTA PRINCIPAL: CENTRO DE ABASTECIMIENTO Y PROVEEDORES
  // =========================================================================
  return (
    <div className="constructa-page">
      {/* Header Principal */}
      <div className="constructa-page-header">
        <div>
          <h1 className="constructa-page-title">Gestión de Abastecimiento & Proveedores</h1>
          <p className="constructa-page-subtitle">
            Control integral del ciclo de compras: solicitudes de obra, órdenes de compra, seguimiento logístico, recepción de materiales y validación de facturas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {activeTab === 'directorio' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateSupplier}>
              Nuevo Proveedor
            </Button>
          )}
          {activeTab === 'solicitudes' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateRequest}>
              Nueva Solicitud de Material
            </Button>
          )}
          {activeTab === 'ordenes' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => handleOpenCreateOrder()}>
              Emitir Orden de Compra
            </Button>
          )}
          {activeTab === 'facturas' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => handleOpenInvoiceModal()}>
              Registrar Factura
            </Button>
          )}
        </div>
      </div>

      {/* KPI Grid de Abastecimiento (Datos reales de compras) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div className="constructa-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('directorio')}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Proveedores Homologados</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
            {data.suppliers?.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '2px' }}>
            Alianzas comerciales activas
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('ordenes')}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Órdenes en Seguimiento</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '4px' }}>
            {procurementStats.pendingOrders}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', marginTop: '2px' }}>
            {procurementStats.inTransit} pedido(s) en camino
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('solicitudes')}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Solicitudes Pendientes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-amber)', marginTop: '4px' }}>
            {procurementStats.pendingRequests}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Requerimientos de obra
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('recepcion')}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Recepciones Parciales</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: procurementStats.partialDeliveries > 0 ? 'var(--color-rose)' : 'var(--color-emerald)', marginTop: '4px' }}>
            {procurementStats.partialDeliveries}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {procurementStats.partialDeliveries > 0 ? 'Con faltantes reportados' : 'Almacén al día'}
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('facturas')}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pagos Programados</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
            {procurementStats.scheduledPay}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '2px' }}>
            Compromisos calendarizados
          </div>
        </div>
      </div>

      {/* Barra de Pestañas del Módulo */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '10px',
          marginBottom: '20px',
        }}
      >
        {[
          { key: 'directorio', label: `Directorio de Proveedores (${data.suppliers?.length || 0})` },
          { key: 'solicitudes', label: `Solicitudes de Material (${materialRequests?.length || 0})` },
          { key: 'ordenes', label: `Órdenes de Compra & Seguimiento (${purchaseOrders?.length || 0})` },
          { key: 'recepcion', label: `Recepción & Control de Calidad` },
          { key: 'facturas', label: `Facturas & Pagos Programados (${supplierInvoices?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedFilterStatus('ALL');
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === tab.key ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === tab.key ? '#000000' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="constructa-card" style={{ padding: '14px 18px', marginBottom: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
          <SearchInput
            placeholder="Buscar por nombre, código, material, proyecto, folio..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {activeTab === 'directorio' && (
            <select
              className="constructa-input"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="ALL">Todas las Especialidades</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          )}

          {activeTab === 'solicitudes' && (
            <select
              className="constructa-input"
              value={selectedFilterStatus}
              onChange={(e) => setSelectedFilterStatus(e.target.value)}
            >
              <option value="ALL">Todos los Estados de Solicitud</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En revisión">En revisión</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Convertida en pedido">Convertida en pedido</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          )}

          {activeTab === 'ordenes' && (
            <select
              className="constructa-input"
              value={selectedFilterStatus}
              onChange={(e) => setSelectedFilterStatus(e.target.value)}
            >
              <option value="ALL">Todos los Estados de Orden</option>
              <option value="Borrador">Borrador</option>
              <option value="Pendiente de aprobación">Pendiente de aprobación</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Enviada al proveedor">Enviada al proveedor</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Preparando pedido">Preparando pedido</option>
              <option value="En camino">En camino</option>
              <option value="Recibida parcialmente">Recibida parcialmente</option>
              <option value="Entregada">Entregada</option>
            </select>
          )}

          {activeTab === 'facturas' && (
            <select
              className="constructa-input"
              value={selectedFilterStatus}
              onChange={(e) => setSelectedFilterStatus(e.target.value)}
            >
              <option value="ALL">Todos los Estados de Factura</option>
              <option value="Pendiente de revisión">Pendiente de revisión</option>
              <option value="En revisión">En revisión</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Programada para pago">Programada para pago</option>
              <option value="Pagada">Pagada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: DIRECTORIO DE PROVEEDORES                                      */}
      {/* ========================================================================= */}
      {activeTab === 'directorio' && (
        <div>
          {filteredSuppliers.length === 0 ? (
            <EmptyState
              isSearch={Boolean(searchTerm || selectedSpecialty !== 'ALL')}
              title="No encontramos proveedores"
              message="No se encontraron proveedores que coincidan con los criterios de búsqueda."
              actionText="Limpiar filtros"
              onAction={() => {
                setSearchTerm('');
                setSelectedSpecialty('ALL');
              }}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredSuppliers.map((sup) => {
                const matCount = (data.materials || []).filter((m) => m.proveedorId === sup.id).length;
                const activeOrdersCount = (purchaseOrders || []).filter(
                  (o) => o.proveedorId === sup.id && !['Entregada', 'Cancelada'].includes(o.estado)
                ).length;

                return (
                  <div
                    key={sup.id}
                    className="constructa-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            margin: 0,
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedSupplierId(sup.id)}
                        >
                          {sup.nombre || sup.nombreComercial}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 500, marginTop: '2px' }}>
                          {sup.especialidad || sup.categoria}
                        </div>
                      </div>

                      <Badge variant={sup.estado === 'Activo' ? 'success' : 'neutral'}>
                        {sup.estado}
                      </Badge>
                    </div>

                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '0.84rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={14} style={{ color: 'var(--color-gold)' }} />
                        <span><strong>Contacto:</strong> {sup.contacto}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} style={{ color: 'var(--color-emerald)' }} />
                        <span><strong>Tel:</strong> {sup.telefono}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={14} style={{ color: 'var(--color-gold)' }} />
                        <span><strong>Condición:</strong> {sup.condicionesPago || 'Crédito 30 días'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={14} style={{ color: 'var(--color-cyan)' }} />
                        <span><strong>Entrega:</strong> {sup.tiempoEntregaEstimado || '48 a 72 hrs'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {matCount} insumos • <strong style={{ color: 'var(--color-gold)' }}>{activeOrdersCount} órdenes activas</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Eye size={13} />}
                          onClick={() => setSelectedSupplierId(sup.id)}
                        >
                          Ver Ficha
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Phone size={13} />}
                          onClick={() => handleOpenComm(sup)}
                        >
                          Contactar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Edit size={13} />}
                          onClick={() => handleOpenEditSupplier(sup)}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<Trash2 size={13} />}
                          onClick={() => handleDeleteSupplier(sup)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: SOLICITUDES DE MATERIALES (Requisitos 4 y 5)                   */}
      {/* ========================================================================= */}
      {activeTab === 'solicitudes' && (
        <div>
          {filteredRequests.length === 0 ? (
            <EmptyState
              title="No hay solicitudes de material"
              message="Genera solicitudes de insumos desde los proyectos o mediante alertas de existencias bajas de inventario."
              actionText="Nueva Solicitud"
              onAction={handleOpenCreateRequest}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="constructa-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{req.numero}</strong>
                      <Badge
                        variant={
                          req.prioridad === 'Urgente'
                            ? 'danger'
                            : req.prioridad === 'Alta'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {req.prioridad}
                      </Badge>
                      <Badge
                        variant={
                          req.estado === 'Aprobada'
                            ? 'success'
                            : req.estado === 'Convertida en pedido'
                            ? 'info'
                            : req.estado === 'Rechazada'
                            ? 'danger'
                            : 'gold'
                        }
                      >
                        {req.estado}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>
                      {req.cantidad} {req.unidad} de {req.materialNombre}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Destino: <strong>{req.proyectoNombre}</strong> • Origen: <em>{req.origen}</em> • Requerido para: <strong style={{ color: 'var(--color-gold)' }}>{req.fechaNecesaria}</strong>
                    </div>

                    {req.observaciones && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Nota: {req.observaciones}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {req.estado === 'Pendiente' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => updateMaterialRequestStatus(req.id, 'Aprobada')}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMaterialRequestStatus(req.id, 'Rechazada')}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}

                    {req.estado === 'Aprobada' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<ShoppingCart size={14} />}
                        onClick={() => handleConvertRequestToOrder(req)}
                      >
                        Convertir en Orden de Compra
                      </Button>
                    )}

                    {req.estado === 'Convertida en pedido' && req.ordenCompraId && (
                      <Badge variant="info">Vinculada a {req.ordenCompraId}</Badge>
                    )}

                    <Button
                      size="sm"
                      variant="danger"
                      icon={<Trash2 size={13} />}
                      onClick={() => deleteMaterialRequest(req.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: ÓRDENES DE COMPRA & SEGUIMIENTO (Requisitos 6 a 10)            */}
      {/* ========================================================================= */}
      {activeTab === 'ordenes' && (
        <div>
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No hay órdenes de compra"
              message="No se encontraron órdenes de compra registradas con los filtros actuales."
              actionText="Emitir Orden de Compra"
              onAction={() => handleOpenCreateOrder()}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredOrders.map((ord) => {
                const sup = (data.suppliers || []).find((s) => s.id === ord.proveedorId);
                const isDelayed = ord.fechaPrometida && ord.fechaSolicitada && ord.fechaPrometida > ord.fechaSolicitada;

                return (
                  <div
                    key={ord.id}
                    className="constructa-card"
                    style={{
                      padding: '18px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>{ord.numeroOrden}</strong>
                        <Badge
                          variant={
                            ord.estado === 'Entregada'
                              ? 'success'
                              : ord.estado === 'Recibida parcialmente'
                              ? 'warning'
                              : ord.estado === 'En camino'
                              ? 'info'
                              : ord.estado === 'Confirmada'
                              ? 'emerald'
                              : 'gold'
                          }
                        >
                          {ord.estado}
                        </Badge>
                        {isDelayed && ord.estado !== 'Entregada' && (
                          <Badge variant="warning">Entrega retrasada</Badge>
                        )}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        Proveedor: <strong style={{ color: '#ffffff' }}>{ord.proveedorNombre}</strong> • Proyecto: <strong>{ord.proyectoNombre}</strong>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {(ord.materiales || []).map((m) => `${m.materialNombre} (${m.cantidad} ${m.unidad})`).join(', ')}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Entrega prometida: <strong style={{ color: isDelayed ? 'var(--color-rose)' : 'var(--color-gold)' }}>{ord.fechaPrometida}</strong> • Condiciones: {ord.condicionesPago}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Orden</span>
                        <strong style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>
                          ${Number(ord.total || 0).toLocaleString('es-MX')}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenTracking(ord)}
                        >
                          Seguimiento
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Phone size={13} />}
                          onClick={() => handleOpenComm(sup || { id: ord.proveedorId, nombre: ord.proveedorNombre }, ord)}
                          title="Contactar al proveedor"
                        >
                          Contactar
                        </Button>

                        {ord.estado !== 'Entregada' && ord.estado !== 'Cancelada' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenReception(ord)}
                          >
                            Recepción
                          </Button>
                        )}

                        {!ord.facturaId && (ord.estado === 'Entregada' || ord.estado === 'Recibida parcialmente' || ord.estado === 'En camino') && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<FileText size={13} />}
                            onClick={() => handleOpenInvoiceModal(null, ord)}
                          >
                            Registrar Factura
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: RECEPCIÓN & CONTROL DE CALIDAD (Requisitos 11 a 15)            */}
      {/* ========================================================================= */}
      {activeTab === 'recepcion' && (
        <div>
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: 'var(--color-sky)',
              lineHeight: '1.5',
            }}
          >
            <strong>Validación de Existencias Físicas:</strong> Cada registro de recepción compara las cantidades solicitadas en la orden contra las efectivamente recibidas en almacén de obra. Si se detectan faltantes o averías, se asienta la incidencia y el inventario sólo se incrementa por la cantidad física conforme.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(purchaseOrders || [])
              .filter((o) => o.recepcion || o.estado === 'En camino' || o.estado === 'Enviada al proveedor')
              .map((ord) => {
                const rec = ord.recepcion;
                return (
                  <div key={ord.id} className="constructa-card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{ord.numeroOrden}</strong>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>
                          {ord.proveedorNombre} • {ord.proyectoNombre}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge variant={rec?.estadoRecepcion === 'Parcial' ? 'warning' : rec ? 'success' : 'info'}>
                          {rec ? `Recepción ${rec.estadoRecepcion}` : 'En tránsito hacia obra'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenReception(ord)}
                        >
                          {rec ? 'Revisar / Modificar Recepción' : 'Registrar Recepción'}
                        </Button>
                      </div>
                    </div>

                    {rec ? (
                      <div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                          Recibido el: <strong>{rec.fechaRecepcion}</strong> por: {rec.responsable}
                        </div>

                        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                          {(rec.itemsRecibidos || []).map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                              <span>{it.materialNombre}</span>
                              <strong style={{ color: it.cantidadRecibida < it.cantidadPedida ? 'var(--color-rose)' : 'var(--color-emerald)' }}>
                                {it.cantidadRecibida} de {it.cantidadPedida} {it.unidad}
                              </strong>
                            </div>
                          ))}
                        </div>

                        {rec.incidencias?.length > 0 && (
                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {rec.incidencias.map((inc, i) => (
                              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-rose)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertTriangle size={14} />
                                <span>{inc.tipo}: {inc.descripcion}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                        Pedido en tránsito con arribo previsto para el <strong>{ord.fechaPrometida}</strong>. Haz clic en "Registrar Recepción" una vez que el transporte descargue en obra.
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 5: FACTURAS & PAGOS PROGRAMADOS (Requisitos 16 a 23)              */}
      {/* ========================================================================= */}
      {activeTab === 'facturas' && (
        <div>
          {/* Clasificación de Pagos Programados (Requisito 20) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="constructa-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-sky)', fontWeight: 600 }}>Próximos Pagos</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                {(supplierInvoices || []).filter((f) => f.estado === 'Programada para pago').length} facturas
              </div>
            </div>

            <div className="constructa-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-rose)', fontWeight: 600 }}>Vencidos / Urgentes</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '4px' }}>
                {(supplierInvoices || []).filter((f) => f.estado !== 'Pagada' && f.estado !== 'Cancelada' && f.fechaVencimiento && f.fechaVencimiento < new Date().toISOString().split('T')[0]).length} facturas
              </div>
            </div>

            <div className="constructa-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-emerald)', fontWeight: 600 }}>Pagados / Liquidados</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
                {(supplierInvoices || []).filter((f) => f.estado === 'Pagada').length} facturas
              </div>
            </div>

            <div className="constructa-card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>En Espera / Revisión</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {(supplierInvoices || []).filter((f) => f.estado === 'En revisión' || f.estado === 'Pendiente de revisión').length} facturas
              </div>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <EmptyState
              title="No hay facturas registradas"
              message="No se encontraron comprobantes fiscales asociados con los filtros seleccionados."
              actionText="Registrar Factura"
              onAction={() => handleOpenInvoiceModal()}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredInvoices.map((fac) => {
                const isOverdue = fac.estado !== 'Pagada' && fac.estado !== 'Cancelada' && fac.fechaVencimiento && fac.fechaVencimiento < new Date().toISOString().split('T')[0];
                const hasDiscrepancy = fac.tresViasMatch?.tieneDiscrepancia;

                return (
                  <div
                    key={fac.id}
                    className="constructa-card"
                    style={{
                      padding: '18px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>{fac.numero}</strong>
                        <Badge
                          variant={
                            fac.estado === 'Pagada'
                              ? 'success'
                              : fac.estado === 'Programada para pago'
                              ? 'info'
                              : fac.estado === 'En revisión'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {fac.estado}
                        </Badge>
                        {hasDiscrepancy && (
                          <Badge variant="danger">Discrepancia en 3-Way Match</Badge>
                        )}
                        {isOverdue && (
                          <Badge variant="danger">Vencida</Badge>
                        )}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        Proveedor: <strong style={{ color: '#ffffff' }}>{fac.proveedorNombre}</strong> • Orden: <strong>{fac.ordenNumero}</strong> ({fac.proyectoNombre})
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Emisión: {fac.fechaEmision} • Vencimiento: <strong style={{ color: isOverdue ? 'var(--color-rose)' : 'inherit' }}>{fac.fechaVencimiento}</strong> {fac.fechaProgramadaPago && `• Programada: ${fac.fechaProgramadaPago}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Facturado</span>
                        <strong style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>
                          ${Number(fac.total || 0).toLocaleString('es-MX')}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenInvoiceModal(fac)}
                        >
                          Validación & Detalle
                        </Button>

                        {fac.estado !== 'Pagada' && fac.estado !== 'Programada para pago' && (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={hasDiscrepancy}
                            onClick={() => scheduleInvoicePayment({ invoiceId: fac.id, fechaPago: fac.fechaProgramadaPago })}
                          >
                            Programar Pago
                          </Button>
                        )}

                        {fac.estado === 'Programada para pago' && (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<CreditCard size={14} />}
                            onClick={() => processInvoicePayment({ invoiceId: fac.id })}
                          >
                            Procesar Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALES DEL SISTEMA                                                       */}
      {/* ========================================================================= */}
      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() => {
          setSupplierModalOpen(false);
          setEditingSupplier(null);
        }}
        onSave={saveSupplier}
        supplier={editingSupplier}
      />

      <MaterialRequestModal
        isOpen={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          setEditingRequest(null);
          setInitialRequestMaterial(null);
        }}
        onSave={saveMaterialRequest}
        request={editingRequest}
        initialMaterial={initialRequestMaterial}
        materials={data.materials || []}
        projects={data.projects || []}
        suppliers={data.suppliers || []}
      />

      <PurchaseOrderModal
        isOpen={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          setEditingOrder(null);
          setOrderFromRequest(null);
        }}
        onSave={savePurchaseOrder}
        order={editingOrder}
        fromRequest={orderFromRequest}
        materials={data.materials || []}
        projects={data.projects || []}
        suppliers={data.suppliers || []}
      />

      <OrderTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => {
          setTrackingModalOpen(false);
          setTrackingOrder(null);
        }}
        order={trackingOrder}
        onUpdateStatus={(id, st, com) => updatePurchaseOrderStatus(id, st, com)}
        onConfirmOrder={(id, data) => confirmPurchaseOrder(id, data)}
        onUpdateDeliveryDate={(id, date, reason) => updatePurchaseOrderDeliveryDate(id, date, reason)}
        onOpenCommunication={(ord) => {
          const sup = (data.suppliers || []).find((s) => s.id === ord.proveedorId);
          handleOpenComm(sup || { id: ord.proveedorId, nombre: ord.proveedorNombre }, ord);
        }}
        onOpenReception={(ord) => handleOpenReception(ord)}
      />

      <OrderReceptionModal
        isOpen={receptionModalOpen}
        onClose={() => {
          setReceptionModalOpen(false);
          setReceptionOrder(null);
        }}
        order={receptionOrder}
        onSaveReception={registerOrderReception}
      />

      <SupplierCommunicationModal
        isOpen={commModalOpen}
        onClose={() => {
          setCommModalOpen(false);
          setCommSupplier(null);
          setCommOrder(null);
        }}
        onSave={saveSupplierCommunication}
        supplier={commSupplier}
        order={commOrder}
      />

      <SupplierInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setEditingInvoice(null);
          setInvoiceFromOrder(null);
        }}
        invoice={editingInvoice}
        fromOrder={invoiceFromOrder}
        orders={purchaseOrders}
        suppliers={data.suppliers || []}
        onSaveInvoice={saveSupplierInvoice}
        onValidateMatch={validateThreeWayMatch}
        onSchedulePayment={scheduleInvoicePayment}
        onProcessPayment={processInvoicePayment}
        calculateScheduledDate={calculateScheduledPaymentDate}
      />
    </div>
  );
}
