const { User, Department } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const emailService = require('./emailService');
const jwt = require('jsonwebtoken');

// Get all users
const getAllUsers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
        include: [
            {
                model: Department,
                as: 'departmentData', // Matches association alias
                attributes: ['name', 'site']
            }
        ],
        limit: Number(limit),
        offset: Number(offset),
        order: [['name', 'ASC']] // Added default sort
    });

    const users = rows.map(u => {
        const plainUser = u.get({ plain: true });
        return {
            id: plainUser.id,
            name: plainUser.name,
            email: plainUser.email,
            status: plainUser.status,
            avatarGradient: plainUser.avatarGradient,
            departmentId: plainUser.departmentId,
            roleId: null, // Legacy field removed
            department: plainUser.departmentData ? plainUser.departmentData.name : 'Unassigned',
            site: plainUser.departmentData ? plainUser.departmentData.site : 'Unassigned',
            role: plainUser.role, // Now expected to be the Enum string
            post: plainUser.post
        };
    });

    return {
        users,
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / limit)
    };
};

// Create user (signup)
const createUser = async (userData) => {
    let departmentId = userData.departmentId;

    // Validate required fields
    if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Resolve department by Name if ID not provided
    if (!departmentId && userData.department) {
        const dept = await Department.findOne({ where: { name: userData.department } });
        if (dept) {
            departmentId = dept.id;
        }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create User
    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role, // Should be one of the Enum values
        status: userData.status || 'Active',
        avatarGradient: userData.avatarGradient || "from-gray-500 to-slate-500",
        departmentId: departmentId,
        post: userData.post
    });

    // Send Welcome Email
    try {
        console.log('📧 Sending welcome email to:', userData.email);
        await emailService.sendWelcomeEmail(userData.email, userData.name, userData.email, userData.password);
    } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError.message);
    }

    const createdUser = newUser.get({ plain: true });
    delete createdUser.password;
    
    // Fetch department name for response if needed, or just return basic info
    // Minimizing extra queries for creation response is usually fine
    return createdUser;
};

// Update user
const updateUser = async (id, userData) => {
    let departmentId = userData.departmentId;
    
    if (!departmentId && userData.department) {
        const dept = await Department.findOne({ where: { name: userData.department } });
        if (dept) departmentId = dept.id;
    }

    const updateData = {};
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.status !== undefined) updateData.status = userData.status;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (userData.avatarGradient !== undefined) updateData.avatarGradient = userData.avatarGradient;
    if (userData.post !== undefined) updateData.post = userData.post;

    await User.update(updateData, { where: { id } });

    const updatedUser = await User.findByPk(id, {
        include: [{ 
            model: Department, 
            as: 'departmentData',
            attributes: ['name', 'site']
        }]
    });
    
    if (!updatedUser) throw new Error('User not found');

    const plainUser = updatedUser.get({ plain: true });
    return {
        ...plainUser,
        department: plainUser.departmentData ? plainUser.departmentData.name : "Unassigned",
        role: plainUser.role
    };
};

// Update user password only
const updateUserPassword = async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { id } });

    const user = await User.findByPk(id, {
        include: [{ 
            model: Department, 
            as: 'departmentData',
            attributes: ['name']
        }]
    });

    const plainUser = user.get({ plain: true });
    return {
        ...plainUser,
        department: plainUser.departmentData ? plainUser.departmentData.name : "Unassigned",
    };
};

// Login user
const loginUser = async (email, password) => {
    if (!email || !password) throw new Error('Email and password are required');

    const user = await User.findOne({
        where: { email },
        include: [{ 
            model: Department, 
            as: 'departmentData',
            attributes: ['name', 'site']
        }]
    });

    if (!user) throw new Error('Invalid email or password');
    if (!user.password) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const token = generateToken(user.id);
    
    const plainUser = user.get({ plain: true });
    const userResult = {
        ...plainUser,
        department: plainUser.departmentData ? plainUser.departmentData.name : "Unassigned",
        role: plainUser.role,
        token
    };
    delete userResult.password;
    return userResult;
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallbacksecret', {
        expiresIn: '30d',
    });
};

// Delete user
const deleteUser = async (id) => {
    await User.destroy({ where: { id } });
    return { message: 'Deleted' };
};

// Get User by ID (Helper might be needed)
const getUserById = async (id) => {
    return await User.findByPk(id);
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    updateUserPassword,
    loginUser,
    deleteUser,
    getUserById
};
