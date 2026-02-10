const asyncHandler = require('express-async-handler');
const candidatureService = require('../services/candidatureService');

const getCandidatures = asyncHandler(async (req, res) => {
    const { page, limit, department, search, status } = req.query;
    const result = await candidatureService.getAllCandidatures({ page, limit, department, search, status });
    res.json(result);
});

const createCandidature = asyncHandler(async (req, res) => {
    console.log("📝 Creating candidature...", req.body);
    if (req.file) {
        console.log("mb_found_file", req.file);
        // Normalize path separators to forward slashes for consistency
        req.body.cvPath = req.file.path.replace(/\\/g, '/');
    }
    const newItem = await candidatureService.createCandidature(req.body);
    res.status(201).json(newItem);
});

const updateCandidature = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.cvPath = req.file.path.replace(/\\/g, '/');
    }
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
