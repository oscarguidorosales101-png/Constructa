import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import BackButton from '../common/BackButton';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  CreditCard, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  Check
} from 'lucide-react';

export default function SupplierInvoiceModal({
  isOpen,
  onClose,
  invoice = null,
  fromOrder = null,
  orders = [],
  suppliers = [],
  onSaveInvoice,
  onValidateMatch,
  onSchedulePayment,
  onProcessPayment,
  calculateScheduledDate,
}) {
  const [formData, setFormData] = useState({
    numero: '',
    proveedorId: '',
    ordenCompraId: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    fechaProgramadaPago: '',
    subtotal: 0,
    impuestos: 0,
    total: 0,
    metodoPago: 'Transferencia SPEI',
    observaciones: '',
    estado: 'Pendiente de revisión',
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'threeWayMatch'

  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        setFormData({
          numero: invoice.numero || '',
          proveedorId: invoice.proveedorId || '',
          ordenCompraId: invoice.ordenCompraId || '',
          fechaEmision: invoice.fechaEmision || new Date().toISOString().split('T')[0],
          fechaVencimiento: invoice.fechaVencimiento || '',
          fechaProgramadaPago: invoice.fechaProgramadaPago || '',
          subtotal: Number(invoice.subtotal) || 0,
          impuestos: Number(invoice.impuestos) || 0,
          total: Number(invoice.total) || 0,
          metodoPago: invoice.metodoPago || 'Transferencia SPEI',
          observaciones: invoice.observaciones || '',
          estado: invoice.estado || 'Pendiente de revisión',
        });
      } else if (fromOrder) {
        // Pre-cargar a partir de una orden de compra recibida
        const today = new Date().toISOString().split('T')[0];
        const sup = suppliers.find((s) => s.id === fromOrder.proveedorId);
        const cond = sup?.condicionesPago || fromOrder.condicionesPago || 'Crédito 30 días';
        const calcDueDate = calculateScheduledDate ? calculateScheduledDate(today, cond) : today;

        setFormData({
          numero: '',
          proveedorId: fromOrder.proveedorId || '',
          ordenCompraId: fromOrder.id || '',
          fechaEmision: today,
          fechaVencimiento: calcDueDate,
          fechaProgramadaPago: calcDueDate,
          subtotal: Number(fromOrder.subtotal) || 0,
          impuestos: Number(fromOrder.impuestos) || 0,
          total: Number(fromOrder.total) || 0,
          metodoPago: 'Transferencia SPEI',
          observaciones: `Facturación correspondiente a la Orden de Compra ${fromOrder.numeroOrden}.`,
          estado: 'Pendiente de revisión',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const firstOrder = orders[0];
        const sub = firstOrder ? Number(firstOrder.subtotal) || 1000 : 1000;
        const imp = Math.round(sub * 0.16);

        setFormData({
          numero: '',
          proveedorId: firstOrder?.proveedorId || suppliers[0]?.id || '',
          ordenCompraId: firstOrder?.id || '',
          fechaEmision: today,
          fechaVencimiento: today,
          fechaProgramadaPago: today,
          subtotal: sub,
          impuestos: imp,
          total: sub + imp,
          metodoPago: 'Transferencia SPEI',
          observaciones: '',
          estado: 'Pendiente de revisión',
        });
      }
      setErrors({});
      setActiveTab('datos');
    }
  }, [isOpen, invoice, fromOrder, orders, suppliers, calculateScheduledDate]);

  // Si cambia la orden seleccionada, actualizar proveedor y montos sugeridos
  const handleOrderChange = (orderId) => {
    const selected = orders.find((o) => o.id === orderId);
    if (!selected) {
      setFormData((prev) => ({ ...prev, ordenCompraId: orderId }));
      return;
    }

    const sup = suppliers.find((s) => s.id === selected.proveedorId);
    const cond = sup?.condicionesPago || selected.condicionesPago || 'Crédito 30 días';
    const calcDate = calculateScheduledDate ? calculateScheduledDate(formData.fechaEmision, cond) : formData.fechaEmision;

    setFormData((prev) => ({
      ...prev,
      ordenCompraId: orderId,
      proveedorId: selected.proveedorId || prev.proveedorId,
      subtotal: Number(selected.subtotal) || prev.subtotal,
      impuestos: Number(selected.impuestos) || prev.impuestos,
      total: Number(selected.total) || prev.total,
      fechaVencimiento: calcDate,
      fechaProgramadaPago: calcDate,
    }));
  };

  const handleSubtotalChange = (val) => {
    const sub = Math.max(0, Number(val) || 0);
    const imp = Math.round(sub * 0.16);
    setFormData((prev) => ({
      ...prev,
      subtotal: sub,
      impuestos: imp,
      total: sub + imp,
    }));
  };

  // Validación de Tres Elementos (Requisito 17)
  const matchingResult = useMemo(() => {
    const targetOrder = orders.find((o) => o.id === formData.ordenCompraId);
    if (!targetOrder) {
      return {
        hasDiscrepancy: true,
        discrepancies: ['No se ha vinculado una orden de compra existente.'],
        targetOrder: null,
      };
    }

    const discrepancies = [];

    // 1. Proveedor
    if (formData.proveedorId !== targetOrder.proveedorId) {
      discrepancies.push('El proveedor emisor de la factura no coincide con el proveedor de la orden de compra.');
    }

    // 2. Monto total
    const diff = Math.abs(Number(formData.total) - Number(targetOrder.total));
    if (diff > 1.0) {
      discrepancies.push(`Discrepancia de monto: La factura ($${Number(formData.total).toLocaleString('es-MX')}) no coincide con la orden ($${Number(targetOrder.total).toLocaleString('es-MX')}).`);
    }

    // 3. Recepción física en almacén
    if (!targetOrder.recepcion) {
      discrepancies.push('El pedido aún no cuenta con registro de recepción física en almacén de obra.');
    } else if (targetOrder.recepcion.estadoRecepcion === 'Parcial') {
      discrepancies.push('Recepción parcial registrada en almacén. Existen faltantes o incidencias pendientes de ajuste o nota de crédito.');
    }

    return {
      hasDiscrepancy: discrepancies.length > 0,
      discrepancies,
      targetOrder,
      reception: targetOrder.recepcion || null,
    };
  }, [formData.ordenCompraId, formData.proveedorId, formData.total, orders]);

  const validate = () => {
    const newErrors = {};
    if (!formData.numero.trim()) newErrors.numero = 'Indica el folio fiscal o número de factura.';
    if (!formData.proveedorId) newErrors.proveedorId = 'Selecciona el proveedor.';
    if (!formData.ordenCompraId) newErrors.ordenCompraId = 'Vincula la factura con una orden de compra.';
    if (!formData.total || Number(formData.total) <= 0) newErrors.total = 'El monto total debe ser mayor a cero.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    onSaveInvoice({
      ...(invoice ? { id: invoice.id } : {}),
      ...formData,
      subtotal: Number(formData.subtotal),
      impuestos: Number(formData.impuestos),
      total: Number(formData.total),
      tresViasMatch: {
        revisado: true,
        tieneDiscrepancia: matchingResult.hasDiscrepancy,
        discrepancias: matchingResult.discrepancies,
        resuelto: !matchingResult.hasDiscrepancy,
      },
    });
    onClose();
  };

  const handleProgramPayment = () => {
    if (matchingResult.hasDiscrepancy) {
      alert('Diferencia detectada. Revisa la orden, la recepción y la factura antes de programar el pago.');
      return;
    }
    if (invoice) {
      onSchedulePayment({
        invoiceId: invoice.id,
        fechaPago: formData.fechaProgramadaPago,
        metodoPago: formData.metodoPago,
      });
      onClose();
    }
  };

  const handleExecutePayment = () => {
    if (invoice) {
      onProcessPayment({
        invoiceId: invoice.id,
        metodoPago: formData.metodoPago,
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? `Factura de Proveedor — ${invoice.numero}` : 'Registrar Factura de Proveedor'}
      maxWidth="780px"
    >
      <div>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'datos' ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'datos' ? '#000000' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            Datos de la Factura
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('threeWayMatch')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'threeWayMatch' ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'threeWayMatch' ? '#000000' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Validación de Tres Elementos (Orden + Recepción + Factura)</span>
            {matchingResult.hasDiscrepancy ? (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-rose)' }} />
            ) : (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-emerald)' }} />
            )}
          </button>
        </div>

        {activeTab === 'datos' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              {/* Número de Factura */}
              <div className="constructa-form-group">
                <label className="constructa-label">Folio / Número de Factura *</label>
                <input
                  type="text"
                  name="numero"
                  className={`constructa-input ${errors.numero ? 'input-error' : ''}`}
                  value={formData.numero}
                  onChange={(e) => setFormData((p) => ({ ...p, numero: e.target.value }))}
                  placeholder="Ej. FAC-9821 / F-2026-089"
                />
                {errors.numero && <span className="constructa-error-text">{errors.numero}</span>}
              </div>

              {/* Orden de Compra Vinculada */}
              <div className="constructa-form-group">
                <label className="constructa-label">Orden de Compra Vinculada *</label>
                <select
                  name="ordenCompraId"
                  className={`constructa-input ${errors.ordenCompraId ? 'input-error' : ''}`}
                  value={formData.ordenCompraId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                >
                  <option value="">-- Selecciona la orden de compra --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.numeroOrden} — {o.proveedorNombre} (${Number(o.total || 0).toLocaleString('es-MX')})
                    </option>
                  ))}
                </select>
                {errors.ordenCompraId && <span className="constructa-error-text">{errors.ordenCompraId}</span>}
              </div>

              {/* Proveedor */}
              <div className="constructa-form-group">
                <label className="constructa-label">Proveedor Emisor *</label>
                <select
                  name="proveedorId"
                  className={`constructa-input ${errors.proveedorId ? 'input-error' : ''}`}
                  value={formData.proveedorId}
                  onChange={(e) => setFormData((p) => ({ ...p, proveedorId: e.target.value }))}
                >
                  <option value="">-- Selecciona el proveedor --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre || s.nombreComercial}
                    </option>
                  ))}
                </select>
                {errors.proveedorId && <span className="constructa-error-text">{errors.proveedorId}</span>}
              </div>

              {/* Estado de la Factura */}
              <div className="constructa-form-group">
                <label className="constructa-label">Estado de Gestión</label>
                <select
                  name="estado"
                  className="constructa-input"
                  value={formData.estado}
                  onChange={(e) => setFormData((p) => ({ ...p, estado: e.target.value }))}
                >
                  <option value="Pendiente de revisión">Pendiente de revisión</option>
                  <option value="En revisión">En revisión</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                  <option value="Programada para pago">Programada para pago</option>
                  <option value="Pagada">Pagada</option>
                  <option value="En espera">En espera</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {/* Fechas */}
              <div className="constructa-form-group">
                <label className="constructa-label">Fecha de Emisión</label>
                <input
                  type="date"
                  className="constructa-input"
                  value={formData.fechaEmision}
                  onChange={(e) => setFormData((p) => ({ ...p, fechaEmision: e.target.value }))}
                />
              </div>

              <div className="constructa-form-group">
                <label className="constructa-label">Fecha de Vencimiento Fiscal</label>
                <input
                  type="date"
                  className="constructa-input"
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData((p) => ({ ...p, fechaVencimiento: e.target.value }))}
                />
              </div>

              <div className="constructa-form-group">
                <label className="constructa-label">Fecha Programada de Pago</label>
                <input
                  type="date"
                  className="constructa-input"
                  value={formData.fechaProgramadaPago}
                  onChange={(e) => setFormData((p) => ({ ...p, fechaProgramadaPago: e.target.value }))}
                />
              </div>

              {/* Método de Pago */}
              <div className="constructa-form-group">
                <label className="constructa-label">Método Previsto de Pago</label>
                <select
                  name="metodoPago"
                  className="constructa-input"
                  value={formData.metodoPago}
                  onChange={(e) => setFormData((p) => ({ ...p, metodoPago: e.target.value }))}
                >
                  <option value="Transferencia SPEI">Transferencia electrónica bancaria</option>
                  <option value="Cheque corporativo">Cheque corporativo</option>
                  <option value="Crédito comercial">Crédito comercial autorizado</option>
                  <option value="Otro método">Otro método autorizado por la empresa</option>
                </select>
              </div>

              {/* Desglose Económico */}
              <div className="constructa-form-group">
                <label className="constructa-label">Subtotal Facturado *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="constructa-input"
                  value={formData.subtotal}
                  onChange={(e) => handleSubtotalChange(e.target.value)}
                  required
                />
              </div>

              <div className="constructa-form-group">
                <label className="constructa-label">IVA (16%)</label>
                <input
                  type="number"
                  className="constructa-input"
                  value={formData.impuestos}
                  disabled
                />
              </div>

              <div className="constructa-form-group form-full-width">
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                    MONTO TOTAL DE LA FACTURA
                  </span>
                  <span style={{ fontSize: '1.3rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                    ${Number(formData.total || 0).toLocaleString('es-MX')}
                  </span>
                </div>
              </div>

              <div className="constructa-form-group form-full-width">
                <label className="constructa-label">Observaciones y Notas Contables</label>
                <textarea
                  className="constructa-input"
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData((p) => ({ ...p, observaciones: e.target.value }))}
                  placeholder="Detalles sobre partidas, folio fiscal XML/PDF o instrucciones de liquidación..."
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '20px',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '16px',
              }}
            >
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {invoice ? 'Guardar Cambios' : 'Registrar Factura'}
              </Button>
            </div>
          </form>
        ) : (
          /* TAB 2: Validación de Tres Elementos (Requisito 17) */
          <div>
            {/* Banner de Discrepancia o Coincidencia */}
            {matchingResult.hasDiscrepancy ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <ShieldAlert size={24} style={{ color: 'var(--color-rose)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--color-rose)', fontSize: '0.98rem' }}>
                    Diferencia detectada en la Validación de Tres Elementos
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>
                    Revisa la orden, la recepción y la factura antes de continuar. El sistema no permite procesar pagos automáticos mientras existan discrepancias abiertas.
                  </p>
                  <ul style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '0.82rem', color: 'var(--color-rose)' }}>
                    {matchingResult.discrepancies.map((d, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <CheckCircle2 size={24} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 2px 0', color: 'var(--color-emerald)', fontSize: '0.96rem' }}>
                    Validación Exitosa (3-Way Matching Conforme)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
                    La orden de compra, la recepción física de almacén y el importe facturado coinciden sin inconsistencias.
                  </p>
                </div>
              </div>
            )}

            {/* Comparativa de los 3 Elementos en Columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {/* Elemento 1: Orden de Compra */}
              <div
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                  1. Orden de Compra
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {matchingResult.targetOrder?.numeroOrden || 'Sin orden vinculada'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                  ¿Qué se solicitó?
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Total Orden: <strong>${Number(matchingResult.targetOrder?.total || 0).toLocaleString('es-MX')}</strong></div>
                  <div>Estado: <Badge variant="neutral">{matchingResult.targetOrder?.estado || 'N/A'}</Badge></div>
                </div>
              </div>

              {/* Elemento 2: Recepción Real */}
              <div
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  2. Recepción de Obra
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {matchingResult.reception ? `Recibida (${matchingResult.reception.estadoRecepcion})` : 'Pendiente de entrega'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                  ¿Qué se recibió físicamente?
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Fecha: <strong>{matchingResult.reception?.fechaRecepcion || 'Sin ingreso'}</strong></div>
                  <div>Incidencias: <strong>{matchingResult.reception?.incidencias?.length || 0} registradas</strong></div>
                </div>
              </div>

              {/* Elemento 3: Factura Proveedor */}
              <div
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                  3. Factura del Proveedor
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {formData.numero || 'Sin folio'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                  ¿Qué cobra el proveedor?
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Total Factura: <strong>${Number(formData.total || 0).toLocaleString('es-MX')}</strong></div>
                  <div>Vencimiento: <strong>{formData.fechaVencimiento || 'No fijada'}</strong></div>
                </div>
              </div>
            </div>

            {/* Acciones de Pago Automatizado Administrativo (Requisitos 18, 20, 21) */}
            <div
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
                Flujo de Aprobación y Pago en Sistema
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 14px 0' }}>
                El sistema simula y controla administrativamente el ciclo financiero sin realizar transferencias bancarias externas.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {invoice && invoice.estado !== 'Programada para pago' && invoice.estado !== 'Pagada' && (
                  <Button
                    variant="primary"
                    disabled={matchingResult.hasDiscrepancy}
                    onClick={handleProgramPayment}
                    icon={<Calendar size={15} />}
                  >
                    Programar Pago para {formData.fechaProgramadaPago || 'la fecha calculada'}
                  </Button>
                )}

                {invoice && invoice.estado === 'Programada para pago' && (
                  <Button
                    variant="primary"
                    onClick={handleExecutePayment}
                    icon={<CreditCard size={15} />}
                  >
                    Procesar Liquidación Administrativa
                  </Button>
                )}

                {invoice?.estado === 'Pagada' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCircle2 size={18} />
                    <span>Factura liquidada. Folio: {invoice.pagoInfo?.comprobanteSimulado || 'PAG-CONF-OK'}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
