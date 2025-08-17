const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Create a new order (User)
router.post('/', authMiddleware, orderController.createOrder);

// Get all orders by user ID (User)
router.get('/user/:id', authMiddleware, orderController.getOrdersByUser);

// Cancel (delete) an order - User or Admin (check permission in controller)
router.delete('/:id', authMiddleware, orderController.deleteOrder);

// Get all orders (Admin)
router.get('/admin', authMiddleware, checkRole('admin'), orderController.getAllOrders);

// Update order status by ID (Admin)
router.put('/:id', authMiddleware, orderController.updateOrderStatus);


// Get order by ID (Owner or Admin — validated inside controller)
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;
