const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Public
router.get('/', controller.getBooks);
router.get('/:id', controller.getBookById);

// Protected for Admin only
router.post('/', authMiddleware, checkRole('admin'), controller.createBook);
router.put('/:id', authMiddleware, checkRole('admin'), controller.updateBook);
router.delete('/:id', authMiddleware, checkRole('admin'), controller.deleteBook);

module.exports = router;
