const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Get all departments
const getAllDepartments = async () => {
    const [rows] = await db.query(`
        SELECT d.*, 
        (SELECT COUNT(*) FROM User u WHERE u.departmentId = d.id) as employeeCount 
        FROM Department d
    `);
    return rows;
};

// Create department
const createDepartment = async (deptData) => {
    const id = uuidv4();
    await db.query(`
        INSERT INTO Department (id, name, head, location, employeeCount, budget, status, colorCallback, siteId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        id,
        deptData.name,
        deptData.head,
        deptData.location,
        deptData.employeeCount || 0,
        deptData.budget,
        deptData.status || 'Active',
        deptData.colorCallback,
        deptData.siteId
    ]);

    const [dept] = await db.query('SELECT * FROM Department WHERE id = ?', [id]);
    return dept[0];
};

// Update department
const updateDepartment = async (id, deptData) => {
    await db.query(`
        UPDATE Department 
        SET name = ?, head = ?, location = ?, budget = ?, status = ?, colorCallback = ?, siteId = ?
        WHERE id = ?
    `, [
        deptData.name,
        deptData.head,
        deptData.location,
        deptData.budget,
        deptData.status,
        deptData.colorCallback,
        deptData.siteId,
        id
    ]);

    const [dept] = await db.query('SELECT * FROM Department WHERE id = ?', [id]);
    return dept[0];
};

// Delete department
const deleteDepartment = async (id) => {
    await db.query('DELETE FROM Department WHERE id = ?', [id]);
    return { message: 'Deleted' };
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
