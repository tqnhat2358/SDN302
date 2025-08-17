const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Kiểm tra header có tồn tại và đúng định dạng Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Không có token xác thực hoặc sai định dạng" });
    }

    // 2. Lấy token từ header
    const token = authHeader.split(" ")[1];

    // 3. Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    console.log(decoded); // hoặc
    console.log("Đã xác thực, payload token:", decoded);

    // 4. Tìm user tương ứng (decoded.sub hoặc decoded.userId)
    const userId = decoded.sub || decoded.userId;
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    // 5. Gắn user vào req để controller sử dụng
    req.user = user;

    next(); // Chuyển sang middleware hoặc route tiếp theo
  } catch (err) {
    console.error("Lỗi xác thực:", err.message);
    res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn: " + err.message });
  }
};

module.exports = authMiddleware;
