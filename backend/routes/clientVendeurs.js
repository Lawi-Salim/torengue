const express = require('express');
const router = express.Router();
const {
  addVendeurToFavoris,
  getVendeursFavoris,
  removeVendeurFromFavoris
} = require('../controllers/clientVendeurController');
const { protect, authorize } = require('../middleware/auth');

// Routes protégées - seuls les clients peuvent accéder
router.route('/')
  .post(protect, authorize('client'), addVendeurToFavoris)
  .get(protect, authorize('client'), getVendeursFavoris);

router.delete('/:id_vendeur', protect, authorize('client'), removeVendeurFromFavoris);

module.exports = router; 