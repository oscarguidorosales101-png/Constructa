import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  className = '',
}) => {
  return (
    <div className={`search-box ${className}`.trim()}>
      <Search size={16} />
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="btn-icon"
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0.2rem',
          }}
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
