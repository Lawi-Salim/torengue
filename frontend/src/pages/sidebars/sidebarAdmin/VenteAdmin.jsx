import React, { useState, useEffect } from 'react';
import apiService from '../../../apiService';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import Modal from '../../../components/Modal';
import { FiEye, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { formatNumber } from '../../../utils/formatUtils';

const VenteAdmin = () => {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVente, setSelectedVente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


    const handleVoirDetails = async (vente) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    try {
      const response = await apiService.get(`/api/v1/ventes/${vente.id_vente}`);
      if (response.data.success) {
        setSelectedVente(response.data.data);
      } else {
        setModalError(response.data.message || 'Erreur lors de la récupération des détails.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Une erreur est survenue.');
    }
    setModalLoading(false);
  };

  // Pagination logic
  const indexOfLastVente = currentPage * itemsPerPage;
  const indexOfFirstVente = indexOfLastVente - itemsPerPage;
  const currentVentes = ventes.slice(indexOfFirstVente, indexOfLastVente);
  const totalPages = Math.ceil(ventes.length / itemsPerPage);

  useEffect(() => {
    const fetchVentes = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/v1/ventes');
        setVentes(response.data.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors de la récupération des ventes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVentes();
  }, []);

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Historique de Toutes les Ventes</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
            <EmptyState title="Erreur" message={error} />
        ) : ventes.length === 0 ? (
          <EmptyState 
            title="Aucune Vente"
            message="Aucune vente n'a été enregistrée sur la plateforme."
          />
        ) : (
          <table className="produit-table">
            <thead className="produit-thead">
              <tr>
                <th>ID Vente</th>
                <th>ID Commande</th>
                <th>Client</th>
                <th>Boutique</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentVentes.map((vente) => (
                <tr key={vente.id_vente}>
                  <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>SALE-{vente.id_vente}</strong></td>
                  <td>CMD-{vente.id_commande}</td>
                  <td>{vente.client?.user?.nom || 'N/A'}</td>
                  <td>{vente.vendeur?.nom_boutique || 'N/A'}</td>
                  <td>{new Date(vente.date).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{formatNumber(vente.montant_total)} kmf</td>
                  <td>
                    <button className="btn-action" title="Voir les détails" onClick={() => handleVoirDetails(vente)}>
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {ventes.length > itemsPerPage && (
            <div className="pagination-controls pagination-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
                <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
            </div>
        )}
      </div>

      {/* Modal de détails de vente  */}
      {selectedVente && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contentClassName="vente-details-modal"
          title={`Détails de la vente SALE-${selectedVente?.id_vente}`}
        >
          <div className="modal-vente">
            {modalLoading ? (
              <Spinner />
            ) : error ? (
              <ErrorState 
                title="Erreur de récupération"
                message={modalError}
              />
            ) : ventes.length === 0 ? (
              <EmptyState 
                title="Aucune Vente"
                message="Aucune vente n'a été enregistrée sur la plateforme."
              />
            ) : (
              <div>
                <div className="detail-section">
                  <h4>Informations Client et Vendeur</h4>
                  <div className="info-container">
                    <div className="vendeur-info">
                      <h5>Vendeur</h5>
                      <div className="info-grid">
                        <div><strong>Nom:</strong> {selectedVente.vendeur?.user?.nom || 'N/A'}</div>
                        <div><strong>Boutique:</strong> {selectedVente.vendeur?.nom_boutique || 'N/A'}</div>
                        <div><strong>Email:</strong> {selectedVente.vendeur?.user?.email || 'N/A'}</div>
                        <div><strong>Téléphone:</strong> {selectedVente.vendeur?.user?.telephone || 'N/A'}</div>
                        <div><strong>Adresse:</strong> {selectedVente.vendeur.adresse || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="client-info">
                      <h5>Client</h5>
                      <div className="info-grid">
                        <div><strong>Nom:</strong> {selectedVente.client?.user?.nom || 'N/A'}</div>
                        <div><strong>Email:</strong> {selectedVente.client?.user?.email || 'N/A'}</div>
                        <div><strong>Téléphone:</strong> {selectedVente.client?.user?.telephone || 'N/A'}</div>
                        <div><strong>Adresse:</strong> {selectedVente.client.adresse_facturation || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Détails de la Vente</h4>
                  <div className="detail-grid">
                    <div><strong>Numéro:</strong> SALE-{selectedVente.id_vente}</div>
                    <div><strong>Date:</strong> {new Date(selectedVente.date).toLocaleDateString()}</div>
                    <div><strong>Montant Total:</strong> {parseFloat(selectedVente.montant_total).toLocaleString()} KMF</div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Produits Vendus</h4>
                  <ul className="produits-vendus-list">
                    {selectedVente.details?.map((item, index) => (
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

export default VenteAdmin;
