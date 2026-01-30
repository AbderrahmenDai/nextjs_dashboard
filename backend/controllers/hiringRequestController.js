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
    const { requesterId } = req.body;

    if (!requesterId) {
        res.status(400);
        throw new Error('Requester ID is required');
    }

    // 1. Verify Requester Role (MUST be DEMANDEUR)
    const [requester] = await db.query(`
        SELECT User.id, User.name, Role.name as roleName 
        FROM User 
        LEFT JOIN Role ON User.roleId = Role.id 
        WHERE User.id = ?
    `, [requesterId]);

    if (requester.length === 0) {
        res.status(404);
        throw new Error('User not found');
    }

    const userRole = requester[0].roleName;
    if (userRole !== 'DEMANDEUR') {
        res.status(403);
        throw new Error('Only users with role "DEMANDEUR" can create hiring requests');
    }

    // 2. Create Request (Initial Status: Pending Admin)
    // Note: User request says: "when created... ADMIN, Direction, HR_MANAGER receive notification" 
    // And "if admin accepts it's done".
    // "but if HR_MANAGER accepts then Direction get notification..."
    // This implies parallel or fallback flows. 
    // Let's set status to "PENDING_ADMIN" or just "PENDING" and notify all.
    
    // We'll trust the body payload but force status
    const requestData = { ...req.body, status: 'PENDING_APPROVAL' };
    const newItem = await hiringRequestService.createHiringRequest(requestData);
    
    // 3. Notify ADMIN, HR_MANAGER (and Direction? User said so)
    try {
        // Fetch target users
        const [recipients] = await db.query(
            `SELECT User.id FROM User 
             JOIN Role ON User.roleId = Role.id 
             WHERE Role.name IN ('ADMIN', 'HR_MANAGER', 'Direction')`
        );
        
        for (const recipient of recipients) {
            // Create notification with ACTIONS
            const notification = await notificationService.createNotification({
                senderId: requesterId, 
                receiverId: recipient.id,
                message: `New Hiring Request from ${requester[0].name}: ${newItem.title}`,
                type: 'ACTION_REQUIRED',
                entityType: 'HIRING_REQUEST',
                entityId: newItem.id,
                actions: ['APPROVE', 'REJECT']
            });
            
            // Send real-time update
            socketService.sendNotificationToUser(recipient.id, notification);
        }
    } catch (error) {
        console.error('Failed to send notifications for new hiring request:', error);
    }

    res.status(201).json(newItem);
});

const updateHiringRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, approverId } = req.body; // approverId acts as the actor

    // Fetch current request state
    const currentRequest = await hiringRequestService.getHiringRequestById(id);
    if (!currentRequest) {
        res.status(404);
        throw new Error('Hiring Request not found');
    }

    // Identify actor role if approverId is provided
    let actorRole = null;
    let actorName = "System";

    if (approverId) {
        const [actor] = await db.query(`
            SELECT User.name, Role.name as roleName 
            FROM User 
            JOIN Role ON User.roleId = Role.id 
            WHERE User.id = ?
        `, [approverId]);
        
        if (actor.length > 0) {
            actorRole = actor[0].roleName;
            actorName = actor[0].name;
        }
    }

    // Perform Update
    const updated = await hiringRequestService.updateHiringRequest(id, req.body);
    
    // NOTIFICATION LOGIC based on Status Changes
    if (status && status !== currentRequest.status) {
        try {
            // Scenario 1: ADMIN approves -> DONE (Notify Requester)
            if (status === 'APPROVED' && (actorRole === 'ADMIN' || actorRole === 'Direction')) {
               // Notify Requester
               await sendNotification(
                   approverId, 
                   currentRequest.requesterId, 
                   `Your hiring request "${currentRequest.title}" has been APPROVED by ${actorName}.`
               );
               
               // Resolve outstanding Action Notifications
               await notificationService.resolveActions(
                   id, 
                   'HIRING_REQUEST', 
                   `Hiring Request "${currentRequest.title}" was APPROVED by ${actorName}.`
               );
            }

            // Scenario 2: HR_MANAGER approves -> Notify DIRECTION
            if (status === 'HR_APPROVED' && actorRole === 'HR_MANAGER') {
                // Fetch Direction users
                const [result] = await db.query(`
                    SELECT User.id FROM User 
                    JOIN Role ON User.roleId = Role.id 
                    WHERE Role.name = 'Direction'
                `);
                
                for (const dir of result) {
                    await sendNotification(
                        approverId,
                        dir.id,
                        `Hiring Request "${currentRequest.title}" approved by HR (${actorName}). Awaiting your final approval.`,
                        'ACTION_REQUIRED',
                        'HIRING_REQUEST',
                        currentRequest.id,
                        ['APPROVE', 'REJECT']
                    );
                }
                
                // Resolve outstanding Action Notifications for HR (if any existed, e.g. parallel approvals)
                // For sequential, the previous "Pending HR" notification (if ACTION_REQUIRED) should be resolved.
                await notificationService.resolveActions(
                   id, 
                   'HIRING_REQUEST', 
                   `Hiring Request "${currentRequest.title}" was approved by HR (${actorName}).`
               );
            }

            // Scenario 3: Rejected -> Notify Requester
            if (status === 'REJECTED') {
                 const reasonText = req.body.rejectionReason ? ` Reason: ${req.body.rejectionReason}` : '';
                 await sendNotification(
                   approverId, 
                   currentRequest.requesterId, 
                   `Your hiring request "${currentRequest.title}" has been REJECTED by ${actorName}.${reasonText}`
               );
               
               // Resolve outstanding Action Notifications
               await notificationService.resolveActions(
                   id, 
                   'HIRING_REQUEST', 
                   `Hiring Request "${currentRequest.title}" was REJECTED by ${actorName}.`
               );
            }

        } catch (error) {
            console.error("Notification error:", error);
        }
    }

    res.json(updated);
});

// Helper for sending notifications
async function sendNotification(senderId, receiverId, message, type='INFO', entityType=null, entityId=null, actions=null) {
    if (!senderId || !receiverId) return;
    const notification = await notificationService.createNotification({
        senderId, receiverId, message, type, entityType, entityId, actions
    });
    socketService.sendNotificationToUser(receiverId, notification);
}

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
