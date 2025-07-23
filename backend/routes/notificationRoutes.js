const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, notificationController.getAllNotifications);
router.put('/:id/read', protect, notificationController.markAsRead);

module.exports = router;
