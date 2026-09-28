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

  // Historial de entregas
  const deliveredOrders = useMemo(() => {
    return supplierOrders.filter((o) => o.recepcion || o.estado === 'Entregada' || o.estado === 'Recibida parcialmente');
  }, [supplierOrders]);

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
      {/* Barra de Navegación Superior con Botón Regresar (Requisitos 30 y 33) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton onClick={onBack} label="← Regresar a Proveedores" />

        <div style={{ display: 'flex', gap: '10px' }}>
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

      {/* Ficha Principal de Perfil del Proveedor (Requisitos 1 y 24) */}
      <div
        className="constructa-card"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(17, 23, 36, 0.95) 100%)',
          borderLeft: '4px solid var(--color-gold)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {supplier.nombre || supplier.nombreComercial}
              </h1>
              <Badge variant={supplier.estado === 'Activo' ? 'success' : 'neutral'}>
                {supplier.estado}
              </Badge>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-gold)', fontWeight: 600, marginTop: '4px' }}>
              {supplier.especialidad || supplier.categoria} {supplier.rfc && `• RFC: ${supplier.rfc}`}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Saldo Pendiente por Pagar</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gold)' }}>
              ${Number(summary?.montoPendiente || 0).toLocaleString('es-MX')}
            </div>
          </div>
        </div>

        {/* Rejilla de Parámetros Comerciales y Contacto */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.86rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Contacto Comercial</span>
              <strong style={{ color: '#ffffff' }}>{supplier.contacto || 'Sin contacto'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={16} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Teléfono</span>
              <strong style={{ color: '#ffffff' }}>{supplier.telefono || 'Sin teléfono'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Correo</span>
              <strong style={{ color: '#ffffff', wordBreak: 'break-all' }}>{supplier.email || 'Sin correo'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} style={{ color: 'var(--color-rose)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Dirección / Logística</span>
              <strong style={{ color: '#ffffff' }}>{supplier.direccion || 'No especificada'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Condiciones de Pago</span>
              <strong style={{ color: '#ffffff' }}>{supplier.condicionesPago || 'Crédito 30 días'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={16} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Tiempo de Entrega</span>
              <strong style={{ color: '#ffffff' }}>{supplier.tiempoEntregaEstimado || '48 a 72 horas'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={16} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Horario de Atención</span>
              <strong style={{ color: '#ffffff' }}>{supplier.horarioAtencion || 'Lunes a Viernes 08:00 - 18:00'}</strong>
            </div>
          </div>
        </div>

        {supplier.observaciones && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
            <strong>Observaciones y Acuerdos:</strong> {supplier.observaciones}
          </div>
        )}
      </div>

      {/* Resumen Financiero Dinámico del Proveedor (Requisito 24) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pedidos Pendientes</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>
            {summary?.pedidosPendientesCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.pedidosPendientesMonto || 0).toLocaleString('es-MX')} en tránsito
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pedidos Entregados</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {summary?.pedidosEntregadosCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.pedidosEntregadosMonto || 0).toLocaleString('es-MX')} recibidos
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Facturas por Pagar</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '4px' }}>
            {summary?.facturasPendientesCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.facturasPendientesMonto || 0).toLocaleString('es-MX')} por liquidar
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pagos Programados</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-sky)', marginTop: '4px' }}>
            {summary?.pagosProgramadosCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.pagosProgramadosMonto || 0).toLocaleString('es-MX')} calendarizados
          </div>
        </div>

        <div className="constructa-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pagos Realizados</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {summary?.pagosRealizadosCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            ${Number(summary?.pagosRealizadosMonto || 0).toLocaleString('es-MX')} liquidados
          </div>
        </div>
      </div>

      {/* Pestañas de Historiales del Proveedor */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '20px' }}>
        {[
          { key: 'pedidos', label: `Historial de Pedidos (${supplierOrders.length})` },
          { key: 'entregas', label: `Entregas y Recepciones (${deliveredOrders.length})` },
          { key: 'incidencias', label: `Incidencias (${allIncidents.length})` },
          { key: 'pagos', label: `Facturas y Pagos (${supplierInvoicesList.length})` },
          { key: 'materiales', label: `Insumos Homologados (${supplierMaterials.length})` },
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

      {/* Contenido de la Pestaña Activa */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {supplierOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="constructa-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: '#ffffff', fontSize: '0.98rem' }}>{ord.numeroOrden}</strong>
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
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Proyecto: <strong>{ord.proyectoNombre}</strong> • {ord.materiales?.length || 0} insumos
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Emitida: {ord.fechaCreacion} • Entrega prevista: {ord.fechaPrometida || ord.fechaSolicitada}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Importe</span>
                      <strong style={{ color: 'var(--color-gold)', fontSize: '1.05rem' }}>
                        ${Number(ord.total || 0).toLocaleString('es-MX')}
                      </strong>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onOpenOrderTracking(ord)}
                    >
                      Ver Seguimiento
                    </Button>
                  </div>
                </div>
              ))}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deliveredOrders.map((ord) => (
                <div key={ord.id} className="constructa-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                        Recepción Orden {ord.numeroOrden}
                      </strong>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>
                        {ord.proyectoNombre}
                      </span>
                    </div>
                    <Badge variant={ord.recepcion?.estadoRecepcion === 'Parcial' ? 'warning' : 'success'}>
                      Recepción {ord.recepcion?.estadoRecepcion || 'Completa'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Fecha de recepción en obra: <strong>{ord.recepcion?.fechaRecepcion || ord.fechaRealEntrega}</strong> • Recibió: {ord.recepcion?.responsable || 'Almacén'}
                  </div>

                  {ord.recepcion?.itemsRecibidos && (
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                      {ord.recepcion.itemsRecibidos.map((it, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                          <span>{it.materialNombre}</span>
                          <strong>
                            {it.cantidadRecibida} de {it.cantidadPedida} {it.unidad}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. INCIDENCIAS */}
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
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#ffffff' }}>
                Proveedor Sin Incidencias Reportadas
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Todas las entregas han sido recibidas con calidad y cantidad conforme a los pedidos.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allIncidents.map((inc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={18} style={{ color: 'var(--color-rose)' }} />
                    <div>
                      <strong style={{ color: 'var(--color-rose)', textTransform: 'capitalize', fontSize: '0.88rem' }}>
                        {inc.tipo.replace('_', ' ')}
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {inc.descripcion} {inc.cantidadAfectada > 0 && `(${inc.cantidadAfectada} unidades)`}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <div>Orden: {inc.numeroOrden}</div>
                    <div>Fecha: {inc.fechaRecepcion || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. FACTURAS Y PAGOS */}
      {activeTab === 'pagos' && (
        <div>
          {supplierInvoicesList.length === 0 ? (
            <EmptyState
              title="Sin facturas registradas"
              message="No se han registrado facturas ni comprobantes fiscales para este proveedor."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {supplierInvoicesList.map((fac) => (
                <div
                  key={fac.id}
                  className="constructa-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: '#ffffff', fontSize: '0.98rem' }}>{fac.numero}</strong>
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
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Orden Ref: <strong>{fac.ordenNumero}</strong> • Proyecto: {fac.proyectoNombre}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Emisión: {fac.fechaEmision} • Vencimiento: {fac.fechaVencimiento} {fac.fechaProgramadaPago && `• Prog. Pago: ${fac.fechaProgramadaPago}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Monto Total</span>
                      <strong style={{ color: 'var(--color-gold)', fontSize: '1.05rem' }}>
                        ${Number(fac.total || 0).toLocaleString('es-MX')}
                      </strong>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onOpenInvoiceModal(fac)}
                    >
                      Detalle Factura
                    </Button>
                  </div>
                </div>
              ))}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {supplierMaterials.map((mat) => (
                <div key={mat.id} className="constructa-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                    {mat.codigo || mat.id}
                  </div>
                  <h4 style={{ margin: '4px 0 8px 0', fontSize: '0.95rem', color: '#ffffff' }}>
                    {mat.nombre}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginTop: '10px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Stock Disponible:</span>
                    <strong style={{ color: (mat.stockActual ?? mat.stock) <= mat.stockMinimo ? 'var(--color-rose)' : '#ffffff' }}>
                      {mat.stockActual ?? mat.stock} {mat.unidad}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginTop: '4px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Precio Unitario:</span>
                    <strong style={{ color: 'var(--color-gold)' }}>
                      ${Number(mat.precioUnitario || 0).toLocaleString('es-MX')}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. COMUNICACIONES */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {supplierComms.map((com) => (
                <div key={com.id} className="constructa-card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge variant="gold">{com.medio}</Badge>
                        <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{com.motivo}</strong>
                        {com.ordenNumero && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            • Ref: {com.ordenNumero}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        Atendió: <strong style={{ color: '#ffffff' }}>{com.personaContactada}</strong> • Registró: {com.registradoPor}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-emerald)', marginTop: '2px', fontWeight: 500 }}>
                        Resultado: {com.resultado}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                      <div>{com.fecha}</div>
                      <div>{com.hora}</div>
                    </div>
                  </div>

                  {com.observaciones && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      <em>"{com.observaciones}"</em>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
