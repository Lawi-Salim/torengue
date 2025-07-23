const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const livraisonController = require('../controllers/livraisonController');

router.get('/vendeur', protect, livraisonController.getLivraisonsVendeur);

module.exports = router; 