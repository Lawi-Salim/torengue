import React, { useState, useEffect } from 'react';
import { FiSearch, FiPackage, FiDollarSign, FiEye, FiTrendingUp, FiTrendingDown, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';
import './styleAdmin.css';

const API_IMAGE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/produits/images/`;

const ProduitAdmin = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [unites, setUnites] = useState([]);
  const [produits, setProduits] = useState([]);
  const filteredProduits = produits.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);
  const paginatedProduits = filteredProduits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [loading, setLoading] = useState(true);

  // Récupérer les données initiales (catégories, unités, produits)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [produitsRes, categoriesRes, unitesRes] = await Promise.all([
          apiService.get('/api/v1/produits/all'),
          apiService.get('/api/v1/categories'),
          apiService.get('/api/v1/unites')
        ]);
        setProduits(produitsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
        setUnites(unitesRes.data.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des données initiales:', error);
        setProduits([]); // Initialiser avec un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleViewProduit = (produit) => {
    setSelectedProduit(produit);
    setShowDetailModal(true);
  };

  const getStockStatus = (stock, seuilCritique = 3) => {
    if (stock <= seuilCritique) return 'critical';
    if (stock <= 10) return 'low';
    return 'good';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'critical': return 'var(--red-600)';
      case 'low': return 'var(--red-500)';
      default: return 'var(--green-600)';
    }
  };

  const getCategoryName = (id) => {
    const category = categories.find(cat => cat.id_categorie == id);
    return category ? category.nom : 'Non définie';
  };

  const getUniteName = (id) => {
    const unite = unites.find(unit => unit.id_unite == id);
    return unite ? unite.nom : 'Non définie';
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion des Produits</h2>
        <div className="zone-actions">
          <div className='field-search search-produit'>
            <FiSearch style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                borderRadius: '4px', 
                border: 'none',
                fontSize: '0.874rem',
                fontFamily: 'Poppins',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : produits.length === 0 ? (
          <EmptyState
            title="Données non trouvées"
            message="Aucun produit n'a été ajouté pour le moment."
          />
        ) : (
          <>
          <table className="produit-table">
            <thead className="produit-thead">
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProduits.map((produit) => {
                const stockStatus = getStockStatus(produit.stock_actuel, produit.seuil_critique);
                const stockColor =
                  stockStatus === 'critical' ? 'var(--red-500)'
                  : stockStatus === 'low' ? 'orange'
                  : 'var(--green-600)';
                return (
                  <tr key={produit.id_produit}>
                    <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}>N°{produit.id_produit}</td>
                    <td>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-200)'
                      }}>
                        {produit.image ? (
                          <img src={produit.image && produit.image.startsWith('http') ? produit.image : API_IMAGE_URL + produit.image} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FiPackage size={20} color="var(--gray-400)" />
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{produit.nom}</td>
                    <td style={{ color: 'var(--primary-600)', fontWeight: 500 }}>{produit.categorie?.nom || 'Non définie'}</td>
                    <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{parseFloat(produit.prix_unitaire).toLocaleString()} kmf</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        width: '10px', height: '10px', borderRadius: '50%', marginRight: 6,
                        backgroundColor: stockColor, border: '1.5px solid #fff', boxShadow: '0 0 2px rgba(0,0,0,0.08)'
                      }} />
                      <span style={{ fontWeight: 500, color: stockColor }}>{produit.stock_actuel}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewProduit(produit)}
                        className="btn btn-view-produit"
                        style={{
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-600)',
                          border: '1px solid var(--primary-200)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FiEye size={14} /> Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination-controls pagination-center">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate">{ <FiArrowLeft/> }</button>
            <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate">{ <FiArrowRight/> }</button>
          </div>
          </>
        )}
      </div>

      {/* Modal de détail du produit */}
      {selectedProduit && (
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Détail du produit : ${selectedProduit.nom}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{
                width: '150px', height: '150px', borderRadius: '8px', 
                overflow: 'hidden', background: 'var(--gray-100)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {selectedProduit.image ? (
                  <img src={selectedProduit.image && selectedProduit.image.startsWith('http') ? selectedProduit.image : API_IMAGE_URL + selectedProduit.image} alt={selectedProduit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FiPackage size={40} color="var(--gray-400)" />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: 'var(--gray-900)' }}>{selectedProduit.nom}</h3>
                <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '1rem' }}>{selectedProduit.description || 'Pas de description.'}</p>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  background: 'var(--primary-100)', 
                  color: 'var(--primary-700)', 
                  fontWeight: 500, 
                  fontSize: '0.9rem',
                  alignSelf: 'flex-start'
                }}>
                  {getCategoryName(selectedProduit.id_categorie)}
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem', 
              padding: '1rem',
              background: 'var(--gray-50)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiDollarSign color="var(--green-600)" size={20} />
                <div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Prix</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{parseFloat(selectedProduit.prix_unitaire).toLocaleString()} kmf / {getUniteName(selectedProduit.id_unite)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiPackage color="var(--blue-600)" size={20} />
                <div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Stock</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedProduit.stock_actuel}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                { getStockStatus(selectedProduit.stock_actuel) === 'good' ? <FiTrendingUp color="var(--green-600)" size={20} /> : <FiTrendingDown color="var(--red-500)" size={20} /> }
                <div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Statut</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: getStockColor(getStockStatus(selectedProduit.stock_actuel)) }}>
                    {getStockStatus(selectedProduit.stock_actuel) === 'critical' ? 'Critique' : getStockStatus(selectedProduit.stock_actuel) === 'low' ? 'Bas' : 'Bon'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProduitAdmin;