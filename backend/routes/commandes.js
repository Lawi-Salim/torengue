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
router.put('/:id/statut', protect, authorize('vendeur'), async (req, res, next) => {
  console.log('=== DÉBUT ROUTE UPDATE STATUT ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  console.log('User ID:', req.user?.id_user);
  console.log('User Role:', req.user?.role);
  console.log('=== FIN ROUTE UPDATE STATUT ===');
  
  try {
    await commandeController.updateStatutCommande(req, res);
  } catch (error) {
    console.error('❌ Erreur dans la route updateStatut:', error);
    console.error('Stack trace:', error.stack);
    next(error);
  }
});

module.exports = router;