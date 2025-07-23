const express = require('express');
const router = express.Router();
const { createDemande, getAllDemandes, approveDemande, rejectDemande, getPendingDemandesCount } = require('../controllers/demandeVendeurController');
const { protect, admin } = require('../middleware/auth.js');

// Route pour créer une nouvelle demande de vendeur
router.post('/', createDemande);

// Route pour obtenir le nombre de demandes en attente
router.get('/pending-count', protect, admin, getPendingDemandesCount);

// Routes pour l'administration des demandes
router.route('/')
    .get(protect, admin, getAllDemandes);

router.route('/:id/approve')
    .put(protect, admin, approveDemande);

router.route('/:id/reject')
    .put(protect, admin, rejectDemande);

module.exports = router;
