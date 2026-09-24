import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext.jsx';

export const ToastContainer = ({ toasts: propToasts, onCloseToast }) => {
  const context = useConstructa();
  const alerts = propToasts || context?.alerts || context?.toasts || [];
  const handleClose = onCloseToast || context?.removeAlert || context?.removeToast;

  if (!alerts || alerts.length === 0) return null;

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'exito':
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
      case 'danger':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'advertencia':
      case 'warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'info':
      default:
        return <Info size={18} color="#38bdf8" />;
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {alerts.map((alert) => {
        const tipo = alert.tipo || alert.type || 'info';
        const mensaje = alert.mensaje || alert.message || '';
        return (
          <div key={alert.id} className={`toast-item ${tipo}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {getIcon(tipo)}
              <span>{mensaje}</span>
            </div>
            <button
              type="button"
              className="btn-icon"
              style={{ padding: '0.2rem', marginLeft: '0.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              onClick={() => handleClose && handleClose(alert.id)}
              aria-label="Cerrar notificación"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
