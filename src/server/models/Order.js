const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: String,
    items: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    status: { type: String, enum: ["pending", "shipped", "delivered", "canceled"], default: "pending" },
  },
  {
    timestamps: true, // ✅ BẮT BUỘC để có updatedAt
  }
);

module.exports = mongoose.model("Order", orderSchema);
