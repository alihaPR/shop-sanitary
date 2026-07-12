const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const { protect, admin } = require('../middleware/auth')

// ثبت سفارش جدید
// POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, totalPrice, shippingCost } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'سبد خرید خالی است' })
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      totalPrice,
      shippingCost
    })

    res.status(201).json(order)
  }
  catch (error) {

    console.error("========== ORDER DETAIL ERROR ==========");
    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }
})

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