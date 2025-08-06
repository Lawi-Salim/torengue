const express = require('express');
const router = express.Router();
const {
  getAllVentes,
  getVente,
  createVente,
  updateVente,
  deleteVente
} = require('../controllers/venteController');
const { protect, authorize } = require('../middleware/auth');

// Routes protégées
router.route('/')
  .get(protect, authorize('vendeur', 'admin'), getAllVentes)
  .post(protect, authorize('vendeur', 'admin'), createVente);


router.route('/:id')
  .get(protect, authorize('vendeur', 'admin'), getVente)
  .put(protect, authorize('vendeur', 'admin'), updateVente)
  .delete(protect, authorize('vendeur', 'admin'), deleteVente);

module.exports = router;