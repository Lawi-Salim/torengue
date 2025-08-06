import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../../../apiService';
import Spinner from '../../../../components/Spinner';
import EmptyState from '../../../../components/EmptyState';
import ErrorState from '../../../../components/ErrorState';
import { formatNumber } from '../../../../utils/formatUtils';

// Helper to format date
const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Helper to format currency
const formatCurrency = (amount) => {
    return `${formatNumber(amount)} KMF`;
};

// Component for recent purchases list for a client
export const RecentPurchasesList = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentPurchases = async () => {
            try {
                const response = await apiService.get('/api/v1/dashboard/client/recent-purchases');
                setPurchases(response.data.data || []);
            } catch (err) {
                setError('Impossible de charger les achats récents.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentPurchases();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Achats Récents</h4>
                <Link to="/dashboard/client/commandes" className="activity-link">Voir tout</Link>
            </div>
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState message={error} />
            ) : purchases.length === 0 ? (
                <EmptyState message="Vous n'avez aucun achat récent." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>Vendeur</th>
                                <th>Date</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id_vente}>
                                    <td>{purchase.vendeur?.user?.nom || 'N/A'}</td>
                                    <td>{purchase.date_vente ? formatDate(purchase.date_vente) : 'Date N/A'}</td>
                                    <td>{formatCurrency(purchase.montant_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Component for favorite vendors list for a client
export const FavoriteVendorsList = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavoriteVendors = async () => {
            try {
                const response = await apiService.get('/api/v1/dashboard/client/favorite-vendors');
                setVendors(response.data.data || []);
            } catch (err) {
                setError('Impossible de charger les vendeurs favoris.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteVendors();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Vendeurs Favoris</h4>
                <Link to="/dashboard/client/vendeurs" className="activity-link">Voir tout</Link>
            </div>
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState message={error} />
            ) : vendors.length === 0 ? (
                <EmptyState message="Vous n'avez aucun vendeur favori pour le moment." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>Vendeur</th>
                                <th>Total Dépensé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((vendor) => (
                                <tr key={vendor.id_vendeur}>
                                    <td>{vendor.nom}</td>
                                    <td>{formatCurrency(vendor.total_depense)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const BestOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await apiService.get('/api/v1/dashboard/client/best-orders');
                setOrders(response.data.data || []);
            } catch (err) {
                setError('Impossible de charger les commandes les plus importantes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Commandes les plus importantes</h4>
                <Link to="/dashboard/client/commandes" className="activity-link">Voir tout</Link>
            </div>
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState message={error} />
            ) : orders.length === 0 ? (
                <EmptyState message="Vous n'avez aucune commande importante pour le moment." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>N°</th>
                                <th>Vendeur</th>
                                <th>Date</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id_commande}>
                                    <td>{order.id_commande}</td>
                                    <td>{order.vendeur?.user?.nom || 'N/A'}</td>
                                    <td>{formatDate(order.date_commande)}</td>
                                    <td>{formatCurrency(order.montant_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
