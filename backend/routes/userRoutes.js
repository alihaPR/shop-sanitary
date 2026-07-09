const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");

// همه کاربران (فقط ادمین)
// GET /api/users
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// حذف کاربر
// DELETE /api/users/:id
router.delete("/:id", protect, admin, async (req, res) => {
  try {

    // جلوگیری از حذف حساب خود
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: "نمی‌توانید حساب خودتان را حذف کنید."
      });
    }

    // پیدا کردن کاربر
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "کاربر پیدا نشد"
      });
    }

    // جلوگیری از حذف هر ادمین
if (req.user._id.toString() === req.params.id) {

  return res.status(400).json({
    message: "نمی‌توانید حساب خودتان را حذف کنید."
  });

}

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "کاربر حذف شد"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// تغییر نقش کاربر
// PUT /api/users/:id/role
router.put("/:id/role", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "کاربر پیدا نشد",
      });
    }

    user.role = req.body.role;

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;