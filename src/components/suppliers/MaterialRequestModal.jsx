import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import BackButton from '../common/BackButton';
import { Package, Building2, AlertTriangle, Calendar } from 'lucide-react';

export default function MaterialRequestModal({
  isOpen,
  onClose,
  onSave,
  request = null,
  initialMaterial = null,
  initialProject = null,
  materials = [],
  projects = [],
  suppliers = [],
}) {
  const [formData, setFormData] = useState({
    proyectoId: '',
    materialId: '',
    cantidad: 1,
    unidad: '',
    fechaNecesaria: '',
    prioridad: 'Alta',
    observaciones: '',
    proveedorSugeridoId: '',
    origen: 'Proyecto',
    estado: 'Pendiente',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (request) {
        setFormData({
          proyectoId: request.proyectoId || '',
          materialId: request.materialId || '',
          cantidad: request.cantidad || 1,
          unidad: request.unidad || '',
          fechaNecesaria: request.fechaNecesaria || '',
          prioridad: request.prioridad || 'Alta',
          observaciones: request.observaciones || '',
          proveedorSugeridoId: request.proveedorSugeridoId || '',
          origen: request.origen || 'Proyecto',
          estado: request.estado || 'Pendiente',
        });
      } else if (initialMaterial) {
        // Inicialización desde alerta de stock de almacén
        const suggestedQty = Math.max(
          1,
          (Number(initialMaterial.stockMinimo) * 2) - Number(initialMaterial.stockActual || initialMaterial.stock || 0)
        );
        const inOneWeek = new Date();
        inOneWeek.setDate(inOneWeek.getDate() + 7);

        setFormData({
          proyectoId: initialProject?.id || '',
          materialId: initialMaterial.id,
          cantidad: suggestedQty,
          unidad: initialMaterial.unidad || 'Unidades',
          fechaNecesaria: inOneWeek.toISOString().split('T')[0],
          prioridad: 'Alta',
          observaciones: `Solicitud de reposición automática por nivel de stock bajo o crítico (${initialMaterial.stockActual || initialMaterial.stock} ${initialMaterial.unidad} disponibles vs ${initialMaterial.stockMinimo} mínimo).`,
          proveedorSugeridoId: initialMaterial.proveedorId || '',
          origen: 'Alerta de Stock',
          estado: 'Pendiente',
        });
      } else {
        const inOneWeek = new Date();
        inOneWeek.setDate(inOneWeek.getDate() + 7);

        setFormData({
          proyectoId: projects[0]?.id || '',
          materialId: materials[0]?.id || '',
          cantidad: 10,
          unidad: materials[0]?.unidad || 'Unidades',
          fechaNecesaria: inOneWeek.toISOString().split('T')[0],
          prioridad: 'Media',
          observaciones: '',
          proveedorSugeridoId: materials[0]?.proveedorId || suppliers[0]?.id || '',
          origen: 'Proyecto',
          estado: 'Pendiente',
        });
      }
      setErrors({});
    }
  }, [isOpen, request, initialMaterial, initialProject, materials, projects, suppliers]);

  // Sincronizar unidad y proveedor sugerido cuando cambia el material
  const handleMaterialChange = (matId) => {
    const mat = materials.find((m) => m.id === matId);
    setFormData((prev) => ({
      ...prev,
      materialId: matId,
      unidad: mat?.unidad || prev.unidad,
      proveedorSugeridoId: mat?.proveedorId || prev.proveedorSugeridoId,
    }));
    if (errors.materialId) {
      setErrors((prev) => ({ ...prev, materialId: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.materialId) newErrors.materialId = 'Selecciona un material de catálogo.';
    if (!formData.cantidad || Number(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad solicitada debe ser mayor a cero.';
    }
    if (!formData.fechaNecesaria) {
      newErrors.fechaNecesaria = 'Indica la fecha en que se requiere el material en obra.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    const mat = materials.find((m) => m.id === formData.materialId);
    const prj = projects.find((p) => p.id === formData.proyectoId);
    const sup = suppliers.find((s) => s.id === formData.proveedorSugeridoId);

    onSave({
      ...(request ? { id: request.id, numero: request.numero } : {}),
      ...formData,
      cantidad: Number(formData.cantidad),
      materialNombre: mat?.nombre || 'Material',
      proyectoNombre: prj?.nombre || 'Almacén General',
      proveedorSugeridoNombre: sup?.nombre || sup?.nombreComercial || '',
    });
    onClose();
  };

  const selectedMat = materials.find((m) => m.id === formData.materialId);
  const isStockAlert = formData.origen === 'Alerta de Stock';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={request ? 'Editar Solicitud de Material' : 'Nueva Solicitud de Material'}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <BackButton onClick={onClose} label="← Regresar" />
        </div>

        {/* Banner de Alerta de Stock si aplica */}
        {isStockAlert && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--color-rose)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#ffffff', fontSize: '0.88rem' }}>
                Solicitud generada por Alerta de Existencias Bajas
              </strong>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                Se precargaron los datos de reposición sugeridos para garantizar el stock mínimo en obra.
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Proyecto */}
          <div className="constructa-form-group">
            <label className="constructa-label">Proyecto Destino / Frente de Obra</label>
            <select
              name="proyectoId"
              className="constructa-input"
              value={formData.proyectoId}
              onChange={handleChange}
            >
              <option value="">Almacén General / Stock Central</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigo || p.id})
                </option>
              ))}
            </select>
          </div>

          {/* Origen de Solicitud */}
          <div className="constructa-form-group">
            <label className="constructa-label">Origen de la Solicitud</label>
            <select
              name="origen"
              className="constructa-input"
              value={formData.origen}
              onChange={handleChange}
            >
              <option value="Proyecto">Necesidad de Proyecto / Obra</option>
              <option value="Alerta de Stock">Alerta de Stock Bajo (Reposición)</option>
              <option value="Manual">Requerimiento Especial Manual</option>
            </select>
          </div>

          {/* Material */}
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Material Requerido *</label>
            <select
              name="materialId"
              className={`constructa-input ${errors.materialId ? 'input-error' : ''}`}
              value={formData.materialId}
              onChange={(e) => handleMaterialChange(e.target.value)}
            >
              <option value="">-- Selecciona un material del catálogo --</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} (Stock actual: {m.stockActual ?? m.stock} {m.unidad})
                </option>
              ))}
            </select>
            {errors.materialId && <span className="constructa-error-text">{errors.materialId}</span>}
          </div>

          {/* Cantidad */}
          <div className="constructa-form-group">
            <label className="constructa-label">Cantidad Necesaria *</label>
            <input
              type="number"
              name="cantidad"
              min="0.1"
              step="any"
              className={`constructa-input ${errors.cantidad ? 'input-error' : ''}`}
              value={formData.cantidad}
              onChange={handleChange}
            />
            {errors.cantidad && <span className="constructa-error-text">{errors.cantidad}</span>}
          </div>

          {/* Unidad */}
          <div className="constructa-form-group">
            <label className="constructa-label">Unidad de Medida</label>
            <input
              type="text"
              name="unidad"
              className="constructa-input"
              value={formData.unidad}
              onChange={handleChange}
              placeholder="Ej. Toneladas, Sacos, Piezas"
            />
          </div>

          {/* Fecha Necesaria */}
          <div className="constructa-form-group">
            <label className="constructa-label">Fecha Límite en Obra *</label>
            <input
              type="date"
              name="fechaNecesaria"
              className={`constructa-input ${errors.fechaNecesaria ? 'input-error' : ''}`}
              value={formData.fechaNecesaria}
              onChange={handleChange}
            />
            {errors.fechaNecesaria && <span className="constructa-error-text">{errors.fechaNecesaria}</span>}
          </div>

          {/* Prioridad */}
          <div className="constructa-form-group">
            <label className="constructa-label">Nivel de Prioridad</label>
            <select
              name="prioridad"
              className="constructa-input"
              value={formData.prioridad}
              onChange={handleChange}
            >
              <option value="Baja">Baja (Planificada)</option>
              <option value="Media">Media (Rutinaria)</option>
              <option value="Alta">Alta (Urgencia de cuadrilla)</option>
              <option value="Urgente">Urgente (Ruta crítica de obra)</option>
            </select>
          </div>

          {/* Proveedor Sugerido */}
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Proveedor Sugerido / Recomendado</label>
            <select
              name="proveedorSugeridoId"
              className="constructa-input"
              value={formData.proveedorSugeridoId}
              onChange={handleChange}
            >
              <option value="">-- Sin proveedor sugerido / A cotizar --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre || s.nombreComercial} ({s.especialidad || s.categoria})
                </option>
              ))}
            </select>
          </div>

          {/* Observaciones */}
          <div className="constructa-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="constructa-label">Observaciones y Justificación de la Compra</label>
            <textarea
              name="observaciones"
              className="constructa-input"
              rows={2}
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Indica el frente de trabajo, fase constructiva o justificación del requerimiento..."
            />
          </div>
        </div>

        {/* Botones de acción */}
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
          <Button type="submit" variant="primary">
            {request ? 'Actualizar Solicitud' : 'Registrar Solicitud'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
