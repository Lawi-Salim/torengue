const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/login (pour éviter la confusion)
router.get('/login', (req, res) => {
  res.status(405).json({ success: false, message: 'Utilisez POST pour vous connecter.' });
});

// POST /api/auth/register
router.post('/register', authController.register);

// GET /api/auth/profile
router.get('/profile', protect, authController.profile);

module.exports = router; 