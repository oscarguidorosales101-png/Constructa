import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CONSTRUCTA ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '2rem',
            margin: '1.5rem auto',
            maxWidth: '600px',
            background: 'var(--bg-card, #131926)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.15))',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'var(--text-primary, #f8fafc)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            {this.props.title || 'Módulo temporalmente no disponible'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', margin: '0 0 1.25rem' }}>
            Ocurrió un evento inesperado al cargar esta sección. El resto del sistema continúa funcionando normalmente.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCcw size={16} /> Reintentar módulo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
