const { HiringRequest, User, Department, Candidature } = require('../models');
const { Op } = require('sequelize');

const getAllHiringRequests = async ({ page, limit, requesterId, search, department, site } = {}) => {
    const where = {};
    const include = [
        {
            model: User,
            as: 'requester',
            attributes: ['id', 'name', 'email']
        },
        {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'role']
        },
        {
            model: Department,
            attributes: ['id', 'name', 'site'],
            where: {} // Initialize for potential filtering
        }
    ];

    // Filter by Requester
    if (requesterId) {
        where.requesterId = requesterId;
    }

    // Filter by Department Name (Frontend sends name)
    if (department) {
        // We need to filter on the associated Department model
        include[2].where = {
            ...include[2].where,
            name: department
        };
    }

    // Filter by Site
    if (site) {
        where.site = site;
    }

    // Search (Title or Requester Name)
    if (search) {
        const searchPattern = `%${search}%`;
        where[Op.or] = [
            { title: { [Op.like]: searchPattern } },
            // To search by requester name, strictly we can't do it easily in the top-level WHERE 
            // without using Sequelize literal or a separate required include with where.
            // But since 'requester' is an include, if we put where clause there it becomes an inner join.
            // Let's keep it simple: Search title OR add condition to requester include.
            // Complex OR across associations is tricky in Sequelize.
            // Often easiest is to use a literal in the top-level where:
            // '$requester.name$': { [Op.like]: searchPattern }
        ];
        
        // Let's try the $association.field$ syntax which Sequelize supports for includes
         where[Op.or].push({
             '$requester.name$': { [Op.like]: searchPattern }
         });
    }

    // Sorting
    const order = [['createdAt', 'DESC']];

    // Execution
    if (page && limit) {
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await HiringRequest.findAndCountAll({
            where,
            include,
            limit: Number(limit),
            offset: Number(offset),
            order,
            distinct: true // Important for correct count with includes
        });
        
        // Flatten logic matching the old service?
        // Old service returned: hr.*, departmentName, requesterName, approverName
        const data = rows.map(r => {
            const plain = r.get({ plain: true });
            return {
                ...plain,
                departmentName: plain.Department ? plain.Department.name : null,
                requesterName: plain.requester ? plain.requester.name : null,
                approverName: plain.approver ? plain.approver.name : null,
                // Ensure we return the included objects too if frontend needs them, 
                // but the old service flattened specific fields. We can keep both.
            };
        });

        return {
            data,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        };
    } else {
        const rows = await HiringRequest.findAll({
            where,
            include,
            order
        });
        
         return rows.map(r => {
            const plain = r.get({ plain: true });
            return {
                ...plain,
                departmentName: plain.Department ? plain.Department.name : null,
                requesterName: plain.requester ? plain.requester.name : null,
                approverName: plain.approver ? plain.approver.name : null,
            };
        });
    }
};

const getHiringRequestById = async (id) => {
    const request = await HiringRequest.findByPk(id, {
        include: [
            {
                model: User,
                as: 'requester',
                attributes: ['id', 'name']
            },
            {
                model: User,
                as: 'approver',
                attributes: ['id', 'name']
            },
            {
                model: Department,
                attributes: ['id', 'name']
            }
        ]
    });

    if (!request) return null;

    const plain = request.get({ plain: true });
    return {
        ...plain,
        departmentName: plain.Department ? plain.Department.name : null,
        requesterName: plain.requester ? plain.requester.name : null,
        approverName: plain.approver ? plain.approver.name : null,
    };
};

const createHiringRequest = async (data) => {
    // Data preparation
    const requestData = {
        title: data.title,
        departmentId: data.departmentId || null,
        category: data.category,
        status: data.status || 'Pending HR',
        requesterId: data.requesterId || null,
        description: data.description,
        budget: data.budget,
        contractType: data.contractType,
        reason: data.reason,
        site: data.site,
        businessUnit: data.businessUnit,
        desiredStartDate: data.desiredStartDate ? new Date(data.desiredStartDate) : null,
        replacementFor: data.replacementFor || null,
        replacementReason: data.replacementReason || null,
        increaseType: data.increaseType,
        increaseDateRange: data.increaseDateRange,
        educationRequirements: data.educationRequirements,
        skillsRequirements: data.skillsRequirements,
        roleId: data.roleId || null
    };

    const newRequest = await HiringRequest.create(requestData);
    return await getHiringRequestById(newRequest.id);
};

const updateHiringRequest = async (id, data) => {
    const updateableColumns = [
        'title', 'departmentId', 'category', 'status', 'description', 'budget', 'contractType', 'reason',
        'site', 'businessUnit', 'desiredStartDate', 'replacementFor', 'replacementReason', 
        'increaseType', 'increaseDateRange', 'educationRequirements', 'skillsRequirements',
        'rejectionReason', 'approverId', 'approvedAt'
    ];

    const updateData = {};
    Object.keys(data).forEach(key => {
        if (updateableColumns.includes(key)) {
             if ((key === 'desiredStartDate' || key === 'approvedAt') && data[key]) {
                updateData[key] = new Date(data[key]);
            } else {
                updateData[key] = data[key];
            }
        }
    });

    await HiringRequest.update(updateData, { where: { id } });
    return await getHiringRequestById(id);
};

const deleteHiringRequest = async (id) => {
    await HiringRequest.destroy({ where: { id } });
    return { message: 'Deleted successfully' };
};

module.exports = {
    getAllHiringRequests,
    getHiringRequestById,
    createHiringRequest,
    updateHiringRequest,
    deleteHiringRequest
};
