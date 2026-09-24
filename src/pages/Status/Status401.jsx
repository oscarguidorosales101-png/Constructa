import React from 'react';
import { LogIn } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

export const Status401 = ({ onGoToLogin, onLogin }) => {
  const handleLogin = onLogin || onGoToLogin;

  return (
    <div className="status-page-wrapper">
      <div className="status-code">401</div>
      <h2 className="status-title">Sesión no iniciada</h2>
      <p className="status-message">
        Debes iniciar sesión para acceder a esta sección. Por motivos de seguridad,
        el acceso a las áreas operativas requiere credenciales válidas.
      </p>
      <Button variant="primary" icon={<LogIn size={16} />} onClick={handleLogin}>
        Iniciar sesión
      </Button>
    </div>
  );
};

export default Status401;
