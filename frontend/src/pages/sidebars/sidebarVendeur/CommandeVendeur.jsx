import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiEye } from 'react-icons/fi';
import './styleVendeur.css';
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import { toast } from 'react-hot-toast';
import Modal from '../../../components/Modal';
import { formatNumber } from '../../../utils/formatUtils';

const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA',
  '#F0B8B8', '#97C1A9', '#A2D5F2', '#FFD3B5', '#F6E6C2',
  '#FF8C94', '#A8E6CF', '#D4F0F0', '#FFDAB9', '#F9EAC3'
];

const getStatusColor = (status) => {
  switch (status) {
    case 'en attente': return '#FFC107';
    case 'validée': return '#17A2B8';
    case 'en préparation': return '#6610F2';
    case 'expédiée': return '#007BFF';
    case 'livrée': return '#28A745';
    case 'annulée': return '#DC3545';
    default: return '#6C757D';
  }
};

const getStatusLabel = (status) => {
  if (!status) return 'Inconnu';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getCategoryColor = (categoryName) => {
  if (!categoryName) return '#ccc';
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % categoryColors.length);
  return categoryColors[index];
};

const CommandeVendeur = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('validée');
  const [hoveredCmdId, setHoveredCmdId] = useState(null);

  const paginatedCommandes = commandes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(commandes.length / itemsPerPage);

  useEffect(() => {
    const fetchCommandesAndDetails = async () => {
      try {
        const listResponse = await apiService.get('/api/v1/commandes/vendeur/mes-commandes');
        const commandesFromApi = listResponse.data.data || [];

        if (commandesFromApi.length > 0) {
          const detailPromises = commandesFromApi.map(cmd => 
            apiService.get(`/api/v1/commandes/vendeur/${cmd.id_commande}`)
          );
          const detailResponses = await Promise.all(detailPromises);
          const commandesWithDetails = detailResponses.map((res, index) => ({
            ...commandesFromApi[index], 
            ...res.data.data
          }));
          setCommandes(commandesWithDetails);
        } else {
          setCommandes([]);
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Une erreur est survenue.');
        console.error('Erreur de récupération des commandes:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCommandesAndDetails();
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
    
    console.log('=== DÉBUT ÉVOLUTION STATUT ===');
    console.log('ID commande:', id_commande);
    console.log('Statut actuel:', currentStatus);
    console.log('Nouveau statut:', nextStatus);
    
    try {
      const response = await apiService.put(`/api/v1/commandes/${id_commande}/statut`, { statut: nextStatus });
      console.log('✅ Réponse du serveur:', response.data);
      toast.success(`Commande passée à "${nextStatus}" !`);
      setCommandes(prev => prev.map(cmd =>
        cmd.id_commande === id_commande ? { ...cmd, statut: nextStatus } : cmd
      ));
      setSelectedCommande(cmd => cmd ? { ...cmd, statut: nextStatus } : cmd);
    } catch (err) {
      console.error('❌ Erreur côté frontend:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
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
                  <th>Catégorie</th>
                  <th>Montant</th>
                  <th>Articles</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommandes.map(cmd => (
                  <tr key={cmd.id_commande}>
                    <td><strong>CMD-{cmd.id_commande}</strong></td>
                    <td>{cmd.client}</td>
                    <td style={{ position: 'relative' }}>
                    {(() => {
                      let products = [];
                      if (cmd.produits) {
                        if (Array.isArray(cmd.produits)) {
                          products = cmd.produits;
                        } else if (Array.isArray(cmd.produits.data)) {
                          products = cmd.produits.data;
                        }
                      }
                      const uniqueCategories = [...new Map(products.map(p => [p.categorie, { nom: p.categorie }])).values()];
                      if (uniqueCategories.length === 0) return (
                        <span className="badge" style={{ backgroundColor: '#ccc', color: 'white', padding: '5px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                          N/A
                        </span>
                      );

                      const firstCategory = uniqueCategories[0];
                      const otherCategories = uniqueCategories.slice(1);
                      const otherCategoriesCount = otherCategories.length;

                      return (
                        <>
                          <span
                            key={firstCategory.nom}
                            className="badge"
                            style={{
                              backgroundColor: getCategoryColor(firstCategory.nom),
                              color: 'white',
                              padding: '5px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              marginRight: otherCategoriesCount > 0 ? '5px' : '0',
                            }}
                          >
                            {firstCategory.nom}
                          </span>
                          {otherCategoriesCount > 0 && (
                            <span 
                              style={{ fontSize: '0.75rem', color: 'var(--gray-500)', cursor: 'pointer'}}
                              onMouseEnter={() => setHoveredCmdId(cmd.id_commande)}
                              onMouseLeave={() => setHoveredCmdId(null)}
                            >
                              +{otherCategoriesCount} autre{otherCategoriesCount > 1 ? 's' : ''}
                            </span>
                          )}
                          {hoveredCmdId === cmd.id_commande && otherCategories.length > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: 'white',
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              padding: '10px',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              zIndex: 10,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '5px',
                              minWidth: '150px'
                            }}>
                              {otherCategories.map(cat => (
                                <span 
                                  key={cat.nom}
                                  className="badge"
                                  style={{
                                    backgroundColor: getCategoryColor(cat.nom),
                                    color: 'white',
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {cat.nom}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    </td>
                    <td>{formatNumber(cmd.montant_total)} kmf</td>
                    <td>{cmd.nbr_article}</td>
                    <td>{new Date(cmd.date_commande).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(cmd.statut),
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {getStatusLabel(cmd.statut)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-action"
                        title='Détails de la commande'
                        onClick={() => handleVoirDetails(cmd)}
                      >
                        <FiEye />
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
            {modalLoading ? (
              <Spinner />
            ) : (
              (selectedCommande.produits && selectedCommande.produits.length > 0) ? (
                selectedCommande.produits.map((p, index) => (
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
                ))
              ) : (
                <p>Aucun produit trouvé pour cette commande.</p>
              )
            )}
          </div>

          {/* Sélecteur de statut */}

          <div className="modal-footer-v2">
            <div className="commande-categories-list-v2">
              {selectedCommande.produits && selectedCommande.produits.length > 0 ? (
                [...new Map(selectedCommande.produits.map(p => [p.categorie, p])).values()].map((p, index) => (
                  <span 
                    key={index} 
                    className="badge"
                    style={{
                      backgroundColor: getCategoryColor(p.categorie),
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      marginRight: '5px'
                    }}
                  >
                    {p.categorie}
                  </span>
                ))
              ) : (
                <span>Catégories non disponibles</span>
              )}
            </div>
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
