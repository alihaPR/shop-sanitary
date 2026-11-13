const express = require("express");
const serverError = require('../utils/serverError')
const router = express.Router();
const Product = require("../models/Product");
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
    serverError(res, err);
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
    serverError(res, err);
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

    // هش رمز عبور هرگز در پاسخ برنگردد
    const safeUser = user.toObject();
    delete safeUser.password;

    res.json(safeUser);
  } catch (err) {
    serverError(res, err);
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

    const cancelled = orders.filter(o => o.status === "cancelled").length;

    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    const lastOrder = orders[0] || null;

    res.json({

      userName: user.name,

      orderCount,

      pending,

      processing,

      shipped,

      delivered,

      cancelled,

      totalSpent,

      lastOrder

    });

  } catch (err) {

    serverError(res, err);

  }

});

router.get("/profile", protect, async (req, res) => {

  try {

    const user = await User.findById(req.user._id).select("-password");

    res.json(user);

  } catch (err) {

    serverError(res, err);

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

    // هش رمز عبور هرگز در پاسخ برنگردد
    const safeUser = user.toObject();
    delete safeUser.password;

    res.json(safeUser);

  } catch (err) {

    serverError(res, err);

  }

});
// ذخیره آدرس کامل تحویل (استان، شهر، آدرس، پلاک، واحد، کد پستی)
// PUT /api/users/shipping-address
router.put("/shipping-address", protect, async (req, res) => {

  try {

    const b = req.body || {};

    const clean = (v, max) =>
      typeof v === "string" ? v.trim().slice(0, max) : "";

    const data = {
      province: clean(b.province, 100),
      city: clean(b.city, 100),
      address: clean(b.address, 500),
      plaque: clean(b.plaque, 20),
      unit: clean(b.unit, 20),
      postalCode: clean(b.postalCode, 10)
    };

    if (!data.province || !data.city || !data.address) {
      return res.status(400).json({
        message: "استان، شهر و آدرس الزامی است."
      });
    }

    if (!/^\d{10}$/.test(data.postalCode)) {
      return res.status(400).json({
        message: "کد پستی باید ۱۰ رقم باشد."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { shippingAddress: data, address: data.address } },
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (err) {

    serverError(res, err);

  }

});

const bcrypt = require("bcryptjs");

router.put("/change-password", protect, async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" || !currentPassword ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        message: "رمز فعلی و رمز جدید را وارد کنید."
      });
    }

    // هم‌راستا با قوانین فرم تغییر رمز در پنل کاربر (حداقل ۸ کاراکتر)
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "رمز جدید باید حداقل ۸ کاراکتر باشد."
      });
    }

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

    // هش کردن را hook مدل User (pre save) انجام می‌دهد؛ اینجا دستی هش نکنید
    user.password = newPassword;

    await user.save();

    res.json({
      message: "رمز عبور با موفقیت تغییر کرد."
    });

  } catch (err) {

    serverError(res, err);

  }

});
router.post("/favorites/:id", protect, async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    if (!product) {

      return res.status(404).json({
        message: "محصول پیدا نشد."
      });

    }

    const user = await User.findById(req.user._id);

    if (!user.favorites.includes(product._id)) {

      user.favorites.push(product._id);

      await user.save();

    }

    res.json({
      favorites: user.favorites
    });

  } catch (err) {

    serverError(res, err);

  }

});
router.delete("/favorites/:id", protect, async (req, res) => {

  try {

    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter(

      id => id.toString() !== req.params.id

    );

    await user.save();

    res.json({
      favorites: user.favorites
    });

  } catch (err) {

    serverError(res, err);

  }

});
router.get("/favorites", protect, async (req, res) => {

  try {

    const user = await User.findById(req.user._id)
      .populate("favorites");

    res.json(user.favorites);

  } catch (err) {

    serverError(res, err);

  }

});
module.exports = router;