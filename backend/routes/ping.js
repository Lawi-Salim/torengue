const express = require('express');
const router = express.Router();

// Route très légère pour les pings UptimeRobot
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 