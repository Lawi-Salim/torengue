import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiEye } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';
import apiService from '../../../apiService';
import './styleClient.css';
import { formatNumber } from '../../../utils/formatUtils';

const CommandeClient = () => {
    const [loading, setLoading] = useState(true);
    const [commandes, setCommandes] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCommande, setSelectedCommande] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCommandes = async () => {
            try {
                setLoading(true);
                const res = await apiService.get('/api/v1/commandes/mes-commandes');
                console.log('Données reçues du backend:', res.data.data);
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

    const handleViewDetails = (commande) => {
        console.log('Commande sélectionnée:', commande);
        setSelectedCommande(commande);
        setShowModal(true);
    };

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
                                    <th>N°</th>
                                    <th>Vendeur</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Montant</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCommandes.map((commande) => (
                                    <tr key={commande.id_commande}>
                                        <td style={{ fontWeight: 500, color: 'var(--gray-600)' }}><strong>{commande.reference || `CMD-${commande.id_commande}`}</strong></td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                                                {commande.vendeur?.nom_boutique || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--gray-900)' }}>{new Date(commande.date_commande).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`statut-${commande.statut?.toLowerCase()}`}>
                                                {commande.statut || 'En attente'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500, color: '#10b981' }}>
                                            {commande.montant_total ? `${formatNumber(commande.montant_total)} kmf` : 'N/A'}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleViewDetails(commande)}
                                                className="btn-action"
                                                title="Voir les détails"
                                            >
                                                <FiEye />
                                            </button>
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
            
            {/* Modal pour les détails de la commande */}
            {showModal && selectedCommande && (
                <Modal 
                    open={showModal} 
                    onClose={() => setShowModal(false)}
                    title={`Détails de la commande ${selectedCommande.reference || `CMD-${selectedCommande.id_commande}`}`}
                >
                    <div className="commande-details">
                        <div className="detail-section">
                            <h4>Informations client et vendeur</h4>
                            <div className="info-container">
                                <div className="client-info">
                                    <h5>Client</h5>
                                    <div className="info-grid">
                                        <div>
                                            <strong>Nom :</strong> {selectedCommande.client?.user?.nom || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Email :</strong> {selectedCommande.client?.user?.email || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Téléphone :</strong> {selectedCommande.client?.user?.telephone || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Adresse :</strong> {selectedCommande.client?.adresse_facturation || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedCommande.vendeur && (
                                    <div className="vendeur-info">
                                        <h5>Vendeur</h5>
                                        <div className="info-grid">
                                            <div>
                                                <strong>Boutique :</strong> {selectedCommande.vendeur.nom_boutique}
                                            </div>
                                            <div>
                                                <strong>Email :</strong> {selectedCommande.vendeur.user?.email}
                                            </div>
                                            <div>
                                                <strong>Téléphone :</strong> {selectedCommande.vendeur.user?.telephone}
                                            </div>
                                            <div>
                                                <strong>Adresse :</strong> {selectedCommande.vendeur.adresse}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Informations générales</h4>
                            <div className="detail-grid">
                                <div>
                                    <strong>Numéro :</strong> {selectedCommande.reference || `CMD-${selectedCommande.id_commande}`}
                                </div>
                                <div>
                                    <strong>Date :</strong> {new Date(selectedCommande.date_commande).toLocaleDateString()}
                                </div>
                                <div>
                                    <strong>Statut :</strong> 
                                    <span className={`statut-${selectedCommande.statut?.toLowerCase()}`}>
                                        {selectedCommande.statut || 'En attente'}
                                    </span>
                                </div>
                                <div>
                                    <strong>Montant total :</strong> {selectedCommande.montant_total ? `${Number(selectedCommande.montant_total)} KMF` : 'N/A'}
                                </div>
                                <div>
                                    <strong>Nombre d'articles :</strong> {selectedCommande.nbr_article || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CommandeClient;
