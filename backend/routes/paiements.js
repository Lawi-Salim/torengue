const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getPaiementsVendeur, getPaiementsClient, getAllPaiements, getPaiement } = require('../controllers/paiementController');

router.get('/vendeur', protect, authorize('vendeur'), getPaiementsVendeur);
router.get('/client', protect, authorize('client'), getPaiementsClient);
router.get('/all', protect, authorize('admin'), getAllPaiements);
router.get('/:id', protect, authorize('admin'), getPaiement);

module.exports = router;