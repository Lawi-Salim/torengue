const { Ventes, DetailCommandes, DetailVentes, Clients, Vendeurs, Utilisateurs, Produits, sequelize } = require('../models');

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
    const { role, id_user } = req.user;
    let whereClause = {};

    if (role === 'vendeur') {
      const vendeur = await Vendeurs.findOne({ where: { id_user } });
      if (!vendeur) {
        return res.status(404).json({ success: false, message: 'Profil vendeur non trouvé.' });
      }
      whereClause.id_vendeur = vendeur.id_vendeur;
    }

    const ventes = await Ventes.findAll({
      where: whereClause,
      include: [
        {
          model: Clients,
          as: 'client',
          include: [{ model: Utilisateurs, as: 'user', attributes: ['nom'] }]
        },
        {
          model: Vendeurs,
          as: 'vendeur',
          attributes: ['nom_boutique']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json({ success: true, data: ventes });
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
exports.getVente = async (req, res) => {
  try {
    const { id } = req.params;
    const vente = await Ventes.findByPk(id, {
      include: [
        {
          model: Clients,
          as: 'client',
          include: [{ model: Utilisateurs, as: 'user', attributes: ['nom', 'email', 'telephone'] }]
        },
        {
          model: Vendeurs,
          as: 'vendeur',
          include: [{ model: Utilisateurs, as: 'user', attributes: ['nom', 'email', 'telephone'] }]
        },
        {
          model: DetailVentes,
          as: 'details',
          include: [{ model: Produits, as: 'produit', attributes: ['nom', 'image'] }]
        }
      ]
    });

    if (!vente) {
      return res.status(404).json({ success: false, message: 'Vente non trouvée.' });
    }

    res.json({ success: true, data: vente });
  } catch (error) {
    console.error('Erreur lors de la récupération de la vente :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
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
