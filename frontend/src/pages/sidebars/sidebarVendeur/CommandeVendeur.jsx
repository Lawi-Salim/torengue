import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import './styleVendeur.css';
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import { toast } from 'react-hot-toast';
import Modal from '../../../components/Modal';

const CommandeVendeur = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('validée');

  const paginatedCommandes = commandes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(commandes.length / itemsPerPage);

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await apiService.get('/api/v1/commandes/vendeur/mes-commandes');
        setCommandes(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Une erreur est survenue.');
        console.error('Erreur de récupération des commandes:', err);
      }
      setLoading(false);
    };

    if (user) {
      fetchCommandes();
    }
  }, [user]);

  const handleValiderCommande = async (id_commande) => {
    try {
      await apiService.put(`/api/v1/commandes/${id_commande}/valider`);
      toast.success('Commande validée avec succès !');
      // Mettre à jour le statut de la commande dans l'état local
      setCommandes(prevCommandes => 
        prevCommandes.map(cmd => 
          cmd.id_commande === id_commande ? { ...cmd, statut: 'validée' } : cmd
        )
      );
      setIsModalOpen(false); // Fermer le modal après validation
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation.');
      console.error('Erreur de validation:', err);
    }
  };

  const handleVoirDetails = (commande) => {
    setSelectedCommande(commande);
    setIsModalOpen(true);
  };

  // Fonction pour obtenir le statut suivant
  const getNextStatus = (current) => {
    switch (current) {
      case 'en attente': return 'en préparation';
      case 'en préparation': return 'expédiée';
      case 'expédiée': return 'livrée';
      default: return null;
    }
  };

  // Handler pour évoluer le statut
  const handleEvoluerStatut = async (id_commande, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;
    try {
      await apiService.put(`/api/v1/commandes/${id_commande}/statut`, { statut: nextStatus });
      toast.success(`Commande passée à "${nextStatus}" !`);
      setCommandes(prev => prev.map(cmd =>
        cmd.id_commande === id_commande ? { ...cmd, statut: nextStatus } : cmd
      ));
      setSelectedCommande(cmd => cmd ? { ...cmd, statut: nextStatus } : cmd);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du changement de statut.');
    }
  };

  // Handler pour annuler la commande
  const handleAnnulerCommande = async (id_commande) => {
    try {
      await apiService.put(`/api/v1/commandes/${id_commande}/statut`, { statut: 'annulée' });
      toast.success('Commande annulée !');
      setCommandes(prev => prev.map(cmd =>
        cmd.id_commande === id_commande ? { ...cmd, statut: 'annulée' } : cmd
      ));
      setSelectedCommande(cmd => cmd ? { ...cmd, statut: 'annulée' } : cmd);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation.');
    }
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion des Commandes</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState 
            title="Erreur de récupération"
            message="Une erreur est survenue lors de la récupération des commandes."
          />
        ) : commandes.length === 0 ? (
          <EmptyState 
            title="Gestion des Commandes"
            message="Aucune commande n'a été trouvée pour le moment."
          />
        ) : (
          <div className="produit-table-container">
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Articles</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommandes.map(cmd => (
                  <tr key={cmd.id_commande}>
                    <td><strong>CMD-{cmd.id_commande}</strong></td>
                    <td>{cmd.client}</td>
                    <td>{new Date(cmd.date_commande).toLocaleDateString()}</td>
                    <td>{cmd.nbr_article}</td>
                    <td>{cmd.montant_total} kmf</td>
                    <td>
                      <span className={`badge bg-${cmd.statut === 'en attente' ? 'warning' : 'success'}`}>
                        {cmd.statut}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => handleVoirDetails(cmd)}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-controls pagination-center">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
              <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de validation d'une commande */}
      {selectedCommande && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`CMD-${selectedCommande.id_commande}`}
          contentClassName="commande-details-modal-v2"
        >
          <div className="commande-produits-list-v2">
            {selectedCommande.produits.map((p, index) => (
              <div key={index} className="produit-item-v2">
                <img 
                  src={p.image || '/placeholder-image.png'} 
                  alt={p.nom} 
                  className="produit-image-v2" 
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
                <div className="produit-info-v2" style={{ width: '9rem' }}>
                  <span className="produit-nom-v2">{p.nom}</span>
                  <span className="produit-categorie-v2">{p.categorie}</span>
                </div>
                <div className="produit-info-v2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span className="produit-nom-v2">Unité</span>
                  <span className="produit-unite-v2">{p.unite}</span>
                </div>
                <div className="produit-info-v2" style={{display: 'flex', justifyContent: 'end', alignItems: 'end' }}>
                  <span className="produit-nom-v2">Prix unitaire</span>
                  <span className="produit-prix-v2" style={{ fontSize: '0.95rem' }}>{Number(p.prix_unitaire)} kmf</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sélecteur de statut */}

          <div className="modal-footer-v2">
            <div className="commande-summary-v2">
              <span>Total articles: <strong>{selectedCommande.nbr_article}</strong></span>
              <span>Montant total: <strong>{selectedCommande.montant_total} kmf</strong></span>
            </div>
            <div className="modal-footer-actions-v2">
              <div className="modal-action-left">
                <span className="status-label">Statut actuel : </span>
                <span className="badge bg-info" style={{fontWeight:'bold',fontSize:'1rem'}}>{(selectedCommande.statut).toUpperCase()}</span>
              </div>
              <div className="modal-action-right">
                {selectedCommande.statut !== 'livrée' && selectedCommande.statut !== 'annulée' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleAnnulerCommande(selectedCommande.id_commande)}
                  >
                    Annuler
                  </button>
                )}
                {selectedCommande.statut !== 'livrée' && selectedCommande.statut !== 'annulée' && getNextStatus(selectedCommande.statut) && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEvoluerStatut(selectedCommande.id_commande, selectedCommande.statut)}
                  >
                    {getNextStatus(selectedCommande.statut).toUpperCase(0)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CommandeVendeur;
