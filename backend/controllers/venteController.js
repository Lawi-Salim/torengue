const { Ventes, DetailCommandes } = require('../models');

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

  return vente;
};

// Contrôleur ventes (exemple à compléter)

exports.getAllVentes = (req, res) => {
  res.json({ success: true, message: 'getAllVentes (à implémenter)' });
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
