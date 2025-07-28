import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { FiSearch, FiPlus, FiTag, FiBox, FiPackage, FiShoppingCart, FiUserCheck, FiTrash2 } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import apiService from '../../../apiService';
import { useCart } from '../../../context/CartContext';
import { toast } from 'react-hot-toast';
import './styleClient.css';

const API_IMAGE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/produits/images/`;

const ProductCard = ({ produit, onViewVendor, onAddToCart }) => {
  const getStockStatus = (stock) => {
    if (stock === 0) return 'rupture';
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
      case 'rupture': return 'Rupture';
      case 'critique': return 'Critique';
      case 'moyen': return 'Moyen';
      case 'suffisant': return 'Suffisant';
      case 'surstock': return 'Sur-stock';
      default: return 'Inconnu';
    }
  };

  const stockStatus = getStockStatus(produit.stock_actuel);
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
          {stockStatus === 'rupture' ? 'Indisponible' : `${produit.stock_actuel} ${stockLabel}`}
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
  const { cartItems, addToCart, removeFromCart, updateCartQuantity, showCartModal, openCartModal, closeCartModal } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);

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

  const handleValidateOrder = async () => {
    if (cartItems.length === 0) return;
    setIsOrdering(true);
    try {
      // Préparer les données pour l'API (adapter selon le backend)
      const produits = cartItems.map(item => ({
        id_produit: item.id_produit,
        quantite: item.quantity,
        prix_unitaire: item.prix_unitaire
      }));
      await apiService.post('/api/v1/commandes', { produits });
      toast.success('Commande validée !');
      // Vider le panier
      cartItems.forEach(item => removeFromCart(item.id_produit));
      closeCartModal();
    } catch (error) {
      toast.error("Erreur lors de la validation de la commande");
    } finally {
      setIsOrdering(false);
    }
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

      {/* Modal Panier */}
      {showCartModal && (
        <Modal open={showCartModal} onClose={closeCartModal} title="Récapitulatif du Panier" contentClassName="custom-cart-modal-width">
          <div className="cart-modal-content">
            {cartItems.length > 0 ? (
              <>
                <div className='command' style={{ maxHeight: 320, overflowY: 'auto', padding: '0' }}>
                  {cartItems.map((item, idx) => (
                    <div key={item.id_produit + '-' + idx} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderBottom: idx < cartItems.length-1 ? '1px solid #f0f0f0' : 'none', background: idx%2===0 ? '#fafbfc' : '#fff' }}>
                      <img
                        src={item.image ? (item.image.startsWith('http') ? item.image : API_IMAGE_URL + item.image) : '/default.jpg'}
                        alt={item.nom}
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 4px #0001' }}
                      />
                      <span style={{ flex: 1, fontWeight: 500 }}>{item.nom}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', borderRadius: 8, padding: '2px 8px' }}>
                        <button onClick={() => updateCartQuantity(item.id_produit, item.quantity - 1)} disabled={item.quantity <= 1} style={{ border: 'none', background: '#e5e7eb', borderRadius: '50%', width: 28, height: 28, fontSize: 18, cursor: 'pointer', color: '#374151' }}>-</button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id_produit, item.quantity + 1)} style={{ border: 'none', background: '#e5e7eb', borderRadius: '50%', width: 28, height: 28, fontSize: 18, cursor: 'pointer', color: '#374151' }}>+</button>
                      </div>
                      <span style={{ minWidth: 90, textAlign: 'right', fontWeight: 500 }}>{(item.prix_unitaire * item.quantity).toLocaleString()} KMF</span>
                      <button onClick={() => removeFromCart(item.id_produit)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#ef4444', fontSize: 20, cursor: 'pointer' }}><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
                <div className="cart-total" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18, padding: '16px 0', fontSize: '1.15rem' }}>
                  <strong style={{ marginRight: 16, fontSize: '1.1rem', color: '#374151' }}>Total :</strong>
                  <strong style={{ fontSize: '1.35rem', color: '#2563eb' }}>{cartItems.reduce((acc, item) => acc + item.prix_unitaire * item.quantity, 0).toLocaleString()} KMF</strong>
                </div>
                <div className="btn-order" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 18px', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    className='btn btn-primary btn-validate-order'
                    style={{ width: '13rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '38px' }}
                    onClick={handleValidateOrder}
                    disabled={isOrdering}
                  >
                    {isOrdering ? <Spinner inline size={18} style={{ marginRight: 8 }} /> : 'Valider la commande'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, color: '#64748b', fontWeight: 500, fontSize: '1.1rem' }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>🛒</span>
                Votre panier est vide.
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};

export default ProduitClient;
