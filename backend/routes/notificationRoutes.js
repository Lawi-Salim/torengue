const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, notificationController.getAllNotifications);
router.get('/user/:userId', protect, notificationController.getNotificationsByUserId);
router.put('/:id/read', protect, notificationController.markAsRead);
router.get('/reminders', protect, notificationController.getReminders);

module.exports = router;
