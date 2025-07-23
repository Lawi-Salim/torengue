const express = require('express');
const router = express.Router();
const { getAllUsers, getAllUsersWithDetails, getProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/v1/users
// @desc    Récupérer tous les utilisateurs
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getAllUsers);

// @route   GET /api/users/details
// @desc    Récupérer tous les utilisateurs avec les détails du vendeur
// @access  Private (Admin only)
router.get('/details', protect, authorize('admin'), getAllUsersWithDetails);

// @route   GET /api/v1/users/me/profile
// @desc    Récupérer le profil de l'utilisateur connecté
// @access  Private
router.get('/me/profile', protect, getProfile);

module.exports = router;
