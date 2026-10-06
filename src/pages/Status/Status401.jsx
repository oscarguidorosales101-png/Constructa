import React from 'react';
import { LogIn, Globe } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import { useConstructa } from '../../context/ConstructaContext.jsx';

export const Status401 = ({ onGoToLogin, onLogin, onGoToPublic }) => {
  const { navigateTo, setActiveView } = useConstructa ? useConstructa() : {};
  const navigate = navigateTo || setActiveView;

  const handleLogin = () => {
    if (onLogin) onLogin();
    else if (onGoToLogin) onGoToLogin();
    else if (navigate) navigate('login');
    else window.location.hash = 'login';
  };

  const handlePublic = () => {
    if (onGoToPublic) onGoToPublic();
    else if (navigate) navigate('inicio');
    else window.location.hash = 'inicio';
  };

  return (
    <div className="status-page-wrapper">
      <div className="status-code">401</div>
      <h2 className="status-title">Sesión no iniciada</h2>
      <p className="status-message">
        Debes iniciar sesión para acceder a esta sección. Por motivos de seguridad,
        el acceso a las áreas operativas requiere credenciales válidas.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
        <Button variant="primary" icon={<LogIn size={16} />} onClick={handleLogin}>
          Iniciar sesión
        </Button>
        <Button variant="secondary" icon={<Globe size={16} />} onClick={handlePublic}>
          Ir al Sitio Web
        </Button>
      </div>
    </div>
  );
};

export default Status401;
