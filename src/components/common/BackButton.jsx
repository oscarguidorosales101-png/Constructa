import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from './Button';

/**
 * Reusable BackButton component for CONSTRUCTA.
 * Standardized "← Regresar" action for details, sub-views and forms.
 * Respects visual consistency (dark obsidian, gold accents, responsive).
 */
export const BackButton = ({
  onClick,
  label = '← Regresar',
  variant = 'secondary',
  size = 'sm',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={`btn-back-constructa ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        padding: size === 'sm' ? '6px 14px' : '8px 18px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default BackButton;
