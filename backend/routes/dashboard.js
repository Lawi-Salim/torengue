const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', protect, dashboardController.getAdminStats);
router.get('/stats-vendeur', protect, dashboardController.getVendeurStats);
router.get('/stats-client', protect, dashboardController.getClientStats);
router.get('/produits-par-categorie', protect, authorize('admin', 'vendeur', 'client'), dashboardController.getProduitsVendusParCategorie);
router.get('/meilleurs-vendeurs', protect, authorize('admin'), dashboardController.getBestSellers);

// Routes for vendor activities
router.get('/vendor/recent-sales', protect, authorize('vendeur'), dashboardController.getRecentSalesForVendor);
router.get('/vendor/best-clients', protect, authorize('vendeur'), dashboardController.getBestClientsForVendor);

// Routes pour le client
router.get('/client/recent-purchases', protect, authorize('client'), dashboardController.getRecentPurchasesForClient);
router.get('/client/favorite-vendors', protect, authorize('client'), dashboardController.getFavoriteVendorsForClient);
router.get('/client/best-orders', protect, authorize('client'), dashboardController.getBestOrdersForClient);

module.exports = router;
