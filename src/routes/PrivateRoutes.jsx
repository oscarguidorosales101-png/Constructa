import React from 'react';
import { useConstructa } from '../context/ConstructaContext';
import MainLayout from '../components/layout/MainLayout';
import Status401 from '../pages/Status/Status401';
import Status403 from '../pages/Status/Status403';
import { hasPermission } from '../utils/permissions';

/**
 * Guardián de Rutas Privadas para CONSTRUCTA.
 * Protege el acceso a módulos administrativos. Si la sesión no ha iniciado,
 * muestra el estado corporativo 401. Si el usuario carece de permisos, muestra 403.
 * Si cuenta con acceso autorizado, renderiza la vista dentro del MainLayout.
 */
export const PrivateRoutes = ({ route, children }) => {
  const { currentUser, isAuthenticated, setActiveView, navigateTo } = useConstructa();
  const navigate = navigateTo || setActiveView;

  // 1. Verificación de autenticación (401 - Sesión no iniciada / Redirección a login)
  if (!isAuthenticated || !currentUser) {
    if (typeof window !== 'undefined' && window.location.hash.replace('#', '') !== 'login') {
      window.location.hash = 'login';
    }
    return (
      <Status401 
        onLogin={() => navigate('login')} 
        onGoToLogin={() => navigate('login')} 
        onGoToPublic={() => navigate('inicio')}
      />
    );
  }

  // 2. Verificación paramétrica de autorización de roles (403 - Acceso no autorizado)
  const isAllowed = hasPermission(currentUser.rol, route?.path);
  if (!isAllowed) {
    const fallbackTarget = currentUser.rol === 'Cliente' ? 'portal-cliente' : 'dashboard';
    return (
      <Status403 
        onBackToHome={() => navigate(fallbackTarget)} 
        onGoToDashboard={() => navigate(fallbackTarget)} 
        onGoToPublic={() => navigate('inicio')}
      />
    );
  }

  // 3. Si el usuario es Cliente externo, renderizar su portal especializado directamente
  // (El Portal del Cliente posee su propia barra superior ejecutiva y navegación dedicada)
  if (currentUser.rol === 'Cliente') {
    return <>{children}</>;
  }

  // 4. Acceso administrativo/interno autorizado: Inyectar dentro del Layout Corporativo
  return (
    <MainLayout currentRoute={route?.path || 'dashboard'}>
      {children}
    </MainLayout>
  );
};

export default PrivateRoutes;
