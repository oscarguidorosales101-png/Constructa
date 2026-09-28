import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import BackButton from '../common/BackButton';
import { PackageCheck, AlertTriangle, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react';

export default function OrderReceptionModal({
  isOpen,
  onClose,
  order,
  onSaveReception,
}) {
  const [responsable, setResponsable] = useState('');
  const [receivedItems, setReceivedItems] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [notas, setNotas] = useState('');

  // Incidencia temporal en edición
  const [newIncidentType, setNewIncidentType] = useState('faltante');
  const [newIncidentDesc, setNewIncidentDesc] = useState('');
  const [newIncidentQty, setNewIncidentQty] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      setResponsable('Don Roberto Sánchez (Bodega Central)');
      setNotas('');
      setIncidencias(order.recepcion?.incidencias ? [...order.recepcion.incidencias] : []);

      // Inicializar items con cantidad solicitada como sugerencia inicial
      const initialItems = (order.materiales || []).map((m) => {
        const prev = order.recepcion?.itemsRecibidos?.find((it) => it.materialId === m.materialId);
        return {
          materialId: m.materialId,
          materialNombre: m.materialNombre,
          cantidadPedida: Number(m.cantidad || 0),
          cantidadRecibida: prev ? Number(prev.cantidadRecibida) : Number(m.cantidad || 0),
          unidad: m.unidad || 'Unidades',
        };
      });
      setReceivedItems(initialItems);
    }
  }, [isOpen, order]);

  if (!order) return null;

  const handleQtyChange = (materialId, val) => {
    const num = Math.max(0, Number(val) || 0);
    setReceivedItems((prev) =>
      prev.map((it) => (it.materialId === materialId ? { ...it, cantidadRecibida: num } : it))
    );
  };

  const handleAddIncident = () => {
    if (!newIncidentDesc.trim()) return;
    const newInc = {
      tipo: newIncidentType,
      descripcion: newIncidentDesc.trim(),
      cantidadAfectada: Number(newIncidentQty) || 0,
    };
    setIncidencias((prev) => [...prev, newInc]);
    setNewIncidentDesc('');
    setNewIncidentQty('');
  };

  const handleRemoveIncident = (index) => {
    setIncidencias((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calcular si existe discrepancia en las cantidades recibidas
  const hasMismatch = receivedItems.some((it) => it.cantidadRecibida < it.cantidadPedida);
  const hasExcess = receivedItems.some((it) => it.cantidadRecibida > it.cantidadPedida);
  const isPartial = hasMismatch || incidencias.some((i) => i.tipo === 'faltante');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveReception({
      orderId: order.id,
      responsable: responsable.trim() || 'Bodega Central',
      receivedItems,
      incidencias,
      notas: notas.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Control y Recepción de Mercancía — ${order.numeroOrden}`}
      maxWidth="740px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>

        {/* Cabecera de la Orden */}
        <div
          style={{
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600 }}>
              {order.proyectoNombre}
            </div>
            <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
              Proveedor: {order.proveedorNombre}
            </strong>
          </div>

          <div>
            <Badge variant={isPartial ? 'warning' : 'success'}>
              {isPartial ? 'Recepción Parcial Detectada' : 'Recepción Conforme Completa'}
            </Badge>
          </div>
        </div>

        {/* Advertencia Crítica de Inventario (Requisito 13) */}
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--color-sky)',
          }}
        >
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Control de Inventario Riguroso:</strong> Las existencias reales de almacén se incrementarán <em>únicamente</em> por la cantidad física recibida ingresada a continuación.
          </span>
        </div>

        {/* Tabla Comparativa: Pedido vs Recibido (Requisito 11) */}
        <div style={{ marginBottom: '20px' }}>
          <label className="constructa-label">
            Comparativa de Insumos: Cantidad Pedida vs Cantidad Realmente Recibida *
          </label>

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
                  <th style={{ padding: '10px 12px', width: '120px' }}>Cantidad Pedida</th>
                  <th style={{ padding: '10px 12px', width: '150px' }}>Cantidad Recibida</th>
                  <th style={{ padding: '10px 12px', width: '100px' }}>Unidad</th>
                  <th style={{ padding: '10px 12px', width: '110px' }}>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {receivedItems.map((it) => {
                  const isItemPartial = it.cantidadRecibida < it.cantidadPedida;
                  const isItemExact = it.cantidadRecibida === it.cantidadPedida;
                  const isItemExcess = it.cantidadRecibida > it.cantidadPedida;

                  return (
                    <tr key={it.materialId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: '#ffffff' }}>
                        {it.materialNombre}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                        {it.cantidadPedida}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="constructa-input"
                          style={{
                            padding: '6px 10px',
                            fontWeight: 700,
                            borderColor: isItemPartial ? 'var(--color-rose)' : isItemExact ? 'var(--color-emerald)' : 'var(--color-cyan)',
                          }}
                          value={it.cantidadRecibida}
                          onChange={(e) => handleQtyChange(it.materialId, e.target.value)}
                          required
                        />
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)' }}>
                        {it.unidad}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isItemExact && (
                          <span style={{ color: 'var(--color-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
                            Completa
                          </span>
                        )}
                        {isItemPartial && (
                          <span style={{ color: 'var(--color-rose)', fontSize: '0.8rem', fontWeight: 600 }}>
                            Faltante (-{it.cantidadPedida - it.cantidadRecibida})
                          </span>
                        )}
                        {isItemExcess && (
                          <span style={{ color: 'var(--color-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
                            Exceso (+{it.cantidadRecibida - it.cantidadPedida})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registro de Incidencias de Recepción (Requisito 12) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="constructa-label" style={{ margin: 0 }}>
              Incidencias Detectadas en Descarga ({incidencias.length})
            </label>
          </div>

          {/* Formulario rápido para añadir incidencia */}
          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '10px',
              display: 'grid',
              gridTemplateColumns: '150px 1fr 100px auto',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <select
              className="constructa-input"
              value={newIncidentType}
              onChange={(e) => setNewIncidentType(e.target.value)}
            >
              <option value="faltante">Faltante</option>
              <option value="material_dañado">Material dañado</option>
              <option value="material_incorrecto">Material incorrecto</option>
              <option value="exceso">Exceso / Sobrante</option>
              <option value="entrega_retrasada">Entrega retrasada</option>
              <option value="otro">Otro inconveniente</option>
            </select>

            <input
              type="text"
              className="constructa-input"
              placeholder="Descripción del incidente (ej. 2 sacos con rotura por maniobra)..."
              value={newIncidentDesc}
              onChange={(e) => setNewIncidentDesc(e.target.value)}
            />

            <input
              type="number"
              className="constructa-input"
              placeholder="Cant. afect."
              value={newIncidentQty}
              onChange={(e) => setNewIncidentQty(e.target.value)}
            />

            <Button
              type="button"
              size="sm"
              variant="outline"
              icon={<Plus size={14} />}
              onClick={handleAddIncident}
            >
              Añadir
            </Button>
          </div>

          {/* Lista de Incidencias Registradas */}
          {incidencias.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {incidencias.map((inc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.84rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={15} style={{ color: 'var(--color-rose)' }} />
                    <strong style={{ color: 'var(--color-rose)', textTransform: 'capitalize' }}>
                      {inc.tipo.replace('_', ' ')}:
                    </strong>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {inc.descripcion} {inc.cantidadAfectada > 0 && `(${inc.cantidadAfectada} unidades)`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveIncident(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-rose)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Responsable de Bodega y Notas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="constructa-form-group">
            <label className="constructa-label">Responsable de Recepción en Obra *</label>
            <input
              type="text"
              className="constructa-input"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              placeholder="Nombre del almacenista / supervisor"
              required
            />
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Notas Adicionales de Bodega</label>
            <input
              type="text"
              className="constructa-input"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ubicación de estiba en patio, remisión de chofer, etc."
            />
          </div>
        </div>

        {/* Botones */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={<PackageCheck size={16} />}>
            Confirmar Recepción y Actualizar Inventario
          </Button>
        </div>
      </form>
    </Modal>
  );
}
