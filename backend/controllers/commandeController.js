const { Commandes, DetailCommandes, Produits, Clients, Vendeurs, Notifications, Utilisateurs, sequelize, Categories, Unites } = require('../models');
const venteController = require('./venteController');
const livraisonController = require('./livraisonController');
const factureController = require('./factureController');
const paiementController = require('./paiementController');
const notificationController = require('./notificationController');

exports.createCommande = async (req, res) => {
  const { produits } = req.body;
  const id_user = req.user.id_user; // Vient du middleware `protect`

  if (!produits || !Array.isArray(produits) || produits.length === 0) {
    return res.status(400).json({ success: false, message: 'Les produits de la commande sont manquants ou invalides.' });
  }

  const t = await sequelize.transaction();

  try {
    const client = await Clients.findOne({ where: { id_user: id_user } });
    if (!client) {
      throw new Error('Profil client non trouvé pour cet utilisateur.');
    }

    // Calculer le montant total et le nombre d'articles
    let montantTotal = 0;
    let nbr_article = 0;
    for (const p of produits) {
      montantTotal += parseFloat(p.prix_unitaire) * parseInt(p.quantite);
      nbr_article += parseInt(p.quantite);
    }

    // Récupérer l'id_vendeur du premier produit (supposant un seul vendeur par commande)
    const premierProduit = await Produits.findByPk(produits[0].id_produit);
    if (!premierProduit || !premierProduit.id_vendeur) {
        throw new Error('Vendeur non trouvé pour les produits de la commande.');
    }
    const id_vendeur = premierProduit.id_vendeur;

    // Créer la commande
    const commande = await Commandes.create({ 
      id_client: client.id_client, 
      id_vendeur: id_vendeur,
      nbr_article: nbr_article
    }, { transaction: t });

    // Créer les détails de la commande et notifier le vendeur
    for (const p of produits) {
      await DetailCommandes.create({
        id_commande: commande.id_commande,
        id_produit: p.id_produit,
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire
      }, { transaction: t });
    }
    
    // Notifier le vendeur une seule fois par commande
    const vendeur = await Vendeurs.findByPk(id_vendeur);
    if (vendeur && vendeur.id_user) {
      await Notifications.create({
        id_user: vendeur.id_user,
        type_notif: 'new_order',
        message: `Nouvelle commande #${commande.id_commande} reçue.`
      }, { transaction: t });
    }

    // Décrémenter le solde du client
    if (client) {
      client.solde = parseFloat(client.solde) - montantTotal;
      await client.save({ transaction: t });
    }

    await t.commit();

    res.status(201).json({ success: true, message: 'Commande créée avec succès.', data: commande });

  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur lors de la création de la commande.' });
  }
};

exports.getMesCommandes = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    // 1. Trouver le client associé à l'utilisateur connecté
    const client = await Clients.findOne({ where: { id_user } });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Profil client non trouvé.' });
    }

    // 2. Récupérer les commandes du client
    const commandes = await Commandes.findAll({
      where: { id_client: client.id_client },
      order: [['date_commande', 'DESC']],
      include: [
        {
          model: DetailCommandes,
          as: 'details',
          include: [
            {
              model: Produits,
              as: 'produit',
              attributes: ['nom', 'prix_unitaire']
            }
          ]
        }
      ]
    });

    // 3. Formater la réponse pour le frontend
    const data = commandes.map(cmd => {
      // Calculer le montant total à partir des détails
      const montantTotal = (cmd.details || []).reduce((acc, detail) => {
        return acc + (parseFloat(detail.prix_unitaire) * parseInt(detail.quantite));
      }, 0);

      return {
        id_commande: cmd.id_commande,
        date_commande: cmd.date_commande,
        statut: cmd.statut,
        nbr_article: cmd.nbr_article,
        montant_total: montantTotal.toFixed(2),
        produits: (cmd.details || []).map(d => ({
          nom: d.produit?.nom || 'Produit non trouvé',
          quantite: d.quantite
        }))
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes client:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.validerCommande = async (req, res) => {
  const { id } = req.params; // id de la commande
  const t = await sequelize.transaction();

  try {
    const commande = await Commandes.findByPk(id, {
      include: [{ model: DetailCommandes, as: 'details' }],
      transaction: t
    });

    if (!commande) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }

    if (commande.statut !== 'en attente') {
      await t.rollback();
      return res.status(400).json({ success: false, message: `La commande a déjà le statut '${commande.statut}'.` });
    }

    // Mettre à jour le statut de la commande
    commande.statut = 'validée';
    await commande.save({ transaction: t });

    // Calculer le montant total à partir des détails de la commande
    const montant_total = (commande.details || []).reduce((acc, detail) => {
        return acc + (parseFloat(detail.prix_unitaire) * parseInt(detail.quantite));
    }, 0);

    // Log pour débogage
    console.log('Tentative de création de vente avec les données:', {
      id_commande: commande.id_commande,
      id_client: commande.id_client,
      id_vendeur: commande.id_vendeur,
      montant_total: montant_total,
      etat_vente: 'en cours'
    });

    // Créer une nouvelle vente
    await Ventes.create({
      id_commande: commande.id_commande,
      id_client: commande.id_client,
      id_vendeur: commande.id_vendeur,
      montant_total: montant_total,
      etat_vente: 'en cours'
    }, { transaction: t });

    console.log('Vente créée avec succès dans la transaction.');

    await t.commit();

    console.log('Transaction commitée avec succès.');

    res.json({ success: true, message: 'Commande validée et vente créée avec succès.' });

  } catch (error) {
    await t.rollback();
    console.error('Erreur détaillée lors de la validation de la commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la validation.' });
  }
};

exports.getCommandesVendeur = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const vendeur = await Vendeurs.findOne({ where: { id_user } });

    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Profil vendeur non trouvé.' });
    }

    const commandes = await Commandes.findAll({
      where: { id_vendeur: vendeur.id_vendeur },
      order: [['date_commande', 'DESC']],
      include: [
        {
          model: DetailCommandes,
          as: 'details',
          attributes: ['quantite', 'prix_unitaire'],
          include: {
            model: Produits,
            as: 'produit',
            attributes: ['nom', 'image', 'prix_unitaire'],
            include: [
              {
                model: Categories,
                as: 'categorie',
                attributes: ['nom']
              },
              {
                model: Unites,
                as: 'unite',
            attributes: ['nom']
              }
            ]
          }
        },
        {
          model: Clients,
          as: 'client',
          attributes: ['id_client'],
          include: {
            model: Utilisateurs,
            as: 'user',
            attributes: ['nom']
          }
        }
      ]
    });

    const data = commandes.map(cmd => {
      const montantTotal = (cmd.details || []).reduce((acc, detail) => {
        return acc + (parseFloat(detail.prix_unitaire) * parseInt(detail.quantite));
      }, 0);

      return {
        id_commande: cmd.id_commande,
        date_commande: cmd.date_commande,
        statut: cmd.statut,
        nbr_article: cmd.nbr_article,
        montant_total: montantTotal.toFixed(2),
        client: cmd.client && cmd.client.user ? cmd.client.user.nom : 'Client non trouvé',
        produits: (cmd.details || []).map(d => ({
          nom: d.produit?.nom || 'Produit non trouvé',
          quantite: d.quantite,
          prix_unitaire: d.prix_unitaire || 0,
          image: d.produit?.image || 'default.jpg',
          categorie: d.produit?.categorie?.nom || 'Non classé',
          unite: d.produit?.unite?.nom || ''
        }))
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes vendeur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Nouvelle méthode pour mettre à jour le statut d'une commande
exports.updateStatutCommande = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  const t = await sequelize.transaction();
  try {
    const commande = await Commandes.findByPk(id, { transaction: t });
    if (!commande) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }
    const statutsValides = ['en attente', 'en préparation', 'expédiée', 'livrée', 'annulée', 'validée'];
    if (!statutsValides.includes(statut)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Statut invalide.' });
    }
    if (['livrée', 'annulée'].includes(commande.statut)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Impossible de modifier une commande livrée ou annulée.' });
    }
    
    commande.statut = statut;
    await commande.save({ transaction: t });

    // Orchestration des créations
    if (statut === 'expédiée' || statut === 'livrée') {
      await livraisonController.createLivraisonFromCommande(commande, t);
    }
    
    if (statut === 'livrée') {
      const vente = await venteController.createVenteFromCommande(commande, t);
      const facture = await factureController.createFactureFromVente(vente, commande, t);
      await paiementController.createPaiementFromFacture(facture, commande, t);
      // Mettre à jour la livraison avec l'id_vente
      await livraisonController.updateLivraisonVente(commande.id_commande, vente.id_vente, t);
    }

    // Notifications
    let notifMessage = '';
    switch (statut) {
      case 'en préparation':
        notifMessage = `Votre commande #${commande.id_commande} est en préparation.`;
        break;
      case 'expédiée':
        notifMessage = `Votre commande #${commande.id_commande} a été expédiée.`;
        break;
      case 'livrée':
        notifMessage = `Votre commande #${commande.id_commande} a été livrée.`;
        break;
      case 'annulée':
        notifMessage = `Votre commande #${commande.id_commande} a été annulée.`;
        break;
      default:
        notifMessage = `Statut de la commande #${commande.id_commande} mis à jour : ${statut}`;
    }
    // Trouver le client lié à la commande
    const client = await Clients.findByPk(commande.id_client);
    if (client && client.id_user) {
      await Notifications.create({
        id_user: client.id_user,
        type_notif: 'info',
        message: notifMessage
      }, { transaction: t });
    }
    // TODO : Notifier le vendeur si besoin
    
    await t.commit();
    res.json({ success: true, message: `Statut mis à jour à "${statut}".` });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour du statut.' });
  }
};
