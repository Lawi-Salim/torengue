const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paiementController = require('../controllers/paiementController');

router.get('/vendeur', protect, paiementController.getPaiementsVendeur);
router.get('/client', protect, paiementController.getPaiementsClient);

module.exports = router; 