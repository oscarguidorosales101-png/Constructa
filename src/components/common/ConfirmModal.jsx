import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Confirmación',
  message = '¿Deseas continuar con esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant,
  confirmVariant,
  isDestructive = false,
  onConfirm,
  onClose,
}) => {
  const handleConfirmClick = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const isDanger = isDestructive || variant === 'danger' || confirmVariant === 'danger';

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button
        variant={isDanger ? 'danger' : 'primary'}
        onClick={handleConfirmClick}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      maxWidth="460px"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isDanger ? '#ef4444' : '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <p style={{ color: 'var(--color-text-primary, #f8fafc)', fontSize: '0.95rem', lineHeight: 1.5, marginTop: '0.3rem' }}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
