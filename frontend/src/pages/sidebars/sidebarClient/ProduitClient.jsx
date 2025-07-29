import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { FiSearch, FiPlus, FiTag, FiBox, FiPackage, FiShoppingCart, FiUserCheck } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import apiService from '../../../apiService';
import { useCart } from '../../../context/CartContext';
import { toast } from 'react-hot-toast';
import './styleClient.css';

const API_IMAGE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/produits/images/`;

const ProductCard = ({ produit, onViewVendor, onAddToCart }) => {
  const getStockStatus = (stock, seuilCritique = 3) => {
    if (stock === 0) return 'rupture';
    if (stock <= seuilCritique) return 'rupture'; // Considérer comme rupture si ≤ seuil critique
    if (stock >= 1 && stock <= 10) return 'critique';
    if (stock >= 11 && stock <= 50) return 'moyen';
    if (stock >= 51 && stock <= 149) return 'suffisant';
    if (stock >= 150) return 'surstock';
    return 'inconnu';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'rupture': return 'var(--red-600)';
      case 'critique': return 'var(--red-500)';
      case 'moyen': return 'var(--yellow-500)';
      case 'suffisant': return 'var(--green-500)';
      case 'surstock': return 'var(--primary-500)';
      default: return 'var(--gray-400)';
    }
  };

  const getStockLabel = (status) => {
    switch (status) {
      case 'rupture': return 'En rupture';
      case 'critique': return 'Critique';
      case 'moyen': return 'Moyen';
      case 'suffisant': return 'Suffisant';
      case 'surstock': return 'Sur-stock';
      default: return 'Inconnu';
    }
  };

  // Utiliser le seuil critique du produit ou 3 par défaut
  const seuilCritique = produit.seuil_critique || 3;
  const stockStatus = getStockStatus(produit.stock_actuel, seuilCritique);
  const stockColor = getStockColor(stockStatus);
  const stockLabel = getStockLabel(stockStatus);
  const isAvailable = stockStatus !== 'rupture';

  return (
    <div className="product-card">
      <div className="product-image-container">
        {produit.image ? (
          <img src={produit.image && produit.image.startsWith('http') ? produit.image : API_IMAGE_URL + produit.image} alt={produit.nom} className="product-image" />
        ) : (
          <div className="product-image-placeholder"><FiPackage size={40} /></div>
        )}
        <span className="stock-badge" style={{
          backgroundColor: stockColor,
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '12px',
          border: '1.5px solid rgba(255, 255, 255, 0.5)'
        }}>
          {stockStatus === 'rupture' ? 'En rupture' : `${produit.stock_actuel} ${stockLabel}`}
        </span>
      </div>
      <div className="product-card-body">
        <div className="product-info">
            <span className="product-category"><FiTag size={12} /> {produit.categorie?.nom || 'Non classé'}</span>
            <h3 className="product-name">{produit.nom}</h3>
            <p className="product-vendor">Boutique : <strong>{produit.vendeur?.nom_boutique || 'N/A'}</strong></p>
        </div>
        <div className="product-price-container">
            <div className="product-price">{parseFloat(produit.prix_unitaire).toLocaleString()} KMF</div>
            <span className="product-unit">/ {produit.unite?.nom || 'unité'}</span>
        </div>
        <div className="product-actions">
            <button className="btn btn-view-vendor" onClick={() => onViewVendor(produit.vendeur)}><FiUserCheck size={14} /> Vendeur</button>
            <button className="btn btn-add-to-cart" disabled={!isAvailable} onClick={() => onAddToCart(produit)}><FiShoppingCart size={14} /> Ajouter</button>
        </div>
      </div>
    </div>
  );
};

const ProduitClient = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const { cartItems, addToCart } = useCart();

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/v1/produits/all');
        setProduits(response.data.data || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des produits:", err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

  const filteredProduits = produits.filter(produit => 
    produit.categorie?.nom.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewVendor = (vendeur) => {
    setSelectedVendor(vendeur);
    setShowVendorModal(true);
  };

  const handleAddToCart = (produit) => {
    addToCart(produit);
    toast.success(`Produit ajouté avec succès !`);
  };



  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Découvrez nos Produits</h2>
        <div className="zone-actions">
          <div className='field-search search-produit'>
            <FiSearch style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Rechercher par catégorie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                borderRadius: '4px', 
                border: 'none',
                fontSize: '0.874rem',
                fontFamily: 'Poppins',
                outline: 'none',
                width: '12rem'
              }}
            />
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState title="Erreur" message={error} />
        ) : filteredProduits.length > 0 ? (
          <div className="product-grid">
            {filteredProduits.map(produit => (
              <ProductCard key={produit.id_produit} produit={produit} onViewVendor={handleViewVendor} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Aucun résultat"
            message={search ? "Aucun produit ne correspond à votre recherche." : "Aucun produit n'est disponible pour le moment."}
          />
        )}
      </div>

      {/* Modal Vendeur favoris */}
      {showVendorModal && selectedVendor && (
        <Modal open={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Détails du vendeur`}>
            <div className="vendor-modal-content">
              <h4>{selectedVendor.nom_boutique}</h4>
              <p><strong>Nom du vendeur :</strong> {selectedVendor.nom_vendeur} </p>
              <p><strong>Contact :</strong> {selectedVendor.telephone} </p>
              <p><strong>Email :</strong> {selectedVendor.email} </p>
              <p><strong>Adresse de la boutique :</strong> {selectedVendor.adresse} </p>
              <button className='btn btn-primary'><FiUserCheck /> Ajouter comme favori</button>
            </div>
        </Modal>
      )}



    </div>
  );
};

export default ProduitClient;
