const express = require('express');
const router = express.Router();
const { login, register, profile, checkExistence } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/login (pour éviter la confusion)
router.get('/login', (req, res) => {
  res.status(405).json({ success: false, message: 'Utilisez POST pour vous connecter.' });
});

// POST /api/auth/register
router.post('/register', register);

// GET /api/auth/profile
router.get('/profile', protect, profile);

// @desc    Vérifier si un email ou un téléphone existe déjà
// @route   POST /api/auth/check-existence
// @access  Public
router.post('/check-existence', checkExistence);

module.exports = router;