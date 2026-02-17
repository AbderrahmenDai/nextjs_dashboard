const asyncHandler = require('express-async-handler');
const postSiteService = require('../services/postSiteService');

// @desc    Get all sites (PostSites)
// @route   GET /api/post-sites
// @access  Public (or Protected based on auth)
const getSites = asyncHandler(async (req, res) => {
    const sites = await postSiteService.getAllSites();
    res.json(sites);
});

// @desc    Get site by name
// @route   GET /api/post-sites/:name
// @access  Public
const getSiteByName = asyncHandler(async (req, res) => {
    const site = await postSiteService.getSiteByName(req.params.name);
    if (!site) {
        res.status(404);
        throw new Error('Site not found');
    }
    res.json(site);
});

// @desc    Create new site config
// @route   POST /api/post-sites
// @access  Private/Admin
const createSite = asyncHandler(async (req, res) => {
    const { name, budget } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Name is required (TT or TTG)');
    }
    const site = await postSiteService.createSite(req.body);
    res.status(201).json(site);
});

// @desc    Update site
// @route   PUT /api/post-sites/:name
// @access  Private/Admin
const updateSite = asyncHandler(async (req, res) => {
    const site = await postSiteService.updateSite(req.params.name, req.body);
    res.json(site);
});

// @desc    Manually trigger stats refresh
// @route   POST /api/post-sites/refresh-stats
// @access  Private/Admin
const refreshStats = asyncHandler(async (req, res) => {
    const { name } = req.body; // Optional specific site
    const sites = await postSiteService.refreshSiteStats(name);
    res.json(sites);
});

module.exports = {
    getSites,
    getSiteByName,
    createSite,
    updateSite,
    refreshStats
};
