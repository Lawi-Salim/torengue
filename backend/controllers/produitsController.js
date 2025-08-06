const { Produits, Categories, Unites, Vendeurs, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Récupérer les produits récents
 * @route   GET /api/v1/produits/recent
 * @access  Private (admin)
 */
exports.getRecentProducts = async (req, res) => {
  try {
    const recentProducts = await Produits.findAll({
      limit: 8,
      order: [['date_creation', 'DESC']],
      attributes: ['id_produit', 'nom', 'prix_unitaire', 'date_creation'],
      include: {
        model: Categories,
        as: 'categorie',
        attributes: ['id_categorie', 'nom']
      }
    });
    res.status(200).json({ success: true, data: recentProducts });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits récents:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * @desc    Récupérer tous les produits
 * @route   GET /api/v1/produits
 * @access  Private (admin)
 */
exports.getAllProduits = async (req, res) => {
  try {
    const { search, id_categorie, stockStatus } = req.query;

    let whereClause = {};

    if (search) {
            whereClause.nom = { [Op.like]: `%${search}%` };
    }

    if (id_categorie) {
      whereClause.id_categorie = id_categorie;
    }

    if (stockStatus) {
      if (stockStatus === 'critical') {
        whereClause.stock_actuel = { [Op.lte]: sequelize.col('seuil_critique') };
      } else if (stockStatus === 'low') {
        whereClause.stock_actuel = {
          [Op.and]: [
            { [Op.gt]: sequelize.col('seuil_critique') },
            { [Op.lte]: sequelize.col('seuil_alerte') }
          ]
        };
      } else if (stockStatus === 'in_stock') {
        whereClause.stock_actuel = { [Op.gt]: sequelize.col('seuil_alerte') };
      }
    }

    const produits = await Produits.findAll({
      where: whereClause,
      include: [{
        model: Vendeurs,
        as: 'vendeur',
        attributes: ['id_vendeur', 'nom_boutique', 'adresse', 'description'],
        include: [{
          model: require('../models').Utilisateurs,
          as: 'user',
          attributes: ['nom', 'email', 'telephone']
        }],
        required: true
      }, {
        model: Categories,
        as: 'categorie',
        attributes: ['nom'],
        required: false
      }, {
        model: Unites,
        as: 'unite',
        attributes: ['nom'],
        required: false
      }],
      order: [['date_creation', 'DESC']]
    });
    
    res.json({ success: true, data: produits });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// --- Fonctions à implémenter pour la gestion complète des produits ---


exports.getProduit = (req, res) => {
  res.json({ success: true, message: 'getProduit (à implémenter)' });
};
exports.createProduit = (req, res) => {
  res.json({ success: true, message: 'createProduit (à implémenter)' });
};
exports.updateProduit = (req, res) => {
  res.json({ success: true, message: 'updateProduit (à implémenter)' });
};
exports.deleteProduit = (req, res) => {
  res.json({ success: true, message: 'deleteProduit (à implémenter)' });
};