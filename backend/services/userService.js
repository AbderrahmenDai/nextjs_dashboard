const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const emailService = require('./emailService');

// Get all users
const getAllUsers = async () => {
    // Join with Department, Role, and Site (via Department)
    const [rows] = await db.query(`
        SELECT User.*, 
               Department.name as departmentName, 
               Role.name as roleName,
               Site.name as siteName
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        LEFT JOIN Site ON Department.siteId = Site.id
        LEFT JOIN Role ON User.roleId = Role.id
    `);
    
    // Transform to match frontend expected structure
    return rows.map(u => ({
        ...u,
        department: u.departmentName || 'Unassigned',
        site: u.siteName || 'Unassigned',
        role: u.roleName || u.role || 'Employee' // Fallback to legacy or default
    }));
};

// Create user (signup)
const createUser = async (userData) => {
    const id = uuidv4();
    let departmentId = userData.departmentId;
    let roleId = userData.roleId;

    // Validate required fields
    if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM User WHERE email = ?', [userData.email]);
    if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
    }

    // Resolve department
    if (!departmentId && userData.department) {
        const [deptRows] = await db.query('SELECT id FROM Department WHERE name = ?', [userData.department]);
        if (deptRows.length > 0) {
            departmentId = deptRows[0].id;
        }
    }

    // Resolve role (if name provided but ID not)
    if (!roleId && userData.role) {
        const [roleRows] = await db.query('SELECT id FROM Role WHERE name = ?', [userData.role]);
        if (roleRows.length > 0) {
            roleId = roleRows[0].id;
        }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await db.query(`
        INSERT INTO User (id, name, email, password, roleId, status, avatarGradient, departmentId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        id, 
        userData.name, 
        userData.email, 
        hashedPassword, 
        roleId,
        userData.status || 'Active', 
        userData.avatarGradient || "from-gray-500 to-slate-500", 
        departmentId
    ]);

    // Send Welcome Email
    try {
        console.log('📧 Sending welcome email to:', userData.email);
        await emailService.sendWelcomeEmail(userData.email, userData.name, userData.email, userData.password);
    } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError.message);
    }

    // Return created user
    const [user] = await db.query(`
        SELECT User.*, Role.name as roleName 
        FROM User 
        LEFT JOIN Role ON User.roleId = Role.id 
        WHERE User.id = ?
    `, [id]);
    
    const userResult = { ...user[0], role: user[0].roleName || user[0].role };
    delete userResult.password;
    return userResult;
};

// Update user
const updateUser = async (id, userData) => {
    let departmentId = userData.departmentId;
    let roleId = userData.roleId;
    
    if (!departmentId && userData.department) {
        const [deptRows] = await db.query('SELECT id FROM Department WHERE name = ?', [userData.department]);
        if (deptRows.length > 0) departmentId = deptRows[0].id;
    }

    if (!roleId && userData.role) {
        const [roleRows] = await db.query('SELECT id FROM Role WHERE name = ?', [userData.role]);
        if (roleRows.length > 0) roleId = roleRows[0].id;
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (userData.name !== undefined) { updateFields.push('name = ?'); updateValues.push(userData.name); }
    if (userData.email !== undefined) { updateFields.push('email = ?'); updateValues.push(userData.email); }
    if (roleId !== undefined) { updateFields.push('roleId = ?'); updateValues.push(roleId); }
    if (userData.status !== undefined) { updateFields.push('status = ?'); updateValues.push(userData.status); }
    if (departmentId !== undefined) { updateFields.push('departmentId = ?'); updateValues.push(departmentId); }
    if (userData.avatarGradient !== undefined) { updateFields.push('avatarGradient = ?'); updateValues.push(userData.avatarGradient); }

    if (updateFields.length > 0) {
        updateValues.push(id);
        await db.query(`UPDATE User SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    }

    const [user] = await db.query(`
        SELECT User.*, Department.name as departmentName, Role.name as roleName
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        LEFT JOIN Role ON User.roleId = Role.id
        WHERE User.id = ?
    `, [id]);
    
    const userResult = {
        ...user[0],
        department: user[0].departmentName || "Unassigned",
        role: user[0].roleName || user[0].role
    };
    delete userResult.password;
    return userResult;
};

// Update user password only
const updateUserPassword = async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE User SET password = ? WHERE id = ?', [hashedPassword, id]);

    const [user] = await db.query(`
        SELECT User.*, Department.name as departmentName, Role.name as roleName
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        LEFT JOIN Role ON User.roleId = Role.id
        WHERE User.id = ?
    `, [id]);
    
    const userResult = {
        ...user[0],
        department: user[0].departmentName || "Unassigned",
        role: user[0].roleName || user[0].role
    };
    delete userResult.password;
    return userResult;
};

// Login user
const loginUser = async (email, password) => {
    if (!email || !password) throw new Error('Email and password are required');

    const [users] = await db.query(`
        SELECT User.*, Department.name as departmentName, Role.name as roleName
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        LEFT JOIN Role ON User.roleId = Role.id
        WHERE User.email = ?
    `, [email]);

    if (users.length === 0) throw new Error('Invalid email or password');

    const user = users[0];
    if (!user.password) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const userResult = {
        ...user,
        department: user.departmentName || "Unassigned",
        role: user.roleName || user.role
    };
    delete userResult.password;
    return userResult;
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
    updateUserPassword,
    loginUser,
    deleteUser
};
