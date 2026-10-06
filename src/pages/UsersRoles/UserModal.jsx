import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import { Search, CheckCircle2, AlertCircle, Building2, User, Phone, Mail, Lock, Shield, RefreshCw } from 'lucide-react';

export const UserModal = ({ isOpen, onClose, onSave, user = null, roles = [] }) => {
  const { consultarHacienda } = useConstructa();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    identificacion: '',
    tipoIdentificacion: '01',
    tipoIdentificacionDescripcion: 'Cédula Física',
    rol: roles[0]?.nombre || 'Usuario / Invitado',
    cargo: '',
    clave: '',
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [haciendaLoading, setHaciendaLoading] = useState(false);
  const [haciendaResult, setHaciendaResult] = useState(null); // { success: boolean, message: string }
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        identificacion: user.identificacion || '',
        tipoIdentificacion: user.tipoIdentificacion || '01',
        tipoIdentificacionDescripcion: user.tipoIdentificacionDescripcion || 'Cédula Física',
        rol: user.rol || roles[0]?.nombre || 'Usuario / Invitado',
        cargo: user.cargo || '',
        clave: '', // no mostrar clave previa por seguridad
        activo: user.activo !== undefined ? user.activo : true,
      });
      setHaciendaResult(null);
    } else {
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        identificacion: '',
        tipoIdentificacion: '01',
        tipoIdentificacionDescripcion: 'Cédula Física',
        rol: roles[0]?.nombre || 'Usuario / Invitado',
        cargo: '',
        clave: '',
        activo: true,
      });
      setHaciendaResult(null);
    }
    setErrors({});
  }, [user, isOpen, roles]);

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

  const handleConsultarHacienda = async () => {
    if (!formData.identificacion || !formData.identificacion.trim()) {
      setErrors((prev) => ({
        ...prev,
        identificacion: 'Ingresa un número de identificación para consultar en Hacienda.',
      }));
      return;
    }

    setHaciendaLoading(true);
    setHaciendaResult(null);
    setErrors((prev) => ({ ...prev, identificacion: null }));

    try {
      const res = await consultarHacienda(formData.identificacion);

      if (res && res.ok) {
        // Separar nombre si viene unificado
        const fullNombre = res.nombre || '';
        const parts = fullNombre.split(' ');
        let firstName = fullNombre;
        let lastName = '';

        if (parts.length > 2) {
          firstName = parts.slice(0, 2).join(' ');
          lastName = parts.slice(2).join(' ');
        } else if (parts.length === 2) {
          firstName = parts[0];
          lastName = parts[1];
        }

        setFormData((prev) => ({
          ...prev,
          nombre: prev.nombre ? prev.nombre : firstName,
          apellidos: prev.apellidos ? prev.apellidos : lastName,
          tipoIdentificacion: res.tipoIdentificacion || '01',
          tipoIdentificacionDescripcion: res.tipoDescripcion || 'Cédula Registrada',
        }));

        setHaciendaResult({
          success: true,
          message: `Identificado en Hacienda: ${res.nombre} (${res.tipoDescripcion || 'Válido'})`,
        });
      } else {
        setHaciendaResult({
          success: false,
          message: res?.error || 'No se localizó la identificación en Hacienda. Puedes ingresar los datos manualmente.',
        });
      }
    } catch (err) {
      setHaciendaResult({
        success: false,
        message: 'Error de conexión con el servicio de Hacienda. Puedes continuar manualmente.',
      });
    } finally {
      setHaciendaLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre o razón social es obligatorio.';
    }

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El formato de correo corporativo no es válido.';
    }

    if (!formData.identificacion.trim()) {
      newErrors.identificacion = 'El número de identificación fiscal o personal es obligatorio.';
    }

    if (!formData.rol) {
      newErrors.rol = 'Selecciona un rol válido del sistema.';
    }

    if (!user && (!formData.clave || formData.clave.length < 4)) {
      newErrors.clave = 'La contraseña inicial debe tener al menos 4 caracteres.';
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
        ...(user ? { id: user.id } : {}),
        ...formData,
      };

      const res = await onSave(payload);
      if (res && (res.ok !== false)) {
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
        {isSaving ? 'Guardando...' : user ? 'Guardar Cambios' : 'Crear Usuario'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Modificar Usuario Corporativo' : 'Registrar Nuevo Usuario'}
      footer={footer}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Sección 1: Identificación y Consulta Tributaria Hacienda */}
        <div style={{ background: 'var(--color-bg-card-hover)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
          <label className="form-label" style={{ fontWeight: 700, color: 'var(--color-gold)' }}>
            Consulta de Identificación (Hacienda de Costa Rica)
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            Ingresa la cédula física (9 dígitos), jurídica (10 dígitos) o DIMEX para autocompletar el nombre oficial registrado en el Ministerio de Hacienda.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '8px', alignItems: 'flex-start' }}>
            <div>
              <input
                id="user-identificacion"
                name="identificacion"
                type="text"
                className="form-input"
                placeholder="Ej. 109990888 o 3101123456"
                value={formData.identificacion}
                onChange={handleChange}
              />
              {errors.identificacion && <span className="form-error">{errors.identificacion}</span>}
            </div>

            <div>
              <select
                id="user-tipoIdentificacion"
                name="tipoIdentificacion"
                className="form-select"
                value={formData.tipoIdentificacion}
                onChange={(e) => {
                  const val = e.target.value;
                  const descMap = { '01': 'Cédula Física', '02': 'Cédula Jurídica', '03': 'DIMEX', '04': 'NITE' };
                  setFormData((prev) => ({
                    ...prev,
                    tipoIdentificacion: val,
                    tipoIdentificacionDescripcion: descMap[val] || 'Identificación Tributaria',
                  }));
                }}
              >
                <option value="01">01 - Cédula Física</option>
                <option value="02">02 - Cédula Jurídica</option>
                <option value="03">03 - DIMEX</option>
                <option value="04">04 - NITE</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleConsultarHacienda}
              disabled={haciendaLoading}
              icon={haciendaLoading ? <RefreshCw size={14} className="spin-animation" /> : <Search size={14} />}
              style={{ whiteSpace: 'nowrap' }}
            >
              {haciendaLoading ? 'Consultando...' : 'Consultar Hacienda'}
            </Button>
          </div>

          {haciendaResult && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: haciendaResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: haciendaResult.success ? '#10b981' : '#f87171',
                border: `1px solid ${haciendaResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {haciendaResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{haciendaResult.message}</span>
            </div>
          )}
        </div>

        {/* Sección 2: Datos Personales / Corporativos */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="user-nombre">
              Nombre / Razón Social *
            </label>
            <input
              id="user-nombre"
              name="nombre"
              type="text"
              className="form-input"
              placeholder="Ej. Fernando"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <span className="form-error">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-apellidos">
              Apellidos
            </label>
            <input
              id="user-apellidos"
              name="apellidos"
              type="text"
              className="form-input"
              placeholder="Ej. Mendoza Rivas"
              value={formData.apellidos}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="user-email">
              Correo Electrónico Corporativo *
            </label>
            <input
              id="user-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="usuario@constructa.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-telefono">
              Teléfono de Contacto
            </label>
            <input
              id="user-telefono"
              name="telefono"
              type="text"
              className="form-input"
              placeholder="+506 2222-0000"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Sección 3: Rol, Cargo y Acceso */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="user-rol">
              Rol Asignado *
            </label>
            <select
              id="user-rol"
              name="rol"
              className="form-select"
              value={formData.rol}
              onChange={handleChange}
            >
              {roles.map((r) => (
                <option key={r.id || r.nombre} value={r.nombre}>
                  {r.nombre}
                </option>
              ))}
            </select>
            {errors.rol && <span className="form-error">{errors.rol}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-cargo">
              Cargo / Posición
            </label>
            <input
              id="user-cargo"
              name="cargo"
              type="text"
              className="form-input"
              placeholder="Ej. Supervisor de Estructuras"
              value={formData.cargo}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="user-clave">
              {user ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña de Acceso *'}
            </label>
            <input
              id="user-clave"
              name="clave"
              type="password"
              className="form-input"
              placeholder={user ? '••••••••' : 'Mínimo 4 caracteres'}
              value={formData.clave}
              onChange={handleChange}
            />
            {errors.clave && <span className="form-error">{errors.clave}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                id="user-activo"
                name="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
              />
              <span style={{ fontWeight: 600 }}>Usuario Activo en Plataforma</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
