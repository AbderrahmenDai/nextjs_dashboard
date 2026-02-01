const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Get all departments
const getAllDepartments = async () => {
    const [rows] = await db.query(`
        SELECT d.*, 
        (SELECT COUNT(*) FROM User u WHERE u.departmentId = d.id) as calculatedEmployees
        FROM Department d
    `);
    
    return rows.map(r => ({
        ...r,
        employeeCount: r.calculatedEmployees // Ensure frontend gets the fresh count
    }));
};

// Create department
const createDepartment = async (deptData) => {
    const id = uuidv4();
    let head = deptData.head || "";
    let headEmail = deptData.headEmail || null;

    if (headEmail) {
        const [users] = await db.query('SELECT name FROM User WHERE email = ?', [headEmail]);
        if (users.length === 0) {
            throw new Error(`User with email ${headEmail} does not exist`);
        }
        head = users[0].name;
    }

    await db.query(`
        INSERT INTO Department (id, name, head, headEmail, location, employeeCount, budget, status, colorCallback, siteId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        id,
        deptData.name,
        head,
        headEmail,
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
    let head = deptData.head || "";
    let headEmail = deptData.headEmail || null;

    if (headEmail) {
        const [users] = await db.query('SELECT name FROM User WHERE email = ?', [headEmail]);
        if (users.length === 0) {
            throw new Error(`User with email ${headEmail} does not exist`);
        }
        head = users[0].name;
    } else {
        head = ""; // Clear head if email is removed
    }

    await db.query(`
        UPDATE Department 
        SET name = ?, head = ?, headEmail = ?, location = ?, budget = ?, status = ?, colorCallback = ?, siteId = ?
        WHERE id = ?
    `, [
        deptData.name,
        head,
        headEmail,
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
