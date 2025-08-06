// @desc    Récupérer les statistiques pour le tableau de bord
// @route   GET /api/dashboard/stats
const { Ventes, DetailVentes, DetailCommandes, Produits, Categories, Utilisateurs, Paiements, Factures, Commandes, Clients, Vendeurs, Unites, sequelize } = require('../models');
const { Op } = require('sequelize');

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
    const { periode } = req.query; // 'semaine' ou 'trimestre'
    let whereDate = {};

    if (periode) {
      const dateFin = new Date();
      let dateDebut = new Date();

      if (periode === 'semaine') {
        dateDebut.setDate(dateFin.getDate() - 7);
      } else if (periode === 'trimestre') {
        dateDebut.setMonth(dateFin.getMonth() - 3);
      }

      whereDate = {
        date_commande: {
          [Op.between]: [dateDebut, dateFin]
        }
      };
    }

    const whereProduct = {};
    const whereCommande = {};

    if (req.user.role === 'vendeur') {
      const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
      if (vendeur) {
        whereProduct.id_vendeur = vendeur.id_vendeur;
      }
    } else if (req.user.role === 'client') {
        const client = await Clients.findOne({ where: { id_user: req.user.id_user } });
        if (client) {
            whereCommande.id_client = client.id_client;
        }
    }

    const categories = await Categories.findAll();

    const dataPromises = categories.map(async (categorie) => {
      const totalVendus = await DetailCommandes.sum('quantite', {
        include: [
          {
            model: Produits,
            as: 'produit',
            where: { ...whereProduct, id_categorie: categorie.id_categorie },
            attributes: []
          },
          {
            model: Commandes,
            as: 'Commande', // Correction de l'alias
            where: { ...whereDate, ...whereCommande }, // Appliquer le filtre de date et de client ici
            attributes: []
          }
        ]
      });

      // Définir les couleurs pour chaque catégorie
      const categoryColors = {
        'Bois': '#8B4513',        // Marron bois
        'Électricité': '#FFD700',  // Or électrique
        'Plomberie': '#4169E1',    // Bleu royal
        'Isolation': '#32CD32',    // Vert lime
        'Peinture': '#FF6347',     // Rouge tomate
        'Sécurité': '#FF4500'      // Rouge-orange
      };

      return {
        name: categorie.nom,
        data: totalVendus || 0, // Renvoyer 0 si aucune vente n'a été trouvée
        color: categoryColors[categorie.nom] || '#808080' // Gris par défaut
      };
    });

    // Attendre que tous les calculs soient terminés
    const formattedData = await Promise.all(dataPromises);

    // Retourner toutes les catégories, même celles sans ventes
    res.json(formattedData);

  } catch (error) {
    console.error('Erreur lors de la récupération des produits par catégorie:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// @desc    Récupérer les meilleurs vendeurs
// @route   GET /api/v1/dashboard/meilleurs-vendeurs
// @access  Private/Admin
exports.getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Ventes.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('montant_total')), 'total_ventes']
      ],
      include: [{
        model: Vendeurs,
        as: 'vendeur',
        attributes: [], // On ne sélectionne rien de Vendeurs directement
        include: [{
          model: Utilisateurs,
          as: 'user',
          attributes: ['nom', 'email'] // On récupère nom et email ici
        }]
      }],
      group: [
        'vendeur.id_vendeur',
        'vendeur->user.id_user', 
        'vendeur->user.nom',
        'vendeur->user.email'
      ],
      order: [[sequelize.literal('total_ventes'), 'DESC']],
      limit: 5,
      raw: true, // Important pour aplatir le résultat
      nest: true
    });

    // Les données sont déjà formatées grâce à raw:true et nest:true
    const formattedSellers = bestSellers.map(v => ({
      nom: v.vendeur.user.nom,
      email: v.vendeur.user.email,
      total_ventes: v.total_ventes
    }));

    res.json(formattedSellers);
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs vendeurs:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// @desc    Get recent sales for a specific vendor
// @route   GET /api/v1/dashboard/vendor/recent-sales
// @access  Private/Vendeur
exports.getRecentSalesForVendor = async (req, res) => {
    console.log('--- Début getRecentSalesForVendor ---');
    try {
        const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
        console.log('Vendeur trouvé:', vendeur ? vendeur.id_vendeur : 'Non trouvé');
        if (!vendeur) {
            return res.status(404).json({ message: 'Vendeur non trouvé.' });
        }

        const recentSales = await Ventes.findAll({
            where: { id_vendeur: vendeur.id_vendeur },
            order: [['date', 'DESC']],
            limit: 5,
            include: [{
                model: Clients,
                as: 'client',
                attributes: ['id_client'],
                include: [{
                    model: Utilisateurs,
                    as: 'user',
                    attributes: ['nom']
                }]
            }]
        });

        console.log('Ventes récentes trouvées:', recentSales.length);
        res.json({ success: true, data: recentSales });
    } catch (error) {
        console.error('Erreur lors de la récupération des ventes récentes du vendeur:', error);
        res.status(500).json({ message: 'Erreur du serveur', error: error.message });
    }
};

// @desc    Get best clients for a specific vendor
// @route   GET /api/v1/dashboard/vendor/best-clients
// @access  Private/Vendeur
exports.getBestClientsForVendor = async (req, res) => {
    console.log('--- Début getBestClientsForVendor ---');
    try {
        const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
        console.log('Vendeur trouvé:', vendeur ? vendeur.id_vendeur : 'Non trouvé');
        if (!vendeur) {
            return res.status(404).json({ message: 'Vendeur non trouvé.' });
        }

        const bestClients = await Ventes.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('montant_total')), 'total_depense']
            ],
            where: { id_vendeur: vendeur.id_vendeur },
            include: [{
                model: Clients,
                as: 'client',
                attributes: ['id_client'],
                include: [{
                    model: Utilisateurs,
                    as: 'user',
                    attributes: ['nom', 'email']
                }]
            }],
            group: ['client.id_client', 'client->user.id_user', 'client->user.nom', 'client->user.email'],
            order: [[sequelize.literal('total_depense'), 'DESC']],
            limit: 5,
            raw: true,
            nest: true
        });

        const formattedClients = bestClients.map(c => ({
            id: c.client.id_client,
            nom: c.client.user.nom,
            email: c.client.user.email,
            total_depense: c.total_depense
        }));

        console.log('Meilleurs clients trouvés:', formattedClients.length);
        res.json({ success: true, data: formattedClients });
    } catch (error) {
        console.error('Erreur lors de la récupération des meilleurs clients du vendeur:', error);
        res.status(500).json({ message: 'Erreur du serveur', error: error.message });
    }
};

// @desc    Get recent purchases for a client
// @route   GET /api/v1/dashboard/client/recent-purchases
// @access  Private/Client
exports.getRecentPurchasesForClient = async (req, res) => {
    try {
        const client = await Clients.findOne({ where: { id_user: req.user.id_user } });
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        const recentPurchases = await Ventes.findAll({
            where: { id_client: client.id_client },
            order: [['date', 'DESC']],
            limit: 5,
            include: [
                {
                    model: Commandes,
                    as: 'commande',
                    attributes: ['id_commande', 'date_commande', 'statut']
                },
                {
                    model: Vendeurs,
                    as: 'vendeur',
                    attributes: ['id_vendeur'],
                    include: [{
                        model: Utilisateurs,
                        as: 'user',
                        attributes: ['nom']
                    }]
                }
            ]
        });

        res.json({ success: true, data: recentPurchases });
    } catch (error) {
        console.error('Erreur lors de la récupération des achats récents du client:', error);
        res.status(500).json({ message: 'Erreur du serveur.' });
    }
};

// @desc    Get favorite vendors for a client
// @route   GET /api/v1/dashboard/client/favorite-vendors
// @access  Private/Client
exports.getFavoriteVendorsForClient = async (req, res) => {
    try {
        const client = await Clients.findOne({ where: { id_user: req.user.id_user } });
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        const favoriteVendors = await Ventes.findAll({
            where: { id_client: client.id_client },
            attributes: [
                [sequelize.literal('`vendeur->user`.`nom`'), 'nom'],
                [sequelize.fn('SUM', sequelize.col('montant_total')), 'total_depense'],
                [sequelize.literal('`vendeur`.`id_vendeur`'), 'id_vendeur']
            ],
            include: [{
                model: Vendeurs,
                as: 'vendeur',
                attributes: [],
                include: [{
                    model: Utilisateurs,
                    as: 'user',
                    attributes: []
                }]
            }],
            group: ['vendeur.id_vendeur', 'vendeur->user.nom'],
            order: [[sequelize.literal('total_depense'), 'DESC']],
            limit: 5,
            raw: true
        });

        res.json({ success: true, data: favoriteVendors });
    } catch (error) {
        console.error('Erreur lors de la récupération des vendeurs favoris du client:', error);
        res.status(500).json({ message: 'Erreur du serveur.' });
    }
};

// @desc    Get best orders for a client
// @route   GET /api/v1/dashboard/client/best-orders
// @access  Private/Client
exports.getBestOrdersForClient = async (req, res) => {
    try {
        const client = await Clients.findOne({ where: { id_user: req.user.id_user } });
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        const bestOrders = await Ventes.findAll({
            attributes: ['id_vente', 'montant_total', ['date', 'date_commande']], // Renommer 'date' en 'date_commande'
            where: { id_client: client.id_client },
            order: [['montant_total', 'DESC']],
            limit: 5,
            include: [
                {
                    model: Commandes,
                    as: 'commande',
                    attributes: ['id_commande', 'statut'] // On a déjà la date depuis Ventes
                },
                {
                    model: Vendeurs,
                    as: 'vendeur',
                    include: [{
                        model: Utilisateurs,
                        as: 'user',
                        attributes: ['nom']
                    }]
                }
            ],
            raw: true,
            nest: true
        });

        const formattedOrders = bestOrders.map(vente => ({
            id_commande: vente.commande.id_commande,
            date_commande: vente.date_commande, // Utiliser la date renommée
            statut: vente.commande.statut,
            montant_total: vente.montant_total,
            vendeur: vente.vendeur
        }));

        res.json({ success: true, data: formattedOrders });
    } catch (error) {
        console.error('Erreur lors de la récupération des meilleures commandes du client:', error);
        res.status(500).json({ message: 'Erreur du serveur.' });
    }
};

