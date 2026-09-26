import React from 'react';
import { useConstructa } from '../context/ConstructaContext';
import MainLayout from '../components/layout/MainLayout';
import Status401 from '../pages/Status/Status401';
import Status403 from '../pages/Status/Status403';

/**
 * Guardián de Rutas Privadas para CONSTRUCTA.
 * Protege el acceso a módulos administrativos. Si la sesión no ha iniciado,
 * muestra el estado corporativo 401. Si el usuario carece de permisos, muestra 403.
 * Si cuenta con acceso autorizado, renderiza la vista dentro del MainLayout.
 */
export const PrivateRoutes = ({ route, children }) => {
  const { currentUser, isAuthenticated, setActiveView, navigateTo } = useConstructa();
  const navigate = navigateTo || setActiveView;

  // 1. Verificación de autenticación (401 - Sesión no iniciada)
  if (!isAuthenticated || !currentUser) {
    return (
      <Status401 
        onLogin={() => navigate('login')} 
        onGoToLogin={() => navigate('login')} 
      />
    );
  }

  // 2. Verificación de autorización de roles (403 - Acceso no autorizado)
  if (route?.requiredRole && currentUser.rol !== route.requiredRole) {
    return (
      <Status403 
        onBackToHome={() => navigate('dashboard')} 
        onGoToDashboard={() => navigate('dashboard')} 
      />
    );
  }

  // 3. Acceso autorizado: Inyectar dentro del Layout Corporativo
  return (
    <MainLayout currentRoute={route?.path || 'dashboard'}>
      {children}
    </MainLayout>
  );
};

export default PrivateRoutes;
