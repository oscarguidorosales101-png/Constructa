import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

export const Status403 = ({ onGoToDashboard, onBackToHome }) => {
  const handleBack = onBackToHome || onGoToDashboard;

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
      <Button variant="primary" icon={<ArrowLeft size={16} />} onClick={handleBack}>
        Volver al Dashboard
      </Button>
    </div>
  );
};

export default Status403;
