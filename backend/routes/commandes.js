const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createCommande, getMesCommandes, validerCommande, getCommandesVendeur, updateStatutCommande, getCommandeById, getAllCommandes, getRecentCommandes, getBestClients, getCommandeStatuts } = require('../controllers/commandeController');
const commandeController = require('../controllers/commandeController');

// Route pour créer une nouvelle commande
router.post('/', protect, createCommande);

// Route pour créer une commande, accessible uniquement par les clients authentifiés
router.post('/', protect, authorize('client'), createCommande);
router.get('/mes-commandes', protect, authorize('client'), getMesCommandes);
router.get('/vendeur/mes-commandes', protect, authorize('vendeur'), getCommandesVendeur);
router.get('/vendeur/:id', protect, authorize('vendeur'), getCommandeById);

// Route pour récupérer toutes les commandes (admin)
router.get('/all', protect, authorize('admin'), getAllCommandes);

// @route   GET /api/v1/commandes/recent
// @desc    Récupérer les commandes récentes (admin)
// @access  Private (Admin only)
router.get('/recent', protect, authorize('admin'), getRecentCommandes);

// @route   GET /api/v1/commandes/best-clients
// @desc    Récupérer les meilleurs clients (admin)
// @access  Private (Admin only)
router.get('/best-clients', protect, authorize('admin'), getBestClients);

// @route   GET /api/v1/commandes/statuts
// @desc    Récupérer tous les statuts de commande possibles
// @access  Private (Admin only)
router.get('/statuts', protect, authorize('admin'), getCommandeStatuts);

// Route pour valider une commande, accessible uniquement par les vendeurs authentifiés
router.put('/:id/valider', protect, authorize('vendeur'), validerCommande);

// Route pour mettre à jour le statut d'une commande
router.put('/:id/statut', protect, authorize('vendeur'), async (req, res, next) => {
  try {
    await commandeController.updateStatutCommande(req, res);
  } catch (error) {
    console.error('❌ Erreur dans la route updateStatut:', error);
    next(error);
  }
});

module.exports = router;