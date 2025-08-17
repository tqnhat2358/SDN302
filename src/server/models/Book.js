const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  price: { type: Number, required: true, min: 0 },
  stock: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: String,
  publishedDate: Date,
  coverImage: String,
});

module.exports = mongoose.model("Book", bookSchema);
