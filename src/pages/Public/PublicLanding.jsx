import React, { useState, useEffect } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import { useConstructa } from '../../context/ConstructaContext';
import PublicHeader from '../../components/public/PublicHeader';
import PublicHero from '../../components/public/PublicHero';
import PublicAbout from '../../components/public/PublicAbout';
import PublicSpecialties from '../../components/public/PublicSpecialties';
import PublicStats from '../../components/public/PublicStats';
import PublicVideo from '../../components/public/PublicVideo';
import PublicProjects from '../../components/public/PublicProjects';
import PublicGallery from '../../components/public/PublicGallery';
import PublicCareers from '../../components/public/PublicCareers';
import PublicContact from '../../components/public/PublicContact';
import PublicFooter from '../../components/public/PublicFooter';
import { 
  Building2, 
  Layers, 
  FolderKanban, 
  Video, 
  Award, 
  Image as ImageIcon, 
  Briefcase, 
  PhoneCall, 
  Home,
  Compass
} from 'lucide-react';

const MODULES_MAP = {
  inicio: { id: 'inicio', label: 'Inicio', icon: Home },
  empresa: { id: 'empresa', label: 'Empresa', icon: Building2 },
  especialidades: { id: 'especialidades', label: 'Especialidades', icon: Layers },
  proyectos: { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  video: { id: 'video', label: 'Video', icon: Video },
  logros: { id: 'logros', label: 'Logros', icon: Award },
  galeria: { id: 'galeria', label: 'Galería', icon: ImageIcon },
  'trabaja-con-nosotros': { id: 'trabaja-con-nosotros', label: 'Trabaja con Nosotros', icon: Briefcase },
  contacto: { id: 'contacto', label: 'Contacto', icon: PhoneCall },
};

export default function PublicLanding({ config = COMPANY_CONFIG, initialModule = 'inicio' }) {
  // Conexión segura con el contexto general de CONSTRUCTA
  let currentUser = null;
  let navigateTo = null;
  try {
    const ctx = useConstructa();
    if (ctx) {
      currentUser = ctx.currentUser;
      navigateTo = ctx.navigateTo || ctx.setActiveView;
    }
  } catch (e) {
    // Si se monta fuera del contexto de autenticación, opera autónomamente
  }

  // Estado del módulo activo
  const [activeModule, setActiveModule] = useState(() => {
    const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
    if (rawHash && MODULES_MAP[rawHash]) return rawHash;
    if (initialModule && MODULES_MAP[initialModule]) return initialModule;
    return 'inicio';
  });

  // Sincronizar cuando cambia initialModule prop
  useEffect(() => {
    if (initialModule && MODULES_MAP[initialModule] && initialModule !== activeModule) {
      setActiveModule(initialModule);
    }
  }, [initialModule]);

  // Escuchar cambios de hash manuales (atrás / adelante del navegador)
  useEffect(() => {
    const handleHash = () => {
      const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
      if (rawHash && MODULES_MAP[rawHash]) {
        setActiveModule(rawHash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Actualizar título de la pestaña corporativa
  useEffect(() => {
    const moduleName = MODULES_MAP[activeModule]?.label || 'Portal Corporativo';
    document.title = `${moduleName} | ${config.identity.commercialName} — ${config.identity.tagline}`;
  }, [activeModule, config]);

  // Manejador centralizado de cambio de módulo
  const handleNavigateSection = (moduleId) => {
    const target = moduleId.toLowerCase();
    if (MODULES_MAP[target]) {
      setActiveModule(target);
      if (window.location.hash !== `#${target}`) {
        window.location.hash = target;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'login') {
      if (navigateTo) navigateTo('login');
      else window.location.hash = 'login';
    }
  };

  const handleGoToLogin = () => {
    if (navigateTo) navigateTo('login');
    else window.location.hash = 'login';
  };

  const handleGoToDashboard = () => {
    if (navigateTo) navigateTo('dashboard');
    else window.location.hash = 'dashboard';
  };

  // Renderizado dinámico del módulo activo
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'empresa':
        return <PublicAbout config={config} onNavigateSection={handleNavigateSection} />;
      case 'especialidades':
        return <PublicSpecialties config={config} onNavigateSection={handleNavigateSection} />;
      case 'proyectos':
        return <PublicProjects config={config} onNavigateSection={handleNavigateSection} />;
      case 'video':
        return <PublicVideo config={config} onNavigateSection={handleNavigateSection} />;
      case 'logros':
        return <PublicStats config={config} onNavigateSection={handleNavigateSection} />;
      case 'galeria':
        return <PublicGallery config={config} onNavigateSection={handleNavigateSection} />;
      case 'trabaja-con-nosotros':
        return <PublicCareers config={config} onNavigateSection={handleNavigateSection} />;
      case 'contacto':
        return <PublicContact config={config} onNavigateSection={handleNavigateSection} />;
      case 'inicio':
      default:
        return <PublicHero config={config} onNavigateSection={handleNavigateSection} />;
    }
  };

  return (
    <div className="public-site-wrapper">
      {/* Encabezado Corporativo Principal */}
      <PublicHeader 
        config={config}
        activeSection={activeModule}
        onNavigateSection={handleNavigateSection}
        onGoToLogin={handleGoToLogin}
        currentUser={currentUser}
        onGoToDashboard={handleGoToDashboard}
      />

      {/* Subnavegador Rápido de Módulos (Solo visible en módulos secundarios o para alternar rápidamente) */}
      {activeModule !== 'inicio' && (
        <aside className="public-subnav-strip" aria-label="Navegación secundaria de módulos">
          <div className="public-container public-subnav-container">
            <div className="public-subnav-label">
              <Compass size={14} style={{ color: 'var(--color-gold, #f59e0b)' }} />
              <span>Explorar Secciones:</span>
            </div>
            <div className="public-subnav-pills">
              {Object.values(MODULES_MAP).map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleNavigateSection(mod.id)}
                    className={`public-subnav-pill ${isActive ? 'active' : ''}`}
                    title={`Ver ${mod.label}`}
                  >
                    <Icon size={13} />
                    <span>{mod.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      )}

      {/* Contenedor Principal con Transición Suave y Aislada */}
      <main id="main-corporate-content" className="public-site-main">
        <div 
          key={activeModule} 
          className="public-module-wrapper public-module-fade-enter"
        >
          {renderModuleContent()}
        </div>
      </main>

      {/* Pie de Página Corporativo */}
      <PublicFooter 
        config={config} 
        onNavigateSection={handleNavigateSection}
      />
    </div>
  );
}
