import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import apiService from '../../../apiService';
import { FiHeart, FiTrash2, FiPhone, FiMail, FiMapPin, FiUserCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import UserAvatar from '../../../components/UserAvatar';

const VendeurFavoris = () => {
  const [loading, setLoading] = useState(true);
  const [vendeursFavoris, setVendeursFavoris] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendeursFavoris = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/v1/client-vendeurs');
        setVendeursFavoris(response.data.data || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des vendeurs favoris:", err);
        setError('Impossible de charger vos vendeurs favoris. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendeursFavoris();
  }, []);

  const handleRemoveFromFavoris = async (id_vendeur) => {
    try {
      await apiService.delete(`/api/v1/client-vendeurs/${id_vendeur}`);
             setVendeursFavoris(prev => prev.filter(v => v.vendeur.id_vendeur !== id_vendeur));
      toast.success('Vendeur supprimé des favoris avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      toast.error('Erreur lors de la suppression du favori.');
    }
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Mes Vendeurs Favoris</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState title="Erreur" message={error} />
        ) : vendeursFavoris.length > 0 ? (
          <div className="vendeurs-favoris-grid">
              {vendeursFavoris.map((favori) => {
                const vendeur = favori.vendeur;
                const user = vendeur.user;
                return (
                 <div key={favori.id_vendeur} className="vendeur-favori-card">
                  <div className="vendeur-header">
                    <div className="vendeur-nom">
                      <UserAvatar name={user.nom} /> {user?.nom || 'Client'}
                    </div>
                    <button 
                      className="btn-remove-favori"
                      onClick={() => handleRemoveFromFavoris(vendeur.id_vendeur)}
                      title="Retirer des favoris"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div className="vendeur-info">
                    <p><FiUserCheck size={14} /> <strong>Vendeur :</strong> {user?.nom || 'N/A'}</p>
                    <p><FiPhone size={14} /> <strong>Contact :</strong> {user?.telephone || 'N/A'}</p>
                    <p><FiMail size={14} /> <strong>Email :</strong> {user?.email || 'N/A'}</p>
                    <p><FiMapPin size={14} /> <strong>Adresse :</strong> {vendeur.adresse || 'N/A'}</p>
                  </div>
                  <div className="vendeur-description" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
                    <p><strong>Boutique :</strong> {vendeur.nom_boutique || 'Nom de la boutique indisponible.'}</p>
                    <p><strong>Description :</strong> {vendeur.description || 'Aucune description disponible.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            title="Mes Vendeurs Favoris"
            message="Vous n'avez ajouté aucun vendeur aux favoris pour le moment."
          />
        )}
      </div>
    </div>
  );
};

export default VendeurFavoris;
