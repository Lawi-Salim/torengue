import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import apiService from '../../../../apiService';
import '../styleAdmin.css';
import Spinner from '../../../../components/Spinner';
import EmptyState from '../../../../components/EmptyState';
import ErrorState from '../../../../components/ErrorState';
import { formatNumber } from '../../../../utils/formatUtils';

// Fonctions utilitaires pour le statut du stock (inspirées de StockVendeur.jsx)
const getStockStatus = (stock, seuilCritique = 3) => {
    if (stock === 0) return 'rupture';
    // La condition pour 'critique' doit venir avant celle pour 'rupture' quand le stock n'est pas nul.
    if (stock > 0 && stock <= seuilCritique) return 'critique';
    if (stock > seuilCritique && stock <= 10) return 'moyen'; // Ajusté pour être cohérent
    return 'suffisant'; // Simplifié pour le contexte de l'admin
  };
  
  const getStockColor = (status) => {
    switch (status) {
      case 'rupture': return 'var(--red-600)';
      case 'critique': return 'var(--red-500)'; // Rétablissement de la variable CSS
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

// Composant pour la liste des utilisateurs récents
export const RecentUsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentUsers = async () => {
            try {
                const response = await apiService.get('/api/v1/users/recent');
                setUsers(response.data.data);
            } catch (err) {
                setError('Impossible de charger les utilisateurs récents.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentUsers();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Utilisateurs Récents</h4>
                <Link to="/dashboard/admin/utilisateurs" className="activity-link">Voir tout</Link>
            </div>
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState title='Erreur' message='Impossible de charger les utilisateurs récents.' />
            ) : users.length === 0 ? (
                <EmptyState title="Aucun utilisateur" message="Aucun nouvel utilisateur trouvé." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.nom}</td>
                                    <td>{user.email}</td>
                                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}; 

// Composant pour la liste des produits récents
export const RecentProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentProducts = async () => {
            try {
                const response = await apiService.get('/api/v1/produits/recent');
                setProducts(response.data.data);
            } catch (err) {
                setError('Impossible de charger les produits récents.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentProducts();
    }, []);

    // if (loading) return <p>Chargement des produits...</p>;
    // if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Produits Récents</h4>
                <Link to="/dashboard/admin/produits" className="activity-link">Voir tout</Link>
            </div>
            {loading ? (
                <Spinner text='Chargement des produits récents...' />
            ) : error ? (
                <ErrorState title='Erreur' message='Impossible de charger les produits récents.' />
            ) : products.length === 0 ? (
                <EmptyState title="Aucun produit" message="Aucun produit récent trouvé." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>Nom</th>
                                <th>Catégorie</th>
                                <th>Prix</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.nom}</td>
                                    <td>{product.categorie?.nom || 'N/A'}</td>
                                    <td>{formatNumber(product.prix_unitaire)} KMF</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};



// Commandes récentes

// Commandes récentes
const getOrderStatusColor = (status) => {
  switch (status) {
    case 'livrée':
      return 'var(--green-600)';
    case 'validée':
    case 'payée':
      return 'var(--green-500)';
    case 'expédiée':
    case 'en préparation':
      return 'var(--blue-500)';
    case 'en attente':
      return 'var(--yellow-500)';
    case 'annulée':
      return 'var(--red-600)';
    default:
      return 'var(--gray-400)';
  }
};

export const RecentOrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const response = await apiService.get('/api/v1/commandes/recent');
                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des commandes récentes:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentOrders();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Commandes Récentes</h4>
                <Link to="/dashboard/admin/commandes" className="activity-link">Voir tout</Link>
            </div>
            {loading ? (
                <Spinner text='Chargement des commandes...' />
            ) : error ? (
                <ErrorState title='Erreur' message='Impossible de charger les commandes.' />
            ) : orders.length === 0 ? (
                <EmptyState title="Aucune commande" message="Aucune commande récente à afficher." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>Montant</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id_commande}>
                                    <td>N°{order.id_commande}</td>
                                    <td>{order.client}</td>
                                    <td>{formatNumber(order.montantTotal)} KMF</td>
                                    <td>
                                        <span 
                                            className="badge"
                                            style={{ backgroundColor: getOrderStatusColor(order.statut), color: '#fff' }}
                                        >
                                            {order.statut.charAt(0).toUpperCase() + order.statut.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const BestClientsList = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBestClients = async () => {
            try {
                const response = await apiService.get('/api/v1/commandes/best-clients');
                setClients(response.data.data || []);
            } catch (err) {
                setError('Impossible de charger les meilleurs clients.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBestClients();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Meilleurs Clients</h4>
            </div>
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState title="Erreur" message={error} />
            ) : clients.length === 0 ? (
                <EmptyState title="Aucun client" message="Aucune donnée sur les meilleurs clients." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Dépenses</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client, index) => (
                                <tr key={index}>
                                    <td>{client.nom}</td>
                                    <td>{client.email}</td>
                                    <td>{formatNumber(client.total_depense)} KMF</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const BestSellersList = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await apiService.get('/api/v1/dashboard/meilleurs-vendeurs');
                setSellers(response.data);
            } catch (err) {
                setError('Impossible de charger les meilleurs vendeurs.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Meilleurs Vendeurs</h4>
            </div>
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState title="Erreur" message={error} />
            ) : sellers.length === 0 ? (
                <EmptyState title="Aucun vendeur" message="Aucune donnée sur les meilleurs vendeurs." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th title="Chiffre d'affaires">CA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellers.map((seller, index) => (
                                <tr key={index}>
                                    <td>{seller.nom}</td>
                                    <td>{seller.email}</td>
                                    <td>{formatNumber(seller.total_ventes)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};