import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {children}
    </span>
  );
};

export default Badge;
