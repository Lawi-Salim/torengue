import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiEye } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import Modal from '../../../components/Modal';
import apiService from '../../../apiService';

const LivraisonVendeur = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLivraisons = async () => {
      try {
        const response = await apiService.get('/api/v1/livraisons/vendeur');
        setLivraisons(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Une erreur est survenue.');
      }
      setLoading(false);
    };
    fetchLivraisons();
  }, []);

  const paginatedLivraisons = livraisons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(livraisons.length / itemsPerPage);

  const handleViewDetails = (livraison) => {
    console.log('Livraison sélectionnée:', livraison);
    setSelectedLivraison(livraison);
    setShowModal(true);
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion des Livraisons</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState 
            title="Erreur de récupération"
            message={error}
          />
        ) : livraisons.length === 0 ? (
          <EmptyState 
            title="Gestion des Livraisons"
            message="Aucune livraison n'a été effectuée pour le moment."
          />
        ) : (
          <div className="produit-table-container">
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Adresse</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLivraisons.map(liv => (
                  <tr key={liv.id_livraison}>
                    <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>LIV-{liv.id_livraison}</strong></td>
                    <td>
                      <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                        {liv.commande?.client?.user?.nom || 'N/A'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-900)' }}>{liv.commande?.client?.adresse_facturation || 'N/A'}</td>
                    <td style={{ color: 'var(--gray-900)' }}>{liv.date_livraison ? new Date(liv.date_livraison).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`statut-${liv.statut_livraison?.toLowerCase()}`}>
                        {liv.statut_livraison || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(liv)}
                        className="btn-action"
                        title="Voir les détails"
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
      
      {/* Modal pour les détails de la livraison */}
      {showModal && selectedLivraison && (
        <Modal 
          open={showModal} 
          onClose={() => setShowModal(false)}
          title={`Détails de la livraison LIV-${selectedLivraison.id_livraison}`}
        >
          <div className="commande-details">
            <div className="detail-section">
              <h4>Informations client et vendeur</h4>
              <div className="info-container">
                <div className="client-info">
                  <h5>Client</h5>
                  <div className="info-grid">
                    <div>
                      <strong>Nom :</strong> {selectedLivraison.commande?.client?.user?.nom || 'N/A'}
                    </div>
                    <div>
                      <strong>Email :</strong> {selectedLivraison.commande?.client?.user?.email || 'N/A'}
                    </div>
                    <div>
                      <strong>Téléphone :</strong> {selectedLivraison.commande?.client?.user?.telephone || 'N/A'}
                    </div>
                    <div>
                      <strong>Adresse :</strong> {selectedLivraison.commande?.client?.adresse_facturation || 'N/A'}
                    </div>
                  </div>
                </div>
                
                {selectedLivraison.commande?.vendeur && (
                  <div className="vendeur-info">
                    <h5>Vendeur</h5>
                    <div className="info-grid">
                      <div>
                        <strong>Boutique :</strong> {selectedLivraison.commande.vendeur.nom_boutique}
                      </div>
                      <div>
                        <strong>Email :</strong> {selectedLivraison.commande.vendeur.user?.email}
                      </div>
                      <div>
                        <strong>Téléphone :</strong> {selectedLivraison.commande.vendeur.user?.telephone}
                      </div>
                      <div>
                        <strong>Adresse :</strong> {selectedLivraison.commande.vendeur.adresse}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h4>Informations générales</h4>
              <div className="detail-grid">
                <div>
                  <strong>Numéro :</strong> LIV-{selectedLivraison.id_livraison}
                </div>
                <div>
                  <strong>Date de livraison :</strong> {selectedLivraison.date_livraison ? new Date(selectedLivraison.date_livraison).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <strong>Statut :</strong> 
                  <span className={`statut-${selectedLivraison.statut_livraison?.toLowerCase()}`}>
                    {selectedLivraison.statut_livraison || 'N/A'}
                  </span>
                </div>
                <div>
                  <strong>Commande associée :</strong> {selectedLivraison.commande ? `CMD-${selectedLivraison.commande.id_commande}` : 'N/A'}
                </div>
                <div>
                  <strong>Statut de la commande :</strong> 
                  <span className={`statut-${selectedLivraison.commande?.statut?.toLowerCase()}`}>
                    {selectedLivraison.commande?.statut || 'N/A'}
                  </span>
                </div>
                <div>
                  <strong>Montant de la commande :</strong> {selectedLivraison.commande?.montant_total ? `${Number(selectedLivraison.commande.montant_total)} KMF` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LivraisonVendeur;
