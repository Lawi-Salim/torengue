const { Paiements, Commandes, Clients, Utilisateurs, Vendeurs, DetailCommandes, Produits, Factures, sequelize } = require('../models');

// Fonction pour créer un paiement pour une facture/commande
exports.createPaiementFromFacture = async (facture, commande, transaction) => {
    const existingPaiement = await Paiements.findOne({ where: { id_facture: facture.id_facture }, transaction });
    if (existingPaiement) {
        return existingPaiement;
    }

    return await Paiements.create({
        id_facture: facture.id_facture,
        id_commande: commande.id_commande,
        montant_paye: facture.montant_total,
        mode_paiement: 'espèces', // ou autre logique
        date_paiement: new Date()
    }, { transaction });
};


exports.getPaiementsVendeur = async (req, res) => {
  try {
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
    if (!vendeur) return res.status(404).json({ success: false, message: 'Vendeur non trouvé.' });
    const paiements = await Paiements.findAll({
      include: [{
        model: Commandes,
        as: 'commande',
        where: { id_vendeur: vendeur.id_vendeur },
        include: [
          {
            model: Clients,
            as: 'client',
            include: [
              {
                model: Utilisateurs,
                as: 'user',
                attributes: ['nom', 'email', 'telephone']
              }
            ]
          },
          {
            model: Vendeurs,
            as: 'vendeur',
            include: [
              {
                model: Utilisateurs,
                as: 'user',
                attributes: ['nom', 'email', 'telephone']
              }
            ]
          }
        ]
      }],
      order: [['date_paiement', 'DESC']]
    });
    res.json({ success: true, data: paiements });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await Paiements.findAll({
      include: [{
        model: Commandes,
        as: 'commande',
        include: [
          {
            model: Clients,
            as: 'client',
            include: [{
              model: Utilisateurs,
              as: 'user',
              attributes: ['nom', 'email']
            }]
          },
          {
            model: Vendeurs,
            as: 'vendeur',
            attributes: ['nom_boutique']
          }
        ]
      }],
      order: [['date_paiement', 'DESC']]
    });
    res.json({ success: true, data: paiements });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les paiements:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.getPaiementsClient = async (req, res) => {
  try {
    const client = await Clients.findOne({ where: { id_user: req.user.id_user } });
    if (!client) return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    const paiements = await Paiements.findAll({
      where: { id_commande: [sequelize.literal(`SELECT id_commande FROM Commandes WHERE id_client = ${client.id_client}`)] },
      order: [['date_paiement', 'DESC']],
      include: [
        {
          model: Commandes,
          as: 'commande',
          include: [
            {
              model: Clients,
              as: 'client',
              include: [
                {
                  model: Utilisateurs,
                  as: 'user',
                  attributes: ['nom', 'email', 'telephone']
                }
              ]
            },
            {
              model: Vendeurs,
              as: 'vendeur',
              include: [
                {
                  model: Utilisateurs,
                  as: 'user',
                  attributes: ['nom', 'email', 'telephone']
                }
              ]
            }
          ]
        }
      ]
    });
    res.json({ success: true, data: paiements });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements client:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}; 

exports.getPaiement = async (req, res) => {
  try {
    const { id } = req.params;
    const paiement = await Paiements.findByPk(id, {
      include: [
        {
          model: Commandes,
          as: 'commande',
          include: [
            {
              model: Clients,
              as: 'client',
              include: [{ model: Utilisateurs, as: 'user' }]
            },
            {
              model: Vendeurs,
              as: 'vendeur',
              include: [{ model: Utilisateurs, as: 'user' }]
            },
            {
              model: DetailCommandes,
              as: 'details',
              include: [{ model: Produits, as: 'produit' }]
            },
            {
              model: Factures,
              as: 'facture'
            }
          ]
        }
      ]
    });

    if (!paiement) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé.' });
    }

    res.json({ success: true, data: paiement });
  } catch (error) {
    console.error(`Erreur lors de la récupération du paiement ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}; 