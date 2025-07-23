import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { FiMail, FiPhone, FiShoppingCart, FiUser, FiMap, FiBell, FiTrash2 } from 'react-icons/fi';
import apiService from '../../apiService';
import './styles.css';

const ProfilUser = ({ onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await apiService.get('/api/v1/users/me/profile');
        setProfile(data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return '';
    // Prend la première lettre de chaque mot, ignore les espaces multiples
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0].toUpperCase())
      .join('');
  };

  return (
    <Modal open={true} onClose={onClose} title="Mon Profil">
      {loading ? (
        <Spinner />
      ) : profile ? (
        <div className="profile-modal-content">
          <div className="profile-avatar">{getInitials(profile.nom) || 'User'}</div>
          <div className="profile-info">
            <div className="info-item">
              <div className="info-left">
                <strong>Nom:</strong> {profile.nom}
              </div>
              <div className="info-right">
                <span className="info-fi"><FiUser /></span> 
              </div>
            </div>
            <div className="info-item">
              <div className="info-left">
                <strong>Email:</strong> {profile.email}
              </div>
              <div className="info-right">
                <span className="info-fi"><FiMail /></span> 
              </div>
            </div>
            <div className="info-item">
              <div className="info-left">
                <strong>Téléphone:</strong> {profile.telephone}
              </div>
              <div className="info-right">
                <span className="info-fi"><FiPhone /></span> 
              </div>
            </div>
            {profile.role === 'client' && profile.clientDetails && (
              <>
                <div className="info-item">
                  <div className="info-left">
                    <strong>Adresse:</strong> {profile.clientDetails.adresse_facturation || `N/A`}
                  </div>
                  <div className="info-right">
                    <span className="info-fi"><FiMap /></span> 
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-left">
                    <strong>Solde:</strong> {profile.clientDetails.solde.toLocaleString()} KMF
                  </div>
                  <div className="info-right">
                    <span className="info-fi"><FiShoppingCart /></span> 
                  </div>
                    
                </div>
              </>
            )}
            {profile.role === 'vendeur' && profile.vendeurDetails && (
              <>
                <div className="info-item">
                  <div className="info-left">
                    <strong>Boutique:</strong> {profile.vendeurDetails.nom_boutique}
                  </div>
                  <div className="info-right">
                    <span className="info-fi"><FiShoppingCart /></span> 
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-left">
                    <strong>Adresse:</strong> {profile.vendeurDetails.adresse}
                  </div>
                  <div className="info-right">
                    <span className="info-fi"><FiMap /></span> 
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>Impossible de charger le profil.</div>
      )}
    </Modal>
  );
};

export default ProfilUser;
