import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { materialImages } from '../../assets/imgs/materiales';

const AVAILABLE_IMAGES = [
  { key: 'cemento-portland', label: 'Cemento Portland' },
  { key: 'arena-construccion', label: 'Arena Fina / Gruesa' },
  { key: 'grava-triturada', label: 'Grava Triturada' },
  { key: 'acero-corrugado', label: 'Varilla Acero Corrugado' },
  { key: 'bloques-hormigon', label: 'Bloques de Hormigón' },
  { key: 'ladrillos-ceramicos', label: 'Ladrillo Cerámico' },
  { key: 'madera-estructural', label: 'Madera de Pino Estructural' },
  { key: 'tuberia-pvc', label: 'Tubería Sanitaria PVC' },
  { key: 'pintura-profesional', label: 'Pintura Látex Profesional' },
  { key: 'yeso-construccion', label: 'Yeso de Construcción' },
  { key: 'baldosas-ceramica', label: 'Baldosa Cerámica Gres' },
  { key: 'conducto-electrico', label: 'Conducto Corrugado Eléctrico' },
  { key: 'malla-electrosoldada', label: 'Malla Electrosoldada' },
  { key: 'viga-acero-ipe', label: 'Viga de Acero Estructural' },
  { key: 'paneles-drywall', label: 'Paneles de Yeso Drywall' },
  { key: 'aislante-xps', label: 'Aislante Térmico XPS' },
  { key: 'membrana-asfaltica', label: 'Membrana Asfáltica' },
  { key: 'mortero-seco', label: 'Mortero Seco Preparado' },
  { key: 'chapas-galvanizadas', label: 'Chapa Cubierta Galvanizada' },
  { key: 'tornilleria-pernos', label: 'Pernos y Anclajes' },
  { key: 'sellador-poliuretano', label: 'Sellador de Poliuretano' },
  { key: 'lana-vidrio', label: 'Lana de Vidrio Aislante' }
];

const CATEGORIES = [
  'Conglomerantes',
  'Áridos',
  'Estructuras y Acero',
  'Mampostería',
  'Maderas',
  'Fontanería',
  'Acabados y Pinturas',
  'Revestimientos',
  'Electricidad',
  'Aislamientos',
  'Cubiertas e Impermeabilización',
  'Fijaciones y Anclajes'
];

export default function MaterialModal({ isOpen, onClose, onSave, material, suppliers = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Estructuras y Acero',
    unidad: 'unidad',
    stock: 100,
    stockMinimo: 20,
    precioUnitario: 10,
    proveedorId: '',
    imagen: 'cemento-portland',
    descripcion: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (material) {
      setFormData({
        nombre: material.nombre || '',
        categoria: material.categoria || 'Estructuras y Acero',
        unidad: material.unidad || 'unidad',
        stock: material.stock !== undefined ? material.stock : 100,
        stockMinimo: material.stockMinimo !== undefined ? material.stockMinimo : 20,
        precioUnitario: material.precioUnitario || 10,
        proveedorId: material.proveedorId || (suppliers[0]?.id || ''),
        imagen: material.imagen || 'cemento-portland',
        descripcion: material.descripcion || ''
      });
    } else {
      setFormData({
        nombre: '',
        categoria: 'Estructuras y Acero',
        unidad: 'unidad',
        stock: 50,
        stockMinimo: 20,
        precioUnitario: 15,
        proveedorId: suppliers[0]?.id || '',
        imagen: 'cemento-portland',
        descripcion: ''
      });
    }
    setErrors({});
  }, [material, isOpen, suppliers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'stockMinimo' || name === 'precioUnitario'
        ? Number(value)
        : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre del material es obligatorio.';
    if (formData.stock < 0) newErrors.stock = 'El stock inicial no puede ser negativo.';
    if (formData.stockMinimo < 0) newErrors.stockMinimo = 'El stock mínimo no puede ser negativo.';
    if (formData.precioUnitario <= 0) newErrors.precioUnitario = 'El precio debe ser mayor a cero.';
    if (!formData.unidad.trim()) newErrors.unidad = 'Indica la unidad de medida.';
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
      ...(material ? { id: material.id } : {}),
      ...formData
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={material ? 'Editar Material de Construcción' : 'Registrar Nuevo Material'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Nombre del Material *</label>
            <input
              type="text"
              name="nombre"
              className={`constructa-input ${errors.nombre ? 'input-error' : ''}`}
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Cemento Portland Tipo I 50kg"
            />
            {errors.nombre && <span className="constructa-error-text">{errors.nombre}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Categoría *</label>
            <select
              name="categoria"
              className="constructa-input"
              value={formData.categoria}
              onChange={handleChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Unidad de Medida *</label>
            <input
              type="text"
              name="unidad"
              className={`constructa-input ${errors.unidad ? 'input-error' : ''}`}
              value={formData.unidad}
              onChange={handleChange}
              placeholder="saco, m³, kg, pieza, tubo..."
            />
            {errors.unidad && <span className="constructa-error-text">{errors.unidad}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Stock Actual *</label>
            <input
              type="number"
              name="stock"
              min="0"
              className={`constructa-input ${errors.stock ? 'input-error' : ''}`}
              value={formData.stock}
              onChange={handleChange}
            />
            {errors.stock && <span className="constructa-error-text">{errors.stock}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Stock Mínimo (Alerta) *</label>
            <input
              type="number"
              name="stockMinimo"
              min="0"
              className={`constructa-input ${errors.stockMinimo ? 'input-error' : ''}`}
              value={formData.stockMinimo}
              onChange={handleChange}
            />
            {errors.stockMinimo && <span className="constructa-error-text">{errors.stockMinimo}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Precio Unitario ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="precioUnitario"
              className={`constructa-input ${errors.precioUnitario ? 'input-error' : ''}`}
              value={formData.precioUnitario}
              onChange={handleChange}
            />
            {errors.precioUnitario && <span className="constructa-error-text">{errors.precioUnitario}</span>}
          </div>

          <div className="constructa-form-group">
            <label className="constructa-label">Proveedor Habitual</label>
            <select
              name="proveedorId"
              className="constructa-input"
              value={formData.proveedorId}
              onChange={handleChange}
            >
              <option value="">Sin proveedor asignado</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Image Selector Preview */}
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Imagen Representativa del Catálogo *</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#0a0d14',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img
                  src={materialImages[formData.imagen] || materialImages['cemento-portland']}
                  alt="Vista previa"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <select
                name="imagen"
                className="constructa-input"
                value={formData.imagen}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                {AVAILABLE_IMAGES.map(img => (
                  <option key={img.key} value={img.key}>{img.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Especificaciones Técnicas / Descripción</label>
            <textarea
              name="descripcion"
              rows={2}
              className="constructa-input"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Grado, pureza, dimensiones o notas de manipulación en almacén..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {material ? 'Guardar Cambios' : 'Registrar Material'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
