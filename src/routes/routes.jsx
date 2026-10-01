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
    'video',
    'logros',
    'galeria',
    'trabaja-con-nosotros',
    'contacto',
  ].includes(currentKey) || (!currentUser && currentKey === 'proyectos');

  if (isPublicSection) {
    const PublicLandingComponent = routeConfig.inicio.component;
    const initialSection = (!currentUser && currentKey === 'proyectos') ? 'proyectos' : currentKey;
    return (
      <>
        <PublicLandingComponent initialModule={initialSection} />
        <ToastContainer />
      </>
    );
  }

  // Caso: Registro y Verificación de Cliente
  if (currentKey === 'registro' || currentKey === 'registro-cliente') {
    const RegisterComponent = routeConfig.registro.component;
    return (
      <>
        <RegisterComponent onNavigate={navigate} />
        <ToastContainer />
      </>
    );
  }

  // Caso: Ruta inexistente (404)
  if (!currentRoute) {
    const homeTarget = currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio';
    return (
      <>
        <Status404 onBackToHome={() => navigate(homeTarget)} />
        <ToastContainer />
      </>
    );
  }

  // Caso: Rutas públicas de error y estado explícito
  if (currentKey === '401') {
    return (
      <>
        <Status401 onLogin={() => navigate('login')} />
        <ToastContainer />
      </>
    );
  }

  if (currentKey === '403') {
    const homeTarget = currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio';
    return (
      <>
        <Status403 onBackToHome={() => navigate(homeTarget)} />
        <ToastContainer />
      </>
    );
  }

  if (currentKey === '404') {
    const homeTarget = currentUser ? (currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard') : 'inicio';
    return (
      <>
        <Status404 onBackToHome={() => navigate(homeTarget)} />
        <ToastContainer />
      </>
    );
  }

  // Caso: Inicio de sesión (Login)
  if (currentKey === 'login') {
    if (currentUser) {
      // Si ya está autenticado y entra a login, se le muestra su espacio correspondiente
      const targetRouteKey = currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard';
      const TargetComponent = routeConfig[targetRouteKey].component;
      return (
        <PrivateRoutes route={routeConfig[targetRouteKey]}>
          <TargetComponent onNavigate={navigate} />
        </PrivateRoutes>
      );
    }
    return (
      <>
        <Login onLoginSuccess={() => navigate(currentUser?.rol === 'Cliente' ? 'portal-cliente' : 'dashboard')} />
        <ToastContainer />
      </>
    );
  }

  // Caso: Rutas Privadas del Sistema CONSTRUCTA
  if (currentRoute.isPrivate) {
    const Component = currentRoute.component;
    return (
      <PrivateRoutes route={currentRoute}>
        <Component onNavigate={navigate} />
      </PrivateRoutes>
    );
  }

  // Fallback por defecto
  return (
    <>
      <Status404 onBackToHome={() => navigate(currentUser ? 'dashboard' : 'login')} />
      <ToastContainer />
    </>
  );
};

export default AppRoutes;
