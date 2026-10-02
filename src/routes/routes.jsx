import React, { useEffect } from 'react';
import { useConstructa } from '../context/ConstructaContext';
import { routeConfig, PRIVATE_MODULES, PUBLIC_ROUTES } from './routeConfig';
import PrivateRoutes from './PrivateRoutes';
import Status401 from '../pages/Status/Status401';
import Status403 from '../pages/Status/Status403';
import Status404 from '../pages/Status/Status404';
import Login from '../pages/Login/Login';
import ToastContainer from '../components/common/ToastContainer';
import ConfirmModal from '../components/common/ConfirmModal';

export const AppRoutes = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    activeView, 
    setActiveView, 
    navigateTo,
    confirmState, 
    closeConfirm 
  } = useConstructa();

  const navigate = navigateTo || setActiveView;

  // Sincronización bidireccional con el hash de la URL
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.split('?')[0].toLowerCase();
      
      if (!hash) {
        const defaultView = currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio';
        setActiveView(defaultView);
        return;
      }

      if (routeConfig[hash]) {
        setActiveView(hash);
      } else {
        setActiveView('404');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, setActiveView]);

  // Mantener actualizado el hash cuando cambia activeView programáticamente
  useEffect(() => {
    if (activeView) {
      const currentHash = window.location.hash.replace('#', '').split('?')[0].toLowerCase();
      if (currentHash !== activeView) {
        window.location.hash = activeView;
      }
    }
  }, [activeView]);

  // Resolución de la vista actual
  const currentKey = activeView || (currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio');
  const currentRoute = routeConfig[currentKey];

  // Caso: Sitio Público Institucional (con soporte para navegación modular)
  const isPublicSection = [
    'inicio',
    'empresa',
    'especialidades',
    'proyectos-publicos',
    'video',
    'logros',
    'galeria',
    'trabaja-con-nosotros',
    'contacto',
  ].includes(currentKey) ||
    (!currentUser && currentKey === 'proyectos') ||
    (currentUser?.rol === 'Cliente' && currentKey === 'proyectos') ||
    (currentUser?.rol === 'RRHH / Reclutamiento' && currentKey === 'proyectos');

  // Resolución del contenido según la ruta
  let content = null;

  if (isPublicSection) {
    const PublicLandingComponent = routeConfig.inicio.component;
    const initialSection = (currentKey === 'proyectos' || currentKey === 'proyectos-publicos') ? 'proyectos' : currentKey;
    content = <PublicLandingComponent initialModule={initialSection} />;
  } else if (currentKey === 'registro' || currentKey === 'registro-cliente') {
    const RegisterComponent = routeConfig.registro.component;
    content = <RegisterComponent onNavigate={navigate} />;
  } else if (!currentRoute) {
    const homeTarget = currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio';
    content = <Status404 onBackToHome={() => navigate(homeTarget)} />;
  } else if (currentKey === '401') {
    content = <Status401 onLogin={() => navigate('login')} />;
  } else if (currentKey === '403') {
    const homeTarget = currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio';
    content = <Status403 onBackToHome={() => navigate(homeTarget)} />;
  } else if (currentKey === '404') {
    const homeTarget = currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio';
    content = <Status404 onBackToHome={() => navigate(homeTarget)} />;
  } else if (currentKey === 'login') {
    if (currentUser) {
      const targetRouteKey = currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard';
      const TargetComponent = routeConfig[targetRouteKey].component;
      content = (
        <PrivateRoutes route={routeConfig[targetRouteKey]}>
          <TargetComponent onNavigate={navigate} />
        </PrivateRoutes>
      );
    } else {
      content = (
        <Login onLoginSuccess={() => navigate(currentUser?.rol === 'Cliente' ? 'portal-cliente' : 'dashboard')} />
      );
    }
  } else if (currentRoute.isPrivate) {
    const Component = currentRoute.component;
    content = (
      <PrivateRoutes route={currentRoute}>
        <Component onNavigate={navigate} />
      </PrivateRoutes>
    );
  } else {
    content = <Status404 onBackToHome={() => navigate(currentUser ? 'dashboard' : 'login')} />;
  }

  return (
    <>
      {content}
      <ToastContainer />
      <ConfirmModal
        isOpen={Boolean(confirmState?.isOpen)}
        title={confirmState?.title || '¿Cerrar sesión?'}
        message={confirmState?.message || '¿Estás seguro de que deseas cerrar tu sesión?'}
        confirmText={confirmState?.confirmText || 'Confirmar'}
        cancelText={confirmState?.cancelText || 'Cancelar'}
        variant={confirmState?.confirmVariant || (confirmState?.isDestructive ? 'danger' : 'primary')}
        confirmVariant={confirmState?.confirmVariant || (confirmState?.isDestructive ? 'danger' : 'primary')}
        isDestructive={Boolean(confirmState?.isDestructive)}
        onConfirm={confirmState?.onConfirm}
        onClose={closeConfirm}
      />
    </>
  );
};

export default AppRoutes;
