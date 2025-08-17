const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', authMiddleware, checkRole('admin'), userController.getUsers);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, checkRole('admin'), userController.deleteUser);

module.exports = router;
