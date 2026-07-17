const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Order = require("../models/Order");
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
router.get("/dashboard", protect, async (req, res) => {

    try {

        const user = await User.findById(req.user._id).select("name");

        const orders = await Order.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        });

        const orderCount = orders.length;

        const pending = orders.filter(o => o.status === "pending").length;

        const processing = orders.filter(o => o.status === "processing").length;

        const shipped = orders.filter(o => o.status === "shipped").length;

        const delivered = orders.filter(o => o.status === "delivered").length;

        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        const lastOrder = orders[0] || null;

        res.json({

            userName: user.name,

            orderCount,

            pending,

            processing,

            shipped,

            delivered,

            totalSpent,

            lastOrder

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});

router.get("/profile", protect, async (req, res) => {

    try {

        const user = await User.findById(req.user._id).select("-password");

        res.json(user);

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

router.put("/profile", protect, async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                message: "کاربر پیدا نشد"
            });

        }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;

        await user.save();

        res.json(user);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});
const bcrypt = require("bcryptjs");

router.put("/change-password", protect, async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                message: "رمز فعلی اشتباه است."
            });

        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.json({
            message: "رمز عبور با موفقیت تغییر کرد."
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});
module.exports = router;