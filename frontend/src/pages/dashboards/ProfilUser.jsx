import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import UserAvatar from '../../components/UserAvatar';
import Spinner from '../../components/Spinner';
import { FiMail, FiPhone, FiShoppingCart, FiUser, FiMap, FiEdit } from 'react-icons/fi';
import apiService from '../../apiService';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const ProfilUser = ({ onClose }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth(); // Renommer pour éviter conflit
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

  const handleEditProfile = () => {
    if (!authUser) return;

    const path = `/dashboard/${authUser.role}/settings`;
    navigate(path);
    onClose(); // Ferme la modale après la redirection
  };

  return (
    <Modal open={true} onClose={onClose} title="Mon Profil">
      {loading ? (
        <Spinner />
      ) : profile ? (
        <div className="profile-modal-content">
          <div className="profile-avatar">
            <UserAvatar name={profile.nom} size={120} />
          </div>
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
          <div className="btn-edit">
            <button className="btn btn-primary" onClick={handleEditProfile}><FiEdit /> Modifier le profil</button>
          </div>
        </div>
      ) : (
        <div>Impossible de charger le profil.</div>
      )}
    </Modal>
  );
};

export default ProfilUser;
