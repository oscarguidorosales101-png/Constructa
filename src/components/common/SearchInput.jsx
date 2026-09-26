import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  className = '',
}) => {
  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`search-box ${className}`.trim()} style={{ position: 'relative' }}>
      <Search size={16} />
      <input
        type="text"
        className="form-input"
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {Boolean(value) && (
        <button
          type="button"
          className="btn-icon"
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0.2rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
