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
    // Set initial status to 'Pending HR' - First step in approval chain
    const requestData = { ...req.body, status: 'Pending HR' };
    const newItem = await hiringRequestService.createHiringRequest(requestData);
    
    // SEQUENTIAL WORKFLOW: Step 1 - Notify ONLY HR_MANAGER
    try {
        const [hrManagers] = await db.query(
            `SELECT User.id, User.name FROM User 
             JOIN Role ON User.roleId = Role.id 
             WHERE Role.name = 'HR_MANAGER'`
        );
        
        for (const hrManager of hrManagers) {
            const notification = await notificationService.createNotification({
                senderId: requesterId, 
                receiverId: hrManager.id,
                message: `📋 Nouvelle demande d'embauche de ${requester[0].name}: "${newItem.title}" - En attente de votre validation`,
                type: 'ACTION_REQUIRED',
                entityType: 'HIRING_REQUEST',
                entityId: newItem.id,
                actions: ['APPROVE', 'REJECT']
            });
            
            socketService.sendNotificationToUser(hrManager.id, notification);
            console.log(`✅ Notification sent to HR Manager: ${hrManager.name}`);
        }
    } catch (error) {
        console.error('Failed to send notifications for new hiring request:', error);
    }

    res.status(201).json(newItem);
});

const updateHiringRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, approverId, rejectionReason } = req.body;

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

    // VALIDATION: If rejecting, require a reason
    if (status === 'Rejected' && !rejectionReason) {
        res.status(400);
        throw new Error('Un motif de rejet est obligatoire');
    }

    // Perform Update
    const updated = await hiringRequestService.updateHiringRequest(id, req.body);
    
    // SEQUENTIAL APPROVAL WORKFLOW LOGIC
    if (status && status !== currentRequest.status) {
        try {
            // ========== STEP 1: HR_MANAGER APPROVES → Notify PLANT_MANAGER (Direction) ==========
            if (status === 'Pending Director' && actorRole === 'HR_MANAGER') {
                // Resolve HR notifications FIRST before creating new actionable ones
                // Otherwise we risk resolving the newly created director notification immediately
                await notificationService.resolveActions(
                    id, 
                    'HIRING_REQUEST', 
                    `Validée par RH (${actorName})`
                );

                const [directors] = await db.query(`
                    SELECT User.id, User.name FROM User 
                    JOIN Role ON User.roleId = Role.id 
                    WHERE Role.name = 'PLANT_MANAGER'
                `);
                
                for (const director of directors) {
                    await sendNotification(
                        approverId,
                        director.id,
                        `✅ Demande d'embauche "${currentRequest.title}" validée par RH (${actorName}). En attente de votre validation.`,
                        'ACTION_REQUIRED',
                        'HIRING_REQUEST',
                        currentRequest.id,
                        ['APPROVE', 'REJECT']
                    );
                }
                
                console.log(`✅ HR approved, notified Direction`);
            }

            // ========== STEP 2: PLANT_MANAGER APPROVES → Notify RECRUITMENT_MANAGER ==========
            if (status === 'Approved' && actorRole === 'PLANT_MANAGER') {
                const [recruiters] = await db.query(`
                    SELECT User.id, User.name FROM User 
                    JOIN Role ON User.roleId = Role.id 
                    WHERE Role.name = 'RECRUITMENT_MANAGER'
                `);
                
                for (const recruiter of recruiters) {
                    await sendNotification(
                        approverId,
                        recruiter.id,
                        `✅ Demande d'embauche "${currentRequest.title}" validée par la Direction (${actorName}). Vous pouvez maintenant procéder au recrutement.`,
                        'INFO',
                        'HIRING_REQUEST',
                        currentRequest.id,
                        null
                    );
                }
                
                // Notify Requester of final approval
                await sendNotification(
                    approverId, 
                    currentRequest.requesterId, 
                    `🎉 Votre demande d'embauche "${currentRequest.title}" a été APPROUVÉE par la Direction (${actorName}).`
                );
                
                // Resolve all outstanding notifications
                await notificationService.resolveActions(
                    id, 
                    'HIRING_REQUEST', 
                    `Approuvée par la Direction (${actorName})`
                );
                
                console.log(`✅ Direction approved, notified Recruitment Manager and Requester`);
            }

            // ========== REJECTION HANDLING ==========
            if (status === 'Rejected') {
                const reasonText = rejectionReason ? `\n\n📝 Motif: ${rejectionReason}` : '';
                
                // Notify Requester
                await sendNotification(
                    approverId, 
                    currentRequest.requesterId, 
                    `❌ Votre demande d'embauche "${currentRequest.title}" a été REFUSÉE par ${actorName}.${reasonText}`
                );
                
                // Resolve all outstanding notifications
                await notificationService.resolveActions(
                    id, 
                    'HIRING_REQUEST', 
                    `Refusée par ${actorName}`
                );
                
                console.log(`❌ Request rejected by ${actorName}`);
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
