const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:receiverId', notificationController.getNotifications);
router.get('/:receiverId/unread-count', notificationController.getUnreadCount);
router.post('/', notificationController.createNotification);
router.put('/:id/read', notificationController.markAsRead);
router.put('/:receiverId/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
