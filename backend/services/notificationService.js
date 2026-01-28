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
    const { senderId, receiverId, message, type = 'INFO', entityType = null, entityId = null, actions = null } = notificationData;
    
    await db.query(`
        INSERT INTO Notification (id, senderId, receiverId, message, type, entityType, entityId, actions, createdAt, isRead)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), FALSE)
    `, [id, senderId, receiverId, message, type, entityType, entityId, actions ? JSON.stringify(actions) : null]);
    
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

// Resolve actionable notifications (e.g. when request is Approved/Rejected)
const resolveActions = async (entityId, entityType, resolutionMessage) => {
    // Update all matching notifications to remove actions and set new message
    await db.query(`
        UPDATE Notification
        SET 
            type = 'INFO',
            actions = NULL,
            message = ?,
            isRead = FALSE
        WHERE entityId = ? AND entityType = ? AND type = 'ACTION_REQUIRED'
    `, [resolutionMessage, entityId, entityType]);
    
    // Notify users about the update via socket (we'd need to fetch them first to notify individually,
    // or just rely on them refreshing/polling. For now let's just update DB.)
    // Ideally we emit an event to all receivers of these notifications.
    
    const [updatedNotifications] = await db.query(`
        SELECT * FROM Notification 
        WHERE entityId = ? AND entityType = ? AND type = 'INFO' AND message = ?
    `, [entityId, entityType, resolutionMessage]);
    
    return updatedNotifications;
};

module.exports = {
    getNotificationsByReceiver,
    getUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    resolveActions
};
