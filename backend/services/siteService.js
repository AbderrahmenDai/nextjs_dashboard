const db = require('../config/db');

// Get all sites
const getAllSites = async () => {
    const [sites] = await db.query('SELECT * FROM Site');
    
    // Check if empty and seed if necessary (handled by schema.sql mostly, but safe fallback)
    if (sites.length === 0) {
        // Just return empty array, assuming user runs schema.sql to seed
         return [];
    }

    return sites;
};

// Update site
const updateSite = async (id, siteData) => {
    await db.query('UPDATE Site SET budget = ? WHERE id = ?', [siteData.budget, id]);
    const [site] = await db.query('SELECT * FROM Site WHERE id = ?', [id]);
    return site[0];
};

module.exports = {
    getAllSites,
    updateSite
};
