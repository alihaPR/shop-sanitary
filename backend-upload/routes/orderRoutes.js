const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const express = require('express')
const serverError = require('../utils/serverError')
const router = express.Router()
const { protect, admin } = require('../middleware/auth')
const { resolveShippingAddress } = require('../utils/addressHelper')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ============================================================
//  پرداخت کارت‌به‌کارت
// ============================================================
const CARD_PAY_MINUTES = Number(process.env.CARD_PAY_MINUTES) || 120

// رسیدها در پوشه‌ی خصوصی ذخیره می‌شوند (از بیرون با URL مستقیم قابل دسترسی نیستند)
const RECEIPT_DIR = path.join(__dirname, '..', 'private_receipts')
if (!fs.existsSync(RECEIPT_DIR)) fs.mkdirSync(RECEIPT_DIR, { recursive: true })

const receiptUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, RECEIPT_DIR),
    filename: (req, file, cb) =>
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|webp/
    const ok = types.test(path.extname(file.originalname).toLowerCase()) && types.test(file.mimetype)
    ok ? cb(null, true) : cb(new Error('فقط تصویر (jpg, png, webp) مجاز است.'))
  }
})

// برگرداندن موجودی کالاها (برای سفارش‌های منقضی‌شده)
async function restoreOrderStock(order) {
  for (const item of order.items) {
    const product = await Product.findById(item.product)
    if (!product) continue
    product.stock += item.qty
    product.buyers = Math.max(0, product.buyers - item.qty)
    await product.save()
  }
}

// لغو سفارش‌های کارت‌به‌کارتی که مهلتشان تمام شده و رسید معتبر ندارند
async function expireCardOrders() {
  try {
    const orders = await Order.find({
      paymentMethod: 'card',
      status: 'pending',
      paymentStatus: { $in: ['unpaid', 'rejected'] },
      paymentExpiresAt: { $lt: new Date() }
    })
    for (const order of orders) {
      // قفل ساده: فقط اگر هنوز همان وضعیت را دارد منقضی شود
      const locked = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: { $in: ['unpaid', 'rejected'] }, status: 'pending' },
        { status: 'cancelled', paymentStatus: 'expired' }
      )
      if (locked) await restoreOrderStock(order)
    }
  } catch (err) {
    console.error('expireCardOrders error:', err.message)
  }
}
setInterval(expireCardOrders, 60 * 1000)

// ============================================================
//  کم کردن اتمیک موجودی (جایگزین تراکنش)
// ============================================================
async function rollbackReserved(reserved) {
  for (const r of reserved) {
    try {
      await Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty, buyers: -r.qty } })
    } catch (e) {
      console.error('rollback error:', e.message)
    }
  }
}

async function reserveItems(items) {
  const reserved = []
  const orderItems = []
  let totalPrice = 0

  try {
    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        const e = new Error('شناسه محصول نامعتبر است.'); e.status = 400; throw e
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        const e = new Error('تعداد محصول نامعتبر است.'); e.status = 400; throw e
      }

      const product = await Product.findById(item.product)
      if (!product) { const e = new Error('یکی از محصولات پیدا نشد.'); e.status = 404; throw e }
      if (!product.available) { const e = new Error(`${product.name} موجود نیست.`); e.status = 400; throw e }

      // کم کردن اتمیک: فقط اگر موجودی کافی باشد
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, available: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, buyers: item.quantity } },
        { new: true }
      )
      if (!updated) { const e = new Error(`موجودی ${product.name} کافی نیست.`); e.status = 400; throw e }

      reserved.push({ id: product._id, qty: item.quantity })

      const finalPrice = product.discountPercent > 0
        ? Math.round(product.price * (1 - product.discountPercent / 100))
        : product.price

      totalPrice += finalPrice * item.quantity
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: finalPrice,
        qty: item.quantity
      })
    }
    return { orderItems, totalPrice, reserved }
  } catch (err) {
    await rollbackReserved(reserved)
    throw err
  }
}

// اطلاعات کارت (از فایل .env خوانده می‌شود)
// GET /api/orders/card-info
router.get('/card-info', protect, (req, res) => {
  res.json({
    cardNumber: process.env.CARD_NUMBER || '',
    cardHolder: process.env.CARD_HOLDER || '',
    bank: process.env.CARD_BANK || '',
    supportPhone: process.env.SUPPORT_PHONE || '',
    payMinutes: CARD_PAY_MINUTES
  })
})

// ثبت سفارش با پرداخت کارت‌به‌کارت (وضعیت: pending / unpaid)
// POST /api/orders/card
router.post('/card', protect, async (req, res) => {
  let reserved = []
  try {
    const { items, shippingAddress } = req.body
    // اگر addressId ارسال شده باشد، مالکیت بررسی و Snapshot آدرس از دیتابیس ساخته می‌شود
    const resolved = await resolveShippingAddress(req)
    const sa = resolved || shippingAddress || {}

    if (!sa.province || !sa.city || !sa.address || !sa.plaque || !sa.postalCode) {
      return res.status(400).json({ message: 'اطلاعات آدرس ناقص است.' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'سبد خرید خالی است.' })
    }

    const result = await reserveItems(items)
    reserved = result.reserved
    const { orderItems, totalPrice } = result

    const shippingCost = totalPrice >= 500000 ? 0 : 35000

    let order
    try {
      order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: sa,
        totalPrice,
        shippingCost,
        status: 'pending',
        paymentMethod: 'card',
        paymentStatus: 'unpaid',
        paymentExpiresAt: new Date(Date.now() + CARD_PAY_MINUTES * 60 * 1000)
      })
    } catch (e) {
      await rollbackReserved(reserved)
      throw e
    }

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(error.status || 500).json({ message: error.status ? error.message : 'خطا در ثبت سفارش.' })
  }
})

// آپلود رسید پرداخت (فقط صاحب سفارش)
// POST /api/orders/:id/receipt   (فیلد فرم: receipt)
router.post('/:id/receipt', protect, (req, res) => {
  receiptUpload.single('receipt')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message })
    try {
      if (!req.file) return res.status(400).json({ message: 'تصویر رسید را انتخاب کنید.' })

      const order = await Order.findById(req.params.id)
      const drop = () => fs.unlink(req.file.path, () => { })

      if (!order || order.user.toString() !== req.user._id.toString()) {
        drop()
        return res.status(404).json({ message: 'سفارش پیدا نشد.' })
      }
      if (order.paymentMethod !== 'card' || order.status !== 'pending' ||
        !['unpaid', 'rejected', 'receipt_submitted'].includes(order.paymentStatus)) {
        drop()
        return res.status(400).json({ message: 'برای این سفارش امکان ارسال رسید وجود ندارد.' })
      }
      if (order.paymentExpiresAt && order.paymentExpiresAt < new Date() && order.paymentStatus !== 'receipt_submitted') {
        drop()
        return res.status(400).json({ message: 'مهلت پرداخت این سفارش تمام شده است.' })
      }

      // حذف رسید قبلی
      if (order.receiptImage) fs.unlink(path.join(RECEIPT_DIR, order.receiptImage), () => { })

      order.receiptImage = req.file.filename
      order.receiptSubmittedAt = new Date()
      order.paymentStatus = 'receipt_submitted'
      order.adminNote = ''
      await order.save()

      res.json({ message: 'رسید دریافت شد.', paymentStatus: order.paymentStatus })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'خطا در ثبت رسید.' })
    }
  })
})

// مشاهده تصویر رسید (صاحب سفارش یا ادمین)
// GET /api/orders/:id/receipt
router.get('/:id/receipt', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order || !order.receiptImage) return res.status(404).json({ message: 'رسیدی ثبت نشده است.' })
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز.' })
    }
    res.sendFile(path.join(RECEIPT_DIR, path.basename(order.receiptImage)))
  } catch (error) {
    serverError(res, error)
  }
})

// تأیید / رد پرداخت — فقط ادمین
// PUT /api/orders/:id/payment   body: { action: "approve" | "reject", note }
router.put('/:id/payment', protect, admin, async (req, res) => {
  try {
    const { action, note } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'سفارش یافت نشد' })
    if (order.paymentMethod !== 'card') {
      return res.status(400).json({ message: 'این سفارش کارت‌به‌کارت نیست.' })
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'این سفارش قبلاً تأیید شده است.' })
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'سفارش لغو شده است.' })
    }

    if (action === 'approve') {
      order.paymentStatus = 'paid'
      order.isPaid = true
      order.paidAt = new Date()
      order.status = 'processing'
      order.adminNote = ''
    } else if (action === 'reject') {
      order.paymentStatus = 'rejected'
      order.adminNote = (note || 'رسید پرداخت تأیید نشد.').toString().slice(0, 300)
      // فرصت دوباره برای ارسال رسید صحیح
      order.paymentExpiresAt = new Date(Date.now() + CARD_PAY_MINUTES * 60 * 1000)
    } else {
      return res.status(400).json({ message: 'عملیات نامعتبر است.' })
    }

    await order.save()
    res.json(order)
  } catch (error) {
    serverError(res, error)
  }
})

// ثبت سفارش جدید
// POST /api/orders
router.post('/', protect, async (req, res) => {
  let reserved = []
  try {
    const { items } = req.body
    const resolved = await resolveShippingAddress(req)
    const shippingAddress = resolved || req.body.shippingAddress

    if (!shippingAddress) {
      return res.status(400).json({ message: 'اطلاعات آدرس ارسال الزامی است.' })
    }
    const { province, city, address, plaque, postalCode } = shippingAddress
    if (!province || !city || !address || !plaque || !postalCode) {
      return res.status(400).json({ message: 'اطلاعات آدرس ناقص است.' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'سبد خرید خالی است.' })
    }

    const result = await reserveItems(items)
    reserved = result.reserved
    const { orderItems, totalPrice } = result

    const shippingCost = totalPrice >= 500000 ? 0 : 35000

    let order
    try {
      order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        totalPrice,
        shippingCost
      })
    } catch (e) {
      await rollbackReserved(reserved)
      throw e
    }

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(error.status || 500).json({ message: error.status ? error.message : 'خطا در ثبت سفارش.' })
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
    serverError(res, error)
  }
})

// یه سفارش خاص
// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image')

    if (!order) {
      return res.status(404).json({ message: "سفارش پیدا نشد" })
    }
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: "دسترسی غیرمجاز." })
    }

    return res.json(order)
  } catch (error) {
    console.error("DETAIL ERROR:")
    console.error(error)
    return serverError(res, error)
  }
})

// همه سفارشات — فقط ادمین
// GET /api/orders
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    serverError(res, error)
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
    ]

    if (req.body.status && !allowedStatus.includes(req.body.status)) {
      return res.status(400).json({ message: "وضعیت سفارش نامعتبر است." })
    }
    order.status = req.body.status || order.status
    if (req.body.isPaid) {
      order.isPaid = true
      order.paidAt = Date.now()
    }

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    serverError(res, error)
  }
})

module.exports = router