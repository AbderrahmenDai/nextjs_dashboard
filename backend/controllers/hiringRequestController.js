const asyncHandler = require('express-async-handler');
const hiringRequestService = require('../services/hiringRequestService');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');
const db = require('../config/db'); // Needed to query users by role

const getHiringRequests = asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const requesterId = req.query.requesterId || null;
    
    const result = await hiringRequestService.getAllHiringRequests(page, limit, requesterId);
    res.json(result);
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

    // 1. Verify Requester Role
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
    
    // Allow DEMANDEUR and HR Roles


    // 2. Determine Workflow
    let initialStatus = 'Pending HR';
    let targetApprovers = [];
    const { site } = req.body;

    // Check if user is an HR role (Responsable RH matches legacy, plus new roles)
    const roleLower = userRole.toLowerCase();
    const isHrRole = roleLower.includes('responsable rh') || 
                     roleLower.includes('recrutement') || 
                     roleLower.includes('human resources') ||
                     roleLower.includes('hr_manager');

    console.log(`[CreateHiringRequest] User: ${requester[0].name}, Role: ${userRole}, isHrRole: ${isHrRole}`);

    if (isHrRole) {
        // --- HR Workflow ---
        // Step 1: Notify "Directeur RH" -> Status: "Pending HR Director"
        initialStatus = 'Pending HR Director';
        // Use LIKE for robustness
        const [hrDirectors] = await db.query(
            `SELECT User.id, User.name FROM User 
             JOIN Role ON User.roleId = Role.id 
             WHERE Role.name LIKE '%Directeur RH%' OR Role.name LIKE '%DRH%' OR Role.name = 'HR_DIRECTOR'`
        );
        targetApprovers = hrDirectors;

        if (hrDirectors.length === 0) {
            console.warn("[CreateHiringRequest] ⚠️ No Directeur RH (DRH) found for HR Workflow!");
        } else {
            console.log(`[CreateHiringRequest] HR Workflow. Target: Directeur RH (Found ${hrDirectors.length}: ${hrDirectors.map(u => u.name).join(', ')})`);
        }
        console.log(`[CreateHiringRequest] HR Workflow. Target: Directeur RH (Found ${hrDirectors.length})`);

        } else {
            // --- Standard Workflow (DEMANDEUR) ---
            // Notify Responsable RH
            initialStatus = 'Pending Responsable RH';
            
            console.log(`[CreateHiringRequest] Standard Workflow: Searching for Responsable RH...`);

            // Use LIKE to be robust against whitespace or minor variations
            const [hrUsers] = await db.query(
                `SELECT User.id, User.name, Role.name as roleName FROM User 
                 JOIN Role ON User.roleId = Role.id 
                 WHERE Role.name LIKE 'Responsable RH%' OR Role.name = 'HR_MANAGER'` 
            );

            console.log(`[CreateHiringRequest] Found ${hrUsers.length} HR users:`, hrUsers.map(u => `${u.name} (${u.roleName})`).join(', '));
            
            // Filter: Target explicit "Responsable RH" first
            const specificRH = hrUsers.filter(u => u.roleName.trim() === 'Responsable RH');
            
            if (specificRH.length > 0) {
                targetApprovers = specificRH;
                console.log(`[CreateHiringRequest] Prioritizing specific Responsable RH users: ${specificRH.map(u => u.name).join(', ')}`);
            } else {
                targetApprovers = hrUsers;
                console.log(`[CreateHiringRequest] No specific 'Responsable RH' found. Falling back to all HR_MANAGERs.`);
            }
        }

    let newItem;
    try {
        const requestData = { ...req.body, status: initialStatus };
        newItem = await hiringRequestService.createHiringRequest(requestData);
        console.log(`[CreateHiringRequest] Created Request ID: ${newItem.id} with status ${initialStatus}`);
    } catch (err) {
        console.error("❌ Error creating hiring request:", err);
        res.status(500);
        throw new Error(`Creation failed: ${err.message}`);
    }
    
    // Send Notifications
    try {
        if (targetApprovers.length === 0) {
            console.warn("[CreateHiringRequest] ⚠️ NO APPROVERS FOUND. Checking DB seeding.");
        }

        for (const approver of targetApprovers) {
            const notification = await notificationService.createNotification({
                senderId: requesterId, 
                receiverId: approver.id,
                message: `📋 Nouvelle demande d'embauche de ${requester[0].name}: "${newItem.title}" - En attente de votre validation`,
                type: 'ACTION_REQUIRED',
                entityType: 'HIRING_REQUEST',
                entityId: newItem.id,
                actions: ['APPROVE', 'REJECT']
            });
            
            socketService.sendNotificationToUser(approver.id, notification);
            console.log(`✅ Notification sent to approver: ${approver.name} (ID: ${approver.id})`);
        }
    } catch (error) {
        console.error('Failed to send notifications for new hiring request:', error);
    }

    res.status(201).json(newItem);
});

const updateHiringRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason, approverId } = req.body;
    
    console.log(`[UpdateHiringRequest] Processing ID: ${id}, Approver: ${approverId}`);

    // Fetch Actor (Approver) from DB since we lack JWT auth middleware
    let actorRole = 'Unknown';
    let actorName = 'Unknown';
    let actorUser = null;

    if (approverId) {
        const [users] = await db.query(`
            SELECT User.*, Role.name as roleName 
            FROM User 
            LEFT JOIN Role ON User.roleId = Role.id 
            WHERE User.id = ?
        `, [approverId]);
        
        if (users.length > 0) {
            actorUser = users[0];
            actorName = actorUser.name;
            actorRole = actorUser.roleName || actorUser.role; // Handle both cases
        }
    }

    if (!actorUser) {
        console.warn('[UpdateHiringRequest] ⚠️ No approver found for ID:', approverId);
         // Fallback or error? Let's error if strictly needed for logic
         // But maybe status update doesn't need it?
         // Logic below relies on actorRole. So we should probably require it for status changes.
    }

    // Fetch Current Request
    const currentRequest = await hiringRequestService.getHiringRequestById(id);
    
    if (!currentRequest) {
        res.status(404);
        throw new Error('Hiring Request not found');
    }


    // Perform Update
    const updated = await hiringRequestService.updateHiringRequest(id, req.body);
    
    // SEQUENTIAL APPROVAL WORKFLOW LOGIC
    if (status && status !== currentRequest.status) {
        try {
            // ========== STEP 1: HR (Responsable RH or DRH) APPROVES → Notify PLANT_MANAGER (Direction) ==========
            // Logic: If status moved TO 'Pending Plant Manager', it means HR or DRH approved it.
            if (status === 'Pending Plant Manager') {
                const isDirector = (actorRole || '').toLowerCase().includes('directeur') || (actorRole || '').toLowerCase().includes('director');
                console.log(`[UpdateHiringRequest] HR/DRH Approved. Actor Role: ${actorRole} (Is Director: ${isDirector})`);

                // Resolve HR/DRH notifications
                await notificationService.resolveActions(
                    id, 
                    'HIRING_REQUEST', 
                    `Validée par ${actorName} (${isDirector ? 'Directeur RH' : 'Responsable RH'})`
                );

                // Start Notification to Plant Manager / Direction
                const [directors] = await db.query(`
                    SELECT User.id, User.name, Role.name as roleName 
                    FROM User 
                    JOIN Role ON User.roleId = Role.id 
                    WHERE Role.name LIKE '%Plant Manager%' OR Role.name LIKE '%PLANT_MANAGER%' OR Role.name LIKE '%Direction%'
                `);
                
                if (directors.length === 0) {
                    console.warn('[UpdateHiringRequest] ⚠️ No Plant Manager/Direction found to notify!');
                }

                for (const director of directors) {
                    await sendNotification(
                        approverId,
                        director.id,
                        `✅ Demande d'embauche "${currentRequest.title}" validée par ${isDirector ? 'Directeur RH' : 'Responsable RH'} (${actorName}). En attente de votre validation.`,
                        'ACTION_REQUIRED',
                        'HIRING_REQUEST',
                        currentRequest.id,
                        ['APPROVE', 'REJECT']
                    );
                    console.log(`   ➡ Notified Plant Manager: ${director.name}`);
                }

                // Notify Requester of progress
                await sendNotification(
                    approverId,
                    currentRequest.requesterId,
                    `ℹ️ Votre demande "${currentRequest.title}" a été validée par les RH/Direction (${actorName}) et transmise au Plant Manager.`
                );
                
                console.log(`✅ HR/DRH approved, notified Plant Manager and Requester`);
            }

            // ========== STEP 2: PLANT_MANAGER APPROVES → Notify RECRUITMENT_MANAGER ==========
            // Logic: If status moved TO 'Approved', it means Plant Manager/Direction validated it.
            if (status === 'Approved') {
                console.log(`[UpdateHiringRequest] Final Approval. Actor Role: ${actorRole}`);

                const [recruiters] = await db.query(`
                    SELECT User.id, User.name, Role.name as roleName 
                    FROM User 
                    JOIN Role ON User.roleId = Role.id 
                    WHERE Role.name LIKE '%RECRUITMENT_MANAGER%' OR Role.name LIKE '%RESPONSABLE_RECRUTEMENT%'
                `);
                
                if (recruiters.length === 0) {
                    console.warn('[UpdateHiringRequest] ⚠️ No Recruitment Manager found to notify!');
                }

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
                console.log(`✅ Requester notified of rejection`);

                // Notify Recruitment Manager (Required: Notify on refusal by HR or Direction)
                const [recruiters] = await db.query(`
                    SELECT User.id, User.name, Role.name as roleName 
                    FROM User 
                    JOIN Role ON User.roleId = Role.id 
                    WHERE Role.name LIKE '%RECRUITMENT_MANAGER%' OR Role.name LIKE '%RESPONSABLE_RECRUTEMENT%'
                `);
                
                if (recruiters.length === 0) {
                    console.warn('[UpdateHiringRequest] ⚠️ No Recruitment Manager found to notify of rejection!');
                }

                for (const recruiter of recruiters) {
                    await sendNotification(
                        approverId,
                        recruiter.id,
                        `❌ Demande d'embauche "${currentRequest.title}" REFUSÉE par ${actorName}.${reasonText}`,
                        'INFO',
                        'HIRING_REQUEST',
                        currentRequest.id
                    );
                    console.log(`   ➡ Notified Recruitment Manager of rejection: ${recruiter.name}`);
                }
                
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
