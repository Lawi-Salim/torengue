import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import apiService from '../../../apiService';

const LivraisonVendeur = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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
                  <th>ID Livraison</th>
                  <th>ID Commande</th>
                  <th>Client</th>
                  <th>Adresse</th>
                  <th>Date Livraison</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLivraisons.map(liv => (
                  <tr key={liv.id_livraison}>
                    <td>LIV-{liv.id_livraison}</td>
                    <td>CMD-{liv.id_commande}</td>
                    <td>{liv.commande?.client?.user?.nom || 'N/A'}</td>
                    <td>{liv.adresse || 'N/A'}</td>
                    <td>{liv.date_livraison ? new Date(liv.date_livraison).toLocaleDateString() : 'N/A'}</td>
                    <td><span className={`badge bg-${liv.statut_livraison === 'livrée' ? 'success' : 'warning'}`}>{liv.statut_livraison}</span></td>
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

export default LivraisonVendeur;
