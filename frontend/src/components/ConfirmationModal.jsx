import React from 'react';
import Modal from './Modal';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title={title || 'Confirmation'}>
      <div className="confirmation-modal-content">
        {children}
        <div className="confirmation-modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Non
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Oui
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
