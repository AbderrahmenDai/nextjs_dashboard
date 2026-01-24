const siteService = require('../services/siteService');
const asyncHandler = require('express-async-handler');

// @desc    Get all sites
// @route   GET /api/sites
// @access  Public
const getSites = asyncHandler(async (req, res) => {
    const sites = await siteService.getAllSites();
    res.json(sites);
});

// @desc    Update site
// @route   PUT /api/sites/:id
// @access  Public
const updateSite = asyncHandler(async (req, res) => {
    const site = await siteService.updateSite(req.params.id, req.body);
    res.json(site);
});

module.exports = {
    getSites,
    updateSite
};
