import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';

export default function StockMovementModal({ isOpen, onClose, onRegister, material, projects = [] }) {
  const [formData, setFormData] = useState({
    tipo: 'Entrada', // 'Entrada' | 'Salida'
    cantidad: 10,
    proyectoId: '',
    motivo: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (material) {
      setFormData({
        tipo: 'Entrada',
        cantidad: 10,
        proyectoId: projects[0]?.id || '',
        motivo: 'Recepción de pedido de proveedor'
      });
    }
    setErrors({});
  }, [material, isOpen, projects]);

  if (!material) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? Math.max(1, Number(value)) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTipoChange = (newTipo) => {
    setFormData(prev => ({
      ...prev,
      tipo: newTipo,
      motivo: newTipo === 'Entrada' 
        ? 'Recepción de pedido de proveedor' 
        : 'Despacho para fases estructurales'
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'Ingresa una cantidad mayor a cero.';
    }
    if (formData.tipo === 'Salida' && formData.cantidad > material.stock) {
      newErrors.cantidad = `No hay suficiente stock. Disponible actualmente: ${material.stock} ${material.unidad}.`;
    }
    if (formData.tipo === 'Salida' && !formData.proyectoId) {
      newErrors.proyectoId = 'Selecciona el proyecto de destino para el despacho.';
    }
    if (!formData.motivo.trim()) {
      newErrors.motivo = 'Indica el motivo o justificación del movimiento.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onRegister({
      materialId: material.id,
      tipo: formData.tipo,
      cantidad: formData.cantidad,
      proyectoId: formData.tipo === 'Salida' ? formData.proyectoId : null,
      motivo: formData.motivo
    });
    onClose();
  };

  const projectedStock = formData.tipo === 'Entrada'
    ? material.stock + formData.cantidad
    : material.stock - formData.cantidad;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Movimiento de Stock — ${material.nombre}`}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit}>
        {/* Type Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => handleTipoChange('Entrada')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${formData.tipo === 'Entrada' ? 'var(--color-emerald)' : 'var(--color-border)'}`,
              background: formData.tipo === 'Entrada' ? 'rgba(16, 185, 129, 0.12)' : 'var(--color-bg-page)',
              color: formData.tipo === 'Entrada' ? 'var(--color-emerald)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            <ArrowDownLeft size={18} /> Entrada (Ingreso)
          </button>

          <button
            type="button"
            onClick={() => handleTipoChange('Salida')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${formData.tipo === 'Salida' ? 'var(--color-amber)' : 'var(--color-border)'}`,
              background: formData.tipo === 'Salida' ? 'rgba(245, 158, 11, 0.12)' : 'var(--color-bg-page)',
              color: formData.tipo === 'Salida' ? 'var(--color-amber)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            <ArrowUpRight size={18} /> Salida (Despacho)
          </button>
        </div>

        {/* Current Stock Banner */}
        <div style={{
          background: 'var(--color-bg-page)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Stock actual en almacén: </span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{material.stock} {material.unidad}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Resultado proyectado: </span>
            <strong style={{ color: projectedStock < material.stockMinimo ? 'var(--color-rose)' : 'var(--color-emerald)' }}>
              {projectedStock} {material.unidad}
            </strong>
          </div>
        </div>

        {projectedStock < material.stockMinimo && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-rose)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={16} />
            <span>Atención: Este movimiento dejará el stock por debajo del mínimo de seguridad ({material.stockMinimo} {material.unidad}).</span>
          </div>
        )}

        <div className="constructa-form-group">
          <label className="constructa-label">Cantidad a transferir ({material.unidad}) *</label>
          <input
            type="number"
            name="cantidad"
            min="1"
            className={`constructa-input ${errors.cantidad ? 'input-error' : ''}`}
            value={formData.cantidad}
            onChange={handleChange}
          />
          {errors.cantidad && <span className="constructa-error-text">{errors.cantidad}</span>}
        </div>

        {formData.tipo === 'Salida' && (
          <div className="constructa-form-group">
            <label className="constructa-label">Proyecto Destino *</label>
            <select
              name="proyectoId"
              className={`constructa-input ${errors.proyectoId ? 'input-error' : ''}`}
              value={formData.proyectoId}
              onChange={handleChange}
            >
              <option value="">Selecciona proyecto receptor</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {errors.proyectoId && <span className="constructa-error-text">{errors.proyectoId}</span>}
          </div>
        )}

        <div className="constructa-form-group">
          <label className="constructa-label">Motivo o Justificación *</label>
          <input
            type="text"
            name="motivo"
            className={`constructa-input ${errors.motivo ? 'input-error' : ''}`}
            value={formData.motivo}
            onChange={handleChange}
            placeholder="Ej. Remesa de proveedor, consumo en cimientos, reposición..."
          />
          {errors.motivo && <span className="constructa-error-text">{errors.motivo}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant={formData.tipo === 'Entrada' ? 'primary' : 'warning'}>
            Confirmar {formData.tipo}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
