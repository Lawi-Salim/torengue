const express = require('express');
const router = express.Router();
const {
  getPendingVendeurs,
  approveVendeur,
  rejectVendeur
} = require('../controllers/vendeurController');
const { protect, admin } = require('../middleware/auth');
const { Vendeurs } = require('../models');

// Endpoint pour récupérer le vendeur à partir de l'id_user
router.get('/user/:id_user', async (req, res) => {
  try {
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.params.id_user } });
    if (!vendeur) return res.status(404).json({ success: false, message: 'Vendeur non trouvé.' });
    res.json({ success: true, data: vendeur });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// Get pending sellers
router.get('/:id/pending', protect, admin, getPendingVendeurs);

// Approve a seller
router.put('/:id/approve', protect, admin, approveVendeur);

// Reject a seller
router.put('/:id/reject', protect, admin, rejectVendeur);

module.exports = router;
