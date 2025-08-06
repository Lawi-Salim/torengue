import React, { useState, useEffect } from 'react';
import apiService from '../../../apiService';
import Spinner from '../../../components/Spinner';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';
import { FiEye, FiDownload, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './styleAdmin.css';
import { formatNumber } from '../../../utils/formatUtils';

const FactureAdmin = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloadingFactureId, setDownloadingFactureId] = useState(null);
  const [openingFactureId, setOpeningFactureId] = useState(null);
  
  const navigate = useNavigate();

  const fetchFactures = async (page) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/api/v1/factures?page=${page}&limit=10`);
      setFactures(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la récupération des factures.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFactures(currentPage);
  }, [currentPage]);

  

    const handleViewClick = (factureId) => {
    setOpeningFactureId(factureId);
    // On réinitialise le spinner après un court délai pour le feedback visuel
    setTimeout(() => {
      setOpeningFactureId(null);
    }, 1500);
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

      doc.text(client.nom || '', 110, 56);
      doc.text(client.adresse || '', 110, 62);
      doc.text(client.telephone || '', 110, 68);

      // Tableau des produits
      const tableColumn = ["Description", "Prix Unitaire", "Quantité", "Total"];
      const tableRows = lignes.map(l => [
        l.produit?.nom || 'Produit non trouvé',
        `${parseFloat(l.prix_unitaire).toFixed(2)} KMF`,
        l.quantite,
        `${(parseFloat(l.prix_unitaire) * l.quantite).toFixed(2)} KMF`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 80,
      });

      // Calcul du total
      const finalY = doc.lastAutoTable.finalY || 120;
      doc.setFontSize(12).setFont('helvetica', 'bold');
      doc.text(`TOTAL : ${parseFloat(facture.montant_total).toFixed(2)} KMF`, 196, finalY + 10, { align: 'right' });

      doc.save(`facture-${facture.id_facture}.pdf`);

    } catch (err) {
      console.error('Erreur lors du téléchargement de la facture:', err);
      setError(err.message || 'Impossible de télécharger la facture.');
    } finally {
      setDownloadingFactureId(null);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState title="Erreur de chargement" message={error} />;

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Toutes les Factures</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState title="Erreur" message={error} />
        ) : factures.length === 0 ? (
          <EmptyState title="Aucune facture" message="Il n'y a aucune facture à afficher pour le moment." />
        ) : (
          <table className="produit-table">
            <thead className="produit-thead">
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Client</th>
                <th>Vendeur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures.map(facture => (
                <tr key={facture.id_facture}>
                  <td>FACT-{facture.id_facture}</td>
                  <td>{new Date(facture.date_creation).toLocaleDateString()}</td>
                  <td>{facture.commande?.client?.user?.nom || 'N/A'}</td>
                  <td>{facture.vente?.vendeur?.user?.nom || 'N/A'}</td>
                  <td>{formatNumber(facture.montant_total)} KMF</td>
                  <td>{facture.statut_paiement}</td>
                  <td style={{ display: 'flex', gap: '5px' }}>
                    <a href={`/facture/${facture.id_facture}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className={`btn-action ${openingFactureId === facture.id_facture ? 'disabled' : ''}`}
                       title="Voir la facture"
                       onClick={() => handleViewClick(facture.id_facture)}>
                      {openingFactureId === facture.id_facture ? <Spinner inline size={13} /> : <FiEye />}
                    </a>
                    <button className="btn-down" onClick={() => handleDownloadFacture(facture.id_facture)} disabled={downloadingFactureId === facture.id_facture} title="Télécharger la facture">
                      {downloadingFactureId === facture.id_facture ? <Spinner inline size={13} /> : <FiDownload />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination-controls pagination-center">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
          <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
        </div>
      </div>
    </div>
  );
};

export default FactureAdmin;
