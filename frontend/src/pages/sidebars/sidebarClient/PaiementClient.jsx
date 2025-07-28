import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiEye } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import Modal from '../../../components/Modal';
import apiService from '../../../apiService';

const PaiementClient = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await apiService.get('/api/v1/paiements/client');
        setPaiements(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Une erreur est survenue.');
      }
      setLoading(false);
    };
    fetchPaiements();
  }, []);

  const paginatedPaiements = paiements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(paiements.length / itemsPerPage);

  const handleViewDetails = (paiement) => {
    console.log('Paiement sélectionné:', paiement);
    setSelectedPaiement(paiement);
    setShowModal(true);
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Mes Paiements</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState 
            title="Erreur de récupération"
            message={error}
          />
        ) : paiements.length === 0 ? (
          <EmptyState 
            title="Mes Paiements"
            message="Aucun paiement n'a été effectué pour le moment."
          />
        ) : (
          <>
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>N°</th>
                  <th>Vendeur</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Mode</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPaiements.map(p => (
                  <tr key={p.id_paiement}>
                    <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>PAY-{p.id_paiement}</strong></td>
                    <td>
                      <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                        {p.commande?.vendeur?.nom_boutique || 'N/A'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-900)' }}>{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ fontWeight: 500, color: '#10b981' }}>{p.montant_paye} KMF</td>
                    <td>
                      <span className={`mode-${p.mode_paiement?.toLowerCase()}`}>
                        {p.mode_paiement || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(p)}
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
          </>
        )}
      </div>
      
      {/* Modal pour les détails du paiement */}
      {showModal && selectedPaiement && (
        <Modal 
          open={showModal} 
          onClose={() => setShowModal(false)}
          title={`Détails du paiement PAY-${selectedPaiement.id_paiement}`}
        >
          <div className="commande-details">
            <div className="detail-section">
              <h4>Informations client et vendeur</h4>
              <div className="info-container">
                <div className="client-info">
                  <h5>Client</h5>
                  <div className="info-grid">
                    <div>
                      <strong>Nom :</strong> {selectedPaiement.commande?.client?.user?.nom || 'N/A'}
                    </div>
                    <div>
                      <strong>Email :</strong> {selectedPaiement.commande?.client?.user?.email || 'N/A'}
                    </div>
                    <div>
                      <strong>Téléphone :</strong> {selectedPaiement.commande?.client?.user?.telephone || 'N/A'}
                    </div>
                    <div>
                      <strong>Adresse :</strong> {selectedPaiement.commande?.client?.adresse_facturation || 'N/A'}
                    </div>
                  </div>
                </div>
                
                {selectedPaiement.commande?.vendeur && (
                  <div className="vendeur-info">
                    <h5>Vendeur</h5>
                    <div className="info-grid">
                      <div>
                        <strong>Boutique :</strong> {selectedPaiement.commande.vendeur.nom_boutique}
                      </div>
                      <div>
                        <strong>Email :</strong> {selectedPaiement.commande.vendeur.user?.email}
                      </div>
                      <div>
                        <strong>Téléphone :</strong> {selectedPaiement.commande.vendeur.user?.telephone}
                      </div>
                      <div>
                        <strong>Adresse :</strong> {selectedPaiement.commande.vendeur.adresse}
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
                  <strong>Numéro :</strong> PAY-{selectedPaiement.id_paiement}
                </div>
                <div>
                  <strong>Date :</strong> {selectedPaiement.date_paiement ? new Date(selectedPaiement.date_paiement).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <strong>Paiement :</strong> 
                  <span className={`mode-${selectedPaiement.mode_paiement?.toLowerCase()}`}>
                    {selectedPaiement.mode_paiement || 'N/A'}
                  </span>
                </div>
                <div>
                  <strong>Montant payé :</strong> {selectedPaiement.montant_paye ? `${Number(selectedPaiement.montant_paye)} KMF` : 'N/A'}
                </div>
                <div>
                  <strong>Facture associée :</strong> {selectedPaiement.facture ? `FACT-${selectedPaiement.facture.id_facture}` : 'N/A'}
                </div>
                <div>
                  <strong>Commande associée :</strong> {selectedPaiement.commande ? `CMD-${selectedPaiement.commande.id_commande}` : 'N/A'}
                </div>
                <div>
                  <strong>Statut de la commande :</strong> 
                  <span className={`statut-${selectedPaiement.commande?.statut?.toLowerCase()}`}>
                    {selectedPaiement.commande?.statut || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaiementClient;
