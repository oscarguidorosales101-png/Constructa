import React from 'react';
import { SearchX, FolderOpen, Plus } from 'lucide-react';
import Button from './Button.jsx';

export const EmptyState = ({
  isSearch = false,
  title,
  message,
  actionText,
  onAction,
  icon: CustomIcon,
}) => {
  const IconToRender = CustomIcon || (isSearch ? SearchX : FolderOpen);
  const defaultTitle = isSearch ? 'Sin resultados' : 'No hay registros disponibles';
  const defaultMessage = isSearch
    ? 'No encontramos información que coincida con tu búsqueda o los filtros seleccionados.'
    : 'Aún no se ha registrado información en este módulo.';

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <IconToRender size={28} />
      </div>
      <h3 className="empty-state-title">{title || defaultTitle}</h3>
      <p className="empty-state-text">{message || defaultMessage}</p>
      {actionText && onAction && (
        <Button variant="primary" icon={Plus} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
