const departmentService = require('../services/departmentService');
const asyncHandler = require('express-async-handler');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
});

// @desc    Create department
// @route   POST /api/departments
// @access  Public
const createDepartment = asyncHandler(async (req, res) => {
    try {
        const dept = await departmentService.createDepartment(req.body);
        res.status(201).json(dept);
    } catch (error) {
        console.error("Error creating department:", error);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Public
const updateDepartment = asyncHandler(async (req, res) => {
    try {
        const dept = await departmentService.updateDepartment(req.params.id, req.body);
        res.json(dept);
    } catch (error) {
        console.error("Error updating department:", error);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Public
const deleteDepartment = asyncHandler(async (req, res) => {
    await departmentService.deleteDepartment(req.params.id);
    res.json({ message: 'Department deleted' });
});

module.exports = {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
