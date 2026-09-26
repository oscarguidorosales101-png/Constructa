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
      const hash = window.location.hash.replace('#', '').toLowerCase();
      
      if (!hash) {
        setActiveView(currentUser ? 'dashboard' : 'login');
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
      if (window.location.hash.replace('#', '') !== activeView) {
        window.location.hash = activeView;
      }
    }
  }, [activeView]);

  // Resolución de la vista actual
  const currentKey = activeView || (currentUser ? 'dashboard' : 'login');
  const currentRoute = routeConfig[currentKey];

  // Caso: Ruta inexistente (404)
  if (!currentRoute) {
    return (
      <>
        <Status404 onBackToHome={() => navigate(currentUser ? 'dashboard' : 'login')} />
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
    return (
      <>
        <Status403 onBackToHome={() => navigate(currentUser ? 'dashboard' : 'login')} />
        <ToastContainer />
      </>
    );
  }

  if (currentKey === '404') {
    return (
      <>
        <Status404 onBackToHome={() => navigate(currentUser ? 'dashboard' : 'login')} />
        <ToastContainer />
      </>
    );
  }

  // Caso: Inicio de sesión (Login)
  if (currentKey === 'login') {
    if (currentUser) {
      // Si ya está autenticado y entra a login, se le muestra el dashboard
      const DashboardComponent = routeConfig.dashboard.component;
      return (
        <PrivateRoutes route={routeConfig.dashboard}>
          <DashboardComponent onNavigate={navigate} />
        </PrivateRoutes>
      );
    }
    return (
      <>
        <Login onLoginSuccess={() => navigate('dashboard')} />
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
