const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllHiringRequests = async () => {
    // Join with Department and User for names
    const sql = `
        SELECT 
            hr.*, 
            d.name as departmentName, 
            u.name as requesterName 
        FROM HiringRequest hr
        LEFT JOIN Department d ON hr.departmentId = d.id
        LEFT JOIN User u ON hr.requesterId = u.id
        ORDER BY hr.createdAt DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
};

const getHiringRequestById = async (id) => {
    const sql = `
        SELECT 
            hr.*, 
            d.name as departmentName, 
            u.name as requesterName 
        FROM HiringRequest hr
        LEFT JOIN Department d ON hr.departmentId = d.id
        LEFT JOIN User u ON hr.requesterId = u.id
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
            description, budget, contractType, reason, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
        id, 
        data.title, 
        data.departmentId, 
        data.category, 
        data.status || 'Pending HR', 
        data.requesterId,
        data.description, 
        data.budget, 
        data.contractType, 
        data.reason
    ];

    await db.query(sql, values);
    return getHiringRequestById(id);
};

const updateHiringRequest = async (id, data) => {
    const sql = `
        UPDATE HiringRequest SET
        title=?, departmentId=?, category=?, status=?, 
        description=?, budget=?, contractType=?, reason=?
        WHERE id=?
    `;
    const values = [
        data.title, 
        data.departmentId, 
        data.category, 
        data.status, 
        data.description, 
        data.budget, 
        data.contractType, 
        data.reason,
        id
    ];
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
