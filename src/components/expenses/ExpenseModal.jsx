import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const EXPENSE_CATEGORIES = [
  'Materiales',
  'Mano de obra',
  'Transporte',
  'Herramientas',
  'Servicios',
  'Otros'
];

export default function ExpenseModal({ isOpen, onClose, onSave, expense, projects = [], suppliers = [] }) {
  const [formData, setFormData] = useState({
    concepto: '',
    proyectoId: '',
    categoria: 'Materiales',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    proveedor: '',
    comprobante: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setFormData({
        concepto: expense.concepto || '',
        proyectoId: expense.proyectoId || (projects[0]?.id || ''),
        categoria: expense.categoria || 'Materiales',
        monto: expense.monto || '',
        fecha: expense.fecha || new Date().toISOString().split('T')[0],
        proveedor: expense.proveedor || '',
        comprobante: expense.comprobante || '',
        notas: expense.notas || ''
      });
    } else {
      setFormData({
        concepto: '',
        proyectoId: projects[0]?.id || '',
        categoria: 'Materiales',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        proveedor: '',
        comprobante: '',
        notas: ''
      });
    }
    setErrors({});
  }, [expense, isOpen, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.concepto.trim()) newErrors.concepto = 'El concepto o descripción del gasto es obligatorio.';
    if (!formData.proyectoId) newErrors.proyectoId = 'Debes asociar el gasto a un proyecto de construcción.';
    if (!formData.monto || Number(formData.monto) <= 0) newErrors.monto = 'Indica un monto positivo mayor a cero.';
    if (!formData.fecha) newErrors.fecha = 'La fecha del gasto es obligatoria.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...(expense ? { id: expense.id } : {}),
      ...formData,
      monto: Number(formData.monto)
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Modificar Registro de Gasto' : 'Registrar Nuevo Gasto'}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Concepto del Gasto *</label>
            <input
              type="text"
              name="concepto"
              className={`constructa-input ${errors.concepto ? 'input-error' : ''}`}
              value={formData.concepto}
              onChange={handleChange}
              placeholder="Ej. Suministro de acero para cimientos lote A"
            />
            {errors.concepto && <span className="constructa-error-text">{errors.concepto}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Proyecto Asociado *</label>
            <select
              name="proyectoId"
              className={`constructa-input ${errors.proyectoId ? 'input-error' : ''}`}
              value={formData.proyectoId}
              onChange={handleChange}
            >
              <option value="">Selecciona proyecto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {errors.proyectoId && <span className="constructa-error-text">{errors.proyectoId}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Categoría Presupuestaria *</label>
            <select
              name="categoria"
              className="constructa-input"
              value={formData.categoria}
              onChange={handleChange}
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Importe / Monto ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="monto"
              className={`constructa-input ${errors.monto ? 'input-error' : ''}`}
              value={formData.monto}
              onChange={handleChange}
              placeholder="0.00"
            />
            {errors.monto && <span className="constructa-error-text">{errors.monto}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Fecha de Ejecución *</label>
            <input
              type="date"
              name="fecha"
              className={`constructa-input ${errors.fecha ? 'input-error' : ''}`}
              value={formData.fecha}
              onChange={handleChange}
            />
            {errors.fecha && <span className="constructa-error-text">{errors.fecha}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Proveedor o Contratista</label>
            <input
              type="text"
              name="proveedor"
              list="suppliers-list"
              className="constructa-input"
              value={formData.proveedor}
              onChange={handleChange}
              placeholder="Nombre del proveedor"
            />
            <datalist id="suppliers-list">
              {suppliers.map(s => (
                <option key={s.id} value={s.nombre} />
              ))}
            </datalist>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Número de Factura / Folio</label>
            <input
              type="text"
              name="comprobante"
              className="constructa-input"
              value={formData.comprobante}
              onChange={handleChange}
              placeholder="FAC-2026-XXXX"
            />
          </div>

          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Notas Adicionales</label>
            <textarea
              name="notas"
              rows={2}
              className="constructa-input"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Observaciones de pago, lote o condiciones comerciales..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {expense ? 'Guardar Cambios' : 'Registrar Gasto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
