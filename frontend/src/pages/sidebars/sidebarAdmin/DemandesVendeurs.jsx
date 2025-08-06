import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';

import apiService from '../../../apiService';
import './styleAdmin.css'; 
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const DemandesVendeurs = () => {
  const { user, token, logout } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDemandes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const { data } = await apiService.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/demandes-vendeur`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDemandes(data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      if (error.response && error.response.status === 401) {
        toast.dismiss();
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        logout();
      } else {
        toast.dismiss();
        toast.error('Impossible de charger les demandes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await apiService.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/demandes-vendeur/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vendeur approuvé avec succès !');
      fetchDemandes(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de l'approbation du vendeur:", error);
      toast.error('Erreur lors de l\'approbation.');
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await apiService.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/demandes-vendeur/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.error('La demande a été rejetée.');
      fetchDemandes(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      toast.error('Le rejet a échoué.');
    }
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Liste des demandes vendeurs</h2>
      </div>
      <div className='card-body'>
        {loading ? (
          <Spinner />
        ) : demandes.length === 0 ? (
          <EmptyState 
            title="Liste des demandes vendeurs"
            message="Aucune demande n'a été envoyée pour le moment."
          />
        ) : (
          <div className="user-table">
            <table className="user-thead">
              <thead>
                <tr>
                  <th>Nom du demandeur</th>
                  <th>Email</th>
                  <th>Nom de la boutique</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map((demande) => (
                  <tr key={demande.id_devenirvendeur}>
                    <td>{demande.nom}</td>
                    <td>{demande.email_pro}</td>
                    <td>{demande.nom_boutique}</td>
                    <td>
                      <span className={`status-badge status-${demande.statut.toLowerCase()}`}>
                        {demande.statut}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleApprove(demande.id_devenirvendeur)}
                          disabled={loading}
                          className="btn-approve"
                        >
                          {loading ? <Spinner size={15} inline={true} /> : <FiCheckCircle size={14.9} />}
                        </button>
                        <button 
                          onClick={() => handleReject(demande.id_devenirvendeur)}
                          className="btn-reject"
                        >
                          <FiXCircle size={14.9} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandesVendeurs;
