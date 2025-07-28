const { Ventes, DetailCommandes, DetailVentes } = require('../models');

// Fonction pour créer une vente à partir d'une commande
exports.createVenteFromCommande = async (commande, transaction) => {
  const existingVente = await Ventes.findOne({ where: { id_commande: commande.id_commande }, transaction });
  if (existingVente) {
    return existingVente; // Retourne la vente si elle existe déjà
  }

  // Calcul du montant total à partir des détails
  const details = await DetailCommandes.findAll({ where: { id_commande: commande.id_commande }, transaction });
  const montantTotal = details.reduce((acc, d) => acc + Number(d.prix_unitaire) * Number(d.quantite), 0);
  
  const vente = await Ventes.create({
    id_commande: commande.id_commande,
    id_client: commande.id_client,
    id_vendeur: commande.id_vendeur,
    montant_total: montantTotal,
    etat_vente: 'livrée'
  }, { transaction });

  // Créer les détails de vente à partir des détails de commande
  for (const detail of details) {
    await DetailVentes.create({
      id_vente: vente.id_vente,
      id_produit: detail.id_produit,
      quantite_vendue: detail.quantite,
      prix_unitaire: detail.prix_unitaire
    }, { transaction });
  }

  return vente;
};

// Contrôleur ventes (exemple à compléter)

exports.getAllVentes = async (req, res) => {
  try {
    const ventes = await Ventes.findAll({
      attributes: ['id_vente', 'date', 'montant_total'],
      order: [['date', 'ASC']]
    });
    res.json({ success: true, data: ventes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
exports.getVente = (req, res) => {
  res.json({ success: true, message: 'getVente (à implémenter)' });
};
exports.createVente = (req, res) => {
  res.json({ success: true, message: 'createVente (à implémenter)' });
};
exports.updateVente = (req, res) => {
  res.json({ success: true, message: 'updateVente (à implémenter)' });
};
exports.deleteVente = (req, res) => {
  res.json({ success: true, message: 'deleteVente (à implémenter)' });
};
