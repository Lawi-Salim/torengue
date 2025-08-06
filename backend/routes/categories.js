const express = require('express');
const { Categories } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Récupérer toutes les catégories
// @route   GET /api/v1/categories
// @access  Privé (admin, vendeur)
router.get('/', protect, authorize('admin', 'vendeur', 'client'), async (req, res) => {
  try {
    const categories = await Categories.findAll({
      order: [['nom', 'ASC']]
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
