import React from 'react';
import Modal from '../../../components/Modal';
import UserAvatar from '../../../components/UserAvatar';
import './UserDetailsModal.css';

const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title={`Détails de ${user.nom}`}>
      <div className="user-details-modal-content">
        <div className="user-details-header">
          <UserAvatar name={user.nom} size={80} />
          <div className="user-details-title">
            <h3>{user.nom}</h3>
            <p className={`badge-role role-${user.role}`}>{user.role}</p>
          </div>
        </div>
        <div className="user-details-body">
          <h4>Informations Générales</h4>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Téléphone:</strong> {user.telephone || 'N/A'}</p>
          <p><strong>Date d'inscription:</strong> {new Date(user.date_inscription).toLocaleDateString('fr-FR')}</p>
          
          {user.role === 'client' && user.client && (
            <>
              <hr />
              <h4>Détails Client</h4>
              <p><strong>Adresse de facturation:</strong> {user.client.adresse_facturation || 'N/A'}</p>
            </>
          )}

          {user.role === 'vendeur' && user.vendeur && (
            <>
              <hr />
              <h4>Détails Vendeur</h4>
              <p><strong>Nom de la boutique:</strong> {user.vendeur.nom_boutique || 'N/A'}</p>
              <p><strong>Adresse de la boutique:</strong> {user.vendeur.adresse || 'N/A'}</p>
              <p><strong>Statut:</strong> <span className={`statut-${user.vendeur.statut}`}>{user.vendeur.statut}</span></p>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailsModal;
