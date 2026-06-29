const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const { protect, admin } = require('../middleware/auth')

// همه محصولات
// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, available, sort } = req.query

    let filter = {}

    if (category) filter.category = category
    if (brand) filter.brand = brand
    if (available === 'true') filter.available = true
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    let sortOption = {}
    if (sort === 'cheapest') sortOption.price = 1
    if (sort === 'expensive') sortOption.price = -1
    if (sort === 'newest') sortOption.createdAt = -1
    if (sort === 'bestseller') sortOption.buyers = -1

    const products = await Product.find(filter).sort(sortOption)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
  }
})

// اضافه کردن محصول — فقط ادمین
// POST /api/products
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
  }
})

module.exports = router