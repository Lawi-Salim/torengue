const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const factureController = require('../controllers/factureController');

router.get('/vendeur', protect, factureController.getFacturesVendeur);
router.get('/client', protect, factureController.getFacturesClient);
router.get('/:id', protect, factureController.getFactureDetails);

module.exports = router; 