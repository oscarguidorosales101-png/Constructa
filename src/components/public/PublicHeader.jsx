import React, { useState } from 'react';
import { HardHat, LogIn, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import COMPANY_CONFIG from '../../config/companyConfig';

export default function PublicHeader({
  activeSection,
  onNavigateSection,
  onGoToLogin,
  currentUser,
  onGoToDashboard,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'empresa', label: 'Empresa' },
    { id: 'especialidades', label: 'Especialidades' },
    { id: 'proyectos-publicos', label: 'Proyectos' },
    { id: 'video-institucional', label: 'Video' },
    { id: 'logros', label: 'Logros' },
    { id: 'galeria', label: 'Galería' },
    { id: 'vacantes', label: 'Trabaja con Nosotros' },
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

          {/* Acciones de Entrada al Sistema */}
          <div className="public-header-actions">
            {currentUser ? (
              <button
                type="button"
                className="constructa-btn constructa-btn-primary constructa-btn-sm"
                onClick={onGoToDashboard}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <UserCheck size={15} />
                <span>Panel Privado ({currentUser.nombre.split(' ')[0]})</span>
              </button>
            ) : (
              <button
                type="button"
                className="constructa-btn constructa-btn-primary constructa-btn-sm"
                onClick={onGoToLogin}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <LogIn size={15} />
                <span>Iniciar Sesión</span>
              </button>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber, #f59e0b)', fontWeight: 700, textTransform: 'uppercase' }}>
            Navegación Institucional
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="mobile-nav-link"
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
              className="constructa-btn constructa-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onGoToDashboard();
              }}
            >
              <UserCheck size={16} />
              <span>Ir a mi Panel de Control</span>
            </button>
          ) : (
            <button
              type="button"
              className="constructa-btn constructa-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onGoToLogin();
              }}
            >
              <LogIn size={16} />
              <span>Acceso a Colaboradores (Login)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
