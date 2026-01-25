const asyncHandler = require('express-async-handler');
const interviewService = require('../services/interviewService');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');

console.log('Interview Controller Loaded. Service:', interviewService);

const getAllInterviews = asyncHandler(async (req, res) => {
    const items = await interviewService.getAllInterviews();
    if (!Array.isArray(items)) {
        console.error("SERVICE RETURNED NON-ARRAY:", items);
        return res.json([]); 
    }
    res.json(items);
});

const getInterviewsByCandidature = asyncHandler(async (req, res) => {
    const items = await interviewService.getInterviewsByCandidature(req.params.candidatureId);
    res.json(items);
});

const createInterview = asyncHandler(async (req, res) => {
    const newItem = await interviewService.createInterview(req.body);

    // Notify Interviewer
    if (newItem.interviewerId) {
        try {
            const notification = await notificationService.createNotification({
                senderId: 'system', // Or current user ID if available in req.user
                receiverId: newItem.interviewerId,
                message: `You have been assigned a new interview for ${newItem.candidateName || 'a candidate'} on ${new Date(newItem.date).toLocaleDateString()}`
            });
            
            socketService.sendNotificationToUser(newItem.interviewerId, notification);
        } catch (error) {
            console.error('Failed to send notification for new interview:', error);
        }
    }

    res.status(201).json(newItem);
});

const updateInterview = asyncHandler(async (req, res) => {
    const updatedItem = await interviewService.updateInterview(req.params.id, req.body);
    res.json(updatedItem);
});

const deleteInterview = asyncHandler(async (req, res) => {
    await interviewService.deleteInterview(req.params.id);
    res.json({ message: 'Interview deleted' });
});

module.exports = {
    getAllInterviews,
    getInterviewsByCandidature,
    createInterview,
    updateInterview,
    deleteInterview
};
