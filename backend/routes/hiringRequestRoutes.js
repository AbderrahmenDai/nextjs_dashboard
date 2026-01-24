const express = require('express');
const router = express.Router();
const {
    getHiringRequests,
    getHiringRequest,
    createHiringRequest,
    updateHiringRequest,
    deleteHiringRequest
} = require('../controllers/hiringRequestController');

router.route('/')
    .get(getHiringRequests)
    .post(createHiringRequest);

router.route('/:id')
    .get(getHiringRequest)
    .put(updateHiringRequest)
    .delete(deleteHiringRequest);

module.exports = router;
