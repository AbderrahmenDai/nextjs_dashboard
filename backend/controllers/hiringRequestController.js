const asyncHandler = require('express-async-handler');
const hiringRequestService = require('../services/hiringRequestService');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');
const { User } = require('../models');
const { Op } = require('sequelize');

const getHiringRequests = asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const requesterId = req.query.requesterId || null;
    const search = req.query.search || null;
    const department = req.query.department || null;
    const site = req.query.site || null;
    
    const result = await hiringRequestService.getAllHiringRequests({ 
        page, limit, requesterId, search, department, site 
    });
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
    const requester = await User.findByPk(requesterId);

    if (!requester) {
        res.status(404);
        throw new Error('User not found');
    }

    const userRole = requester.role; // Enum value
    
    // 2. Determine Workflow
    let initialStatus = 'Pending HR';
    let targetApprovers = [];
    
    // Check if user is an HR role
    // Enum values: ["responsable recrutement", "plant manger", "drh", "responsable RH", "demander "]
    const isHrRole = ['responsable rh', 'responsable recrutement', 'drh'].includes(userRole);

    console.log(`[CreateHiringRequest] User: ${requester.name}, Role: ${userRole}, isHrRole: ${isHrRole}`);

    if (isHrRole) {
        // --- HR Workflow ---
        // Step 1: Notify "Directeur RH" (drh) -> Status: "Pending HR Director"
        initialStatus = 'Pending HR Director';
        
        targetApprovers = await User.findAll({
            where: {
                role: 'drh'
            }
        });

        if (targetApprovers.length === 0) {
            console.warn("[CreateHiringRequest] ⚠️ No Directeur RH (drh) found for HR Workflow!");
        } else {
            console.log(`[CreateHiringRequest] HR Workflow. Target: drh (Found ${targetApprovers.length})`);
        }

    } else {
        // --- Standard Workflow (DEMANDEUR) ---
        // Notify Responsable RH
        initialStatus = 'Pending Responsable RH';
        
        targetApprovers = await User.findAll({
            where: {
                role: 'responsable RH'
            }
        });

        if (targetApprovers.length === 0) {
            console.warn(`[CreateHiringRequest] No 'responsable RH' found. Falling back to 'drh' as backup if sensible? Or generic HR?`);
            // Attempt fallback or just log
            // Check for 'responsable recrutement' maybe?
             const recruiters = await User.findAll({ where: { role: 'responsable recrutement' } });
             if (recruiters.length > 0) {
                 targetApprovers = recruiters;
                 console.log("Fallback to 'responsable recrutement'");
             }
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
                message: `📋 Nouvelle demande d'embauche de ${requester.name}: "${newItem.title}" - En attente de votre validation`,
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

    // Fetch Actor (Approver) from DB
    let actorRole = 'Unknown';
    let actorName = 'Unknown';
    let actorUser = null;

    if (approverId) {
        actorUser = await User.findByPk(approverId);
        if (actorUser) {
            actorName = actorUser.name;
            actorRole = actorUser.role;
        }
    }

    if (!actorUser) {
        console.warn('[UpdateHiringRequest] ⚠️ No approver found for ID:', approverId);
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
                const isDirector = actorRole === 'drh';
                const approverLabel = isDirector ? 'Directeur RH' : 'Responsable RH';
                
                console.log(`[UpdateHiringRequest] HR/DRH Approved. Actor Role: ${actorRole}`);

                // Resolve HR/DRH notifications
                await notificationService.resolveActions(
                    id, 
                    'HIRING_REQUEST', 
                    `Validée par ${actorName} (${approverLabel})`
                );

                // Start Notification to Plant Manager / Direction ('plant manger')
                const directors = await User.findAll({
                    where: {
                        role: 'plant manger' // Using the specific typo string requested
                    }
                });
                
                if (directors.length === 0) {
                    console.warn('[UpdateHiringRequest] ⚠️ No Plant Manager found!');
                }

                for (const director of directors) {
                    await sendNotification(
                        approverId,
                        director.id,
                        `✅ Demande d'embauche "${currentRequest.title}" validée par ${approverLabel} (${actorName}). En attente de votre validation.`,
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
                    `ℹ️ Votre demande "${currentRequest.title}" a été validée par les RH/Direction (${approverLabel}) et transmise au Plant Manager.`
                );
            }

            // ========== STEP 2: PLANT_MANAGER APPROVES → Notify RECRUITMENT_MANAGER ==========
            if (status === 'Approved') {
                console.log(`[UpdateHiringRequest] Final Approval. Actor Role: ${actorRole}`);

                const recruiters = await User.findAll({
                    where: {
                        role: 'responsable recrutement'
                    }
                });
                
                if (recruiters.length === 0) {
                    console.warn('[UpdateHiringRequest] ⚠️ No Recruitment Manager found!');
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

                // Notify Recruitment Manager (responsable recrutement)
                const recruiters = await User.findAll({
                     where: { role: 'responsable recrutement' }
                });
                
                for (const recruiter of recruiters) {
                    await sendNotification(
                        approverId,
                        recruiter.id,
                        `❌ Demande d'embauche "${currentRequest.title}" REFUSÉE par ${actorName}.${reasonText}`,
                        'INFO',
                        'HIRING_REQUEST',
                        currentRequest.id
                    );
                }
                
                // Resolve all outstanding notifications
                await notificationService.resolveActions(
                    id, 
                    'HIRING_REQUEST', 
                    `Refusée par ${actorName}`
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
