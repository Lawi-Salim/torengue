import React from 'react';

const Modal = ({ open, onClose, title, children, contentClassName = '' }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${contentClassName}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fermer le modal">&times;</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(30, 41, 59, 0.25);
          backdrop-filter: blur(2px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.25s;
        }
        .modal-content {
          background: #fff;
          border-radius: 1.25rem;
          box-shadow: 0 8px 32px rgba(30,41,59,0.18), 0 1.5px 6px rgba(59,130,246,0.07);
          min-width: 320px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 0;
          animation: slideUp 0.32s cubic-bezier(.4,1.4,.6,1);
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        .modal-title {
          font-size: 1.18rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--gray-400);
          cursor: pointer;
          line-height: 1;
          padding: 0 0.5rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        .modal-close:hover {
          background: var(--gray-100);
          color: var(--gray-700);
        }
        .modal-body {
          padding: 1.5rem 1.5rem 1.2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        @media (max-width: 600px) {
          .modal-content {
            min-width: 0;
            max-width: 98vw;
            padding: 0;
          }
          .modal-header, .modal-body {
            padding: 1rem;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(40px) scale(0.98);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
