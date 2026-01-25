const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Get all notifications for a user
const getNotificationsByReceiver = async (receiverId) => {
    const [rows] = await db.query(`
        SELECT 
            n.*,
            sender.name as senderName,
            sender.email as senderEmail,
            sender.avatarGradient as senderAvatarGradient
        FROM Notification n
        LEFT JOIN User sender ON n.senderId = sender.id
        WHERE n.receiverId = ?
        ORDER BY n.createdAt DESC
    `, [receiverId]);
    
    return rows;
};

// Get unread notifications count for a user
const getUnreadCount = async (receiverId) => {
    const [rows] = await db.query(`
        SELECT COUNT(*) as count
        FROM Notification
        WHERE receiverId = ? AND isRead = FALSE
    `, [receiverId]);
    
    return rows[0]?.count || 0;
};

// Create a new notification
const createNotification = async (notificationData) => {
    const id = uuidv4();
    const { senderId, receiverId, message } = notificationData;
    
    await db.query(`
        INSERT INTO Notification (id, senderId, receiverId, message, createdAt, isRead)
        VALUES (?, ?, ?, ?, NOW(), FALSE)
    `, [id, senderId, receiverId, message]);
    
    // Return the created notification with sender info
    const [notifications] = await db.query(`
        SELECT 
            n.*,
            sender.name as senderName,
            sender.email as senderEmail,
            sender.avatarGradient as senderAvatarGradient
        FROM Notification n
        LEFT JOIN User sender ON n.senderId = sender.id
        WHERE n.id = ?
    `, [id]);
    
    return notifications[0];
};

// Mark notification as read
const markAsRead = async (notificationId) => {
    await db.query(`
        UPDATE Notification
        SET isRead = TRUE
        WHERE id = ?
    `, [notificationId]);
    
    const [notifications] = await db.query(`
        SELECT 
            n.*,
            sender.name as senderName,
            sender.email as senderEmail,
            sender.avatarGradient as senderAvatarGradient
        FROM Notification n
        LEFT JOIN User sender ON n.senderId = sender.id
        WHERE n.id = ?
    `, [notificationId]);
    
    return notifications[0];
};

// Mark all notifications as read for a user
const markAllAsRead = async (receiverId) => {
    await db.query(`
        UPDATE Notification
        SET isRead = TRUE
        WHERE receiverId = ? AND isRead = FALSE
    `, [receiverId]);
    
    return { message: 'All notifications marked as read' };
};

// Delete a notification
const deleteNotification = async (notificationId) => {
    await db.query('DELETE FROM Notification WHERE id = ?', [notificationId]);
    return { message: 'Notification deleted' };
};

module.exports = {
    getNotificationsByReceiver,
    getUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
