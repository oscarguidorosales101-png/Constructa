import React, { useState } from 'react';
import { HardHat, Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import ToastContainer from '../../components/common/ToastContainer.jsx';

export const Login = ({ onLoginSuccess }) => {
  const { login } = useConstructa();
  const [identifier, setIdentifier] = useState('admin@constructa.com');
  const [password, setPassword] = useState('admin123');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Ingresa tu usuario o correo electrónico corporativo.';
    }
    if (!password.trim()) {
      newErrors.password = 'Ingresa tu clave de acceso.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsSubmitting(false);
      if (res.ok && onLoginSuccess) {
        onLoginSuccess();
      }
    }, 300);
  };

  const handleQuickLogin = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(email, pass);
      setIsSubmitting(false);
      if (res.ok && onLoginSuccess) {
        onLoginSuccess();
      }
    }, 200);
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow-bg" />

      <div className="login-card" style={{ maxWidth: '480px', width: '95%' }}>
        {/* Navigation back to public portal */}
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'flex-start' }}>
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
              transition: 'background 0.2s ease'
            }}
          >
            <ArrowLeft size={14} /> Volver al Sitio Público
          </a>
        </div>

        <div className="login-brand">
          <div className="login-logo-box">
            <HardHat size={30} />
          </div>
          <h1 className="login-title">CONSTRUCTA</h1>
          <p className="login-subtitle">Sistema de Gestión para Empresa Constructora</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-identifier">
              Usuario o Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-identifier"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ejemplo@constructa.com"
                autoComplete="username"
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
            {errors.identifier && (
              <span className="form-error">{errors.identifier}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Contraseña de Acceso
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: '100%' }}
              icon={ArrowRight}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            </Button>
          </div>
        </form>

        <div className="login-demo-box" style={{ marginTop: '1.5rem' }}>
          <div className="login-demo-title" style={{ marginBottom: '0.75rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--color-gold)' }} />
            <span>Accesos Rápidos de Demostración por Rol</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* 1. Administrador */}
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => handleQuickLogin('admin@constructa.com', 'admin123')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.82rem' }}>
                  Administrador General
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  admin@constructa.com (Ing. Fernando Mendoza)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                Entrar &rarr;
              </span>
            </button>

            {/* 2. Gerente de Construcción */}
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => handleQuickLogin('gerente@constructa.com', 'gerente123')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.82rem' }}>
                  Gerente de Construcción
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  gerente@constructa.com (Ing. Carlos Mendoza Rivas)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                Entrar &rarr;
              </span>
            </button>

            {/* 3. RRHH / Reclutamiento */}
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => handleQuickLogin('rrhh@constructa.com', 'rrhh123')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.82rem' }}>
                  RRHH / Reclutamiento
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  rrhh@constructa.com (Lic. Mariana Morales Solís)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                Entrar &rarr;
              </span>
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
