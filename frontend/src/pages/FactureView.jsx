import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../apiService';
import Factures from './dashboards/Factures';

const FactureView = () => {
  const { id } = useParams();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacture = async () => {
      try {
        const response = await apiService.get(`/api/v1/factures/${id}`);
        setFacture(response.data.data);
      } catch (err) {
        setError('Facture introuvable.');
      }
      setLoading(false);
    };
    fetchFacture();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error || !facture) return <div>{error || 'Facture introuvable.'}</div>;

  // Mapping des données pour le composant Factures
  const vente = facture.vente || {};
  const client = vente.client || {};
  const vendeur = vente.vendeur || {};
  const lignes = (vente.details || []).map(d => ({
    desc: d.produit?.nom || 'Produit',
    pu: `${d.prix_unitaire} KMF`,
    qte: d.quantite_vendue,
    total: `${(d.prix_unitaire * d.quantite_vendue).toFixed(2)} KMF`
  }));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <Factures
        numero={`FACT-${facture.id_facture}`}
        date={new Date(facture.date_creation).toLocaleDateString()}
        echeance={new Date(facture.date_creation).toLocaleDateString()}
        emetteur={{
          nom: vendeur.nom_boutique,
          adresse: vendeur.adresse,
          tel: vendeur.user?.telephone,
          email: vendeur.user?.email
        }}
        destinataire={{
          nom: client.user?.nom,
          adresse: client.adresse_facturation,
          tel: client.user?.telephone,
          email: client.user?.email
        }}
        lignes={lignes}
        totalHT={`${facture.montant_HT} KMF`}
        totalTTC={`${facture.montant_TTC} KMF`}
        mentions={facture.statut_paiement === 'payé' ? 'Facture réglée.' : ''}
      />
    </div>
  );
};

export default FactureView; 