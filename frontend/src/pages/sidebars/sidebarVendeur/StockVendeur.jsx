import React, { useState, useEffect } from 'react';
import EmptyState from '../../../components/EmptyState';
import Spinner from '../../../components/Spinner';
import { FiPackage, FiEye, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Modal from '../../../components/Modal';
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';
import './styleVendeur.css';

const API_IMAGE_URL = 'http://localhost:5000/api/v1/produits/images/';

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

const StockVendeur = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [vendeurId, setVendeurId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [newSeuilAlerte, setNewSeuilAlerte] = useState('');
  const [newSeuilCritique, setNewSeuilCritique] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(stocks.length / itemsPerPage);
  const paginatedStocks = stocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Récupérer l'id_vendeur à partir de l'id_user
  useEffect(() => {
    if (user?.id_user) {
      apiService.get(`/api/v1/vendeurs/user/${user.id_user}`)
        .then(res => {
          if (res.data.success) {
            setVendeurId(res.data.data.id_vendeur);
          } else {
          }
        })
        .catch(err => console.error('Erreur pour récupérer lID vendeur:', err));
    }
  }, [user]);

  // Récupérer les produits du vendeur une fois que l'ID vendeur est connu
  useEffect(() => {
    const fetchStocks = async () => {
      if (!vendeurId) return;
      setLoading(true);
      try {
        // On attend la réponse de l'API ET un délai minimum pour voir le spinner
        const res = await apiService.get(`/api/v1/produits/vendeur/${vendeurId}`);
        setStocks(res.data.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des stocks:', error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, [vendeurId]);

  const handleView = (produit) => {
    setSelected(produit);
    setNewStock(produit.stock_actuel);
    setNewSeuilAlerte(produit.seuil_alerte);
    setNewSeuilCritique(produit.seuil_critique);
    setError('');
    setShowModal(true);
  };

  const handleUpdateStock = async () => {
    const stockValue = Number(newStock);
    let seuilAlerte = Number(newSeuilAlerte);
    let seuilCritique = Number(newSeuilCritique);
    if (isNaN(stockValue) || isNaN(seuilAlerte) || isNaN(seuilCritique)) {
      setError('Veuillez saisir des valeurs valides.');
      return;
    }
    if (seuilAlerte < 10) seuilAlerte = 10;
    if (seuilCritique < 3) seuilCritique = 3;
    if (seuilCritique >= seuilAlerte) {
      setError('Le seuil critique doit être inférieur au seuil d\'alerte.');
      return;
    }
    try {
      await apiService.patch(`/api/v1/produits/${selected.id_produit}/stock`, {
        stock_actuel: stockValue,
        seuil_alerte: seuilAlerte,
        seuil_critique: seuilCritique
      });
      // Rafraîchir la liste
      const res = await apiService.get(`/api/v1/produits/vendeur/${vendeurId}`);
      setStocks(res.data.data || []);
      setShowModal(false);
    } catch (error) {
      setError('Erreur lors de la mise à jour du stock.');
    }
  };

  // Juste avant le return du composant

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion des Stocks</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : (Array.isArray(stocks) && stocks.length > 0) ? (
          <>
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Stock actuel</th>
                  <th>Seuil d'alerte</th>
                  <th>Seuil critique</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocks.map((produit) => {
                  const status = getStockStatus(produit.stock_actuel);
                  const color = getStockColor(status);
                  const label = getStockLabel(status);
                  return (
                    <tr key={produit.id_produit}>
                      <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>N°{produit.id_produit}</strong></td>
                      <td>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-400)'
                        }}>
                          {produit.image && produit.image !== 'default.png' ? (
                            <img src={API_IMAGE_URL + produit.image} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <FiPackage size={20} color="var(--gray-400)" />
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{produit.nom}</td>
                      <td>
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
                      </td>
                      <td style={{ color: 'var(--gray-500)' }}>{produit.seuil_alerte}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{produit.seuil_critique}</td>
                      <td>
                        <button
                          className="btn btn-view-produit"
                          title="Voir et ajuster le stock"
                          onClick={() => handleView(produit)}
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
              <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
            </div>
          </>
        ) : (
          <EmptyState 
            title="Gestion des Stocks"
            message="Aucun stock n'a été trouvé pour le moment."
          />
        )}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Ajuster le stock du produit">
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected.image && selected.image !== 'default.png' ? (
                    <img src={API_IMAGE_URL + selected.image} alt={selected.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FiPackage size={28} color="var(--gray-400)" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--gray-900)' }}>{selected.nom}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--gray-500)' }}>Stock actuel : <b style={{ color: getStockColor(getStockStatus(selected.stock_actuel)) }}>{selected.stock_actuel}</b></div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--gray-500)' }}>Seuil d'alerte : {selected.seuil_alerte}</div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--gray-500)' }}>Seuil critique : {selected.seuil_critique}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 500, color: 'var(--gray-700)', marginBottom: 4 }}>Saisissez le nouveau stock du produit</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={e => setNewStock(e.target.value)}
                  className="input"
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--gray-300)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, color: 'var(--gray-700)', marginBottom: 4 }}>Seuil d’alerte</label>
                  <input
                    type="number"
                    min="10"
                    value={newSeuilAlerte}
                    onChange={e => setNewSeuilAlerte(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--gray-300)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, color: 'var(--gray-700)', marginBottom: 4 }}>Seuil critique</label>
                  <input
                    type="number"
                    min="3"
                    value={newSeuilCritique}
                    onChange={e => setNewSeuilCritique(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--gray-300)' }}
                  />
                </div>
              </div>
              {error && <div style={{ color: 'var(--red-500)', fontWeight: 500 }}>{error}</div>}
              <button
                className="btn btn-success"
                style={{ marginTop: 8, alignSelf: 'flex-end', padding: '8px 22px', borderRadius: 6 }}
                onClick={handleUpdateStock}
              >
                Valider
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StockVendeur;
