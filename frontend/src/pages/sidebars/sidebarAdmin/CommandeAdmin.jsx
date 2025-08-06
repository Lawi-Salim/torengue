import React, { useState, useEffect } from 'react';
import apiService from '../../../apiService';
import { FiArrowLeft, FiArrowRight, FiSearch, FiEye, FiDownload } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import { formatNumber } from '../../../utils/formatUtils';

const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA',
  '#F0B8B8', '#97C1A9', '#A2D5F2', '#FFD3B5', '#F6E6C2',
  '#FF8C94', '#A8E6CF', '#D4F0F0', '#FFDAB9', '#F9EAC3'
];

const getCategoryColor = (categoryName) => {
  if (!categoryName) return '#ccc';
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % categoryColors.length);
  return categoryColors[index];
};

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

const CommandeAdmin = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState(null);
  const [hoveredCmdId, setHoveredCmdId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const paginatedCommandes = commandes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(commandes.length / itemsPerPage);



  const fetchCommandes = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.id_categorie) params.append('id_categorie', filters.id_categorie);
      if (filters.statut) params.append('statut', filters.statut);

      const res = await apiService.get(`/api/v1/commandes/all?${params.toString()}`);
      setCommandes(res.data.data || []);
    } catch (err) {
      setError('Impossible de charger les commandes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [catRes, statusRes] = await Promise.all([
          apiService.get('/api/v1/categories'),
          apiService.get('/api/v1/commandes/statuts')
        ]);
        setCategories(catRes.data.data || []);
        setStatuses(statusRes.data.data || []);
      } catch (err) {
        setError('Impossible de charger les données de filtrage.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    // Ne pas lancer la recherche initiale si les filtres sont vides au premier rendu
    if (selectedCategory === '' && selectedStatus === '') {
        fetchCommandes();
        return;
    }
    const handler = setTimeout(() => {
        fetchCommandes({ id_categorie: selectedCategory, statut: selectedStatus });
    }, 300); // Debounce pour éviter les appels multiples

    return () => {
        clearTimeout(handler);
    };
  }, [selectedCategory, selectedStatus]);

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion de Toutes les Commandes</h2>
        <div className="zone-actions">
            <select className='filter-select' value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom}</option>
              ))}
            </select>
            <select className='filter-select' value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">Tous les statuts</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
            <EmptyState title="Erreur" message={error} />
        ) : commandes.length === 0 ? (
          <EmptyState 
            title="Aucune Commande"
            message="Il n'y a aucune commande enregistrée sur la plateforme pour le moment."
          />
        ) : (
          <table className="produit-table">
            <thead className="produit-thead">
              <tr>
                <th>ID Commande</th>
                <th>Client</th>
                <th>Boutique</th>
                <th>Catégorie</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCommandes.map((commande) => (
                <tr key={commande.id_commande}>
                  <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>CMD-{commande.id_commande}</strong></td>
                  <td>{commande.client?.nom || 'N/A'}</td>
                  <td>{commande.boutique}</td>
                  <td style={{ position: 'relative' }}>
                    {(() => {
                      const uniqueCategories = Array.isArray(commande.categories) ? [...new Map(commande.categories.map(item => [item['nom'], item])).values()] : [];
                      if (uniqueCategories.length === 0) return null;

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
                              style={{ fontSize: '0.75rem', color: 'var(--gray-500)', cursor: 'pointer' }}
                              onMouseEnter={() => setHoveredCmdId(commande.id_commande)}
                              onMouseLeave={() => setHoveredCmdId(null)}
                            >
                              +{otherCategoriesCount} autre{otherCategoriesCount > 1 ? 's' : ''}
                            </span>
                          )}
                          {hoveredCmdId === commande.id_commande && otherCategories.length > 0 && (
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
                  <td>{new Date(commande.date_commande).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{formatNumber(commande.montantTotal)} kmf</td>
                  <td>
                    <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(commande.statut),
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {getStatusLabel(commande.statut)}
                      </span>
                    </td>
                  <td>
                    <button className="btn-action" title="Voir les détails">
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination-controls pagination-center">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
          <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
        </div>
      </div>
    </div>
  );
};

export default CommandeAdmin;
