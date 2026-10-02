import React, { useState } from 'react';
import { HardHat, LogIn, Menu, X, ArrowRight, UserCheck, Briefcase, Sliders, Bot } from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';
import { useConstructa } from '../../context/ConstructaContext';

export default function PublicHeader({
  activeSection,
  onNavigateSection,
  onGoToLogin,
  currentUser,
  onGoToDashboard,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAccessibilityModal, openAIAssistantModal } = useConstructa();

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'empresa', label: 'Empresa' },
    { id: 'especialidades', label: 'Especialidades' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'video', label: 'Video' },
    { id: 'logros', label: 'Logros' },
    { id: 'galeria', label: 'Galería' },
    { id: 'trabaja-con-nosotros', label: 'Trabaja con Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    }
  };

  return (
    <header className="public-header">
      <div className="public-container">
        <nav className="public-navbar">
          {/* Logo Corporativo */}
          <div
            className="public-brand"
            onClick={() => handleNavClick('inicio')}
            role="button"
            tabIndex={0}
          >
            <div className="public-brand-icon">
              <HardHat size={22} />
            </div>
            <div className="public-brand-text">
              <span className="public-brand-title">{COMPANY_CONFIG.identity.commercialName}</span>
              <span className="public-brand-subtitle">Infraestructura & Obra</span>
            </div>
          </div>

          {/* Enlaces de Navegación Desktop */}
          <ul className="public-nav-links">
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`public-nav-item ${activeSection === item.id ? 'active' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Acciones de Entrada al Sistema & Accesibilidad */}
          <div className="public-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={openAIAssistantModal}
              title="Asistente de IA"
              style={{
                color: 'var(--accent-blue, #38bdf8)',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Bot size={15} />
              <span className="hide-mobile">IA</span>
            </button>

            <button
              type="button"
              className="btn-icon"
              onClick={openAccessibilityModal}
              title="Centro de Accesibilidad & Tema"
              style={{
                color: 'var(--accent-amber, #f59e0b)',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Sliders size={15} />
              <span className="hide-mobile">Accesibilidad</span>
            </button>
            {currentUser ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onGoToDashboard}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <UserCheck size={15} />
                <span>
                  {currentUser.rol === 'Cliente'
                    ? `Portal Cliente (${currentUser.nombre.split(' ')[0]})`
                    : `Panel Privado (${currentUser.nombre.split(' ')[0]})`}
                </span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <a
                  href="#registro"
                  className="btn btn-outline btn-sm hide-mobile"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Briefcase size={14} />
                  <span>Portal Clientes</span>
                </a>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onGoToLogin}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <LogIn size={15} />
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            )}

            {/* Botón Menú Móvil */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Menú Móvil Desplegable */}
      <div className={`public-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--accent-amber, #f59e0b)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Navegación Institucional
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span>{item.label}</span>
            <ArrowRight size={15} style={{ opacity: 0.6 }} />
          </button>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {currentUser ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onGoToDashboard();
              }}
            >
              <UserCheck size={16} />
              <span>
                {currentUser.rol === 'Cliente'
                  ? 'Ir a mi Portal de Cliente'
                  : 'Ir a mi Panel de Control'}
              </span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="#registro"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase size={16} />
                <span>Registro de Cuenta Cliente</span>
              </a>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoToLogin();
                }}
              >
                <LogIn size={16} />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
