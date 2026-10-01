import React, { useState } from 'react';
import {
  HardHat,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  FileText,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import ToastContainer from '../../components/common/ToastContainer.jsx';

export const ClientRegister = ({ onNavigate }) => {
  const { registerClient, verifyClientAccount, login, showAlert } = useConstructa();

  // Paso del flujo: 'form' | 'verify'
  const [step, setStep] = useState('form');

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ciudad: '',
    pais: 'México',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del paso de verificación
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Modales de Términos y Privacidad
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

  // Validación de contraseña en tiempo real
  const passwordCriteria = {
    length: formData.password.length >= 6,
    hasNumber: /\d/.test(formData.password),
    hasLetter: /[a-zA-Z]/.test(formData.password),
    match: formData.password && formData.password === formData.confirmPassword,
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre completo es obligatorio.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un formato de correo válido.';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono de contacto es obligatorio.';
    }
    if (!formData.password) {
      newErrors.password = 'Define una contraseña segura.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar el Aviso de Privacidad y Términos.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const res = registerClient({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        ciudad: formData.ciudad.trim() || 'Monterrey, N.L.',
        pais: formData.pais,
        password: formData.password,
      });

      setIsSubmitting(false);

      if (res.ok) {
        setRegisteredEmail(res.cliente.email);
        setSimulatedCode(res.cliente.codigoVerificacion);
        setStep('verify');
      } else {
        setErrors({ email: res.error || 'No se pudo completar el registro.' });
      }
    }, 400);
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      showAlert('Ingresa el código de verificación.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = verifyClientAccount(registeredEmail, verificationCode.trim());
      setIsSubmitting(false);

      if (res.ok) {
        // Iniciar sesión automáticamente tras verificación exitosa
        login(registeredEmail, formData.password);
        if (onNavigate) {
          onNavigate('portal-cliente');
        } else {
          window.location.hash = 'portal-cliente';
        }
      } else {
        showAlert(res.error || 'Código incorrecto. Revisa el código proporcionado.', 'error');
      }
    }, 400);
  };

  return (
    <div className="login-wrapper" style={{ padding: '2rem 1rem' }}>
      <div className="login-glow-bg" />

      <div className="login-card" style={{ maxWidth: '560px', width: '100%', margin: 'auto' }}>
        {/* Cabecera / Navegación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <a
            href="#inicio"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-gold)',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <ArrowLeft size={14} /> Sitio Público
          </a>

          <a
            href="#login"
            style={{
              color: '#94a3b8',
              fontSize: '0.84rem',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            ¿Ya tienes cuenta? <span style={{ color: '#f59e0b', fontWeight: 600 }}>Iniciar Sesión</span>
          </a>
        </div>

        {/* Marca CONSTRUCTA */}
        <div className="login-brand" style={{ marginBottom: '1.5rem' }}>
          <div className="login-logo-box">
            <HardHat size={28} />
          </div>
          <h1 className="login-title" style={{ fontSize: '1.5rem' }}>
            {step === 'form' ? 'Registro de Cuenta Cliente' : 'Verificación de Cuenta'}
          </h1>
          <p className="login-subtitle">
            {step === 'form'
              ? 'Acceda a presupuestos formales, seguimiento de obra y documentación de su proyecto.'
              : 'Verifique su identidad para proteger la confidencialidad de sus obras y contratos.'}
          </p>
        </div>

        {/* Indicador de Pasos */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '0.6rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: step === 'form' ? '#f59e0b' : '#10b981', fontWeight: 700, fontSize: '0.8rem' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === 'form' ? '#f59e0b' : '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>1</span>
            Datos del Cliente
          </div>
          <div style={{ width: '30px', height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: step === 'verify' ? '#f59e0b' : '#64748b', fontWeight: 700, fontSize: '0.8rem' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === 'verify' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)', color: step === 'verify' ? '#000' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>2</span>
            Verificación de Seguridad
          </div>
        </div>

        {/* ===================== PASO 1: FORMULARIO DE REGISTRO ===================== */}
        {step === 'form' && (
          <form onSubmit={handleRegisterSubmit} noValidate>
            {/* Nombre Completo */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-nombre">Nombre Completo o Razón Social</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-nombre"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej. Roberto Garza Sada"
                />
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            {/* Email & Teléfono */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="cliente@empresa.com"
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-telefono">Teléfono / WhatsApp</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-telefono"
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+52 81 0000 0000"
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                {errors.telefono && <span className="form-error">{errors.telefono}</span>}
              </div>
            </div>

            {/* Ubicación (Ciudad) */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-ciudad">Ciudad o Estado de Residencia / Proyecto</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-ciudad"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  placeholder="Ej. Monterrey, N.L."
                />
                <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Contraseña & Confirmación */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">Confirmar Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Repita contraseña"
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                    title={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Checklist de requisitos de contraseña */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.6rem 0.85rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>Requisitos de seguridad:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.7rem' }}>
                <span style={{ color: passwordCriteria.length ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Al menos 6 caracteres
                </span>
                <span style={{ color: passwordCriteria.hasNumber ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Incluye un número
                </span>
                <span style={{ color: passwordCriteria.hasLetter ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Incluye letras
                </span>
                <span style={{ color: passwordCriteria.match ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Contraseñas coinciden
                </span>
              </div>
            </div>

            {/* Aceptación de Términos y Privacidad (Sección 9, 40) */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#f59e0b' }}
                />
                <span>
                  He leído y acepto el{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}
                  >
                    Aviso de Privacidad
                  </button>{' '}
                  y los{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}
                  >
                    Términos y Condiciones
                  </button>{' '}
                  de CONSTRUCTA para la gestión de proyectos de construcción.
                </span>
              </label>
              {errors.acceptTerms && <span className="form-error">{errors.acceptTerms}</span>}
            </div>

            {/* Botón de Envío */}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: '100%' }}
              icon={ArrowRight}
            >
              {isSubmitting ? 'Registrando cliente...' : 'Crear Cuenta y Continuar'}
            </Button>
          </form>
        )}

        {/* ===================== PASO 2: VERIFICACIÓN DE CUENTA ===================== */}
        {step === 'verify' && (
          <form onSubmit={handleVerifySubmit} noValidate>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px' }}>
                <Shield size={18} />
                <span>Simulación de Código de Verificación</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                Para fines de demostración en la arquitectura actual, su código de activación asignado es:
              </p>
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 1rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'monospace',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#f59e0b',
                  letterSpacing: '0.2em',
                }}
              >
                <KeyRound size={18} /> {simulatedCode}
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', marginBottom: 0 }}>
                * En producción, este código es enviado a: <strong>{registeredEmail}</strong>.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="verification-input" style={{ textAlign: 'center', display: 'block', fontSize: '0.85rem' }}>
                Ingrese el Código de Verificación (6 dígitos)
              </label>
              <input
                id="verification-input"
                type="text"
                maxLength={6}
                className="form-input"
                style={{
                  textAlign: 'center',
                  letterSpacing: '0.35em',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  maxWidth: '240px',
                  margin: '0 auto',
                  display: 'block',
                }}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVerificationCode(simulatedCode)}
                style={{ flex: 1 }}
              >
                Autocompletar Código
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                style={{ flex: 1.5 }}
                icon={CheckCircle2}
              >
                {isSubmitting ? 'Verificando...' : 'Verificar y Acceder'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* MODAL DE AVISO DE PRIVACIDAD / TÉRMINOS */}
      {legalModal && (
        <div className="client-modal-overlay" onClick={() => setLegalModal(null)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="client-modal-header">
              <h3>
                {legalModal === 'privacy' ? 'Aviso de Privacidad' : 'Términos y Condiciones del Cliente'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div className="client-modal-body" style={{ fontSize: '0.84rem', lineHeight: 1.6, color: '#cbd5e1' }}>
              {legalModal === 'privacy' ? (
                <>
                  <p>
                    <strong>CONSTRUCTA DE MÉXICO S.A. DE C.V.</strong>, con domicilio en Av. Constitución 1450, Monterrey, N.L., es responsable del uso y protección de sus datos personales.
                  </p>
                  <p>
                    Los datos recabados (nombre, teléfono, correo electrónico, ubicación del predio y documentación técnica) serán utilizados exclusivamente para:
                  </p>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    <li>Elaboración y emisión de presupuestos y propuestas comerciales.</li>
                    <li>Evaluación técnica de viabilidad por la Gerencia de Construcción.</li>
                    <li>Coordinación de reuniones ejecutivas y visitas a obra.</li>
                    <li>Formalización de contratos de obra civil y seguimiento financiero.</li>
                  </ul>
                  <p>
                    No transferimos sus datos personales a terceros sin su consentimiento explícito, salvo los supuestos previstos en la legislación aplicable.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Condiciones del Servicio Comercial y Operativo:</strong>
                  </p>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    <li>
                      <strong>Alcance de la Solicitud Inicial:</strong> El registro y envío de información no constituye un contrato de obra definitivo ni obliga a la empresa a iniciar trabajos sin contrato firmado.
                    </li>
                    <li>
                      <strong>Evaluación Preliminar:</strong> Los presupuestos iniciales son estimados y están sujetos a confirmación técnica, mecánica de suelos y levantamiento topográfico.
                    </li>
                    <li>
                      <strong>Propiedad de la Documentación:</strong> Los planos y memorias técnicas provistos por el cliente se resguardan bajo estricta confidencialidad.
                    </li>
                    <li>
                      <strong>Visitas a Terreno:</strong> Toda visita a obra requiere coordinación previa con el Administrador o Gerente de Construcción.
                    </li>
                  </ul>
                </>
              )}
            </div>
            <div className="client-modal-footer">
              <Button
                variant="primary"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, acceptTerms: true }));
                  setLegalModal(null);
                }}
              >
                Entendido y Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ClientRegister;
