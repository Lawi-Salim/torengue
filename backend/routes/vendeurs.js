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
    console.log('=== RÉCUPÉRATION VENDEUR PAR USER ID ===');
    console.log('User ID demandé:', req.params.id_user);
    
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.params.id_user } });
    
    console.log('Vendeur trouvé:', vendeur);
    
    if (!vendeur) {
      console.log('❌ Vendeur non trouvé pour user ID:', req.params.id_user);
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé.' });
    }
    
    console.log('✅ Vendeur trouvé avec ID:', vendeur.id_vendeur);
    res.json({ success: true, data: vendeur });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du vendeur:', error);
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
