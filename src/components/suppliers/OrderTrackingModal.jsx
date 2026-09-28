import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import BackButton from '../common/BackButton';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  Phone, 
  Send, 
  Calendar, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

const TRACKING_STAGES = [
  { key: 'Solicitud', label: 'Solicitud', icon: FileCheck },
  { key: 'Aprobada', label: 'Aprobación', icon: ShieldCheck },
  { key: 'Enviada al proveedor', label: 'Orden Enviada', icon: Send },
  { key: 'Confirmada', label: 'Confirmada', icon: CheckCircle2 },
  { key: 'Preparando pedido', label: 'Preparando', icon: Package },
  { key: 'En camino', label: 'En Camino', icon: Truck },
  { key: 'Entregada', label: 'Recibida', icon: CheckCircle2 },
];

export default function OrderTrackingModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onConfirmOrder,
  onUpdateDeliveryDate,
  onOpenCommunication,
  onOpenReception,
}) {
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [showDateForm, setShowDateForm] = useState(false);

  // Formulario de confirmación
  const [confirmData, setConfirmData] = useState({
    confirmado: true,
    confirmDisponibilidad: true,
    confirmCantidad: true,
    confirmPrecio: true,
    confirmFecha: true,
    solicitoModificacion: false,
    detalleModificacion: '',
    noRespondio: false,
    observaciones: '',
  });

  // Formulario de cambio de fecha
  const [newDate, setNewDate] = useState('');
  const [dateReason, setDateReason] = useState('');

  if (!order) return null;

  // Determinar índice actual en la línea de seguimiento
  const currentStageIndex = (() => {
    const st = order.estado;
    if (st === 'Recibida parcialmente' || st === 'Entregada') return 6;
    if (st === 'En camino') return 5;
    if (st === 'Preparando pedido') return 4;
    if (st === 'Confirmada') return 3;
    if (st === 'Enviada al proveedor' || st === 'Enviada') return 2;
    if (st === 'Aprobada') return 1;
    return 0; // Borrador / Solicitud / Pendiente
  })();

  const handleAdvanceStatus = (nextStatus, comment) => {
    onUpdateStatus(order.id, nextStatus, comment);
  };

  const handleSaveConfirmation = (e) => {
    e.preventDefault();
    onConfirmOrder(order.id, confirmData);
    setShowConfirmForm(false);
  };

  const handleSaveDateChange = (e) => {
    e.preventDefault();
    if (!newDate) return;
    onUpdateDeliveryDate(order.id, newDate, dateReason);
    setShowDateForm(false);
    setNewDate('');
    setDateReason('');
  };

  const isDelayed = order.fechaPrometida && order.fechaSolicitada && order.fechaPrometida > order.fechaSolicitada;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Seguimiento Logístico — ${order.numeroOrden}`}
      maxWidth="800px"
    >
      <div>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>

        {/* Encabezado Principal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
              {order.proyectoNombre}
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>
              Proveedor: {order.proveedorNombre}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {(order.materiales || []).map((m) => `${m.materialNombre} (${m.cantidad} ${m.unidad})`).join(', ')}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Badge
              variant={
                order.estado === 'Entregada'
                  ? 'success'
                  : order.estado === 'Recibida parcialmente'
                  ? 'warning'
                  : order.estado === 'En camino'
                  ? 'info'
                  : order.estado === 'Cancelada'
                  ? 'neutral'
                  : 'gold'
              }
            >
              {order.estado}
            </Badge>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '6px' }}>
              ${Number(order.total || 0).toLocaleString('es-MX')}
            </div>
          </div>
        </div>

        {/* Alerta de Retraso si aplica (Requisito 10) */}
        {isDelayed && order.estado !== 'Entregada' && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <AlertTriangle size={22} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                Entrega Reprogramada / Posible Afectación a Cronograma
              </strong>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
                La fecha prometida por el proveedor ({order.fechaPrometida}) difiere de la solicitada inicialmente ({order.fechaSolicitada}). Verifica el impacto en el frente constructivo de {order.proyectoNombre}.
              </div>
            </div>
          </div>
        )}

        {/* Línea de Seguimiento Visual Clara (Requisito 7) */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase' }}>
            Línea de Proceso del Pedido
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${TRACKING_STAGES.length}, 1fr)`,
              gap: '6px',
              position: 'relative',
            }}
          >
            {TRACKING_STAGES.map((st, idx) => {
              const IconComp = st.icon;
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isFuture = idx > currentStageIndex;

              return (
                <div
                  key={st.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    background: isCurrent
                      ? 'rgba(245, 158, 11, 0.15)'
                      : isPast
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isCurrent
                      ? '1px solid var(--color-gold)'
                      : isPast
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid var(--color-border)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                      background: isCurrent
                        ? 'var(--color-gold)'
                        : isPast
                        ? 'var(--color-emerald)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: isCurrent || isPast ? '#000000' : 'var(--color-text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    <IconComp size={15} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent
                        ? 'var(--color-gold)'
                        : isPast
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-muted)',
                    }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Fechas y Compromisos */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Fecha de Emisión</span>
            <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{order.fechaCreacion}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Fecha Solicitada</span>
            <strong style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{order.fechaSolicitada}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', display: 'block' }}>Fecha Prometida</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: 'var(--color-gold)', fontSize: '0.95rem' }}>{order.fechaPrometida}</strong>
              <Button
                size="sm"
                variant="outline"
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={() => setShowDateForm(!showDateForm)}
              >
                Cambiar
              </Button>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Fecha Real de Entrega</span>
            <strong style={{ color: order.fechaRealEntrega ? 'var(--color-emerald)' : 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {order.fechaRealEntrega || 'Pendiente de llegada'}
            </strong>
          </div>
        </div>

        {/* Formulario desplegable para cambiar fecha prometida */}
        {showDateForm && (
          <form
            onSubmit={handleSaveDateChange}
            style={{
              padding: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--color-gold)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gold)' }}>
              Registrar Modificación de Fecha Prometida
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <input
                type="date"
                className="constructa-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
              <input
                type="text"
                className="constructa-input"
                placeholder="Motivo del cambio (ej. Ajuste de transporte pesado, reprogramación del proveedor...)"
                value={dateReason}
                onChange={(e) => setDateReason(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button size="sm" variant="secondary" onClick={() => setShowDateForm(false)}>
                Cancelar
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Guardar Nueva Fecha
              </Button>
            </div>
          </form>
        )}

        {/* Confirmación del Proveedor (Requisitos 8 y 9) */}
        <div
          style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} style={{ color: 'var(--color-gold)' }} />
              <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>
                Estatus de Confirmación del Proveedor
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="sm"
                variant="secondary"
                icon={<Phone size={14} />}
                onClick={() => onOpenCommunication(order)}
              >
                Contactar Proveedor
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirmForm(!showConfirmForm)}
              >
                Registrar Confirmación
              </Button>
            </div>
          </div>

          {order.confirmacionProveedor?.confirmado ? (
            <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-emerald)', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Confirmado el {order.confirmacionProveedor.fechaConfirmacion || 'Recientemente'}</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                {order.confirmacionProveedor.observaciones || 'Disponibilidad, volumen y precio validados satisfactoriamente por el proveedor.'}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.84rem', color: 'var(--color-rose)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>Pendiente de confirmación formal por parte del proveedor.</span>
            </div>
          )}

          {/* Formulario de Confirmación Inline */}
          {showConfirmForm && (
            <form
              onSubmit={handleSaveConfirmation}
              style={{
                marginTop: '14px',
                paddingTop: '14px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={confirmData.confirmDisponibilidad}
                    onChange={(e) => setConfirmData((p) => ({ ...p, confirmDisponibilidad: e.target.checked }))}
                  />
                  Confirmó disponibilidad
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={confirmData.confirmCantidad}
                    onChange={(e) => setConfirmData((p) => ({ ...p, confirmCantidad: e.target.checked }))}
                  />
                  Confirmó cantidad
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={confirmData.confirmPrecio}
                    onChange={(e) => setConfirmData((p) => ({ ...p, confirmPrecio: e.target.checked }))}
                  />
                  Confirmó precio pactado
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={confirmData.confirmFecha}
                    onChange={(e) => setConfirmData((p) => ({ ...p, confirmFecha: e.target.checked }))}
                  />
                  Confirmó fecha de entrega
                </label>
              </div>

              <textarea
                className="constructa-input"
                rows={2}
                placeholder="Detalles de la confirmación (persona que atendió, comentarios del despacho, etc.)..."
                value={confirmData.observaciones}
                onChange={(e) => setConfirmData((p) => ({ ...p, observaciones: e.target.value }))}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button size="sm" variant="secondary" onClick={() => setShowConfirmForm(false)}>
                  Cancelar
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Guardar Confirmación
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Acciones Rápidas de Transición de Estado */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Actualizar Fase de la Orden:
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {order.estado === 'Borrador' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleAdvanceStatus('Aprobada', 'Orden aprobada corporativamente.')}
              >
                Aprobar Orden
              </Button>
            )}

            {order.estado === 'Aprobada' && (
              <Button
                size="sm"
                variant="primary"
                icon={<Send size={14} />}
                onClick={() => handleAdvanceStatus('Enviada al proveedor', 'Notificación formal enviada al proveedor.')}
              >
                Marcar Enviada al Proveedor
              </Button>
            )}

            {order.estado === 'Confirmada' && (
              <Button
                size="sm"
                variant="secondary"
                icon={<Package size={14} />}
                onClick={() => handleAdvanceStatus('Preparando pedido', 'Proveedor inició preparación de embarque.')}
              >
                Marcar en Preparación
              </Button>
            )}

            {(order.estado === 'Confirmada' || order.estado === 'Preparando pedido') && (
              <Button
                size="sm"
                variant="primary"
                icon={<Truck size={14} />}
                onClick={() => handleAdvanceStatus('En camino', 'Mercancía cargada y en ruta hacia el frente de obra.')}
              >
                Marcar En Camino
              </Button>
            )}

            {order.estado !== 'Entregada' && (
              <Button
                size="sm"
                variant="primary"
                icon={<CheckCircle2 size={14} />}
                onClick={() => onOpenReception(order)}
              >
                Registrar Recepción en Almacén
              </Button>
            )}
          </div>
        </div>

        {/* Historial de Trazabilidad y Auditoría (Requisito 29) */}
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase' }}>
            Historial de Operaciones y Trazabilidad ({order.historialEstados?.length || 0})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {(order.historialEstados || []).map((h, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>{h.estado}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)' }}>• {h.usuario}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {h.comentario}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <div>{h.fecha}</div>
                  <div>{h.hora}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
