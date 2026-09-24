import React, { useState } from 'react';
import { HardHat, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
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

  const handleFillDemo = () => {
    setIdentifier('admin@constructa.com');
    setPassword('admin123');
    setErrors({});
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow-bg" />

      <div className="login-card">
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

        <div className="login-demo-box">
          <div className="login-demo-title">
            <ShieldCheck size={16} />
            <span>Acceso Empresarial Autorizado</span>
          </div>
          <p style={{ margin: '0.25rem 0 0.5rem', lineHeight: 1.4 }}>
            Usuario: <strong style={{ color: '#ffffff' }}>admin@constructa.com</strong> / Clave: <strong style={{ color: '#ffffff' }}>admin123</strong>
          </p>
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={handleFillDemo}
            style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem' }}
          >
            Cargar credenciales de demostración
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
