const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const express = require('express')
const router = express.Router()
const { protect, admin } = require('../middleware/auth')


// ثبت سفارش جدید
router.post('/', protect, async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { items, shippingAddress } = req.body;
    if (!shippingAddress) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "اطلاعات آدرس ارسال الزامی است."
      });
    }

    const {
      province,
      city,
      address,
      plaque,
      postalCode
    } = shippingAddress;

    if (
      !province ||
      !city ||
      !address ||
      !plaque ||
      !postalCode
    ) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "اطلاعات آدرس ناقص است."
      });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "سبد خرید خالی است."
      });
    }

    let orderItems = [];

    let totalPrice = 0;

    for (const item of items) {
      if (!item.product) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          message: "شناسه محصول نامعتبر است."
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          message: "تعداد محصول نامعتبر است."
        });
      }
      const product = await Product
        .findById(item.product)
        .session(session);

      if (!product) {

        return res.status(404).json({
          message: "یکی از محصولات پیدا نشد."
        });

      }

      if (!product.available) {

        return res.status(400).json({
          message: `${product.name} موجود نیست.`
        });

      }

      if (product.stock < item.quantity) {

        return res.status(400).json({
          message: `موجودی ${product.name} کافی نیست.`
        });

      }

      const finalPrice = product.discountPercent > 0
        ? Math.round(product.price * (1 - product.discountPercent / 100))
        : product.price;

      totalPrice += finalPrice * item.quantity;

      orderItems.push({

        product: product._id,

        name: product.name,

        image: product.image,

        price: finalPrice,

        qty: item.quantity

      });
      product.stock -= item.quantity;

      product.buyers += item.quantity;

      await product.save({
        session
      });

    }

    const shippingCost = totalPrice >= 500000 ? 0 : 35000;

    const [order] = await Order.create([{

      user: req.user._id,

      items: orderItems,

      shippingAddress,

      totalPrice,

      shippingCost

    }], {

      session

    });

    await session.commitTransaction();

    session.endSession();

    res.status(201).json(order);

  }

  catch (error) {

    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    console.error(error);

    return res.status(500).json({
      message: "خطا در ثبت سفارش."
    });

  }
});


// سفارشات کاربر لاگین شده
// GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// یه سفارش خاص
// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image')

    if (!order) {

      return res.status(404).json({
        message: "سفارش پیدا نشد"
      });
    }
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        message: "دسترسی غیرمجاز."
      });
    }

    return res.json(order);

  } catch (error) {

    console.error("DETAIL ERROR:");
    console.error(error);

    return res.status(500).json({
      message: error.message
    });

  }
});

// همه سفارشات — فقط ادمین
// GET /api/orders
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// آپدیت وضعیت سفارش — فقط ادمین
// PUT /api/orders/:id/status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'سفارش یافت نشد' })
    const allowedStatus = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (
      req.body.status &&
      !allowedStatus.includes(req.body.status)
    ) {
      return res.status(400).json({
        message: "وضعیت سفارش نامعتبر است."
      });
    }
    order.status = req.body.status || order.status
    if (req.body.isPaid) {
      order.isPaid = true
      order.paidAt = Date.now()
    }

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router