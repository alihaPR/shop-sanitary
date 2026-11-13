const express = require('express')
const serverError = require('../utils/serverError')
const router = express.Router()
const mongoose = require('mongoose')
const Product = require('../models/Product')
const { protect, admin } = require('../middleware/auth')

// escape کردن کاراکترهای خاص regex (جلوگیری از ReDoS)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// همه محصولات
// GET /api/products
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      available,
      sort,
      search
    } = req.query;
    

    let filter = {}

    // مقادیر query حتماً String شوند (جلوگیری از NoSQL injection مثل category[$ne]=x)
    if (category) filter.category = String(category)
    if (brand) filter.brand = String(brand)
    if (search) {
      filter.name = {
        $regex: escapeRegex(String(search).slice(0, 100)),
        $options: "i"
      };
    }
    if (available === 'true') filter.available = true
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice && Number.isFinite(Number(minPrice))) filter.price.$gte = Number(minPrice)
      if (maxPrice && Number.isFinite(Number(maxPrice))) filter.price.$lte = Number(maxPrice)
      if (Object.keys(filter.price).length === 0) delete filter.price
    }

    let sortOption = {}
    if (sort === 'cheapest') sortOption.price = 1
    if (sort === 'expensive') sortOption.price = -1
    if (sort === 'newest') sortOption.createdAt = -1
    if (sort === 'bestseller') sortOption.buyers = -1

    const products = await Product.find(filter).sort(sortOption);

    res.json(products)
  } catch (error) {
    serverError(res, error)
  }
})

// تنظیم دسته‌جمعی تخفیف — فقط ادمین
// PUT /api/products/discounts/bulk
// body: { updates: [{ id, discountPercent }] }   (۰ = بدون تخفیف، حداکثر ۹۰)
router.put('/discounts/bulk', protect, admin, async (req, res) => {
  try {
    const { updates } = req.body || {}

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'هیچ تغییری ارسال نشده است' })
    }
    if (updates.length > 500) {
      return res.status(400).json({ message: 'تعداد تغییرات بیش از حد مجاز است' })
    }

    const ops = []
    for (const u of updates) {
      const pct = Number(u && u.discountPercent)
      if (!u || !mongoose.Types.ObjectId.isValid(u.id) || !Number.isFinite(pct) || pct < 0 || pct > 90) {
        return res.status(400).json({ message: 'درصد تخفیف باید عددی بین ۰ تا ۹۰ باشد' })
      }
      ops.push({
        updateOne: {
          filter: { _id: u.id },
          update: { $set: { discountPercent: Math.round(pct) } }
        }
      })
    }

    const result = await Product.bulkWrite(ops)
    res.json({ message: 'تخفیف‌ها ذخیره شد', modified: result.modifiedCount, matched: result.matchedCount })
  } catch (error) {
    serverError(res, error)
  }
})

// یه محصول
// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'محصول یافت نشد' })
    res.json(product)
  } catch (error) {
    serverError(res, error)
  }
})

// اضافه کردن محصول — فقط ادمین
// POST /api/products
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    serverError(res, error)
  }
})

// آپدیت محصول — فقط ادمین
// PUT /api/products/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) return res.status(404).json({ message: 'محصول یافت نشد' })
    res.json(product)
  } catch (error) {
    serverError(res, error)
  }
})

// حذف محصول — فقط ادمین
// DELETE /api/products/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'محصول یافت نشد' })
    res.json({ message: 'محصول حذف شد' })
  } catch (error) {
    serverError(res, error)
  }
})

module.exports = router