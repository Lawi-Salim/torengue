const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createCommande, getMesCommandes, validerCommande, getCommandesVendeur, updateStatutCommande } = require('../controllers/commandeController');
const commandeController = require('../controllers/commandeController');

// Route pour créer une nouvelle commande
router.post('/', protect, createCommande);

// Route pour créer une commande, accessible uniquement par les clients authentifiés
router.post('/', protect, authorize('client'), createCommande);
router.get('/mes-commandes', protect, authorize('client'), getMesCommandes);
router.get('/vendeur/mes-commandes', protect, authorize('vendeur'), getCommandesVendeur);

// Route pour valider une commande, accessible uniquement par les vendeurs authentifiés
router.put('/:id/valider', protect, authorize('vendeur'), validerCommande);

// Route pour mettre à jour le statut d'une commande
router.put('/:id/statut', protect, commandeController.updateStatutCommande);

module.exports = router;