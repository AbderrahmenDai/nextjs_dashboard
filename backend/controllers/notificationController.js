const notificationService = require('../services/notificationService');
const asyncHandler = require('express-async-handler');

// @desc    Get all notifications for a user
// @route   GET /api/notifications/:receiverId
// @access  Public
const getNotifications = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;
    const notifications = await notificationService.getNotificationsByReceiver(receiverId);
    res.json(notifications);
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/:receiverId/unread-count
// @access  Public
const getUnreadCount = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;
    const count = await notificationService.getUnreadCount(receiverId);
    res.json({ count });
});

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Public
const createNotification = asyncHandler(async (req, res) => {
    const { senderId, receiverId, message } = req.body;
    
    if (!senderId || !receiverId || !message) {
        res.status(400);
        throw new Error('senderId, receiverId, and message are required');
    }
    
    const notification = await notificationService.createNotification({
        senderId,
        receiverId,
        message
    });
    res.status(201).json(notification);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Public
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/:receiverId/read-all
// @access  Public
const markAllAsRead = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;
    const result = await notificationService.markAllAsRead(receiverId);
    res.json(result);
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Public
const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.params.id);
    res.json({ message: 'Notification deleted' });
});

module.exports = {
    getNotifications,
    getUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
