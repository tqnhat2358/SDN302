const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  address: { type: String },
  age: { type: Number, min: 0 },
  phoneNumber: {
    type: String,
    validate: {
      validator: (v) => /^0\d{9}$/.test(v),
      message: (props) => `${props.value} không phải là số điện thoại hợp lệ!`,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
