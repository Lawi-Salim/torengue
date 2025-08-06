import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import apiService from '../apiService';
import { FiLoader, FiAlertTriangle, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Import des styles de slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const API_IMAGE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Le composant ProductCard est maintenant défini localement dans ce fichier.
const ProductCard = ({ produit }) => {
  const navigate = useNavigate();

  // Logique de gestion du stock
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

  const stockStatus = getStockStatus(produit.stock_actuel, produit.seuil_critique);
  const stockLabel = getStockLabel(stockStatus);
  const stockColor = getStockColor(stockStatus);
  const isAvailable = stockStatus !== 'rupture';

  const handleViewProduct = () => {
    navigate('/login'); // Redirige simplement vers login pour l'instant
  };

  return (
    <div className="product-card-carousel">
      <div className="product-image-container">
        {produit.image ? (
          <img 
            src={produit.image.startsWith('http') ? produit.image : `${API_IMAGE_URL}${produit.image}`}
            alt={produit.nom} 
            className="product-image" 
          />
        ) : (
          <div className="product-image-placeholder"><FiPackage size={40} /></div>
        )}
        <span className="stock-badge" style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: stockColor,
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '12px',
          border: '1.5px solid rgba(255, 255, 255, 0.3)'
        }}>
          {stockStatus === 'rupture' ? 'En rupture' : `${produit.stock_actuel} ${stockLabel}`}
        </span>
      </div>
      <div className="product-card-body">
        <div className="product-info">
            <h3 className="product-name">{produit.nom}</h3>
            <p className="product-vendor">{produit.vendeur?.nom_boutique || 'Vendeur Partenaire'}</p>
        </div>
        <div className="product-price-container">
            <div className="product-price">{parseFloat(produit.prix_unitaire).toLocaleString()} KMF</div>
        </div>
        <div className="product-actions">
            <button className="btn btn-add-to-cart" onClick={handleViewProduct} disabled={!isAvailable}>
              <FiShoppingCart size={14} /> {isAvailable ? 'Voir' : 'Indisponible'}
            </button>
        </div>
      </div>
    </div>
  );
};

const ProductCarousel = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await apiService.get('/api/v1/produits/public/featured');
        const featuredProduits = response.data.data || [];
        setProduits(featuredProduits.slice(0, 6)); // Limite à 6 produits
      } catch (err) {
        console.error("Erreur lors de la récupération des produits:", err);
        setError('Impossible de charger les produits pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

    const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="carousel-feedback">
        <FiLoader className="spinner" />
        <p>Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-feedback error">
        <FiAlertTriangle />
        <p>{error}</p>
      </div>
    );
  }

  if (produits.length === 0) {
    return (
        <div className="carousel-feedback">
            <FiPackage />
            <p>Aucun produit à afficher pour le moment.</p>
        </div>
    );
  }

  return (
    <div className="product-carousel-container">
      <Slider {...settings}>
        {produits.map(produit => (
          <div key={produit.id_produit}>
            <ProductCard produit={produit} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductCarousel;
