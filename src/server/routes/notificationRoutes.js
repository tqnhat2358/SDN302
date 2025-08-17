// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification"); // mongoose model

router.post("/", async (req, res) => {
  try {
    const notif = new Notification({
      message: req.body.message,
      createdAt: new Date(),
    });
    await notif.save();
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo thông báo" });
  }
});

module.exports = router;
