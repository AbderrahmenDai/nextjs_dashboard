const { Notification, User } = require('../models');

// Get all notifications for a user
const getNotificationsByReceiver = async (receiverId) => {
    const notifications = await Notification.findAll({
        where: { receiverId },
        include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'avatarGradient']
        }],
        order: [['createdAt', 'DESC']]
    });
    
    return notifications.map(n => {
        const plain = n.get({ plain: true });
        return {
            ...plain,
            senderName: plain.sender ? plain.sender.name : null,
            senderEmail: plain.sender ? plain.sender.email : null,
            senderAvatarGradient: plain.sender ? plain.sender.avatarGradient : null
        };
    });
};

// Get unread notifications count for a user
const getUnreadCount = async (receiverId) => {
    return await Notification.count({
        where: {
            receiverId,
            isRead: false
        }
    });
};

// Create a new notification
const createNotification = async (notificationData) => {
    // Sanitize actions
    if (notificationData.actions && typeof notificationData.actions !== 'string') {
        // Model defines actions as JSON, so we can pass object directly.
        // But if previous implementation stringified it, we should check what frontend expects.
        // Sequelize JSON type handles objects automatically.
    }

    const newNotification = await Notification.create({
        senderId: notificationData.senderId,
        receiverId: notificationData.receiverId,
        message: notificationData.message,
        type: notificationData.type || 'INFO',
        entityType: notificationData.entityType,
        entityId: notificationData.entityId,
        actions: notificationData.actions,
        isRead: false
    });

    const created = await Notification.findByPk(newNotification.id, {
        include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'avatarGradient']
        }]
    });

    const plain = created.get({ plain: true });
    return {
        ...plain,
        senderName: plain.sender ? plain.sender.name : null,
        senderEmail: plain.sender ? plain.sender.email : null,
        senderAvatarGradient: plain.sender ? plain.sender.avatarGradient : null
    };
};

// Mark notification as read
const markAsRead = async (notificationId) => {
    await Notification.update({ isRead: true }, { where: { id: notificationId } });
    
    const notification = await Notification.findByPk(notificationId, {
        include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'avatarGradient']
        }]
    });
    
    if (!notification) return null;

    const plain = notification.get({ plain: true });
    return {
        ...plain,
        senderName: plain.sender ? plain.sender.name : null,
        senderEmail: plain.sender ? plain.sender.email : null,
        senderAvatarGradient: plain.sender ? plain.sender.avatarGradient : null
    };
};

// Mark all notifications as read for a user
const markAllAsRead = async (receiverId) => {
    await Notification.update({ isRead: true }, { where: { receiverId, isRead: false } });
    return { message: 'All notifications marked as read' };
};

// Delete a notification
const deleteNotification = async (notificationId) => {
    await Notification.destroy({ where: { id: notificationId } });
    return { message: 'Notification deleted' };
};

// Resolve actionable notifications
const resolveActions = async (entityId, entityType, resolutionMessage) => {
    // Update all matching notifications
    await Notification.update({
        type: 'INFO',
        actions: null,
        message: resolutionMessage,
        isRead: false // Mark as unread so user sees the update?
    }, {
        where: {
            entityId,
            entityType,
            type: 'ACTION_REQUIRED'
        }
    });

    const updatedNotifications = await Notification.findAll({
        where: {
            entityId,
            entityType,
            type: 'INFO',
            message: resolutionMessage
        }
    });
    
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
