const express = require('express');
const router = express.Router();
const { getAllUsers, getAllUsersWithDetails, getProfile, updateProfile, getRecentUsers, getPendingSellers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/v1/users
// @desc    Récupérer tous les utilisateurs
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getAllUsers);

// @route   GET /api/users/details
// @desc    Récupérer tous les utilisateurs avec les détails du vendeur
// @access  Private (Admin only)
router.get('/details', protect, authorize('admin'), getAllUsersWithDetails);

// @route   GET /api/v1/users/recent
// @desc    Récupérer les utilisateurs récents
// @access  Private (Admin only)
router.get('/recent', protect, authorize('admin'), getRecentUsers);

// @route   GET /api/v1/users/pending-sellers
// @desc    Récupérer les vendeurs en attente
// @access  Private (Admin only)
router.get('/pending-sellers', protect, authorize('admin'), getPendingSellers);

// @route   GET /api/v1/users/me/profile
// @desc    Récupérer le profil de l'utilisateur connecté
// @access  Private
router.route('/me/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
