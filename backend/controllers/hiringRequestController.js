const asyncHandler = require('express-async-handler');
const hiringRequestService = require('../services/hiringRequestService');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');
const db = require('../config/db'); // Needed to query users by role

const getHiringRequests = asyncHandler(async (req, res) => {
    const items = await hiringRequestService.getAllHiringRequests();
    res.json(items);
});

const getHiringRequest = asyncHandler(async (req, res) => {
    const item = await hiringRequestService.getHiringRequestById(req.params.id);
    if (!item) {
        res.status(404);
        throw new Error('Hiring Request not found');
    }
    res.json(item);
});

const createHiringRequest = asyncHandler(async (req, res) => {
    const newItem = await hiringRequestService.createHiringRequest(req.body);
    
    // Notify RH Managers and Directors
    try {
        const [recipients] = await db.query(
            `SELECT id FROM User WHERE role IN ( 'HR_MANAGER', 'RH Manager', 'Direction' , 'ADMIN')`
        );

        // Resolve a valid sender ID
        let senderId = req.body.requesterId || newItem.requesterId;
        
        // Verify sender exists
        const [senderCheck] = await db.query('SELECT id FROM User WHERE id = ?', [senderId]);
        
        if (senderCheck.length === 0) {
            console.warn(`Sender ID ${senderId} not found, falling back to first available user.`);
            const [fallbackUser] = await db.query('SELECT id FROM User LIMIT 1');
            if (fallbackUser.length > 0) {
                senderId = fallbackUser[0].id;
            } else {
                console.error('No users found in DB to act as sender.');
                return; // Cannot send notification without a sender
            }
        }
        
        for (const recipient of recipients) {
            // Create notification in DB
            const notification = await notificationService.createNotification({
                senderId: senderId, 
                receiverId: recipient.id,
                message: `New Hiring Request created: ${newItem.title || 'Untitled'}`
            });
            
            // Send real-time update
            socketService.sendNotificationToUser(recipient.id, notification);
        }
    } catch (error) {
        console.error('Failed to send notifications for new hiring request:', error);
        // Don't fail the request if notifications fail
    }

    res.status(201).json(newItem);
});

const updateHiringRequest = asyncHandler(async (req, res) => {
    const updated = await hiringRequestService.updateHiringRequest(req.params.id, req.body);
    res.json(updated);
});

const deleteHiringRequest = asyncHandler(async (req, res) => {
    await hiringRequestService.deleteHiringRequest(req.params.id);
    res.json({ message: 'Deleted successfully' });
});

module.exports = {
    getHiringRequests,
    getHiringRequest,
    createHiringRequest,
    updateHiringRequest,
    deleteHiringRequest
};
