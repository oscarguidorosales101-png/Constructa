import React, { useState } from 'react';
import { HardHat, Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck, ChevronDown, CheckCircle2, User, KeyRound } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import Button from '../../components/common/Button.jsx';
import ToastContainer from '../../components/common/ToastContainer.jsx';

export const Login = ({ onLoginSuccess }) => {
  const { login } = useConstructa();
  const [identifier, setIdentifier] = useState('admin@constructa.com');
  const [password, setPassword] = useState('admin');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Administrador');

  const DEMO_ACCOUNTS = [
    {
      role: 'Administrador',
      title: 'Administrador General',
      email: 'admin@constructa.com',
      password: 'admin',
      name: 'Ing. Fernando Mendoza',
      badge: 'Dirección & Finanzas',
      color: '#f59e0b',
    },
    {
      role: 'Gerente de Construcción',
      title: 'Gerente de Construcción',
      email: 'gerencia@constructa.com',
      password: 'Gerencia2026!',
      name: 'Ing. Carlos Mendoza Rivas',
      badge: 'Operaciones & Obras',
      color: '#38bdf8',
    },
    {
      role: 'RRHH / Reclutamiento',
      title: 'RRHH / Reclutamiento',
      email: 'rrhh@constructa.com',
      password: 'RRHH2026!',
      name: 'Lic. Mariana Morales Solís',
      badge: 'Talento & Citas',
      color: '#a855f7',
    },
    {
      role: 'Cliente',
      title: 'Cliente (Propietario de Obra)',
      email: 'cliente@constructa.com',
      password: 'Cliente2026!',
      name: 'Lic. Roberto Garza Sada',
      badge: 'Portal Cliente',
      color: '#10b981',
    },
  ];

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
      if (res.ok) {
        if (res.usuario.rol === 'Cliente') {
          window.location.hash = 'portal-cliente';
        } else if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    }, 300);
  };

  const handleSelectDemoAccount = (acc) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setSelectedRole(acc.role);
    setErrors({});
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow-bg" />

      <div className="login-card" style={{ maxWidth: '490px', width: '95%' }}>
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
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              transition: 'background 0.2s ease',
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
          <p className="login-subtitle">Sistema de Gestión Integral para Empresa Constructora</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {selectedRole && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#f59e0b" />
                <span style={{ color: '#cbd5e1' }}>Cuenta seleccionada:</span>
                <strong style={{ color: '#ffffff' }}>{selectedRole}</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoAccounts(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-gold)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Cambiar
              </button>
            </div>
          )}

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
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setSelectedRole(null);
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setSelectedRole(null);
                }}
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

          <div style={{ marginTop: '1.25rem' }}>
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

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
            ¿Desea solicitar una cotización o dar seguimiento a su obra?{' '}
            <a
              href="#registro"
              style={{
                color: 'var(--color-gold)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Crear cuenta de Cliente &rarr;
            </a>
          </div>
        </form>

        {/* Sección de Cuentas de Demostración con Acordeón Fluido */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={16} color="var(--color-gold)" />
              <span>Cuentas de demostración</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {showDemoAccounts ? 'Ocultar' : 'Ver cuentas'}
              </span>
              <ChevronDown
                size={16}
                style={{
                  transform: showDemoAccounts ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: 'var(--color-gold)',
                }}
              />
            </div>
          </button>

          <div
            style={{
              maxHeight: showDemoAccounts ? '680px' : '0px',
              opacity: showDemoAccounts ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 320ms cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: showDemoAccounts ? '0.75rem' : '0',
            }}
          >
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0 0 8px 4px' }}>
              Seleccione una cuenta para autocompletar credenciales oficiales de demostración:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = identifier === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.84rem' }}>
                          {acc.title}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: `${acc.color}22`,
                            color: acc.color,
                            border: `1px solid ${acc.color}44`,
                          }}
                        >
                          {acc.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
                        {acc.email} • pass: <span style={{ color: '#cbd5e1' }}>{acc.password}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: isSelected ? '#f59e0b' : '#94a3b8',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px',
                      }}
                    >
                      {isSelected ? '✓ Seleccionada' : 'Seleccionar →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
