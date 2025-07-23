import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import apiService from '../../../apiService';
import './styleClient.css';

const CommandeClient = () => {
    const [loading, setLoading] = useState(true);
    const [commandes, setCommandes] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCommandes = async () => {
            try {
                setLoading(true);
                const res = await apiService.get('/api/v1/commandes/mes-commandes');
                setCommandes(res.data.data || []);
            } catch (err) {
                setError("Impossible de charger les commandes.");
            } finally {
                setLoading(false);
            }
        };
        fetchCommandes();
    }, []);

    const totalPages = Math.ceil(commandes.length / itemsPerPage);
    const paginatedCommandes = commandes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="card-user">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="card-title">Mes Commandes</h2>
            </div>
            <div className="card-body">
                {loading ? (
                    <Spinner />
                ) : error ? (
                    <EmptyState title="Erreur" message={error} />
                ) : commandes.length === 0 ? (
                    <EmptyState 
                        title="Aucune commande"
                        message="Vous n'avez pas encore passé de commande."
                    />
                ) : (
                    <>
                        <table className="produit-table">
                            <thead className="produit-thead">
                                <tr>
                                    <th>Référence</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Montant</th>
                                    <th>Produits</th>
                                    <th>Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCommandes.map((commande) => (
                                    <tr key={commande.id_commande}>
                                        <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>{commande.reference || `CMD-${commande.id_commande}`}</strong></td>
                                        <td style={{ color: 'var(--gray-900)' }}>{new Date(commande.date_commande).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`statut-${commande.statut?.toLowerCase()}`}>
                                                {commande.statut || 'En attente'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500, color: '#10b981' }}>
                                            {commande.montant_total ? `${Number(commande.montant_total)} kmf` : 'N/A'}
                                        </td>
                                        <td>
                                            <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                                                {(commande.produits || []).map((prod, idx) => (
                                                    <li key={idx} style={{ fontSize: '0.9rem', color: '#374151' }}>
                                                        {prod.nom}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>
                                            <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                                                {(commande.produits || []).map((prod, idx) => (
                                                    <li key={idx} style={{ fontSize: '0.9rem', color: '#374151', textAlign: 'center' }}>
                                                        {prod.quantite}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination-controls pagination-center">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
                            <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommandeClient;
