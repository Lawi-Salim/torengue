import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiChevronLeft, 
  FiChevronRight, 
  FiX, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiShoppingBag,
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEye, 
  FiArrowLeft, 
  FiArrowRight 
} from 'react-icons/fi';
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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(produits.length / itemsPerPage);
  const paginatedProduits = produits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndUnites = async () => {
      try {
        const [categoriesRes, unitesRes] = await Promise.all([
          apiService.get('/api/v1/categories'),
          apiService.get('/api/v1/unites')
        ]);
        setCategories(categoriesRes.data.data || []);
        setUnites(unitesRes.data.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories et unités:', error);
      }
    };
    fetchCategoriesAndUnites();
  }, []);

  useEffect(() => {
    const fetchProduits = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryFilter) params.append('id_categorie', categoryFilter);
        if (stockStatusFilter) params.append('stockStatus', stockStatusFilter);

        const response = await apiService.get(`/api/v1/produits/all?${params.toString()}`);
        setProduits(response.data.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        setProduits([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
        fetchProduits();
    }, 300); // Ajoute un délai pour ne pas surcharger le serveur à chaque frappe

    return () => clearTimeout(debounceFetch);
  }, [search, categoryFilter, stockStatusFilter]);

  const handleViewProduit = (produit) => {
    setSelectedProduit(produit);
    setShowDetailModal(true);
  };

  const getCategoryColor = (categorie) => {
    const colors = {
      'Électricité': '#FFC107', 'Plomberie': '#00BCD4', 'Peinture': '#E91E63',
      'Jardinage': '#4CAF50', 'Construction': '#795548', 'Sécurité': '#607D8B',
      'Outils': '#9E9E9E', 'Décoration': '#FF5722',
    };
    return colors[categorie] || '#ccc';
  };

    const getStockStatus = (stock, seuilCritique = 3) => {
    if (stock <= seuilCritique) return 'critical';
    if (stock <= 10) return 'low';
    return 'in_stock';
  };

  const getStockLabel = (status) => {
    switch (status) {
      case 'in_stock': return 'En stock';
      case 'low': return 'Stock faible';
      case 'critical': return 'Critique';
      default: return 'Indisponible';
    }
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'in_stock': return 'var(--green-600)';
      case 'low': return 'orange';
      case 'critical': return 'var(--red-500)';
      default: return '#6c757d';
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
            />
          </div>
          <select className='filter-select' value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id_categorie} value={cat.id_categorie}>{cat.nom}</option>
            ))}
          </select>
          <select className='filter-select' value={stockStatusFilter} onChange={e => setStockStatusFilter(e.target.value)}>
            <option value="">Tous les stocks</option>
            <option value="in_stock">En stock</option>
            <option value="low">Stock faible</option>
            <option value="critical">Critique</option>
          </select>
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
                <th>Boutique</th>
                <th>Statut</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProduits.map((produit) => {
                const stockStatus = getStockStatus(produit.stock_actuel, produit.seuil_critique);
                const stockLabel = getStockLabel(stockStatus);
                const stockColor = getStockColor(stockStatus);

                return (
                  <tr key={produit.id_produit}>
                    <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>PRDT-{produit.id_produit}</strong></td>
                    <td>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-400)'
                      }}>
                        {produit.image ? (
                          <img src={produit.image && produit.image.startsWith('http') ? produit.image : API_IMAGE_URL + produit.image} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FiPackage size={20} color="var(--gray-400)" />
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{produit.nom}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getCategoryColor(produit.categorie?.nom), color: 'white', padding: '5px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                        {produit.categorie?.nom || 'Non définie'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{parseFloat(produit.prix_unitaire).toLocaleString()} kmf</td>
                    <td style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{produit.vendeur?.nom_boutique || 'N/A'}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: stockColor, color: 'white', padding: '5px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                        {stockLabel}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: stockColor }}>
                      {produit.stock_actuel}
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

            {/* Section Informations du Vendeur */}
            <div className="vendor-details-section" style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
              <h4 style={{
                marginBottom: '1rem',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--gray-800)',
              }}>
                Informations sur le Vendeur
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiShoppingBag color="var(--gray-500)" size={20} />
                  <div>
                    <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Boutique</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedProduit.vendeur?.nom_boutique || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiUser color="var(--gray-500)" size={20} />
                  <div>
                    <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Nom du vendeur</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedProduit.vendeur?.user?.nom || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMail color="var(--gray-500)" size={20} />
                  <div>
                    <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Email</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedProduit.vendeur?.user?.email || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiPhone color="var(--gray-500)" size={20} />
                  <div>
                    <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Téléphone</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedProduit.vendeur?.user?.telephone || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMapPin color="var(--gray-500)" size={20} />
                  <div>
                    <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Adresse</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedProduit.vendeur?.adresse || 'N/A'}</div>
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