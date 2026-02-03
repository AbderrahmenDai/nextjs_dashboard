const db = require('../config/db');
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
        if (users.length > 0) {
            head = users[0].name;
        } else {
             // If user doesn't exist, we can't assign them as head properly, 
             // but let's not block department creation.
             // Option 1: Clear the email and head
             // headEmail = null;
             // head = "";
             
             // Option 2 (Better for UI feedback loop): Keep the email but warn?
             // For now, let's just allow it but maybe set head to the email prefix or something
             // OR, more safely, just ignore the head assignment if user doesn't exist but keep the email stored?
             // The original requirement was strict: "If the email exists, the user becomes the head."
             // If it doesn't exist, we probably shouldn't set headEmail to avoid FK issues if it were a foreign key (it's not currently).
             
             // Let's just log it and NOT throw.
             console.warn(`User with email ${headEmail} does not exist. Proceeding without assigning head name.`);
        }
    }

    await db.query(`
        INSERT INTO Department (id, name, head, headEmail, location, employeeCount, budget, status, colorCallback, siteId, logoUrl, icon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        deptData.siteId,
        deptData.logoUrl || null,
        deptData.icon || null
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
        if (users.length > 0) {
            head = users[0].name;
        } else {
             console.warn(`User with email ${headEmail} does not exist. Proceeding without assigning head name.`);
        }
    } else {
        head = ""; // Clear head if email is removed
    }

    await db.query(`
        UPDATE Department 
        SET name = ?, head = ?, headEmail = ?, location = ?, budget = ?, status = ?, colorCallback = ?, siteId = ?, logoUrl = ?, icon = ?
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
        deptData.logoUrl || null,
        deptData.icon || null,
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
