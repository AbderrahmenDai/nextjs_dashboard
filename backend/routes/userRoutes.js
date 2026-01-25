const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.updateUserPassword);
router.delete('/:id', userController.deleteUser);

module.exports = router;
