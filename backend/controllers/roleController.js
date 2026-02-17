const asyncHandler = require('express-async-handler');

// Defined Enum Values
const ROLES = [
    { id: '1', name: 'responsable recrutement' },
    { id: '2', name: 'plant manger' },
    { id: '3', name: 'drh' },
    { id: '4', name: 'responsable RH' },
    { id: '5', name: 'demander ' } // Keeping exact string as requested
];

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
const getRoles = asyncHandler(async (req, res) => {
    // Return static list
    res.json(ROLES);
});

// @desc    Create new role
// @route   POST /api/roles
// @access  Public
const createRole = asyncHandler(async (req, res) => {
    res.status(405).json({ message: 'Roles are now static and cannot be created dynamically.' });
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Public
const updateRole = asyncHandler(async (req, res) => {
    res.status(405).json({ message: 'Roles are now static and cannot be updated dynamically.' });
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Public
const deleteRole = asyncHandler(async (req, res) => {
    res.status(405).json({ message: 'Roles are now static and cannot be deleted dynamically.' });
});

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole
};
