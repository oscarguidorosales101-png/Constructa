import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Buscar...',
  className = '',
  style = {},
  inputStyle = {},
  autoFocus = false,
  id,
  name = 'search',
  disabled = false,
  ...props
}) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('', e);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`search-box ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '480px',
        ...style,
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '0.85rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted, #94a3b8)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        className="form-input"
        value={value ?? ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck="false"
        style={{
          paddingLeft: '2.5rem',
          paddingRight: Boolean(value) ? '2.5rem' : '1rem',
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'text',
          pointerEvents: 'auto',
          ...inputStyle,
        }}
        {...props}
      />
      {Boolean(value) && !disabled && (
        <button
          type="button"
          className="btn-icon"
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            minHeight: '28px',
            minWidth: '28px',
            borderRadius: 'var(--radius-full, 9999px)',
          }}
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
