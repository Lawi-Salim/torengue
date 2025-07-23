const { Commandes, DetailCommandes, Produits, Vendeurs, Utilisateurs, Notifications } = require('../models');

// POST /api/v1/commandes
exports.createCommande = async (req, res) => {
  try {
    const { produits } = req.body; // [{ id_produit, quantite, prix_unitaire }]
    const id_client = req.user.id_user; // L'utilisateur connecté (client)
    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun produit dans la commande.' });
    }

    // Créer la commande
    const commande = await Commandes.create({ id_client });

    // Créer les détails de la commande
    for (const p of produits) {
      await DetailCommandes.create({
        id_commande: commande.id_commande,
        id_produit: p.id_produit,
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire
      });
      // Trouver le vendeur du produit
      const produit = await Produits.findByPk(p.id_produit, { include: [{ model: Vendeurs, as: 'vendeur' }] });
      if (produit && produit.id_vendeur) {
        // Notifier le vendeur
        await Notifications.create({
          id_user: produit.id_vendeur, // id_user du vendeur
          type_notif: 'new_order',
          message: `Nouvelle commande reçue pour le produit ${produit.nom}`
        });
      }
    }

    res.status(201).json({ success: true, message: 'Commande créée et notification envoyée.' });
  } catch (error) {
    console.error('Erreur lors de la création de la commande :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la création de la commande.' });
  }
}; 