const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

const Address = require('../models/Address')
const User = require('../models/User')
const Order = require('../models/Order')
const { protect } = require('../middleware/auth')
const { MAX_ADDRESSES, cleanAddressInput } = require('../utils/addressHelper')

// همه مسیرها نیاز به لاگین دارند و فقط روی آدرس‌های خود کاربر کار می‌کنند
router.use(protect)
router.use((req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'دسترسی ندارید.' })
  next()
})

const validId = id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)

// ---- انتقال یک‌باره‌ی آدرس‌های قبلی (پروفایل / آخرین سفارش) به دفترچه آدرس ----
async function migrateLegacy(user) {
  try {
    if (user.addressesMigrated) return

    const claimed = await User.findOneAndUpdate(
      { _id: user._id, addressesMigrated: { $ne: true } },
      { $set: { addressesMigrated: true } }
    )
    if (!claimed) return

    if (await Address.countDocuments({ user: user._id }) > 0) return

    const has = s => s && s.province && s.city && s.address && s.plaque && s.postalCode

    let src = has(user.shippingAddress) ? user.shippingAddress : null

    if (!src) {
      const o = await Order.findOne({ user: user._id }).sort({ createdAt: -1 })
      if (o && has(o.shippingAddress)) src = o.shippingAddress
    }
    if (!src) return

    const plain = typeof src.toObject === 'function' ? src.toObject() : src

    const { data } = cleanAddressInput({
      recipientName: (src.recipientName || user.name),
      recipientPhone: (src.recipientPhone || user.phone),
      province: plain.province,
      city: plain.city,
      neighborhood: plain.neighborhood,
      address: plain.address,
      plaque: plain.plaque,
      unit: plain.unit,
      postalCode: plain.postalCode
    })
    if (!data) return

    await Address.create({ ...data, user: user._id, isDefault: true })
  } catch (e) {
    console.error('address migrate error:', e.message)
  }
}

// GET /api/addresses  → همه آدرس‌های کاربر
router.get('/', async (req, res) => {
  try {
    await migrateLegacy(req.user)

    const list = await Address.find({ user: req.user._id })
      .sort({ isDefault: -1, updatedAt: -1 })

    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطا در دریافت آدرس‌ها.' })
  }
})

// POST /api/addresses  → افزودن آدرس
router.post('/', async (req, res) => {
  try {
    const { data, error } = cleanAddressInput(req.body)
    if (error) return res.status(400).json({ message: error })

    const count = await Address.countDocuments({ user: req.user._id })
    if (count >= MAX_ADDRESSES) {
      return res.status(400).json({ message: `حداکثر ${MAX_ADDRESSES} آدرس می‌توانید ثبت کنید.` })
    }

    // اولین آدرس همیشه پیش‌فرض است
    const makeDefault = count === 0 || data.isDefault

    if (makeDefault) {
      await Address.updateMany({ user: req.user._id, isDefault: true }, { $set: { isDefault: false } })
    }

    const created = await Address.create({ ...data, user: req.user._id, isDefault: makeDefault })

    res.status(201).json(created)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطا در ثبت آدرس.' })
  }
})

// PUT /api/addresses/:id/default  → تعیین آدرس پیش‌فرض
router.put('/:id/default', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'شناسه آدرس نامعتبر است.' })

    const addr = await Address.findOne({ _id: req.params.id, user: req.user._id })
    if (!addr) return res.status(404).json({ message: 'آدرس پیدا نشد.' })

    if (!addr.isDefault) {
      await Address.updateMany({ user: req.user._id, isDefault: true }, { $set: { isDefault: false } })
      addr.isDefault = true
      await addr.save()
    }

    res.json(addr)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطا در تعیین آدرس پیش‌فرض.' })
  }
})

// GET /api/addresses/:id  → جزئیات یک آدرس
router.get('/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'شناسه آدرس نامعتبر است.' })

    const addr = await Address.findOne({ _id: req.params.id, user: req.user._id })
    if (!addr) return res.status(404).json({ message: 'آدرس پیدا نشد.' })

    res.json(addr)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطا در دریافت آدرس.' })
  }
})

// PUT /api/addresses/:id  → ویرایش آدرس (سفارش‌های قبلی تغییر نمی‌کنند؛ آن‌ها Snapshot دارند)
router.put('/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'شناسه آدرس نامعتبر است.' })

    const { data, error } = cleanAddressInput(req.body)
    if (error) return res.status(400).json({ message: error })

    const addr = await Address.findOne({ _id: req.params.id, user: req.user._id })
    if (!addr) return res.status(404).json({ message: 'آدرس پیدا نشد.' })

    if (data.isDefault && !addr.isDefault) {
      await Address.updateMany({ user: req.user._id, isDefault: true }, { $set: { isDefault: false } })
      addr.isDefault = true
    }

    ;['recipientName', 'recipientPhone', 'province', 'city', 'neighborhood',
      'address', 'plaque', 'unit', 'postalCode'].forEach(k => { addr[k] = data[k] })

    await addr.save()

    res.json(addr)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطا در ویرایش آدرس.' })
  }
})

// DELETE /api/addresses/:id  → حذف آدرس
router.delete('/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'شناسه آدرس نامعتبر است.' })

    const addr = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!addr) return res.status(404).json({ message: 'آدرس پیدا نشد.' })

    // اگر آدرس پیش‌فرض حذف شد، جدیدترین آدرس باقی‌مانده پیش‌فرض می‌شود
    if (addr.isDefault) {
      const next = await Address.findOne({ user: req.user._id }).sort({ updatedAt: -1 })
      if (next) {
        next.isDefault = true
        await next.save()
      }
    }

    res.json({ message: 'آدرس حذف شد.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطا در حذف آدرس.' })
  }
})

module.exports = router
