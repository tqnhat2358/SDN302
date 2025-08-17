const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Đăng ký người dùng
exports.register = async (req, res) => {
  try {
    const { name, email, password, address, age, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      passwordHash,
      address,
      age,
      phoneNumber,
      role: 'customer' // mặc định nếu cần
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        age: user.age,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá người dùng
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Chỉ cho chính chủ hoặc admin chỉnh sửa
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Không có quyền chỉnh sửa người dùng này" });
    }

    const { name, address, age, phoneNumber, password } = req.body;

    const updatedFields = {
      ...(name && { name }),
      ...(address && { address }),
      ...(typeof age !== "undefined" && { age }),
      ...(phoneNumber && { phoneNumber }),
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    res.json(updatedUser);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
