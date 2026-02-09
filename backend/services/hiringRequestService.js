const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllHiringRequests = async (page, limit, requesterId = null) => {
    // If no pagination params, return all (with optional filter)
    if (!page || !limit) {
        let sql = `
            SELECT 
                hr.*, 
                d.name as departmentName, 
                u.name as requesterName,
                app.name as approverName
            FROM HiringRequest hr
            LEFT JOIN Department d ON hr.departmentId = d.id
            LEFT JOIN User u ON hr.requesterId = u.id
            LEFT JOIN User app ON hr.approverId = app.id
        `;
        const params = [];
        if (requesterId) {
             sql += ` WHERE hr.requesterId = ?`;
             params.push(requesterId);
        }
        sql += ` ORDER BY hr.createdAt DESC`;
        
        const [rows] = await db.query(sql, params);
        return rows;
    }

    const offset = (page - 1) * limit;

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM HiringRequest';
    const countParams = [];
    if (requesterId) {
        countSql += ' WHERE requesterId = ?';
        countParams.push(requesterId);
    }
    const [countResult] = await db.query(countSql, countParams);
    const total = countResult[0].total;

    // Join with Department and User for names
    let sql = `
        SELECT 
            hr.*, 
            d.name as departmentName, 
            u.name as requesterName,
            app.name as approverName
        FROM HiringRequest hr
        LEFT JOIN Department d ON hr.departmentId = d.id
        LEFT JOIN User u ON hr.requesterId = u.id
        LEFT JOIN User app ON hr.approverId = app.id
    `;
    const params = [];
    if (requesterId) {
        sql += ` WHERE hr.requesterId = ?`;
        params.push(requesterId);
    }
    sql += ` ORDER BY hr.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(sql, params);
    
    return {
        data: rows,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getHiringRequestById = async (id) => {
    const sql = `
        SELECT 
            hr.*, 
            d.name as departmentName, 
            u.name as requesterName,
            app.name as approverName
        FROM HiringRequest hr
        LEFT JOIN Department d ON hr.departmentId = d.id
        LEFT JOIN User u ON hr.requesterId = u.id
        LEFT JOIN User app ON hr.approverId = app.id
        WHERE hr.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
};

const createHiringRequest = async (data) => {
    const id = uuidv4();
    const sql = `
        INSERT INTO HiringRequest (
            id, title, departmentId, category, status, requesterId, 
            description, budget, contractType, reason, createdAt,
            site, businessUnit, desiredStartDate, replacementFor, replacementReason,
            increaseType, increaseDateRange, educationRequirements, skillsRequirements, roleId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        id, 
        data.title, 
        data.departmentId || null, 
        data.category, 
        data.status || 'Pending HR', 
        data.requesterId || null,
        data.description, 
        data.budget, 
        data.contractType, 
        data.reason,
        new Date(), // createdAt
        data.site,
        data.businessUnit,
        data.desiredStartDate ? new Date(data.desiredStartDate) : null,
        data.replacementFor || null,
        data.replacementReason || null,
        data.increaseType,
        data.increaseDateRange,
        data.educationRequirements,
        data.skillsRequirements,
        data.roleId || null
    ];

    await db.query(sql, values);
    return getHiringRequestById(id);
};

const updateHiringRequest = async (id, data) => {
    // Dynamic update building would be better, but sticking to pattern for now
    // We fetch existing first to merge? Or just update what's passed?
    // Let's do a somewhat dynamic update to be safe against missing fields overwriting with NULL if we pass partial data to Service
    // But the controller usually passes everything or we trust the frontend. 
    // Let's rewrite this to be dynamic to be safe.
    
    const fields = [];
    const values = [];
    
    const updateableColumns = [
        'title', 'departmentId', 'category', 'status', 'description', 'budget', 'contractType', 'reason',
        'site', 'businessUnit', 'desiredStartDate', 'replacementFor', 'replacementReason', 
        'increaseType', 'increaseDateRange', 'educationRequirements', 'skillsRequirements',
        'rejectionReason', 'approverId', 'approvedAt'
    ];

    for (const key of Object.keys(data)) {
        if (updateableColumns.includes(key)) {
            fields.push(`${key} = ?`);
            if ((key === 'desiredStartDate' || key === 'approvedAt') && data[key]) {
                values.push(new Date(data[key]));
            } else {
                values.push(data[key]);
            }
        }
    }

    if (fields.length === 0) return getHiringRequestById(id);

    values.push(id);
    const sql = `UPDATE HiringRequest SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return getHiringRequestById(id);
};

const deleteHiringRequest = async (id) => {
    await db.query('DELETE FROM HiringRequest WHERE id = ?', [id]);
    return { message: 'Deleted successfully' };
};

module.exports = {
    getAllHiringRequests,
    getHiringRequestById,
    createHiringRequest,
    updateHiringRequest,
    deleteHiringRequest
};
