import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { ALL_MODULES } from '../../services/roleService.js';
import { Shield, CheckSquare, Square, Info } from 'lucide-react';

export const RoleModal = ({ isOpen, onClose, onSave, role = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    permisos: ['dashboard'],
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        id: role.id,
        nombre: role.nombre || '',
        codigo: role.codigo || '',
        descripcion: role.descripcion || '',
        permisos: Array.isArray(role.permisos) ? role.permisos : ['dashboard'],
        activo: role.activo !== undefined ? role.activo : true,
        esSistema: Boolean(role.esSistema),
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        permisos: ['dashboard'],
        activo: true,
        esSistema: false,
      });
    }
    setErrors({});
  }, [role, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTogglePermission = (moduleId) => {
    setFormData((prev) => {
      const exists = prev.permisos.includes(moduleId);
      const nextPermisos = exists
        ? prev.permisos.filter((p) => p !== moduleId)
        : [...prev.permisos, moduleId];
      return { ...prev, permisos: nextPermisos };
    });
  };

  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      permisos: ALL_MODULES.map((m) => m.id),
    }));
  };

  const handleDeselectAll = () => {
    setFormData((prev) => ({
      ...prev,
      permisos: ['dashboard'], // Mantener al menos dashboard
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del rol es obligatorio.';
    }
    if (formData.permisos.length === 0) {
      newErrors.permisos = 'Debes asignar al menos un módulo de acceso para este rol.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...(role ? { id: role.id } : {}),
        ...formData,
      };

      const res = await onSave(payload);
      if (res && res.ok !== false) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
        {isSaving ? 'Guardando...' : role ? 'Guardar Cambios' : 'Crear Rol'}
      </Button>
    </div>
  );

  // Agrupar módulos por categoría
  const categories = Array.from(new Set(ALL_MODULES.map((m) => m.category)));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? `Editar Rol: ${role.nombre}` : 'Registrar Nuevo Rol Personalizado'}
      footer={footer}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {role?.esSistema && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--color-gold)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <Shield size={16} />
            <span>Este es un rol base del sistema. Su identificador principal está protegido por integridad.</span>
          </div>
        )}

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="role-nombre">
              Nombre del Rol *
            </label>
            <input
              id="role-nombre"
              name="nombre"
              type="text"
              className="form-input"
              placeholder="Ej. Supervisor de Estructuras"
              value={formData.nombre}
              onChange={handleChange}
              disabled={role?.esSistema}
            />
            {errors.nombre && <span className="form-error">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role-codigo">
              Código Único (opcional)
            </label>
            <input
              id="role-codigo"
              name="codigo"
              type="text"
              className="form-input"
              placeholder="Ej. SUP_ESTRUCTURA"
              value={formData.codigo}
              onChange={handleChange}
              disabled={role?.esSistema}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="role-descripcion">
            Descripción de Funciones
          </label>
          <textarea
            id="role-descripcion"
            name="descripcion"
            className="form-input"
            rows="2"
            placeholder="Describe las responsabilidades y alcance operativo de este rol..."
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>

        {/* Matriz de Permisos */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
              Matriz de Permisos por Módulo ({formData.permisos.length} autorizados)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-link"
                style={{ fontSize: '0.78rem', color: 'var(--color-gold)', cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={handleSelectAll}
              >
                Seleccionar Todos
              </button>
              <span style={{ color: 'var(--color-text-muted)' }}>•</span>
              <button
                type="button"
                className="btn-link"
                style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={handleDeselectAll}
              >
                Solo Dashboard
              </button>
            </div>
          </div>
          {errors.permisos && <span className="form-error" style={{ display: 'block', marginBottom: '8px' }}>{errors.permisos}</span>}

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              background: 'var(--color-bg-card)',
            }}
          >
            {categories.map((cat) => {
              const modulesInCat = ALL_MODULES.filter((m) => m.category === cat);
              return (
                <div key={cat} style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    {cat}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
                    {modulesInCat.map((mod) => {
                      const isChecked = formData.permisos.includes(mod.id);
                      return (
                        <label
                          key={mod.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: isChecked ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                            border: `1px solid ${isChecked ? 'rgba(245, 158, 11, 0.25)' : 'transparent'}`,
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(mod.id)}
                            style={{ accentColor: 'var(--color-gold)' }}
                          />
                          <span>{mod.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
