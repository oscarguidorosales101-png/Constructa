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
            marginBottom: '16px',
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

        {/* Resumen Comparativo Visual: Solicitado vs Recibido vs Faltante (Requisito 18) */}
        <div className="reception-comparison-grid">
          <div className="constructa-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--color-gold)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Solicitado
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {receivedItems.reduce((acc, it) => acc + (Number(it.cantidadPedida) || 0), 0)}{' '}
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>unidades</span>
            </div>
          </div>

          <div className="constructa-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--color-emerald)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Recibido
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '2px' }}>
              {receivedItems.reduce((acc, it) => acc + (Number(it.cantidadRecibida) || 0), 0)}{' '}
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>unidades</span>
            </div>
          </div>

          <div
            className="constructa-card"
            style={{
              padding: '12px 14px',
              borderLeft: `3px solid ${
                receivedItems.some((it) => it.cantidadRecibida < it.cantidadPedida) ? 'var(--color-rose)' : 'var(--color-text-muted)'
              }`,
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                color: receivedItems.some((it) => it.cantidadRecibida < it.cantidadPedida) ? 'var(--color-rose)' : 'var(--color-text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Total Faltante
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: receivedItems.some((it) => it.cantidadRecibida < it.cantidadPedida) ? 'var(--color-rose)' : 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              {receivedItems.reduce((acc, it) => acc + Math.max(0, (Number(it.cantidadPedida) || 0) - (Number(it.cantidadRecibida) || 0)), 0)}{' '}
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>unidades</span>
            </div>
          </div>
        </div>

        {/* Tabla Comparativa: Solicitado vs Recibido vs Faltante (Requisito 18) */}
        <div style={{ marginBottom: '20px' }}>
          <label className="constructa-label">
            Comparativa de Insumos: Cantidad Solicitada vs Cantidad Recibida vs Faltante *
          </label>

          <div className="constructa-table-container">
            <table className="constructa-table" style={{ minWidth: '580px' }}>
              <thead>
                <tr>
                  <th>Material / Insumo</th>
                  <th style={{ width: '110px' }}>Solicitado</th>
                  <th style={{ width: '130px' }}>Recibido</th>
                  <th style={{ width: '110px' }}>Faltante</th>
                  <th style={{ width: '120px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {receivedItems.map((it) => {
                  const diff = it.cantidadPedida - it.cantidadRecibida;
                  const isItemPartial = diff > 0;
                  const isItemExact = diff === 0;
                  const isItemExcess = diff < 0;

                  return (
                    <tr key={it.materialId}>
                      <td style={{ fontWeight: 500, color: '#ffffff' }}>
                        <div>{it.materialNombre}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Unidad: {it.unidad}</div>
                      </td>
                      <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                        {it.cantidadPedida} {it.unidad}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="constructa-input"
                          style={{
                            padding: '6px 10px',
                            fontWeight: 700,
                            maxWidth: '110px',
                            borderColor: isItemPartial ? 'var(--color-rose)' : isItemExact ? 'var(--color-emerald)' : 'var(--color-cyan)',
                          }}
                          value={it.cantidadRecibida}
                          onChange={(e) => handleQtyChange(it.materialId, e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        {isItemPartial ? (
                          <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>
                            -{diff} {it.unidad}
                          </span>
                        ) : isItemExcess ? (
                          <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>
                            +{Math.abs(diff)} {it.unidad}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-emerald)', fontWeight: 500 }}>
                            0 (Conforme)
                          </span>
                        )}
                      </td>
                      <td>
                        {isItemExact && (
                          <Badge variant="success">Completa</Badge>
                        )}
                        {isItemPartial && (
                          <Badge variant="warning">Parcial</Badge>
                        )}
                        {isItemExcess && (
                          <Badge variant="info">Excedente</Badge>
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

          {/* Formulario rápido para añadir incidencia adaptativo */}
          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <select
              className="constructa-input"
              style={{ flex: '1 1 140px' }}
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
              style={{ flex: '2 1 200px' }}
              placeholder="Descripción del incidente (ej. 2 sacos con rotura por maniobra)..."
              value={newIncidentDesc}
              onChange={(e) => setNewIncidentDesc(e.target.value)}
            />

            <input
              type="number"
              className="constructa-input"
              style={{ flex: '1 1 90px', maxWidth: '120px' }}
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

        {/* Responsable de Bodega y Notas en cuadrícula responsive */}
        <div className="form-grid-2">
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
