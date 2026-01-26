const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const emailService = require('./emailService');

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

// Create user (signup)
const createUser = async (userData) => {
    const id = uuidv4();
    let departmentId = userData.departmentId;

    // Validate required fields
    if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM User WHERE email = ?', [userData.email]);
    if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
    }

    // Resolve department by name if ID is missing (simple lookup)
    if (!departmentId && userData.department) {
        const [deptRows] = await db.query('SELECT id FROM Department WHERE name = ?', [userData.department]);
        if (deptRows.length > 0) {
            departmentId = deptRows[0].id;
        }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await db.query(`
        INSERT INTO User (id, name, email, password, role, status, avatarGradient, departmentId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        id, 
        userData.name, 
        userData.email, 
        hashedPassword, 
        userData.role, 
        userData.status || 'Active', 
        userData.avatarGradient || "from-gray-500 to-slate-500", 
        departmentId
    ]);

    // Send Welcome Email (don't fail user creation if email fails)
    try {
        console.log('📧 Sending welcome email to:', userData.email);
        await emailService.sendWelcomeEmail(userData.email, userData.name, userData.email, userData.password);
        console.log('✅ Welcome email sent successfully');
    } catch (emailError) {
        console.error('❌ Failed to send welcome email (user still created):', emailError.message);
        // Don't throw - user creation should succeed even if email fails
    }

    // Return created user (without password)
    const [user] = await db.query('SELECT * FROM User WHERE id = ?', [id]);
    const userResult = user[0];
    delete userResult.password; // Don't return password
    return userResult;
};

// Update user (general fields, excluding password)
const updateUser = async (id, userData) => {
    let departmentId = userData.departmentId;
    
    if (!departmentId && userData.department) {
        const [deptRows] = await db.query('SELECT id FROM Department WHERE name = ?', [userData.department]);
        if (deptRows.length > 0) departmentId = deptRows[0].id;
    }

    // Build update query dynamically - only update fields that are provided
    const updateFields = [];
    const updateValues = [];

    if (userData.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(userData.name);
    }
    if (userData.email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(userData.email);
    }
    if (userData.role !== undefined) {
        updateFields.push('role = ?');
        updateValues.push(userData.role);
    }
    if (userData.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(userData.status);
    }
    if (departmentId !== undefined) {
        updateFields.push('departmentId = ?');
        updateValues.push(departmentId);
    }
    if (userData.avatarGradient !== undefined) {
        updateFields.push('avatarGradient = ?');
        updateValues.push(userData.avatarGradient);
    }

    if (updateFields.length > 0) {
        updateValues.push(id);
        await db.query(`
            UPDATE User 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);
    }

    const [user] = await db.query(`
        SELECT User.*, Department.name as departmentName 
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        WHERE User.id = ?
    `, [id]);
    
    const userResult = {
        ...user[0],
        department: user[0].departmentName || "Unassigned"
    };
    delete userResult.password; // Don't return password
    return userResult;
};

// Update user password only
const updateUserPassword = async (id, newPassword) => {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.query('UPDATE User SET password = ? WHERE id = ?', [hashedPassword, id]);

    const [user] = await db.query(`
        SELECT User.*, Department.name as departmentName 
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        WHERE User.id = ?
    `, [id]);
    
    const userResult = {
        ...user[0],
        department: user[0].departmentName || "Unassigned"
    };
    delete userResult.password; // Don't return password
    return userResult;
};

// Login user
const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    // Find user by email
    const [users] = await db.query(`
        SELECT User.*, Department.name as departmentName 
        FROM User 
        LEFT JOIN Department ON User.departmentId = Department.id
        WHERE User.email = ?
    `, [email]);

    if (users.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Check if user has a password set
    if (!user.password) {
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Return user without password
    const userResult = {
        ...user,
        department: user.departmentName || "Unassigned"
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
