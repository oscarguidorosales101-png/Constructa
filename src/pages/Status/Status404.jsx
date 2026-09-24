import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

export const Status404 = ({ onGoToDashboard, onBackToHome }) => {
  const handleBack = onBackToHome || onGoToDashboard;

  return (
    <div className="status-page-wrapper">
      <div className="status-code">404</div>
      <h2 className="status-title">Página no encontrada</h2>
      <p className="status-message">
        La sección que buscas no existe o ya no está disponible.
        Verifica la dirección o regresa al panel principal de gestión.
      </p>
      <Button variant="primary" icon={<ArrowLeft size={16} />} onClick={handleBack}>
        Volver al Dashboard
      </Button>
    </div>
  );
};

export default Status404;
