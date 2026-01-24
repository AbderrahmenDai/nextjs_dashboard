const asyncHandler = require('express-async-handler');
const hiringRequestService = require('../services/hiringRequestService');

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
