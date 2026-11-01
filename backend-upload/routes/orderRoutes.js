const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const express = require('express')
const router = express.Router()
const { protect, admin } = require('../middleware/auth')
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
  let session
  try {
    const { items, shippingAddress } = req.body
    const sa = shippingAddress || {}

    if (!sa.province || !sa.city || !sa.address || !sa.plaque || !sa.postalCode) {
      return res.status(400).json({ message: 'اطلاعات آدرس ناقص است.' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'سبد خرید خالی است.' })
    }

    session = await mongoose.startSession()
    session.startTransaction()

    const orderItems = []
    let totalPrice = 0

    for (const item of items) {
      if (!item.product || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('اطلاعات محصول نامعتبر است.')
      }
      const product = await Product.findById(item.product).session(session)
      if (!product) throw new Error('یکی از محصولات پیدا نشد.')
      if (!product.available) throw new Error(`${product.name} موجود نیست.`)
      if (product.stock < item.quantity) throw new Error(`موجودی ${product.name} کافی نیست.`)

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

      product.stock -= item.quantity
      product.buyers += item.quantity
      await product.save({ session })
    }

    const shippingCost = totalPrice >= 500000 ? 0 : 35000

    const [order] = await Order.create([{
      user: req.user._id,
      items: orderItems,
      shippingAddress: sa,
      totalPrice,
      shippingCost,
      status: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'unpaid',
      paymentExpiresAt: new Date(Date.now() + CARD_PAY_MINUTES * 60 * 1000)
    }], { session })

    await session.commitTransaction()
    session.endSession()
    res.status(201).json(order)

  } catch (error) {
    if (session) {
      try { await session.abortTransaction() } catch (e) { }
      session.endSession()
    }
    console.error(error)
    res.status(400).json({ message: error.message || 'خطا در ثبت سفارش.' })
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
  }
})



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
      .populate('user', 'name email phone')
      .populate('items.product', 'name image')

    if (!order) {

      return res.status(404).json({
        message: "سفارش پیدا نشد"
      });
    }
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
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
      .populate('user', 'name email phone')
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