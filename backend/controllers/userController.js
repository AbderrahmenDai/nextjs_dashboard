const userService = require('../services/userService');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await userService.getAllUsers(page, limit);
    res.json(result);
});

// @desc    Create new user (signup)
// @route   POST /api/users
// @access  Public
const createUser = asyncHandler(async (req, res) => {
    const { email, password, name, role, status, departmentId, department, avatarGradient } = req.body;
    
    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required');
    }

    const user = await userService.createUser(req.body);
    res.status(201).json(user);
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required');
    }

    try {
        const user = await userService.loginUser(email, password);
        console.log('Login response payload:', user);
        res.json(user);
    } catch (error) {
        // If service throws invalid credentials, return 401
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Update user (general fields, excluding password)
// @route   PUT /api/users/:id
// @access  Public
const updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
});

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Public
const updateUserPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) {
        res.status(400);
        throw new Error('Password is required');
    }
    const user = await userService.updateUserPassword(req.params.id, password);
    res.json(user);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
});

module.exports = {
    getUsers,
    createUser,
    loginUser,
    updateUser,
    updateUserPassword,
    deleteUser
};
