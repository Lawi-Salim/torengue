// @desc    Récupérer les statistiques pour le tableau de bord
// @route   GET /api/dashboard/stats
const { Utilisateurs, Produits, Ventes, Paiements, Factures, Commandes, Clients, Vendeurs, sequelize, Categories, DetailVentes } = require('../models');

exports.getAdminStats = async (req, res) => {
  try {
    const usersCount = await Utilisateurs.count();
    const productsCount = await Produits.count();
    const salesCount = await Ventes.count();
    const revenus = await Ventes.sum('montant_total') || 0;
    res.json({ usersCount, productsCount, salesCount, revenus });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getVendeurStats = async (req, res) => {
  try {
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
    if (!vendeur) return res.status(404).json({ message: 'Vendeur non trouvé.' });
    const produitsCount = await Produits.count({ where: { id_vendeur: vendeur.id_vendeur } });
    const ventesCount = await Ventes.count({ where: { id_vendeur: vendeur.id_vendeur, date: sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), new Date().getMonth() + 1) } });
    const revenus = await Ventes.sum('montant_total', { where: { id_vendeur: vendeur.id_vendeur, date: sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), new Date().getMonth() + 1) } }) || 0;
    const paiementsCount = await Paiements.count({
      include: [{
        model: Commandes,
        as: 'commande',
        where: { id_vendeur: vendeur.id_vendeur }
      }],
      where: { date_paiement: sequelize.where(sequelize.fn('MONTH', sequelize.col('date_paiement')), new Date().getMonth() + 1) }
    });
    res.json({ produitsCount, ventesCount, revenus, paiementsCount });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getClientStats = async (req, res) => {
  try {
    const client = await Clients.findOne({ where: { id_user: req.user.id_user } });
    if (!client) return res.status(404).json({ message: 'Client non trouvé.' });
    const commandesCount = await Commandes.count({ where: { id_client: client.id_client } });
    const depenses = await Paiements.sum('montant_paye', { where: { id_commande: [sequelize.literal(`SELECT id_commande FROM Commandes WHERE id_client = ${client.id_client}`)] } }) || 0;
    const facturesCount = await Factures.count({ where: { id_commande: [sequelize.literal(`SELECT id_commande FROM Commandes WHERE id_client = ${client.id_client}`)] } });
    res.json({ commandesCount, depenses, facturesCount });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc    Nombre d'articles vendus par catégorie
// @route   GET /api/v1/dashboard/produits-par-categorie
// @access  Private/Admin
exports.getProduitsVendusParCategorie = async (req, res) => {
  try {
    const results = await DetailVentes.findAll({
      attributes: [
        [sequelize.col('produit.categorie.nom'), 'categorie'],
        [sequelize.fn('SUM', sequelize.col('quantite_vendue')), 'total_vendus']
      ],
      include: [{
        model: Produits,
        as: 'produit',
        attributes: [],
        include: [{
          model: Categories,
          as: 'categorie',
          attributes: []
        }]
      }],
      group: ['produit.categorie.nom'],
      raw: true
    });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Erreur lors de l’agrégation des produits vendus par catégorie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
