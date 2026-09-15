const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// تولید توکن
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// ثبت نام
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {

    const { name, phone, password } = req.body;

    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({
        message: 'این شماره موبایل قبلاً ثبت شده است.'
      });
    }

    const user = await User.create({
      name,
      phone,
      password
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});
// ورود
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {

    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'شماره موبایل یا رمز عبور اشتباه است.'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});

// پروفایل کاربر
// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// آپدیت پروفایل
// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.name = req.body.name || user.name
    user.phone = req.body.phone || user.phone
    user.address = req.body.address || user.address
    if (req.body.password) user.password = req.body.password

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router