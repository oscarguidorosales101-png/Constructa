import React from 'react';
import { ArrowLeft, Globe, LogIn } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import { useConstructa } from '../../context/ConstructaContext.jsx';
import { normalizeRole, getDefaultRouteForRole } from '../../utils/permissions.js';

export const Status403 = ({ onGoToDashboard, onBackToHome, onGoToPublic }) => {
  const { currentUser, navigateTo, setActiveView } = useConstructa();
  const navigate = navigateTo || setActiveView;

  const isClient = normalizeRole(currentUser?.rol) === 'Cliente';
  const roleTarget = getDefaultRouteForRole(currentUser);

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else if (onGoToDashboard) {
      onGoToDashboard();
    } else if (navigate) {
      navigate(roleTarget);
    } else {
      window.location.hash = roleTarget;
    }
  };

  const handlePublic = () => {
    if (onGoToPublic) {
      onGoToPublic();
    } else if (navigate) {
      navigate('inicio');
    } else {
      window.location.hash = 'inicio';
    }
  };

  const primaryBtnText = isClient
    ? 'Volver a Mi Portal'
    : (currentUser ? 'Volver al Dashboard' : 'Iniciar Sesión');

  return (
    <div className="status-page-wrapper">
      <div className="status-code" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        403
      </div>
      <h2 className="status-title">Acceso no autorizado</h2>
      <p className="status-message">
        No cuentas con los permisos suficientes para acceder a este módulo.
        Comunícate con la dirección general de la empresa constructora si requieres permisos adicionales.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
        <Button variant="primary" icon={<ArrowLeft size={16} />} onClick={handleBack}>
          {primaryBtnText}
        </Button>
        <Button variant="secondary" icon={<Globe size={16} />} onClick={handlePublic}>
          Ir al Sitio Web
        </Button>
      </div>
    </div>
  );
};

export default Status403;
