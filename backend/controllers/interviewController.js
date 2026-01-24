const asyncHandler = require('express-async-handler');
const interviewService = require('../services/interviewService');
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
