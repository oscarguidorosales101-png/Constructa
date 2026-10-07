import React, { useState, useMemo } from 'react';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  Clock, 
  Calendar, 
  CreditCard, 
  Package, 
  FileText, 
  AlertTriangle, 
  Plus, 
  Edit, 
  CheckCircle2, 
  Truck,
  DollarSign
} from 'lucide-react';

export default function SupplierDetailView({
  supplierId,
  onBack,
  suppliers = [],
  materials = [],
  purchaseOrders = [],
  supplierInvoices = [],
  supplierCommunications = [],
  onOpenEdit,
  onOpenOrder,
  onOpenCommunication,
  onOpenOrderTracking,
  onOpenInvoiceModal,
  getSupplierSummary,
}) {
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'entregas' | 'incidencias' | 'pagos' | 'materiales' | 'comunicaciones'

  const supplier = useMemo(() => {
    return suppliers.find((s) => s.id === supplierId) || null;
  }, [suppliers, supplierId]);

  const summary = useMemo(() => {
    if (!supplierId || !getSupplierSummary) return null;
    return getSupplierSummary(supplierId);
  }, [supplierId, getSupplierSummary]);

  const supplierMaterials = useMemo(() => {
    return materials.filter((m) => m.proveedorId === supplierId);
  }, [materials, supplierId]);

  const supplierOrders = useMemo(() => {
    return purchaseOrders.filter((o) => o.proveedorId === supplierId);
  }, [purchaseOrders, supplierId]);

  const deliveredOrders = useMemo(() => {
    return supplierOrders.filter((o) => o.recepcion || o.estado === 'Entregada' || o.estado === 'Recibida parcialmente');
  }, [supplierOrders]);

  const supplierInvoicesList = useMemo(() => {
    return supplierInvoices.filter((f) => f.proveedorId === supplierId);
  }, [supplierInvoices, supplierId]);

  const supplierComms = useMemo(() => {
    return supplierCommunications.filter((c) => c.proveedorId === supplierId);
  }, [supplierCommunications, supplierId]);

  // Historial de incidencias agregadas de recepciones
  const allIncidents = useMemo(() => {
    const list = [];
    supplierOrders.forEach((o) => {
      if (o.recepcion && Array.isArray(o.recepcion.incidencias)) {
        o.recepcion.incidencias.forEach((inc) => {
          list.push({
            ...inc,
            numeroOrden: o.numeroOrden,
            fechaRecepcion: o.recepcion.fechaRecepcion,
            proyectoNombre: o.proyectoNombre,
          });
        });
      }
    });
    return list;
  }, [supplierOrders]);

  const inTransitCount = useMemo(() => {
    return supplierOrders.filter((o) => o.estado === 'En camino').length;
  }, [supplierOrders]);

  const scheduledPayments = useMemo(() => {
    return supplierInvoicesList.filter((f) => f.estado === 'Programada para pago');
  }, [supplierInvoicesList]);

  const paidInvoices = useMemo(() => {
    return supplierInvoicesList.filter((f) => f.estado === 'Pagada');
  }, [supplierInvoicesList]);

  if (!supplier) {
    return (
      <div className="constructa-page">
        <BackButton onClick={onBack} label="← Regresar al Directorio" />
        <EmptyState
          title="Proveedor no encontrado"
          message="El proveedor solicitado no existe o fue retirado del sistema."
          actionText="Volver al Listado"
          onAction={onBack}
        />
      </div>
    );
  }

  return (
    <div className="constructa-page" style={{ paddingBottom: '3rem' }}>
      {/* Barra de Navegación Superior con Botón Regresar (Requisito 20) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton onClick={onBack} label="← Regresar al Directorio" />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Phone size={14} />}
            onClick={() => onOpenCommunication(supplier)}
          >
            Registrar Contacto
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => onOpenOrder(supplier)}
          >
            Emitir Orden de Compra
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit size={14} />}
            onClick={() => onOpenEdit(supplier)}
          >
            Editar Ficha
          </Button>
        </div>
      </div>

      {/* Secciones Visualmente Separadas: Información General vs Contacto & Logística (Requisito 10) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Sección 1: Información del Proveedor */}
        <div
          className="constructa-card"
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(17, 23, 36, 0.95) 100%)',
            borderLeft: '4px solid var(--color-gold)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Información del Proveedor
                </span>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '4px 0 0 0' }}>
                  {supplier.nombre || supplier.nombreComercial}
                </h1>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-gold)', fontWeight: 500, marginTop: '2px' }}>
                  {supplier.especialidad || supplier.categoria} {supplier.rfc && `• RFC: ${supplier.rfc}`}
                </div>
              </div>

              <Badge variant={supplier.estado === 'Activo' ? 'success' : supplier.estado === 'En Evaluación' ? 'warning' : 'neutral'}>
                {supplier.estado}
              </Badge>
            </div>

            <div style={{ marginTop: '16px', fontSize: '0.84rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Identificación Fiscal:</span>{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{supplier.rfc || supplier.cif || 'No registrada'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Categoría Especializada:</span>{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{supplier.especialidad || supplier.categoria || 'General'}</strong>
              </div>
              {supplier.observaciones && (
                <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  "{supplier.observaciones}"
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Saldo Pendiente:</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-gold)' }}>
              ${Number(summary?.montoPendiente || 0).toLocaleString('es-MX')}
            </strong>
          </div>
        </div>

        {/* Sección 2: Contacto y Parámetros Comerciales */}
        <div
          className="constructa-card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              Contacto & Logística Comercial
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '12px',
                fontSize: '0.83rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={15} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Contacto</span>
                  <strong style={{ color: 'var(--color-text-primary)' }} className="text-truncate">{supplier.contacto || 'Sin contacto'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={15} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Teléfono</span>
                  <strong style={{ color: 'var(--color-text-primary)' }} className="text-truncate">{supplier.telefono || 'Sin teléfono'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={15} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Correo</span>
                  <strong style={{ color: 'var(--color-text-primary)' }} className="text-truncate" title={supplier.email}>{supplier.email || 'Sin correo'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={15} style={{ color: 'var(--color-rose)', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Ubicación</span>
                  <strong style={{ color: 'var(--color-text-primary)' }} className="text-truncate" title={supplier.direccion}>{supplier.direccion || 'No especificada'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={15} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Condición de Pago</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{supplier.condicionesPago || 'Crédito 30 días'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={15} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Tiempo de Entrega</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{supplier.tiempoEntregaEstimado || '48 a 72 hrs'}</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <Clock size={13} style={{ color: 'var(--color-gold)' }} />
            <span>Horario: {supplier.horarioAtencion || 'Lunes a Viernes 08:00 - 18:00'}</span>
          </div>
        </div>
      </div>

      {/* Resumen Compacto del Proveedor con KPIs Pequeños y Consistentes (Requisito 11) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '22px' }}>
        <div className="constructa-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pedidos Pendientes</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '2px' }}>
            {summary?.pedidosPendientesCount || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.pedidosPendientesMonto || 0).toLocaleString('es-MX')} pendientes
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pedidos en Camino</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '2px' }}>
            {inTransitCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-cyan)', marginTop: '2px' }}>
            En tránsito hacia obra
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Facturas Pendientes</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '2px' }}>
            {summary?.facturasPendientesCount || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.facturasPendientesMonto || 0).toLocaleString('es-MX')} por liquidar
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pagos Programados</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '2px' }}>
            {summary?.pagosProgramadosCount || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.pagosProgramadosMonto || 0).toLocaleString('es-MX')} calendarizados
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pagos Realizados</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '2px' }}>
            {summary?.pagosRealizadosCount || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.pagosRealizadosMonto || 0).toLocaleString('es-MX')} liquidados
          </div>
        </div>
      </div>

      {/* Pestañas de Historiales del Proveedor (Requisitos 10 y 12) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '20px' }}>
        {[
          { key: 'pedidos', label: `Historial de Pedidos (${supplierOrders.length})` },
          { key: 'entregas', label: `Entregas y Recepciones (${deliveredOrders.length})` },
          { key: 'facturas', label: `Facturas (${supplierInvoicesList.length})` },
          { key: 'pagos', label: `Pagos & Liquidaciones (${scheduledPayments.length + paidInvoices.length})` },
          { key: 'materiales', label: `Insumos Homologados (${supplierMaterials.length})` },
          { key: 'incidencias', label: `Incidencias (${allIncidents.length})` },
          { key: 'comunicaciones', label: `Bitácora de Contactos (${supplierComms.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === tab.key ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === tab.key ? '#000000' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de la Pestaña Activa con Tablas en Contenedores Controlados (Requisito 12) */}
      {/* 1. PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div>
          {supplierOrders.length === 0 ? (
            <EmptyState
              title="Sin órdenes de compra registradas"
              message="No se han emitido órdenes de compra para este proveedor todavía."
              actionText="Emitir Primera Orden"
              onAction={() => onOpenOrder(supplier)}
            />
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Folio Orden</th>
                    <th>Proyecto</th>
                    <th>Insumos</th>
                    <th>Fecha Emisión</th>
                    <th>Entrega Prevista</th>
                    <th style={{ textAlign: 'right' }}>Importe Total</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{ord.numeroOrden}</strong>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>
                        {ord.proyectoNombre}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '240px' }} className="text-truncate">
                        {(ord.materiales || []).map((m) => `${m.materialNombre} (${m.cantidad})`).join(', ')}
                      </td>
                      <td>{ord.fechaCreacion}</td>
                      <td>
                        <span style={{ color: 'var(--color-gold)', fontWeight: 500 }}>
                          {ord.fechaPrometida || ord.fechaSolicitada}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-gold)' }}>
                        ${Number(ord.total || 0).toLocaleString('es-MX')}
                      </td>
                      <td>
                        <Badge
                          variant={
                            ord.estado === 'Entregada'
                              ? 'success'
                              : ord.estado === 'Recibida parcialmente'
                              ? 'warning'
                              : ord.estado === 'En camino'
                              ? 'info'
                              : 'neutral'
                          }
                        >
                          {ord.estado}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onOpenOrderTracking(ord)}
                        >
                          Seguimiento
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. ENTREGAS */}
      {activeTab === 'entregas' && (
        <div>
          {deliveredOrders.length === 0 ? (
            <EmptyState
              title="Sin recepciones registradas"
              message="No existen recepciones de mercancía asentadas para este proveedor."
            />
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Orden de Compra</th>
                    <th>Proyecto</th>
                    <th>Fecha de Recepción</th>
                    <th>Responsable Almacén</th>
                    <th>Insumos Recibidos</th>
                    <th>Estado Recepción</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{ord.numeroOrden}</strong>
                      </td>
                      <td>{ord.proyectoNombre}</td>
                      <td>{ord.recepcion?.fechaRecepcion || ord.fechaRealEntrega || 'En tránsito'}</td>
                      <td>{ord.recepcion?.responsable || 'Almacén Central'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {ord.recepcion?.itemsRecibidos?.map((it) => `${it.materialNombre} (${it.cantidadRecibida}/${it.cantidadPedida})`).join(', ') || 'Pendiente'}
                      </td>
                      <td>
                        <Badge variant={ord.recepcion?.estadoRecepcion === 'Parcial' ? 'warning' : 'success'}>
                          {ord.recepcion?.estadoRecepcion || 'Entregada'}
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

      {/* 3. FACTURAS (Requisito 10) */}
      {activeTab === 'facturas' && (
        <div>
          {supplierInvoicesList.length === 0 ? (
            <EmptyState
              title="Sin facturas registradas"
              message="No se han registrado facturas ni comprobantes fiscales para este proveedor."
            />
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Folio Factura</th>
                    <th>Orden Referencia</th>
                    <th>Proyecto</th>
                    <th>Fecha Emisión</th>
                    <th>Fecha Vencimiento</th>
                    <th style={{ textAlign: 'right' }}>Total Facturado</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierInvoicesList.map((fac) => (
                    <tr key={fac.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{fac.numero}</strong>
                      </td>
                      <td>{fac.ordenNumero}</td>
                      <td>{fac.proyectoNombre}</td>
                      <td>{fac.fechaEmision}</td>
                      <td>
                        <span style={{ color: fac.estado !== 'Pagada' && fac.fechaVencimiento < new Date().toISOString().split('T')[0] ? 'var(--color-rose)' : 'inherit' }}>
                          {fac.fechaVencimiento}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-gold)' }}>
                        ${Number(fac.total || 0).toLocaleString('es-MX')}
                      </td>
                      <td>
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
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onOpenInvoiceModal(fac)}
                        >
                          Detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. PAGOS & LIQUIDACIONES (Requisito 10 y 19) */}
      {activeTab === 'pagos' && (
        <div>
          {supplierInvoicesList.length === 0 ? (
            <EmptyState
              title="Sin movimientos de pago"
              message="No existen pagos calendarizados ni transacciones registradas con este proveedor."
            />
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Orden</th>
                    <th>Método Previsto / Utilizado</th>
                    <th>Fecha Programada</th>
                    <th style={{ textAlign: 'right' }}>Monto a Liquidar</th>
                    <th>Estado de Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierInvoicesList.map((fac) => (
                    <tr key={fac.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{fac.numero}</strong>
                      </td>
                      <td>{fac.ordenNumero}</td>
                      <td>{fac.metodoPago || 'Transferencia SPEI'}</td>
                      <td>{fac.fechaProgramadaPago || fac.fechaVencimiento || 'Inmediato'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: fac.estado === 'Pagada' ? 'var(--color-emerald)' : 'var(--color-gold)' }}>
                        ${Number(fac.total || 0).toLocaleString('es-MX')}
                      </td>
                      <td>
                        <Badge
                          variant={
                            fac.estado === 'Pagada'
                              ? 'success'
                              : fac.estado === 'Programada para pago'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {fac.estado === 'Pagada' ? 'Liquidada' : fac.estado === 'Programada para pago' ? 'Programada' : 'Pendiente'}
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

      {/* 5. MATERIALES */}
      {activeTab === 'materiales' && (
        <div>
          {supplierMaterials.length === 0 ? (
            <EmptyState
              title="Sin insumos vinculados"
              message="No hay materiales en el catálogo asociados a este proveedor."
            />
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre del Insumo</th>
                    <th>Stock en Almacén</th>
                    <th>Stock Mínimo</th>
                    <th style={{ textAlign: 'right' }}>Precio Unitario</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierMaterials.map((mat) => {
                    const currentStock = mat.stockActual ?? mat.stock ?? 0;
                    const minStock = mat.stockMinimo || 0;
                    const isLow = currentStock <= minStock;

                    return (
                      <tr key={mat.id}>
                        <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{mat.codigo || mat.id}</td>
                        <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{mat.nombre}</td>
                        <td>
                          <span style={{ color: isLow ? 'var(--color-rose)' : 'var(--color-emerald)', fontWeight: 600 }}>
                            {currentStock} {mat.unidad}
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{minStock} {mat.unidad}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-gold)' }}>
                          ${Number(mat.precioUnitario || 0).toLocaleString('es-MX')}
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

      {/* 6. INCIDENCIAS */}
      {activeTab === 'incidencias' && (
        <div>
          {allIncidents.length === 0 ? (
            <div
              className="constructa-card"
              style={{
                padding: '30px',
                textAlign: 'center',
                color: 'var(--color-emerald)',
              }}
            >
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto' }} />
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                Proveedor Sin Incidencias Reportadas
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Todas las entregas han sido recibidas con calidad y cantidad conforme a los pedidos.
              </p>
            </div>
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Tipo de Incidencia</th>
                    <th>Descripción Detallada</th>
                    <th>Cantidad Afectada</th>
                    <th>Orden Referencia</th>
                    <th>Fecha de Reporte</th>
                  </tr>
                </thead>
                <tbody>
                  {allIncidents.map((inc, idx) => (
                    <tr key={idx}>
                      <td>
                        <span style={{ color: 'var(--color-rose)', fontWeight: 600, textTransform: 'capitalize' }}>
                          {inc.tipo?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{inc.descripcion}</td>
                      <td>
                        <strong style={{ color: 'var(--color-rose)' }}>
                          {inc.cantidadAfectada > 0 ? `${inc.cantidadAfectada} unidades` : 'No cuantificada'}
                        </strong>
                      </td>
                      <td>{inc.numeroOrden} ({inc.proyectoNombre})</td>
                      <td>{inc.fechaRecepcion || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. COMUNICACIONES */}
      {activeTab === 'comunicaciones' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => onOpenCommunication(supplier)}
            >
              Nuevo Registro de Contacto
            </Button>
          </div>

          {supplierComms.length === 0 ? (
            <EmptyState
              title="Sin bitácora de contactos"
              message="No se han registrado llamadas, correos o acuerdos previos con este proveedor."
              actionText="Registrar Primer Contacto"
              onAction={() => onOpenCommunication(supplier)}
            />
          ) : (
            <div className="constructa-table-container">
              <table className="constructa-table">
                <thead>
                  <tr>
                    <th>Fecha & Hora</th>
                    <th>Medio</th>
                    <th>Motivo del Enlace</th>
                    <th>Persona Atendió</th>
                    <th>Registrado Por</th>
                    <th>Resultado / Acuerdo</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierComms.map((com) => (
                    <tr key={com.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div>{com.fecha}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{com.hora}</div>
                      </td>
                      <td>
                        <Badge variant="gold">{com.medio}</Badge>
                      </td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{com.motivo}</strong>
                        {com.ordenNumero && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                            Ref: {com.ordenNumero}
                          </div>
                        )}
                      </td>
                      <td>{com.personaContactada}</td>
                      <td>{com.registradoPor}</td>
                      <td>
                        <span style={{ color: 'var(--color-emerald)', fontWeight: 500 }}>
                          {com.resultado}
                        </span>
                        {com.observaciones && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            "{com.observaciones}"
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
