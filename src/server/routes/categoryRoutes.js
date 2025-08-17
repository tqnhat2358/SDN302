const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET all
router.get('/', categoryController.getAll);

// POST new
router.post('/', categoryController.create);

// PUT update
router.put('/:id', categoryController.update);

// DELETE
router.delete('/:id', categoryController.remove);

module.exports = router;
