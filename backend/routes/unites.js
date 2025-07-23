const express = require('express');
const { Unites } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Récupérer toutes les unités
// @route   GET /api/v1/unites
// @access  Privé (admin, vendeur)
router.get('/', protect, authorize('admin', 'vendeur'), async (req, res) => {
  try {
    const unites = await Unites.findAll({
      order: [['nom', 'ASC']]
    });
    res.json({ success: true, data: unites });
  } catch (error) {
    console.error('Erreur lors de la récupération des unités:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
