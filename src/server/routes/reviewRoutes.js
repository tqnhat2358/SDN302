const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// API endpoints
router.post('/', auth, reviewController.createReview);
router.get('/book/:bookId', reviewController.getReviewsByBook);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;





