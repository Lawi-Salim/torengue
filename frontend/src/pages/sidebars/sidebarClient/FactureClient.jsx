import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import apiService from '../../../apiService';
import { FiEye } from 'react-icons/fi';
import Modal from '../../../components/Modal';
import Factures from '../../dashboards/Factures';

const FactureClient = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const response = await apiService.get('/api/v1/factures/client');
        setFactures(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Une erreur est survenue.');
      }
      setLoading(false);
    };
    fetchFactures();
  }, []);

  const paginatedFactures = factures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(factures.length / itemsPerPage);

  const handleVoirFacture = (facture) => {
    setSelectedFacture(facture);
    setIsModalOpen(true);
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Mes Factures</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState 
            title="Erreur de récupération"
            message={error}
          />
        ) : factures.length === 0 ? (
          <EmptyState 
            title="Mes Factures"
            message="Aucune facture n'a été trouvée pour le moment."
          />
        ) : (
          <>
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFactures.map(fac => (
                  <tr key={fac.id_facture}>
                    <td>FACT-{fac.id_facture}</td>
                    <td>{new Date(fac.date_creation).toLocaleDateString()}</td>
                    <td>{fac.montant_total} kmf</td>
                    <td><span className={`badge bg-${fac.statut_paiement === 'payé' ? 'success' : fac.statut_paiement === 'annulé' ? 'danger' : 'warning'}`}>{fac.statut_paiement}</span></td>
                    <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'start' }}>
                      <a
                        className="btn btn-sm btn-info"
                        title="Voir la facture"
                        href={"/facture/" + fac.id_facture}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {loading ? <Spinner inline size={18} style={{ marginRight: 8 }} /> : <FiEye />}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-controls pagination-center">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate">&lt;</button>
              <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate">&gt;</button>
            </div>
            {/* Modal d'aperçu */}
            {selectedFacture && (
              <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={null}
                contentClassName="facture-modal-apercu"
              >
                <Factures
                  numero={selectedFacture.id_facture}
                  date={new Date(selectedFacture.date_creation).toLocaleDateString()}
                  echeance={new Date(selectedFacture.date_creation).toLocaleDateString()}
                  // TODO : passer les vraies infos client, vendeur, lignes, totaux
                  totalHT={selectedFacture.montant_HT || selectedFacture.montant_total}
                  totalTTC={selectedFacture.montant_TTC || selectedFacture.montant_total}
                />
              </Modal>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FactureClient;
