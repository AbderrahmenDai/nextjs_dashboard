const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
const getRoles = asyncHandler(async (req, res) => {
    const [roles] = await db.query('SELECT * FROM Role ORDER BY name ASC');
    res.json(roles);
});

// @desc    Create new role
// @route   POST /api/roles
// @access  Public
const createRole = asyncHandler(async (req, res) => {
    const { name, description, departmentId } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Role name is required');
    }

    // Check if role exists
    const [existing] = await db.query('SELECT id FROM Role WHERE name = ?', [name]);
    if (existing.length > 0) {
        res.status(400);
        throw new Error('Role already exists');
    }

    const id = uuidv4();
    await db.query('INSERT INTO Role (id, name, description, departmentId) VALUES (?, ?, ?, ?)', [id, name, description, departmentId]);

    const [role] = await db.query(`
        SELECT r.*, d.name as departmentName 
        FROM Role r 
        LEFT JOIN Department d ON r.departmentId = d.id 
        WHERE r.id = ?
    `, [id]);
    res.status(201).json(role[0]);
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Public
const updateRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, departmentId } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Role name is required');
    }

    // Check if role exists (excluding current)
    const [existing] = await db.query('SELECT id FROM Role WHERE name = ? AND id != ?', [name, id]);
    if (existing.length > 0) {
        res.status(400);
        throw new Error('Role name already in use');
    }

    await db.query('UPDATE Role SET name = ?, description = ?, departmentId = ? WHERE id = ?', [name, description, departmentId, id]);
    
    const [role] = await db.query(`
        SELECT r.*, d.name as departmentName 
        FROM Role r 
        LEFT JOIN Department d ON r.departmentId = d.id 
        WHERE r.id = ?
    `, [id]);
    res.json(role[0]);
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Public
const deleteRole = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if role is used by any user
    const [users] = await db.query('SELECT id FROM User WHERE roleId = ?', [id]);
    if (users.length > 0) {
        res.status(400);
        throw new Error('Cannot delete role assigned to users. Reassign users first.');
    }

    // Check if it's a system role (optional protection)
    // const [role] = await db.query('SELECT name FROM Role WHERE id = ?', [id]);
    // if (role.length > 0 && ['ADMIN', 'HR_MANAGER'].includes(role[0].name)) {
    //     res.status(400);
    //     throw new Error('Cannot delete system roles');
    // }

    await db.query('DELETE FROM Role WHERE id = ?', [id]);
    res.json({ message: 'Role deleted' });
});

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole
};
