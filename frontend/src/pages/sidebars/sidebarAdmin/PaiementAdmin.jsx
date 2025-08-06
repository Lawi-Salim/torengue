import React, { useState, useEffect } from 'react';
import apiService from '../../../apiService';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import Modal from '../../../components/Modal';
import { FiEye, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { formatNumber } from '../../../utils/formatUtils';

const PaiementAdmin = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleVoirDetails = async (paiement) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    try {
      const response = await apiService.get(`/api/v1/paiements/${paiement.id_paiement}`);
      if (response.data.success) {
        setSelectedPaiement(response.data.data);
      } else {
        setModalError(response.data.message || 'Erreur lors de la récupération des détails.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Une erreur est survenue.');
    }
    setModalLoading(false);
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'succès':
        return 'success';
      case 'en attente':
        return 'warning';
      case 'échec':
        return 'danger';
      default:
        return 'primary';
    }
  };

  // Pagination logic
  const indexOfLastPaiement = currentPage * itemsPerPage;
  const indexOfFirstPaiement = indexOfLastPaiement - itemsPerPage;
  const currentPaiements = paiements.slice(indexOfFirstPaiement, indexOfLastPaiement);
  const totalPages = Math.ceil(paiements.length / itemsPerPage);

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/v1/paiements/all');
        setPaiements(response.data.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors de la récupération des paiements.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaiements();
  }, []);

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Historique de Tous les Paiements</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
            <EmptyState title="Erreur" message={error} />
        ) : paiements.length === 0 ? (
          <EmptyState 
            title="Aucun Paiement"
            message="Aucun paiement n'a été enregistré sur la plateforme."
          />
        ) : (
          <table className="produit-table">
            <thead className="produit-thead">
              <tr>
                <th>ID Paiement</th>
                <th>ID Commande</th>
                <th>Client</th>
                <th>Boutique</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Mode de paiement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPaiements.map((paiement) => (
                <tr key={paiement.id_paiement}>
                  <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>PAY-{paiement.id_paiement}</strong></td>
                  <td>CMD-{paiement.id_commande}</td>
                  <td>{paiement.commande?.client?.user?.nom || 'N/A'}</td>
                  <td>{paiement.commande?.vendeur?.nom_boutique || 'N/A'}</td>
                  <td>{new Date(paiement.date_paiement).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{formatNumber(paiement.montant_paye)} kmf</td>
                  <td>
                    <span className={`mode-${paiement.mode_paiement?.toLowerCase()}`}>
                      {paiement.mode_paiement}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleVoirDetails(paiement)} className="btn-action">
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {paiements.length > itemsPerPage && (
            <div className="pagination-controls pagination-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
                <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
            </div>
        )}
      </div>

      {/* Modal des détails de paiements  */}
      {selectedPaiement && (
        <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentClassName="paiement-details-modal"
        title={`Détails du paiement PAY-${selectedPaiement?.id_paiement}`}
        >
          <div className="modal-paiement">
            {modalLoading ? (
              <Spinner />
            ) : error ? (
              <ErrorState 
                title="Erreur de récupération"
                message={modalError}
              />
            ) : (
              <div>
                <div className="detail-section" style={{ marginBottom: '.1rem' }}>
                  <h4>Informations Client et Vendeur</h4>
                  <div className="info-container">
                    <div className="vendeur-info">
                      <h5>Vendeur</h5>
                      <div className="info-grid">
                        <div><strong>Nom:</strong> {selectedPaiement.commande?.vendeur?.user?.nom || 'N/A'}</div>
                        <div><strong>Boutique:</strong> {selectedPaiement.commande?.vendeur?.nom_boutique || 'N/A'}</div>
                        <div><strong>Email:</strong> {selectedPaiement.commande?.vendeur?.user?.email || 'N/A'}</div>
                        <div><strong>Téléphone:</strong> {selectedPaiement.commande?.vendeur?.user?.telephone || 'N/A'}</div>
                        <div><strong>Adresse:</strong> {selectedPaiement.commande?.vendeur?.adresse || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="client-info">
                      <h5>Client</h5>
                      <div className="info-grid">
                        <div><strong>Nom:</strong> {selectedPaiement.commande?.client?.user?.nom || 'N/A'}</div>
                        <div><strong>Email:</strong> {selectedPaiement.commande?.client?.user?.email || 'N/A'}</div>
                        <div><strong>Téléphone:</strong> {selectedPaiement.commande?.client?.user?.telephone || 'N/A'}</div>
                        <div><strong>Adresse:</strong> {selectedPaiement.commande?.client?.adresse_facturation || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section" style={{ marginBottom: '.1rem' }}>
                  <h4>Détails du Paiement et de la Commande</h4>
                  <div className="detail-grid">
                    <div><strong>N° Paiement:</strong> PAY-{selectedPaiement.id_paiement}</div>
                    <div><strong>Date Paiement:</strong> {new Date(selectedPaiement.date_paiement).toLocaleDateString()}</div>
                    <div><strong>Montant Payé:</strong> {parseFloat(selectedPaiement.montant_paye).toLocaleString()} KMF</div>
                    <div><strong>Mode:</strong> {selectedPaiement.mode_paiement}</div>
                    <div><strong>Statut:</strong> {selectedPaiement.commande?.facture?.statut_paiement || 'N/A'}</div>
                    <div><strong>N° Commande:</strong> CMD-{selectedPaiement.id_commande}</div>
                  </div>
                </div>

                <div className="detail-section" style={{ marginBottom: '.1rem' }}>
                  <h4>Produits de la Commande</h4>
                  <ul className="produits-vendus-list">
                    {selectedPaiement.commande?.details?.map((item, index) => (
                      <li key={index} className="produit-vendu-item">
                        <img src={item.produit.image || 'https://via.placeholder.com/50'} alt={item.produit.nom} />
                        <div className="produit-vendu-info">
                          <div className="nom">{item.produit.nom}</div>
                          <div className="details">
                            {item.quantite} x {parseFloat(item.prix_unitaire).toLocaleString()} KMF
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaiementAdmin;
