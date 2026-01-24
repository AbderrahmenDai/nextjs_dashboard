const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Get all users
const getAllUsers = async () => {
    // Join with Department to get department name
    const [rows] = await db.query(`
        SELECT User.*, Department.name as departmentName 
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
    `);
    
    // Transform to match frontend expected structure
    return rows.map(u => ({
        ...u,
        department: u.departmentName || 'Unassigned'
    }));
};

// Create user
const createUser = async (userData) => {
    const id = uuidv4();
    let departmentId = userData.departmentId;

    // Resolve department by name if ID is missing (simple lookup)
    if (!departmentId && userData.department) {
        const [deptRows] = await db.query('SELECT id FROM Department WHERE name = ?', [userData.department]);
        if (deptRows.length > 0) {
            departmentId = deptRows[0].id;
        }
    }

    await db.query(`
        INSERT INTO User (id, name, email, password, role, status, avatarGradient, departmentId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        id, 
        userData.name, 
        userData.email, 
        userData.password, 
        userData.role, 
        userData.status || 'Active', 
        userData.avatarGradient || "from-gray-500 to-slate-500", 
        departmentId
    ]);

    // Return created user
    const [user] = await db.query('SELECT * FROM User WHERE id = ?', [id]);
    return user[0];
};

// Update user
const updateUser = async (id, userData) => {
    let departmentId = userData.departmentId;
    
    if (!departmentId && userData.department) {
        const [deptRows] = await db.query('SELECT id FROM Department WHERE name = ?', [userData.department]);
        if (deptRows.length > 0) departmentId = deptRows[0].id;
    }

    // Build update query dynamically optionally
    // For simplicity, updating commonly changed fields
    await db.query(`
        UPDATE User 
        SET name = ?, email = ?, role = ?, status = ?, departmentId = ?
        WHERE id = ?
    `, [userData.name, userData.email, userData.role, userData.status, departmentId, id]);

    if (userData.password) {
        await db.query('UPDATE User SET password = ? WHERE id = ?', [userData.password, id]);
    }

    const [user] = await db.query(`
        SELECT User.*, Department.name as departmentName 
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        WHERE User.id = ?
    `, [id]);
    
    return {
        ...user[0],
        department: user[0].departmentName || "Unassigned"
    };
};

// Delete user
const deleteUser = async (id) => {
    await db.query('DELETE FROM User WHERE id = ?', [id]);
    return { message: 'Deleted' };
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};
