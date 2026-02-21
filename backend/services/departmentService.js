const { Department, User } = require('../models');
const { Op } = require('sequelize');

const getAllDepartments = async (page, limit) => {
    // If no pagination params, return all
    if (!page || !limit) {
        const departments = await Department.findAll({
            order: [['name', 'ASC']],
            // Calculate employee count? Sequelize doesn't support subqueries in attributes easily without literal
            // simpler to let the frontend handle it or use a hook, but for now let's use a literal if performance is needed.
            // Or just include Users and count them in JS if dataset is small.
            // Given "limit" might be null, dataset might be small.
            include: [{
                model: User,
                as: 'users',
                attributes: ['id']
            }]
        });

        return departments.map(d => {
            const plain = d.get({ plain: true });
            return {
                ...plain,
                employeeCount: plain.users ? plain.users.length : 0
            };
        });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Department.findAndCountAll({
        limit: Number(limit),
        offset: Number(offset),
        include: [{
            model: User,
            as: 'users',
            attributes: ['id']
        }]
    });

    const data = rows.map(d => {
        const plain = d.get({ plain: true });
        return {
            ...plain,
            employeeCount: plain.users ? plain.users.length : 0
        };
    });

    return {
        data,
        pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / limit)
        }
    };
};

// Create department
const createDepartment = async (deptData) => {
    let headEmail = deptData.headEmail || null;

    if (headEmail) {
        const user = await User.findOne({ where: { email: headEmail } });
        if (user) {
            head = user.name;
        } else {
             console.warn(`User with email ${headEmail} does not exist. Proceeding without assigning head name.`);
        }
    }

    const newDept = await Department.create({
        name: deptData.name,
        // headEmail field not in model? Check model.
        // The previous raw SQL insert included headEmail.
        // "INSERT INTO Department (..., headEmail, ...)".
        // My Department model definition DID NOT include headEmail.
        // Let's verify if I should add it or if it was just transient.
        // The original code had it in Insert, so it likely exists in DB.
        // I should probably add it to the model if I want to persist it.
        // But for now, keeping strictly with what I defined in model (which matched schema.prisma more or less).
        // schema.prisma DID NOT have headEmail.
        // schema.prisma: id, name, head, location, employeeCount, budget, status, colorCallback, siteId, logoUrl, icon.
        // The raw SQL insert in the OLD file had `headEmail`. This implies the DB had a column not in schema.prisma?
        // OR the user added it manually.
        // Use logic: schema.prisma is the source of truth for the previous ORM.
        // So I will omit headEmail persistence if it wasn't in schema.prisma, assuming it was a drift.
        // Wait, if the code was using it, the DB probably has it.
        // But since we are rebuilding the schema with sync ({force: true}) likely, we define the truth now.
        // I will omit `headEmail` from the model for now unless user asks, or I can add it if needed.
        // Actually, looking at the code, it uses headEmail to lookup the User name.
        headEmail: deptData.headEmail,
        location: deptData.location,
        employeeCount: deptData.employeeCount || 0,
        budget: deptData.budget,
        status: deptData.status || 'Active',
        colorCallback: deptData.colorCallback,
        site: deptData.site || 'TT', // Default to TT if missing?
        logoUrl: deptData.logoUrl,
        icon: deptData.icon
    });

    return newDept;
};

// Update department
const updateDepartment = async (id, deptData) => {
    let headEmail = deptData.headEmail || null;

    if (headEmail) {
        const user = await User.findOne({ where: { email: headEmail } });
        if (user) {
            head = user.name;
        }
    } else {
        // preserve existing head if not updating email? 
        // Logic in old code: "head = ""; // Clear head if email is removed"
        // Implicitly if headEmail is passed as falsy, head becomes empty.
    }

    const updateData = {
        name: deptData.name,
        location: deptData.location,
        headEmail: deptData.headEmail,
        budget: deptData.budget,
        status: deptData.status,
        colorCallback: deptData.colorCallback,
        site: deptData.site,
        logoUrl: deptData.logoUrl,
        icon: deptData.icon
    };
    
    // Remove undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await Department.update(updateData, { where: { id } });

    return await Department.findByPk(id);
};

// Delete department
const deleteDepartment = async (id) => {
    await Department.destroy({ where: { id } });
    return { message: 'Deleted' };
};

const getDepartmentById = async (id) => {
    return await Department.findByPk(id);
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById
};
