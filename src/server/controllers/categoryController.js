const Category = require('../models/Category');

// Get all categories
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách thể loại' });
  }
};

// Create category
exports.create = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ message: 'Thêm thể loại thành công', category });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi thêm thể loại', error: err.message });
  }
};

// Update category
exports.update = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Cập nhật thành công', updated });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật thể loại' });
  }
};

// Delete category
exports.remove = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa thể loại' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa thể loại' });
  }
};
