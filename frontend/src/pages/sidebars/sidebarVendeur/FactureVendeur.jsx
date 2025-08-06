import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import apiService from '../../../apiService';
import { FiEye, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber } from '../../../utils/formatUtils';

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'payé': return '#28A745';
    case 'en attente': return '#FFC107';
    case 'annulé': return '#DC3545';
    default: return '#6C757D';
  }
};

const getPaymentStatusLabel = (status) => {
  if (!status) return 'Inconnu';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const FactureVendeur = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openingFactureId, setOpeningFactureId] = useState(null);
  const [downloadingFactureId, setDownloadingFactureId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const response = await apiService.get('/api/v1/factures/vendeur');
        setFactures(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Une erreur est survenue.');
      }
      setLoading(false);
    };
    fetchFactures();
  }, []);

  const paginatedFactures = factures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(factures.length / itemsPerPage);

  const handleOpenFacture = async (factureId) => {
    setOpeningFactureId(factureId);
    await new Promise(resolve => setTimeout(resolve, 50));
    window.open(`/facture/${factureId}`, '_blank');
    setTimeout(() => setOpeningFactureId(null), 1500);
  };

  const handleDownloadFacture = async (factureId) => {
    setDownloadingFactureId(factureId);
    try {
      const { data: factureData } = await apiService.get(`/api/v1/factures/${factureId}`);
      const facture = factureData.data;
      // Utilisation de l'enchaînement optionnel pour éviter les erreurs si des données sont manquantes
      const client = facture?.vente?.commande?.client?.user;
      const vendeur = facture?.vente?.vendeur?.user;
      const lignes = facture?.vente?.commande?.details;

      // Vérification que les données essentielles sont présentes
      if (!client || !vendeur || !lignes) {
        console.error("Données de facture incomplètes pour la génération du PDF.", { facture });
        // Idéalement, afficher une notification à l'utilisateur ici
        throw new Error("Données de facture incomplètes.");
      }

      const doc = new jsPDF();
      const dateFacture = new Date(facture.date_creation).toLocaleDateString();
      const echeanceFacture = new Date(facture.date_echeance).toLocaleDateString();

      // En-tête
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Biyashara', 14, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`DATE : ${dateFacture}`, 196, 18, { align: 'right' });
      doc.text(`ÉCHÉANCE : ${echeanceFacture}`, 196, 24, { align: 'right' });
      doc.text(`FACTURE N° : FACT-${facture.id_facture}`, 196, 30, { align: 'right' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURE', 196, 40, { align: 'right' });

      // Informations Émetteur / Destinataire
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ÉMETTEUR :', 14, 55);
      doc.text('DESTINATAIRE :', 110, 55);

      doc.setFont('helvetica', 'normal');
      doc.text(vendeur.nom, 14, 61);
      doc.text(vendeur.email, 14, 66);
      doc.text(vendeur.telephone, 14, 71);

      doc.text(client.nom, 110, 61);
      doc.text(client.email, 110, 66);
      doc.text(client.telephone, 110, 71);

      // Tableau des produits
      const tableColumn = ["Description", "Prix Unitaire", "Quantité", "Total"];
      const tableRows = [];

      lignes.forEach(ligne => {
        const quantite = parseInt(ligne.quantite, 10);
        const prixUnitaire = parseFloat(ligne.prix_unitaire);
        const totalLigne = quantite * prixUnitaire;
        const row = [
          ligne.produit.nom,
          `${prixUnitaire.toFixed(2)} kmf`,
          quantite,
          `${totalLigne.toFixed(2)} kmf`
        ];
        tableRows.push(row);
      });

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 85 });

      // Total
      const finalY = doc.lastAutoTable.finalY || 120;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL :`, 140, finalY + 15, { align: 'right' });
      doc.text(`${parseFloat(facture.montant_total).toFixed(2)} kmf`, 196, finalY + 15, { align: 'right' });

      // Pied de page
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Merci de votre confiance.', 105, 280, { align: 'center' });

      doc.save(`facture-${facture.id_facture}.pdf`);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
    } finally {
      setDownloadingFactureId(null);
    }
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Gestion des Factures</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState 
            title="Erreur de récupération"
            message={error}
          />
        ) : factures.length === 0 ? (
          <EmptyState 
            title="Gestion des Factures"
            message="Aucune facture n'a été trouvée pour le moment."
          />
        ) : (
          <div className="produit-table-container">
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>ID Facture</th>
                  <th>ID Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant Total</th>
                  <th>Statut Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFactures.map(fac => (
                  <tr key={fac.id_facture}>
                    <td>FACT-{fac.id_facture}</td>
                    <td>CMD-{fac.id_commande}</td>
                    <td>{fac.vente?.commande?.client?.user?.nom || 'N/A'}</td>
                    <td>{new Date(fac.date_creation).toLocaleDateString()}</td>
                    <td>{formatNumber(fac.montant_total)} kmf</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: getPaymentStatusColor(fac.statut_paiement),
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {getPaymentStatusLabel(fac.statut_paiement)}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'start' }}>
                      <button
                        className="btn-action"
                        title="Voir la facture"
                        onClick={() => handleOpenFacture(fac.id_facture)}
                        disabled={openingFactureId === fac.id_facture}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {openingFactureId === fac.id_facture ? <Spinner inline size={13} /> : <FiEye />}
                      </button>
                      <button 
                        className="btn-down"
                        onClick={() => handleDownloadFacture(fac.id_facture)}
                        disabled={downloadingFactureId === fac.id_facture}
                      >
                        {downloadingFactureId === fac.id_facture ? <Spinner inline size={13} /> : <FiDownload />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-controls pagination-center">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate">&lt;</button>
              <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate">&gt;</button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FactureVendeur;
