import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import apiService from '../../../apiService';

const FactureVendeur = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const response = await apiService.get('/api/v1/factures/vendeur');
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

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion des Factures</h2>
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
            title="Gestion des Factures"
            message="Aucune facture n'a été trouvée pour le moment."
          />
        ) : (
          <div className="produit-table-container">
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>ID Facture</th>
                  <th>ID Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant Total</th>
                  <th>Statut Paiement</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFactures.map(fac => (
                  <tr key={fac.id_facture}>
                    <td>FACT-{fac.id_facture}</td>
                    <td>CMD-{fac.id_commande}</td>
                    <td>{fac.vente?.commande?.client?.user?.nom || 'N/A'}</td>
                    <td>{new Date(fac.date_creation).toLocaleDateString()}</td>
                    <td>{fac.montant_total} kmf</td>
                    <td><span className={`badge bg-${fac.statut_paiement === 'payé' ? 'success' : fac.statut_paiement === 'annulé' ? 'danger' : 'warning'}`}>{fac.statut_paiement}</span></td>
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

export default FactureVendeur;
