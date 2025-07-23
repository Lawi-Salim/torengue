const { Livraisons, Commandes, Clients, Utilisateurs, Vendeurs } = require('../models');

// Fonction pour créer une livraison pour une commande
exports.createLivraisonFromCommande = async (commande, transaction) => {
  const existingLivraison = await Livraisons.findOne({ where: { id_commande: commande.id_commande }, transaction });
  // Récupérer l'adresse du client
  let adresse = null;
  if (commande.id_client) {
    const client = await Clients.findByPk(commande.id_client, { transaction });
    if (client && client.adresse_facturation) {
      adresse = client.adresse_facturation;
    }
  }
  if (existingLivraison) {
    // Si la livraison existe, mettre à jour le statut si nécessaire
    if (commande.statut === 'livrée' && existingLivraison.statut_livraison !== 'livrée') {
      existingLivraison.statut_livraison = 'livrée';
      existingLivraison.date_livraison = new Date();
      if (adresse) existingLivraison.adresse = adresse;
      await existingLivraison.save({ transaction });
    }
    return existingLivraison;
  }
  return await Livraisons.create({
    id_commande: commande.id_commande,
    statut_livraison: commande.statut === 'livrée' ? 'livrée' : 'en cours',
    date_livraison: commande.statut === 'livrée' ? new Date() : null,
    adresse
  }, { transaction });
};

exports.updateLivraisonVente = async (id_commande, id_vente, transaction) => {
  const livraison = await Livraisons.findOne({ where: { id_commande }, transaction });
  if (livraison && !livraison.id_vente) {
    livraison.id_vente = id_vente;
    await livraison.save({ transaction });
  }
};

exports.getLivraisonsVendeur = async (req, res) => {
  try {
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
    if (!vendeur) return res.status(404).json({ success: false, message: 'Vendeur non trouvé.' });
    const livraisons = await Livraisons.findAll({
      include: [{
        model: Commandes,
        as: 'commande',
        where: { id_vendeur: vendeur.id_vendeur },
        include: [{
          model: Clients,
          as: 'client',
          include: [{
            model: Utilisateurs,
            as: 'user',
            attributes: ['nom']
          }]
        }]
      }]
    });
    res.json({ success: true, data: livraisons });
  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}; 