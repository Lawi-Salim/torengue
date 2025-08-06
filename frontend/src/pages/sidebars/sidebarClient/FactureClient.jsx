import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import apiService from '../../../apiService';
import { FiEye, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from '../../../components/Modal';
import Factures from '../../dashboards/Factures';
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

const FactureClient = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openingFactureId, setOpeningFactureId] = useState(null);
  const [downloadingFactureId, setDownloadingFactureId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const response = await apiService.get('/api/v1/factures/client');
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

  const handleVoirFacture = (facture) => {
    setSelectedFacture(facture);
    setIsModalOpen(true);
  };

  const handleOpenFacture = async (factureId) => {
    setOpeningFactureId(factureId);
    // On attend un court instant pour que le spinner s'affiche
    await new Promise(resolve => setTimeout(resolve, 50));
    window.open(`/facture/${factureId}`, '_blank');
    // On réinitialise le spinner après un délai
    setTimeout(() => setOpeningFactureId(null), 1500);
  };

  const handleDownloadFacture = async (factureId) => {
    setDownloadingFactureId(factureId);
    try {
      const { data: factureData } = await apiService.get(`/api/v1/factures/${factureId}`);
      const facture = factureData.data;

      const commande = facture?.commande;
      const client = commande?.client?.user;
      const vendeur = facture?.vente?.vendeur?.user;
      const lignes = commande?.details;

      if (!client || !vendeur || !lignes || !facture.vente) {
        console.error("Données de facture incomplètes pour la génération du PDF.", { facture });
        throw new Error("Données de facture incomplètes.");
      }

      const doc = new jsPDF();
      const dateFacture = new Date(facture.date_creation).toLocaleDateString();
      const echeanceFacture = new Date(facture.date_echeance || facture.date_creation).toLocaleDateString();

      doc.setFontSize(20).setFont('helvetica', 'bold').text('Biyashara', 14, 22);
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(`DATE : ${dateFacture}`, 196, 18, { align: 'right' });
      doc.text(`ÉCHÉANCE : ${echeanceFacture}`, 196, 24, { align: 'right' });
      doc.text(`FACTURE N° : FACT-${facture.id_facture}`, 196, 30, { align: 'right' });
      doc.setFontSize(16).setFont('helvetica', 'bold').text('FACTURE', 196, 40, { align: 'right' });

      doc.setFontSize(10).setFont('helvetica', 'bold');
      doc.text('ÉMETTEUR :', 14, 50);
      doc.text('DESTINATAIRE :', 110, 50);

      doc.setFont('helvetica', 'normal');
      doc.text(facture.vente.vendeur.nom_boutique || '', 14, 56);
      doc.text(facture.vente.vendeur.adresse || '', 14, 62);
      doc.text(vendeur.telephone || '', 14, 68);
      doc.text(vendeur.email || '', 14, 74);

      doc.text(client.nom || '', 110, 56);
      doc.text(commande.client.adresse_facturation || '', 110, 62);
      doc.text(client.telephone || '', 110, 68);
      doc.text(client.email || '', 110, 74);

      const tableColumn = ["Description", "Prix Unitaire", "Quantité", "Total"];
      const tableRows = lignes.map(l => [
        l.produit?.nom || 'Produit non trouvé',
        `${parseFloat(l.prix_unitaire).toFixed(2)} KMF`,
        l.quantite,
        `${(parseFloat(l.prix_unitaire) * l.quantite).toFixed(2)} KMF`
      ]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 85 });

      const finalY = doc.lastAutoTable.finalY || 120;
      doc.setFontSize(12).setFont('helvetica', 'bold');
      doc.text(`TOTAL : ${parseFloat(facture.montant_total).toFixed(2)} KMF`, 196, finalY + 10, { align: 'right' });

      if (facture.statut_paiement === 'payé') {
        doc.setFontSize(10).setFont('helvetica', 'italic').text('Facture réglée.', 14, finalY + 20);
      }

      doc.save(`facture-Biyashara-${facture.id_facture}.pdf`);

    } catch (err) {
      console.error("Erreur lors de la génération du PDF :", err);
    } finally {
      setDownloadingFactureId(null);
    }
  };

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Mes Factures</h2>
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
            title="Mes Factures"
            message="Aucune facture n'a été trouvée pour le moment."
          />
        ) : (
          <>
            <table className="produit-table">
              <thead className="produit-thead">
                <tr>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFactures.map(fac => (
                  <tr key={fac.id_facture}>
                    <td>FACT-{fac.id_facture}</td>
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
                        {downloadingFactureId === fac.id_facture ? <Spinner inline size={13}/> : <FiDownload />}
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
            {/* Modal d'aperçu */}
            {selectedFacture && (
              <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={null}
                contentClassName="facture-modal-apercu"
              >
                <Factures
                  numero={selectedFacture.id_facture}
                  date={new Date(selectedFacture.date_creation).toLocaleDateString()}
                  echeance={new Date(selectedFacture.date_creation).toLocaleDateString()}
                  // TODO : passer les vraies infos client, vendeur, lignes, totaux
                  totalHT={selectedFacture.montant_HT || selectedFacture.montant_total}
                  totalTTC={selectedFacture.montant_TTC || selectedFacture.montant_total}
                />
              </Modal>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FactureClient;
