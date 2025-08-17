const Review = require('../models/Review');
const Book = require('../models/Book');

// Thêm review mới
exports.createReview = async (req, res) => {
  try {
    const { user, book, rating, comment } = req.body;

    // Kiểm tra xem sách tồn tại không
    const bookExists = await Book.findById(book);
    if (!bookExists) return res.status(404).json({ message: 'Book not found' });

    const review = new Review({ user, book, rating, comment });
    await review.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy toàn bộ review cho một sách
exports.getReviewsByBook = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá review
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
