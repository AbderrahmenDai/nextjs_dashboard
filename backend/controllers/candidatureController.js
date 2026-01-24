const asyncHandler = require('express-async-handler');
const candidatureService = require('../services/candidatureService');

const getCandidatures = asyncHandler(async (req, res) => {
    const items = await candidatureService.getAllCandidatures();
    res.json(items);
});

const createCandidature = asyncHandler(async (req, res) => {
    const newItem = await candidatureService.createCandidature(req.body);
    res.status(201).json(newItem);
});

const updateCandidature = asyncHandler(async (req, res) => {
    const updated = await candidatureService.updateCandidature(req.params.id, req.body);
    res.json(updated);
});

const deleteCandidature = asyncHandler(async (req, res) => {
    await candidatureService.deleteCandidature(req.params.id);
    res.json({ message: 'Deleted successfully' });
});

module.exports = {
    getCandidatures,
    createCandidature,
    updateCandidature,
    deleteCandidature
};
