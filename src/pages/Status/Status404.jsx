import React from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import { useConstructa } from '../../context/ConstructaContext.jsx';

export const Status404 = ({ onGoToDashboard, onBackToHome, onGoToPublic }) => {
  const { currentUser, navigateTo, setActiveView } = useConstructa();
  const navigate = navigateTo || setActiveView;

  const isClient = currentUser?.rol === 'Cliente';
  const roleTarget = isClient ? 'portal-cliente' : (currentUser ? 'dashboard' : 'inicio');

  const handleBack = () => {
    if (onBackToHome) onBackToHome();
    else if (onGoToDashboard) onGoToDashboard();
    else if (navigate) navigate(roleTarget);
    else window.location.hash = roleTarget;
  };

  const handlePublic = () => {
    if (onGoToPublic) onGoToPublic();
    else if (navigate) navigate('inicio');
    else window.location.hash = 'inicio';
  };

  const primaryBtnText = isClient
    ? 'Volver a Mi Portal'
    : (currentUser ? 'Volver al Dashboard' : 'Ir al Inicio');

  return (
    <div className="status-page-wrapper">
      <div className="status-code">404</div>
      <h2 className="status-title">Página no encontrada</h2>
      <p className="status-message">
        La sección que buscas no existe o ya no está disponible.
        Verifica la dirección o regresa al panel principal de gestión.
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

export default Status404;
