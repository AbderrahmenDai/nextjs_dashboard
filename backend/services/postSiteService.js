const { PostSite, Department, User } = require('../models');

const getAllSites = async () => {
    return await PostSite.findAll();
};

const getSiteByName = async (name) => {
    return await PostSite.findOne({ where: { name } });
};

const createSite = async (data) => {
    return await PostSite.create(data);
};

const updateSite = async (name, data) => {
    await PostSite.update(data, { where: { name } });
    return await getSiteByName(name);
};

// Recalculate stats for a site (or all sites)
const refreshSiteStats = async (siteName) => {
    const whereClause = siteName ? { name: siteName } : {};
    const sites = await PostSite.findAll({ where: whereClause });

    for (const site of sites) {
        // Count Departments
        const deptCount = await Department.count({ where: { site: site.name } });
        
        // Count Employees (Users in those departments)
        // We need to join with Department to filter by site
        const employeeCount = await User.count({
            include: [{
                model: Department,
                as: 'departmentData',
                where: { site: site.name }
            }]
        });

        await site.update({
            numberOfDepartments: deptCount,
            numberOfEmployees: employeeCount
        });
    }

    return await PostSite.findAll({ where: whereClause });
};

module.exports = {
    getAllSites,
    getSiteByName,
    createSite,
    updateSite,
    refreshSiteStats
};
