import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import BackButton from '../common/BackButton';
import { Plus, Trash2, ShoppingCart, Calculator, AlertCircle } from 'lucide-react';

export default function PurchaseOrderModal({
  isOpen,
  onClose,
  onSave,
  order = null,
  fromRequest = null,
  materials = [],
  projects = [],
  suppliers = [],
}) {
  const [formData, setFormData] = useState({
    numeroOrden: '',
    proveedorId: '',
    proyectoId: '',
    materiales: [],
    fechaSolicitada: new Date().toISOString().split('T')[0],
    fechaPrometida: new Date().toISOString().split('T')[0],
    condicionesPago: 'Crédito 30 días',
    observaciones: '',
    estado: 'Borrador',
    solicitudId: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (order) {
        setFormData({
          numeroOrden: order.numeroOrden || '',
          proveedorId: order.proveedorId || '',
          proyectoId: order.proyectoId || '',
          materiales: order.materiales ? [...order.materiales] : [],
          fechaSolicitada: order.fechaSolicitada || new Date().toISOString().split('T')[0],
          fechaPrometida: order.fechaPrometida || order.fechaSolicitada || new Date().toISOString().split('T')[0],
          condicionesPago: order.condicionesPago || 'Crédito 30 días',
          observaciones: order.observaciones || '',
          estado: order.estado || 'Borrador',
          solicitudId: order.solicitudId || null,
        });
      } else if (fromRequest) {
        // Inicializada a partir de una solicitud de material aprobada
        const mat = materials.find((m) => m.id === fromRequest.materialId);
        const unitPrice = mat ? Number(mat.precioUnitario || 0) : 100;
        const qty = Number(fromRequest.cantidad || 1);
        const subtotal = qty * unitPrice;

        const inFiveDays = new Date();
        inFiveDays.setDate(inFiveDays.getDate() + 5);

        setFormData({
          numeroOrden: '',
          proveedorId: fromRequest.proveedorSugeridoId || (mat ? mat.proveedorId : '') || suppliers[0]?.id || '',
          proyectoId: fromRequest.proyectoId || '',
          materiales: [
            {
              materialId: fromRequest.materialId,
              materialNombre: fromRequest.materialNombre || mat?.nombre || 'Material',
              cantidad: qty,
              precioUnitario: unitPrice,
              unidad: fromRequest.unidad || mat?.unidad || 'Unidades',
              subtotal,
            },
          ],
          fechaSolicitada: fromRequest.fechaNecesaria || inFiveDays.toISOString().split('T')[0],
          fechaPrometida: fromRequest.fechaNecesaria || inFiveDays.toISOString().split('T')[0],
          condicionesPago: 'Crédito 30 días',
          observaciones: `Orden generada en base a la Solicitud ${fromRequest.numero || fromRequest.id}. ${fromRequest.observaciones || ''}`,
          estado: 'Aprobada',
          solicitudId: fromRequest.id,
        });
      } else {
        const inFiveDays = new Date();
        inFiveDays.setDate(inFiveDays.getDate() + 5);

        const firstMat = materials[0];
        const unitPrice = firstMat ? Number(firstMat.precioUnitario || 0) : 100;
        const qty = 10;

        setFormData({
          numeroOrden: '',
          proveedorId: suppliers[0]?.id || '',
          proyectoId: projects[0]?.id || '',
          materiales: firstMat
            ? [
                {
                  materialId: firstMat.id,
                  materialNombre: firstMat.nombre,
                  cantidad: qty,
                  precioUnitario: unitPrice,
                  unidad: firstMat.unidad || 'Unidades',
                  subtotal: qty * unitPrice,
                },
              ]
            : [],
          fechaSolicitada: inFiveDays.toISOString().split('T')[0],
          fechaPrometida: inFiveDays.toISOString().split('T')[0],
          condicionesPago: 'Crédito 30 días',
          observaciones: '',
          estado: 'Borrador',
          solicitudId: null,
        });
      }
      setErrors({});
    }
  }, [isOpen, order, fromRequest, materials, projects, suppliers]);

  // Si cambia el proveedor, actualizar las condiciones de pago habituales
  const handleSupplierChange = (supId) => {
    const sup = suppliers.find((s) => s.id === supId);
    setFormData((prev) => ({
      ...prev,
      proveedorId: supId,
      condicionesPago: sup?.condicionesPago || prev.condicionesPago,
    }));
    if (errors.proveedorId) {
      setErrors((prev) => ({ ...prev, proveedorId: null }));
    }
  };

  const handleAddItem = () => {
    const availableMat = materials.find((m) => !formData.materiales.some((it) => it.materialId === m.id)) || materials[0];
    if (!availableMat) return;

    const unitPrice = Number(availableMat.precioUnitario || 0);
    const newItem = {
      materialId: availableMat.id,
      materialNombre: availableMat.nombre,
      cantidad: 1,
      precioUnitario: unitPrice,
      unidad: availableMat.unidad || 'Unidades',
      subtotal: unitPrice,
    };

    setFormData((prev) => ({
      ...prev,
      materiales: [...prev.materiales, newItem],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      materiales: prev.materiales.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const nextItems = [...prev.materiales];
      const item = { ...nextItems[index] };

      if (field === 'materialId') {
        const mat = materials.find((m) => m.id === value);
        item.materialId = value;
        item.materialNombre = mat?.nombre || 'Material';
        item.unidad = mat?.unidad || item.unidad;
        item.precioUnitario = Number(mat?.precioUnitario || item.precioUnitario || 0);
        item.subtotal = Number(item.cantidad || 0) * item.precioUnitario;
      } else if (field === 'cantidad') {
        const qty = Number(value) || 0;
        item.cantidad = qty;
        item.subtotal = qty * Number(item.precioUnitario || 0);
      } else if (field === 'precioUnitario') {
        const price = Number(value) || 0;
        item.precioUnitario = price;
        item.subtotal = Number(item.cantidad || 0) * price;
      }

      nextItems[index] = item;
      return { ...prev, materiales: nextItems };
    });
  };

  const subtotal = formData.materiales.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);
  const impuestos = Math.round(subtotal * 0.16);
  const total = subtotal + impuestos;

  const validate = () => {
    const newErrors = {};
    if (!formData.proveedorId) newErrors.proveedorId = 'Selecciona el proveedor para la orden.';
    if (!formData.proyectoId) newErrors.proyectoId = 'Selecciona el proyecto vinculado a la compra.';
    if (!formData.materiales || formData.materiales.length === 0) {
      newErrors.materiales = 'Debes incluir al menos un material en la orden.';
    }
    formData.materiales.forEach((it, idx) => {
      if (!it.cantidad || Number(it.cantidad) <= 0) {
        newErrors[`cant_${idx}`] = 'Cantidad inválida.';
      }
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    const sup = suppliers.find((s) => s.id === formData.proveedorId);
    const prj = projects.find((p) => p.id === formData.proyectoId);

    onSave({
      ...(order ? { id: order.id, numeroOrden: order.numeroOrden } : {}),
      ...formData,
      subtotal,
      impuestos,
      total,
      proveedorNombre: sup?.nombre || sup?.nombreComercial || 'Proveedor',
      proyectoNombre: prj?.nombre || 'Proyecto General',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Editar Orden de Compra ${order.numeroOrden}` : 'Emitir Orden de Compra'}
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Proveedor */}
          <div className="constructa-form-group">
            <label className="constructa-label">Proveedor Seleccionado *</label>
            <select
              name="proveedorId"
              className={`constructa-input ${errors.proveedorId ? 'input-error' : ''}`}
              value={formData.proveedorId}
              onChange={(e) => handleSupplierChange(e.target.value)}
            >
              <option value="">-- Selecciona un proveedor --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre || s.nombreComercial} ({s.especialidad || s.categoria})
                </option>
              ))}
            </select>
            {errors.proveedorId && <span className="constructa-error-text">{errors.proveedorId}</span>}
          </div>

          {/* Proyecto */}
          <div className="constructa-form-group">
            <label className="constructa-label">Proyecto / Frente Constructivo *</label>
            <select
              name="proyectoId"
              className={`constructa-input ${errors.proyectoId ? 'input-error' : ''}`}
              value={formData.proyectoId}
              onChange={(e) => setFormData((p) => ({ ...p, proyectoId: e.target.value }))}
            >
              <option value="">-- Selecciona el proyecto --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigo || p.id})
                </option>
              ))}
            </select>
            {errors.proyectoId && <span className="constructa-error-text">{errors.proyectoId}</span>}
          </div>

          {/* Fecha Solicitada */}
          <div className="constructa-form-group">
            <label className="constructa-label">Fecha Prevista / Solicitada de Entrega</label>
            <input
              type="date"
              name="fechaSolicitada"
              className="constructa-input"
              value={formData.fechaSolicitada}
              onChange={(e) => setFormData((p) => ({ ...p, fechaSolicitada: e.target.value, fechaPrometida: e.target.value }))}
            />
          </div>

          {/* Condiciones de Pago */}
          <div className="constructa-form-group">
            <label className="constructa-label">Condiciones de Pago</label>
            <select
              name="condicionesPago"
              className="constructa-input"
              value={formData.condicionesPago}
              onChange={(e) => setFormData((p) => ({ ...p, condicionesPago: e.target.value }))}
            >
              <option value="Contado">Contado / Inmediato</option>
              <option value="Crédito 15 días">Crédito 15 días</option>
              <option value="Crédito 30 días">Crédito 30 días</option>
              <option value="Crédito 60 días">Crédito 60 días</option>
              <option value="50% anticipo, 50% entrega">50% anticipo, 50% entrega</option>
            </select>
          </div>

          {/* Estado Inicial */}
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Estado de la Orden</label>
            <select
              name="estado"
              className="constructa-input"
              value={formData.estado}
              onChange={(e) => setFormData((p) => ({ ...p, estado: e.target.value }))}
            >
              <option value="Borrador">Borrador (Edición preliminar)</option>
              <option value="Pendiente de aprobación">Pendiente de aprobación presupuestal</option>
              <option value="Aprobada">Aprobada (Lista para enviar al proveedor)</option>
              <option value="Enviada al proveedor">Enviada al proveedor (Esperando confirmación)</option>
            </select>
          </div>
        </div>

        {/* Tabla de Materiales */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="constructa-label" style={{ margin: 0 }}>
              Desglose de Materiales e Insumos ({formData.materiales.length})
            </label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<Plus size={14} />}
              onClick={handleAddItem}
            >
              Agregar Insumo
            </Button>
          </div>

          {errors.materiales && (
            <div style={{ color: 'var(--color-rose)', fontSize: '0.8rem', marginBottom: '8px' }}>
              {errors.materiales}
            </div>
          )}

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '10px 12px' }}>Material</th>
                  <th style={{ padding: '10px 12px', width: '100px' }}>Cantidad</th>
                  <th style={{ padding: '10px 12px', width: '90px' }}>Unidad</th>
                  <th style={{ padding: '10px 12px', width: '110px' }}>Precio U.</th>
                  <th style={{ padding: '10px 12px', width: '110px' }}>Subtotal</th>
                  <th style={{ padding: '10px 12px', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.materiales.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <select
                        className="constructa-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                        value={item.materialId}
                        onChange={(e) => handleItemChange(idx, 'materialId', e.target.value)}
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        className="constructa-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>
                      {item.unidad}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="constructa-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                        value={item.precioUnitario}
                        onChange={(e) => handleItemChange(idx, 'precioUnitario', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#ffffff' }}>
                      ${Number(item.subtotal || 0).toLocaleString('es-MX')}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {formData.materiales.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-rose)',
                            cursor: 'pointer',
                          }}
                          title="Eliminar partida"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen Financiero de la Orden */}
          <div
            style={{
              marginTop: '16px',
              padding: '14px 16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              * Se aplica tasa estándar de IVA (16%) para materiales de construcción fiscalmente deducibles.
            </div>

            <div style={{ display: 'flex', gap: '20px', textAlign: 'right' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Subtotal</span>
                <span style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
                  ${subtotal.toLocaleString('es-MX')}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>IVA (16%)</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                  ${impuestos.toLocaleString('es-MX')}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', display: 'block', fontWeight: 600 }}>TOTAL ORDEN</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                  ${total.toLocaleString('es-MX')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="constructa-form-group" style={{ marginTop: '16px' }}>
          <label className="constructa-label">Instrucciones Logísticas y Observaciones de Entrega</label>
          <textarea
            name="observaciones"
            className="constructa-input"
            rows={2}
            value={formData.observaciones}
            onChange={(e) => setFormData((p) => ({ ...p, observaciones: e.target.value }))}
            placeholder="Especifica lugar de descarga, horarios de patio de maniobras o requerimiento de equipo especial de descarga..."
          />
        </div>

        {/* Botones */}
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
            {order ? 'Guardar Cambios' : 'Emitir Orden de Compra'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
