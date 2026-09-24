import React from 'react';

export const Button = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon;
      return <IconComponent size={size === 'sm' ? 14 : 16} />;
    }
    return null;
  };

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  );
};

export default Button;
