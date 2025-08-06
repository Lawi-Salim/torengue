const express = require('express');
const router = express.Router();
const {
  getClientsFavoris
} = require('../controllers/vendeurClientController');
const { protect, authorize } = require('../middleware/auth');

// Routes protégées - seuls les vendeurs peuvent accéder
router.get('/', protect, authorize('vendeur'), getClientsFavoris);

module.exports = router; 