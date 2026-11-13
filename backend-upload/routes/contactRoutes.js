const express = require('express')
const serverError = require('../utils/serverError')
const router = express.Router()
const Contact = require('../models/Contact')
const { protect, admin } = require('../middleware/auth')

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'نام، ایمیل و پیام الزامی است' })
    }

    const contact = await Contact.create({ name, email, phone, message })
    res.status(201).json({ message: 'پیام شما با موفقیت ارسال شد', contact })
  } catch (error) {
    serverError(res, error)
  }
})

router.get('/', protect, admin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })
    res.json(contacts)
  } catch (error) {
    serverError(res, error)
  }
})

router.put('/:id/read', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    )
    if (!contact) return res.status(404).json({ message: 'پیام یافت نشد' })
    res.json(contact)
  } catch (error) {
    serverError(res, error)
  }
})

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id)
    if (!contact) return res.status(404).json({ message: 'پیام یافت نشد' })
    res.json({ message: 'پیام حذف شد' })
  } catch (error) {
    serverError(res, error)
  }
})

module.exports = router