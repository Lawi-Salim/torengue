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

// Component for recent sales list for a vendor
export const RecentSalesList = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentSales = async () => {
            try {
                // This endpoint needs to be created in the backend
                const response = await apiService.get('/api/v1/dashboard/vendor/recent-sales');
                setSales(response.data.data || []);
            } catch (err) {
                setError('Impossible de charger les ventes récentes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentSales();
    }, []);

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h4>Ventes Récentes</h4>
                <Link to="/dashboard/vendeur/paiements" className="activity-link">Voir tout</Link>
            </div>
            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorState title="Erreur" message={error} />
            ) : sales.length === 0 ? (
                <EmptyState title="Aucune vente" message="Aucune vente récente trouvée." />
            ) : (
                <div className="table-responsive">
                    <table className="produit-table">
                        <thead className="produit-thead">
                            <tr>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id_vente}>
                                    <td>{sale.client?.user?.nom || 'Client non spécifié'}</td>
                                    <td>{formatDate(sale.date)}</td>
                                    <td>{formatCurrency(sale.montant_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Component for best clients list for a vendor
export const BestClientsListForVendor = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBestClients = async () => {
            try {
                // This endpoint needs to be created in the backend
                const response = await apiService.get('/api/v1/dashboard/vendor/best-clients');
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
                <Link to="/dashboard/vendeur/commandes" className="activity-link">Voir tout</Link>
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
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td>{client.nom}</td>
                                    <td>{client.email}</td>
                                    <td>{formatCurrency(client.total_depense)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};