const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { user, items } = req.body;

    // Kiểm tra user tồn tại và lấy địa chỉ
    const userDoc = await User.findById(user);
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    let totalAmount = 0;
    const detailedItems = [];

    // Duyệt từng item trong giỏ hàng để kiểm tra stock và tính tổng
    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book)
        return res
          .status(404)
          .json({ message: `Book not found: ${item.book}` });

      // ✅ Kiểm tra tồn kho
      if (book.stock < item.quantity) {
        return res.status(400).json({
          message: `❌ Sách "${book.title}" chỉ còn ${book.stock} cuốn trong kho.`,
        });
      }

      const itemTotal = book.price * item.quantity;
      totalAmount += itemTotal;

      detailedItems.push({
        book: book._id,
        quantity: item.quantity,
        price: book.price,
      });
    }

    // ✅ Trừ stock
    for (const item of items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: -item.quantity },
      });
    }

    // ✅ Tạo đơn hàng
    const order = new Order({
      user,
      address: userDoc.address,
      items: detailedItems,
      totalAmount,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Lỗi khi tạo đơn hàng:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả đơn hàng (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email address phoneNumber")
      .populate("items.book", "title price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email address phoneNumber")
      .populate("items.book", "title price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Không cho cập nhật nếu đã giao hơn 20s
    if (order.status === "delivered") {
      const now = new Date();
      const deliveredAt = new Date(order.updatedAt || order.createdAt);
      const diffSeconds = (now - deliveredAt) / 1000;

      if (diffSeconds > 20) {
        return res.status(400).json({
          message: "Đơn hàng đã giao, không thể cập nhật trạng thái.",
        });
      }
    }

    order.status = status;
    await order.save();

    // Nếu hủy thì hoàn kho và xóa sau 20s
    if (status === "canceled") {
      setTimeout(async () => {
        try {
          for (const item of order.items) {
            const book = await Book.findById(item.book);
            if (book) {
              book.stock += item.quantity;
              await book.save();
            }
          }
        } catch (err) {
          console.error(`Lỗi khi hoàn hàng đơn ${orderId}:`, err.message);
        }
      }, 20000);
    }

    res.status(200).json({
      message: "Trạng thái đơn hàng đã được cập nhật",
      order,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xoá đơn hàng
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Cho xóa nếu là admin hoặc chính chủ
    if (
      req.user.role !== "admin" &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa đơn hàng này" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Người dùng xem đơn hàng của chính họ
const getOrdersByUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền xem đơn hàng này" });
  }

  try {
    const orders = await Order.find({ user: id })
      .populate("items.book", "title price")
      .populate("user", "name email address");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrdersByUser,
};
