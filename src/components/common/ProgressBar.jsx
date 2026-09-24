import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  labelPrefix = '',
  size = 'md',
  variant,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  // Auto variant based on percentage if not explicitly provided
  let autoVariant = variant;
  if (!autoVariant) {
    if (percentage >= 80) autoVariant = 'success';
    else if (percentage >= 40) autoVariant = 'warning';
    else autoVariant = 'danger';
  }

  const height = size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px';

  return (
    <div className={`progress-container ${className}`.trim()}>
      {showLabel && (
        <div className="progress-header">
          <span>{labelPrefix || 'Avance'}</span>
          <span style={{ fontWeight: 600 }}>{percentage}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className={`progress-fill ${autoVariant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
