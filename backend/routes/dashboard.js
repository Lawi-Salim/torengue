const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', protect, dashboardController.getAdminStats);
router.get('/stats-vendeur', protect, dashboardController.getVendeurStats);
router.get('/stats-client', protect, dashboardController.getClientStats);

module.exports = router;
