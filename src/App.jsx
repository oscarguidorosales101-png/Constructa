import React, { useEffect } from 'react';
import { ConstructaProvider, useConstructa } from './context/ConstructaContext';
import MainLayout from './components/layout/MainLayout';
import ToastContainer from './components/common/ToastContainer';
import ConfirmModal from './components/common/ConfirmModal';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import Employees from './pages/Employees/Employees';
import Materials from './pages/Materials/Materials';
import Suppliers from './pages/Suppliers/Suppliers';
import Budgets from './pages/Budgets/Budgets';
import Expenses from './pages/Expenses/Expenses';
import Schedule from './pages/Schedule/Schedule';
import Progress from './pages/Progress/Progress';
import Reports from './pages/Reports/Reports';

// Status pages
import Status401 from './pages/Status/Status401';
import Status403 from './pages/Status/Status403';
import Status404 from './pages/Status/Status404';

// Valid protected routes
const VALID_ROUTES = [
  'dashboard',
  'proyectos',
  'empleados',
  'materiales',
  'proveedores',
  'presupuestos',
  'gastos',
  'cronograma',
  'avance',
  'reportes'
];

function AppContent() {
  const { 
    currentUser, 
    activeView, 
    setActiveView, 
    navigateTo,
    confirmState, 
    closeConfirm 
  } = useConstructa();

  // Sync route with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (!hash) {
        setActiveView(currentUser ? 'dashboard' : 'login');
        return;
      }

      if (hash === 'login' || hash === '401' || hash === '403' || hash === '404') {
        setActiveView(hash);
      } else if (VALID_ROUTES.includes(hash)) {
        setActiveView(hash);
      } else {
        setActiveView('404');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, setActiveView]);

  // Keep hash updated when activeView changes internally
  useEffect(() => {
    if (activeView) {
      if (window.location.hash.replace('#', '') !== activeView) {
        window.location.hash = activeView;
      }
    }
  }, [activeView]);

  // Render view router
  const renderView = () => {
    // Unauthenticated status checks
    if (!currentUser) {
      if (activeView === '401') {
        return <Status401 onLogin={() => setActiveView('login')} />;
      }
      if (activeView === '404') {
        return <Status404 onBackToHome={() => setActiveView('login')} />;
      }
      if (activeView === '403') {
        return <Status403 onBackToHome={() => setActiveView('login')} />;
      }
      // Any attempt to access protected routes without session triggers 401
      if (VALID_ROUTES.includes(activeView)) {
        return <Status401 onLogin={() => setActiveView('login')} />;
      }
      // Default to Login page
      return <Login onLoginSuccess={() => setActiveView('dashboard')} />;
    }

    // Authenticated user routes
    // Explicit error states
    if (activeView === '401') {
      return <Status401 onLogin={() => setActiveView('dashboard')} />;
    }
    if (activeView === '403') {
      return <Status403 onBackToHome={() => setActiveView('dashboard')} />;
    }
    if (activeView === '404') {
      return <Status404 onBackToHome={() => setActiveView('dashboard')} />;
    }

    // Inside Main Corporate Layout for valid enterprise modules
    let pageComponent = null;
    switch (activeView) {
      case 'dashboard':
        pageComponent = <Dashboard onNavigate={navigateTo || setActiveView} />;
        break;
      case 'proyectos':
        pageComponent = <Projects />;
        break;
      case 'empleados':
        pageComponent = <Employees />;
        break;
      case 'materiales':
        pageComponent = <Materials />;
        break;
      case 'proveedores':
        pageComponent = <Suppliers />;
        break;
      case 'presupuestos':
        pageComponent = <Budgets />;
        break;
      case 'gastos':
        pageComponent = <Expenses />;
        break;
      case 'cronograma':
        pageComponent = <Schedule />;
        break;
      case 'avance':
        pageComponent = <Progress />;
        break;
      case 'reportes':
        pageComponent = <Reports />;
        break;
      case 'login':
        // If logged in and enters login, redirect to dashboard
        pageComponent = <Dashboard onNavigate={navigateTo || setActiveView} />;
        break;
      default:
        return <Status404 onBackToHome={() => setActiveView('dashboard')} />;
    }

    return (
      <MainLayout>
        {pageComponent}
      </MainLayout>
    );
  };

  return (
    <>
      {renderView()}

      {/* Global Confirmation Dialog and Toasts for standalone/unauthenticated views */}
      {!currentUser && (
        <>
          <ToastContainer />
          <ConfirmModal
            isOpen={confirmState.isOpen}
            onClose={closeConfirm}
            onConfirm={confirmState.onConfirm}
            title={confirmState.title}
            message={confirmState.message}
            confirmText={confirmState.confirmText}
            cancelText={confirmState.cancelText}
            confirmVariant={confirmState.confirmVariant}
          />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <ConstructaProvider>
      <AppContent />
    </ConstructaProvider>
  );
}
