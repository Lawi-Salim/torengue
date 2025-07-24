const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', protect, dashboardController.getAdminStats);
router.get('/stats-vendeur', protect, dashboardController.getVendeurStats);
router.get('/stats-client', protect, dashboardController.getClientStats);
router.get('/produits-par-categorie', protect, authorize('admin'), dashboardController.getProduitsVendusParCategorie);

module.exports = router;
