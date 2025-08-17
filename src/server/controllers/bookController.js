const Book = require('../models/Book');

// GET all books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('category');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('category');
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new book
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE book
exports.updateBook = async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE book
exports.deleteBook = async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
