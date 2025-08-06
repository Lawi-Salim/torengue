const { Factures, Ventes, Commandes, Clients, Utilisateurs, Vendeurs, DetailVentes, DetailCommandes, Produits, sequelize } = require('../models');

// Fonction pour créer une facture pour une vente
exports.createFactureFromVente = async (vente, commande, transaction) => {
    const existingFacture = await Factures.findOne({ where: { id_vente: vente.id_vente }, transaction });
    if(existingFacture) {
        return existingFacture;
    }

    // Si la commande est annulée, statut_paiement = 'annulé', sinon 'payé'
    let statut_paiement = 'payé';
    if (commande.statut === 'annulée') {
        statut_paiement = 'annulé';
    }

    return await Factures.create({
        id_vente: vente.id_vente,
        id_commande: commande.id_commande,
        montant_HT: vente.montant_total,
        montant_TTC: vente.montant_total, // Adapter si TVA
        montant_total: vente.montant_total,
        statut_paiement
    }, { transaction });
};

exports.getFacturesVendeur = async (req, res) => {
  try {
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
    if (!vendeur) return res.status(404).json({ success: false, message: 'Vendeur non trouvé.' });
    const factures = await Factures.findAll({
      include: [{
        model: Ventes,
        as: 'vente',
        where: { id_vendeur: vendeur.id_vendeur },
        include: [{
            model: Commandes,
            as: 'commande',
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
      }]
    });
    res.json({ success: true, data: factures });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.getFacturesClient = async (req, res) => {
  try {
    const client = await Clients.findOne({ where: { id_user: req.user.id_user } });
    if (!client) return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    const factures = await Factures.findAll({
      where: { id_commande: [sequelize.literal(`SELECT id_commande FROM Commandes WHERE id_client = ${client.id_client}`)] },
      order: [['date_creation', 'DESC']]
    });
    res.json({ success: true, data: factures });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures client:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.getFactureDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const facture = await Factures.findByPk(id, {
      include: [
        {
          model: Ventes,
          as: 'vente',
          include: [
            {
              model: Vendeurs,
              as: 'vendeur',
              include: {
                model: Utilisateurs,
                as: 'user',
                attributes: ['nom', 'email', 'telephone'],
              },
            },
          ],
        },
        {
          model: Commandes,
          as: 'commande',
          include: [
            {
              model: Clients,
              as: 'client',
              include: {
                model: Utilisateurs,
                as: 'user',
                attributes: ['nom', 'email', 'telephone'],
              },
            },
            {
              model: DetailCommandes,
              as: 'details',
              include: {
                model: Produits,
                as: 'produit',
                attributes: ['nom', 'description', 'image'],
              },
            },
          ],
        },
      ],
    });

    if (!facture) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée.' });
    }

    res.json({ success: true, data: facture });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la facture:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: factures } = await Factures.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: Ventes,
          as: 'vente',
          attributes: ['id_vente'],
          include: [
            {
              model: Vendeurs,
              as: 'vendeur',
              attributes: ['id_vendeur', 'nom_boutique'],
              include: {
                model: Utilisateurs,
                as: 'user',
                attributes: ['nom'],
              },
            },
          ],
        },
        {
          model: Commandes,
          as: 'commande',
          attributes: ['id_commande'],
          include: [
            {
              model: Clients,
              as: 'client',
              attributes: ['id_client'],
              include: {
                model: Utilisateurs,
                as: 'user',
                attributes: ['nom'],
              },
            },
          ],
        },
      ],
      order: [['date_creation', 'DESC']],
      distinct: true,
    });

    res.status(200).json({
      success: true,
      data: factures,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les factures :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}; 