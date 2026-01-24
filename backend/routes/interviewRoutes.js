const express = require('express');
const router = express.Router();
const {
    getAllInterviews,
    getInterviewsByCandidature,
    createInterview,
    updateInterview,
    deleteInterview
} = require('../controllers/interviewController');

// Get all interviews
router.get('/', getAllInterviews);

// Get interviews for a specific candidature
router.get('/candidature/:candidatureId', getInterviewsByCandidature);

// Create, Update, Delete
router.post('/', createInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
