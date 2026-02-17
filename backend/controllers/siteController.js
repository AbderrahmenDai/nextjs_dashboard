const asyncHandler = require('express-async-handler');

// Defined Enum Values
// Sites: ['TT', 'TTG']
const SITES = [
    { id: '1', name: 'TT' },
    { id: '2', name: 'TTG' }
];

// @desc    Get all sites
// @route   GET /api/sites
// @access  Public
const getSites = asyncHandler(async (req, res) => {
    res.json(SITES);
});

// @desc    Update site
// @route   PUT /api/sites/:id
// @access  Public
const updateSite = asyncHandler(async (req, res) => {
    res.status(405).json({ message: 'Sites are now static and cannot be updated dynamically.' });
});

module.exports = {
    getSites,
    updateSite
};
