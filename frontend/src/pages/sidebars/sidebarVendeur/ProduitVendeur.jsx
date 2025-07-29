import React, { useState, useEffect } from 'react';
import { FiPlus, FiCheckCircle, FiXCircle, FiSearch, FiUpload, FiImage, FiEdit, FiTrash2, FiPackage, FiDollarSign, FiEye, FiTrendingUp, FiTrendingDown, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';
import './styleVendeur.css';

const API_IMAGE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/produits/images/`;

// Fonction pour gérer les erreurs d'images
const handleImageError = (event) => {
  console.log('❌ Erreur de chargement image:', event.target.src);
  event.target.src = '/favicon.png'; // Image par défaut
  event.target.onerror = null; // Éviter les boucles infinies
};

// Fonction pour construire l'URL de l'image
const getImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === 'default.png' || imageUrl === 'default.jpg') {
    return '/favicon.png'; // Image par défaut
  }
  // Si c'est une URL Cloudinary, l'utiliser directement
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  // Sinon, utiliser l'ancienne méthode (pour compatibilité)
  return API_IMAGE_URL + imageUrl;
};

const ProduitVendeur = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [unites, setUnites] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    prix_unitaire: '',
    stock_actuel: '',
    image: null,
    id_categorie: '',
    id_unite: '',
    seuil_alerte: 10,
    seuil_critique: 3
  });
  const [produits, setProduits] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editProduitId, setEditProduitId] = useState(null);
  const filteredProduits = produits.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);
  const paginatedProduits = filteredProduits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [vendeurId, setVendeurId] = useState(null);
  const [loading, setLoading] = useState(true);
  // Supposons que tu as un état loadingForm pour le chargement du formulaire
  // Ajoute-le si besoin :
  // const [loadingForm, setLoadingForm] = useState(false);

  // Récupérer les catégories, unités et produits du vendeur
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, unitesRes] = await Promise.all([
          apiService.get('/api/v1/produits/categories/list'),
          apiService.get('/api/v1/produits/unites/list')
        ]);
        setCategories(categoriesRes.data.data);
        setUnites(unitesRes.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    fetchData();
  }, []);

  // Récupérer les produits du vendeur
  useEffect(() => {
    const fetchProduits = async () => {
      if (!vendeurId) return;
      setLoading(true);
      try {
        // On attend la réponse de l'API ET un délai minimum pour voir le spinner
        const [res] = await Promise.all([
          apiService.get(`/api/v1/produits/vendeur/${vendeurId}`),
          new Promise(resolve => setTimeout(resolve, 1500)) // Délai de 1.5s
        ]);
        setProduits(res.data.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        setProduits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, [vendeurId]);

  // Récupérer l'id_vendeur à partir de l'id_user
  useEffect(() => {
    console.log('=== RÉCUPÉRATION VENDEUR ID ===');
    console.log('User:', user);
    console.log('User ID:', user?.id_user);
    
    if (user?.id_user) {
      console.log('Tentative de récupération du vendeur pour user ID:', user.id_user);
      
      apiService.get(`/api/v1/vendeurs/user/${user.id_user}`)
        .then(res => {
          console.log('✅ Réponse API vendeur:', res.data);
          setVendeurId(res.data.data.id_vendeur);
          console.log('Vendeur ID défini:', res.data.data.id_vendeur);
        })
        .catch(error => {
          console.error('❌ Erreur lors de la récupération du vendeur:', error);
          console.error('Détails de l\'erreur:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
        });
    } else {
      console.log('❌ User ID non disponible');
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // Si aucun fichier n'est sélectionné, garder l'image existante
      if (form.image && typeof form.image === 'string') {
        // Si c'est une URL d'image existante (pas un fichier)
        setImagePreview(getImageUrl(form.image));
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleEditProduit = (produit) => {
    setForm({
      nom: produit.nom || '',
      description: produit.description || '',
      prix_unitaire: produit.prix_unitaire || '',
      stock_actuel: produit.stock_actuel || '',
      image: produit.image || null,
      id_categorie: produit.id_categorie || '',
      id_unite: produit.id_unite || '',
      seuil_alerte: produit.seuil_alerte || 10,
      seuil_critique: produit.seuil_critique || 3
    });
    
    // Corriger l'affichage de l'image
    if (produit.image) {
      const imageUrl = getImageUrl(produit.image);
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    
    setEditProduitId(produit.id_produit);
    setEditMode(true);
    setShowForm(true);
  };

  const handleAddProduit = async (e) => {
    e.preventDefault();
    
    console.log('=== DÉBUT CRÉATION PRODUIT FRONTEND ===');
    console.log('Form data:', form);
    console.log('Vendeur ID:', vendeurId);
    console.log('Edit mode:', editMode);
    
    // Validation des champs
    if (!form.nom || !form.prix_unitaire || !form.stock_actuel || !form.id_categorie || !form.id_unite) {
      console.log('❌ Champs obligatoires manquants');
      alert('Veuillez remplir tous les champs obligatoires (nom, prix, stock, catégorie et unité).');
      return;
    }
    
    if (!vendeurId) {
      console.log('❌ Vendeur ID manquant');
      alert('Erreur: ID vendeur non trouvé. Veuillez vous reconnecter.');
      return;
    }
    
    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('description', form.description || '');
    formData.append('prix_unitaire', form.prix_unitaire);
    formData.append('stock_actuel', form.stock_actuel);
    formData.append('id_categorie', form.id_categorie || '');
    formData.append('id_unite', form.id_unite || '');
    formData.append('seuil_alerte', form.seuil_alerte || 10);
    formData.append('seuil_critique', form.seuil_critique || 3);
    formData.append('id_vendeur', vendeurId);
    if (form.image) formData.append('image', form.image);
    
    // Afficher le contenu du FormData
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    try {
      if (editMode) {
        console.log('Mode édition - mise à jour du produit');
        await apiService.put(`/api/v1/produits/${editProduitId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        console.log('Mode ajout - création d\'un nouveau produit');
        console.log('URL:', '/api/v1/produits');
        console.log('Headers:', { 'Content-Type': 'multipart/form-data' });
        
        const response = await apiService.post('/api/v1/produits', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log('✅ Réponse du serveur:', response);
      }
      
      setShowForm(false);
      setForm({
        nom: '',
        description: '',
        prix_unitaire: '',
        stock_actuel: '',
        image: null,
        id_categorie: '',
        id_unite: '',
        seuil_alerte: 10,
        seuil_critique: 3
      });
      setImagePreview(null);
      setEditMode(false);
      setEditProduitId(null);
      
      // Rafraîchir la liste
      const res = await apiService.get(`/api/v1/produits/vendeur/${vendeurId}`);
      setProduits(res.data.data || []);
      
      console.log('✅ Produit créé/modifié avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'opération sur le produit:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response?.data?.message) {
        alert(`Erreur: ${error.response.data.message}`);
      } else {
        alert(editMode ? 'Erreur lors de la modification du produit.' : 'Erreur lors de l\'ajout du produit.');
      }
    }
    
    console.log('=== FIN CRÉATION PRODUIT FRONTEND ===');
  };

  const handleViewProduit = (produit) => {
    setSelectedProduit(produit);
    setShowDetailModal(true);
  };

  const handleDeleteProduit = (id) => {
    // TODO: Implement actual deletion via API
    alert('Suppression de produit non implémentée via API.');
  };

  // Nouvelle gestion du statut de stock
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
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus />
            Ajouter un produit
          </button>
        </div>
      </div>
      <div className="card-body">
        {/* Modal d'ajout de produit */}
        <Modal open={showForm} onClose={() => setShowForm(false)} title="Ajouter un produit">
          <form onSubmit={handleAddProduit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                name="nom"
                placeholder="Nom du produit*"
                value={form.nom}
                onChange={handleChange}
                required
                className="input"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="input"
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
              <input
                type="number"
                name="prix_unitaire"
                placeholder="Prix unitaire*"
                value={form.prix_unitaire}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input"
              />
              <input
                type="number"
                name="stock_actuel"
                placeholder="Stock actuel*"
                value={form.stock_actuel}
                onChange={handleChange}
                required
                min="0"
                className="input"
              />
              
              {/* Upload d'image avec aperçu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Image du produit
                </label>
                <div style={{ 
                  border: '2px dashed var(--gray-300)', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: imagePreview ? 'var(--gray-50)' : 'white'
                }} onClick={() => document.getElementById('image-upload').click()}>
                  {imagePreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={imagePreview} 
                        alt="Aperçu" 
                        style={{ 
                          maxWidth: '120px', 
                          maxHeight: '120px', 
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }} 
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                        Cliquez pour changer l'image
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FiUpload size={24} color="var(--gray-400)" />
                      <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                        Cliquez pour sélectionner une image
                      </span>
                    </div>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              <select
                name="id_categorie"
                value={form.id_categorie}
                onChange={handleChange}
                className="input"
                style={{ cursor: 'pointer' }}
                required
              >
                <option value="">Sélectionner une catégorie*</option>
                {categories.map(cat => (
                  <option key={cat.id_categorie} value={cat.id_categorie}>
                    {cat.nom}
                  </option>
                ))}
              </select>

              <select
                name="id_unite"
                value={form.id_unite}
                onChange={handleChange}
                className="input"
                style={{ cursor: 'pointer' }}
                required
              >
                <option value="">Sélectionner une unité*</option>
                {unites.map(unite => (
                  <option key={unite.id_unite} value={unite.id_unite}>
                    {unite.nom} {unite.symbole ? `(${unite.symbole})` : ''}
                  </option>
                ))}
              </select>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center', 
                marginTop: '16px',
                justifyContent: 'flex-end'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowForm(false)}
                  style={{
                    backgroundColor: 'var(--gray-200)',
                    color: 'var(--gray-700)',
                    border: '1px solid var(--gray-300)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  <FiXCircle /> Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  style={{
                    backgroundColor: 'var(--green-600)',
                    color: 'white',
                    border: '1px solid var(--green-600)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size={18} inline={true} />
                      <span style={{ marginLeft: 8,  width: '100%', textAlign: 'center'}}>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle /> Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal de détails du produit */}
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Détails du produit">
          {selectedProduit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--gray-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedProduit.image ? (
                  <img 
                    src={getImageUrl(selectedProduit.image)} 
                    alt={selectedProduit.nom}
                    onError={handleImageError}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <FiPackage size={64} color="var(--gray-400)" />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: '0 0 8px 0' }}>
                    {selectedProduit.nom}
                  </h3>
                  <p style={{ color: 'var(--gray-600)', margin: 0 }}>
                    {selectedProduit.description || 'Aucune description'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Prix unitaire</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--green-600)' }}>
                      {parseFloat(selectedProduit.prix_unitaire).toLocaleString()} kmf
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Stock actuel</span>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: '700', 
                      color: getStockColor(getStockStatus(selectedProduit.stock_actuel))
                    }}>
                      {selectedProduit.stock_actuel}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Catégorie</span>
                    <div style={{ fontSize: '1rem', fontWeight: '500' }}>
                      {getCategoryName(selectedProduit.id_categorie)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Unité</span>
                    <div style={{ fontSize: '1rem', fontWeight: '500' }}>
                      {getUniteName(selectedProduit.id_unite)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditProduit(selectedProduit);
                    }}
                    style={{
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      border: '1px solid var(--primary-200)',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FiEdit size={16} />
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
        
        {loading ? (
          <Spinner />
        ) : filteredProduits.length === 0 ? (
          <EmptyState 
            title="Gestion des Produits"
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
                  stockStatus === 'rupture' ? 'var(--red-500)'
                  : stockStatus === 'critique' ? 'var(--red-500)'
                  : stockStatus === 'moyen' ? 'var(--yellow-500)'
                  : stockStatus === 'suffisant' ? 'var(--green-500)'
                  : stockStatus === 'surstock' ? 'var(--primary-500)'
                  : 'var(--gray-400)';
                return (
                  <tr key={produit.id_produit}>
                    <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}>N°{produit.id_produit}</td>
                    <td>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {produit.image ? (
                          (() => {
                            const imageUrl = getImageUrl(produit.image);
                            console.log('=== AFFICHAGE IMAGE PRODUIT ===');
                            console.log('Produit:', produit.nom);
                            console.log('Image dans DB:', produit.image);
                            console.log('API_IMAGE_URL:', API_IMAGE_URL);
                            console.log('URL complète:', imageUrl);
                            console.log('=== FIN AFFICHAGE IMAGE ===');
                            return (
                              <img src={imageUrl} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            );
                          })()
                        ) : (
                          <FiPackage size={20} color="var(--gray-400)" />
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{produit.nom}</td>
                    <td style={{ color: 'var(--primary-600)', fontWeight: 500 }}>{getCategoryName(produit.id_categorie)}</td>
                    <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{parseFloat(produit.prix_unitaire).toLocaleString()} kmf</td>
                    <td>
                      {(() => {
                        const status = getStockStatus(produit.stock_actuel, produit.seuil_critique);
                        const color = getStockColor(status);
                        const label =
                          status === 'rupture' ? 'En rupture'
                          : status === 'critique' ? 'Critique'
                          : status === 'moyen' ? 'Moyen'
                          : status === 'suffisant' ? 'Suffisant'
                          : status === 'surstock' ? 'Sur-stock'
                          : 'Inconnu';
                        return (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: '0.92rem',
                              fontWeight: 500,
                              color,
                              background: 'rgba(0,0,0,0.04)',
                              borderRadius: 6,
                              padding: '2px 10px',
                              marginLeft: 4
                            }}>{label}</span>
                          </span>
                        );
                      })()}
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
    </div>
  );
};

export default ProduitVendeur;
