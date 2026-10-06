import React from 'react';

const SYMBOL_MAP = {
  success: '✓',
  warning: '⚠',
  danger: '×',
  error: '×',
  info: 'ℹ',
  primary: '▶',
  neutral: '•'
};

export const Badge = ({ children, variant = 'neutral', icon, showSymbol = true, className = '', ...props }) => {
  const normVariant = variant?.toLowerCase() || 'neutral';
  const defaultSymbol = SYMBOL_MAP[normVariant] || null;

  // Si children ya empieza con un símbolo semántico, no duplicar
  const startsWithSymbol = typeof children === 'string' && /^[✓✔⚠!×✕✖ℹi▶•·\-\*]/.test(children.trim());
  const renderSymbol = showSymbol && !icon && !startsWithSymbol && defaultSymbol;

  return (
    <span className={`badge badge-${normVariant} ${className}`.trim()} {...props}>
      {icon && <span className="badge-icon" aria-hidden="true">{icon}</span>}
      {renderSymbol && (
        <span className="badge-symbol" aria-hidden="true" style={{ fontWeight: '700', marginRight: '2px', display: 'inline-block' }}>
          {defaultSymbol}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
