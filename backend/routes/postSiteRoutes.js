const express = require('express');
const router = express.Router();
const {
    getSites,
    getSiteByName,
    createSite,
    updateSite,
    refreshStats
} = require('../controllers/postSiteController');

router.route('/')
    .get(getSites)
    .post(createSite);

router.post('/refresh-stats', refreshStats);

router.route('/:name')
    .get(getSiteByName)
    .put(updateSite);

module.exports = router;
