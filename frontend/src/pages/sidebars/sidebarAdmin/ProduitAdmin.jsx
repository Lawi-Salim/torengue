import React, { useState, useEffect } from 'react';
import { FiPlus, FiCheckCircle, FiXCircle, FiSearch, FiUpload, FiImage, FiEdit, FiTrash2, FiPackage, FiDollarSign, FiEye, FiTrendingUp, FiTrendingDown, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';
import './styleAdmin.css';

const API_IMAGE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/produits/images/`;

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
    }
  };

  const handleEditProduit = (produit) => {
    setForm({
      nom: produit.nom,
      description: produit.description,
      prix_unitaire: produit.prix_unitaire,
      stock_actuel: produit.stock_actuel,
      image: produit.image,
      id_categorie: produit.id_categorie,
      id_unite: produit.id_unite,
      seuil_alerte: produit.seuil_alerte,
      seuil_critique: produit.seuil_critique
    });
    setImagePreview(produit.image);
    setEditProduitId(produit.id_produit);
    setEditMode(true);
    setShowForm(true);
  };

  const handleAddProduit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prix_unitaire || !form.stock_actuel || !vendeurId) return;
    
    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('description', form.description);
    formData.append('prix_unitaire', form.prix_unitaire);
    formData.append('stock_actuel', form.stock_actuel);
    formData.append('id_categorie', form.id_categorie);
    formData.append('id_unite', form.id_unite);
    formData.append('seuil_alerte', form.seuil_alerte);
    formData.append('seuil_critique', form.seuil_critique);
    // L'id_vendeur n'est plus nécessaire ici pour l'admin, le backend devrait le gérer
    // formData.append('id_vendeur', vendeurId);
    if (form.image) formData.append('image', form.image);
    
    try {
      if (editMode) {
        // Mode édition - mettre à jour le produit
        await apiService.put(`/api/v1/produits/${editProduitId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Mode ajout - créer un nouveau produit
        await apiService.post('/api/v1/produits', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
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
    } catch (error) {
      console.error(`Erreur lors de l'opération sur le produit:`, error);
      alert(`editMode` ? `Erreur lors de la modification du produit.` : `Erreur lors de l'ajout du produit.`);
    }
  };

  const handleViewProduit = (produit) => {
    setSelectedProduit(produit);
    setShowDetailModal(true);
  };

  const handleDeleteProduit = (id) => {
    // TODO: Implement actual deletion via API
    alert('Suppression de produit non implémentée via API.');
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
              >
                <option value="">Sélectionner une catégorie</option>
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
              >
                <option value="">Sélectionner une unité</option>
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
                >
                  <FiCheckCircle /> Enregistrer
                </button>
              </div>
            </div>
          </form>
        </Modal>

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
                    <img src={API_IMAGE_URL + selectedProduit.image} alt={selectedProduit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FiImage size={40} color="var(--gray-400)" />
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    handleEditProduit(selectedProduit);
                    setShowDetailModal(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiEdit size={14} /> Modifier
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteProduit(selectedProduit.id_produit)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiTrash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          </Modal>
        )}

        {loading ? (
          <Spinner />
        ) : produits.length === 0 ? (
          <EmptyState
            title="Données non trouvées"
            message="Aucun vendeur n'a ajouté de produit pour le moment."
          />
        ) : (
          <>
          <table className="produit-table">
            <thead className="produit-thead">
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Nom</th>
                <th>Vendeur</th>
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
                          <img src={API_IMAGE_URL + produit.image} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FiPackage size={20} color="var(--gray-400)" />
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{produit.nom}</td>
                    <td style={{ color: 'var(--gray-600)', fontWeight: 400 }}>{produit.vendeur?.nom_boutique || 'N/A'}</td>
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
    </div>
  );
};

export default ProduitVendeur;