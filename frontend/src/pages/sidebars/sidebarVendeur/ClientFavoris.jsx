import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import apiService from '../../../apiService';
import { FiUser, FiPhone, FiMail, FiMapPin, FiHeart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import './styleVendeur.css';
import UserAvatar from '../../../components/UserAvatar';

const ClientFavoris = () => {
  const [loading, setLoading] = useState(true);
  const [clientsFavoris, setClientsFavoris] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientsFavoris = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/v1/vendeur-clients');
        setClientsFavoris(response.data.data || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des clients favoris:", err);
        setError('Impossible de charger vos clients favoris. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientsFavoris();
  }, []);

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Mes Clients Favoris</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState title="Erreur" message={error} />
        ) : clientsFavoris.length > 0 ? (
          <div className="clients-favoris-grid">
            {clientsFavoris.map((favori) => {
              const client = favori.client;
              const user = client.user;
              return (
                <div key={favori.id_client} className="client-favori-card">
                  <div className="client-header">
                    <div className="client-nom">
                      <UserAvatar name={user.nom} /> {user?.nom || 'Client'}
                    </div>
                  </div>
                  <div className="client-info">
                    <p><FiUser size={14} /> <strong>Nom :</strong> {user?.nom || 'N/A'}</p>
                    <p><FiPhone size={14} /> <strong>Contact :</strong> {user?.telephone || 'N/A'}</p>
                    <p><FiMail size={14} /> <strong>Email :</strong> {user?.email || 'N/A'}</p>
                    <p><FiMapPin size={14} /> <strong>Adresse :</strong> {client.adresse_facturation || 'N/A'}</p>
                  </div>
                  <div className="client-footer">
                    <div className="favori-badge">
                      <FiHeart size={16} />
                      <span>Client Favori</span>
                    </div> 
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            title="Mes Clients Favoris"
            message="Aucun client ne vous a ajouté aux favoris pour le moment."
          />
        )}
      </div>
    </div>
  );
};

export default ClientFavoris;
