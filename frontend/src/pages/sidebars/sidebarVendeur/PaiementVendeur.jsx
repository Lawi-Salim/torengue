import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import apiService from '../../../apiService';

const PaiementVendeur = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await apiService.get('/api/v1/paiements/vendeur');
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

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion des Paiements</h2>
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
            title="Gestion des Paiements"
            message="Aucun paiement n'a été effectué pour le moment."
          />
        ) : (
          <div className="produit-table-container">
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>ID Paiement</th>
                  <th>ID Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant Payé</th>
                  <th>Mode Paiement</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPaiements.map(p => (
                  <tr key={p.id_paiement}>
                    <td>PAY-{p.id_paiement}</td>
                    <td>CMD-{p.id_commande}</td>
                    <td>{p.commande?.client?.user?.nom || 'N/A'}</td>
                    <td>{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString() : 'N/A'}</td>
                    <td>{p.montant_paye} kmf</td>
                    <td>{p.mode_paiement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-controls pagination-center">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate">&lt;</button>
              <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaiementVendeur;
