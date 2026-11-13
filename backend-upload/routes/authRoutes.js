const express = require('express')
const serverError = require('../utils/serverError')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// تولید توکن
const generateToken = (id, role) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: role === 'admin' ? '1d' : '30d' })
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
      token: generateToken(user._id, user.role)
    });

  } catch (error) {

    serverError(res, error);

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
      token: generateToken(user._id, user.role)
    });

  } catch (error) {

    serverError(res, error);

  }
});

// پروفایل کاربر
// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    serverError(res, error)
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
      token: generateToken(updatedUser._id, updatedUser.role)
    })
  } catch (error) {
    serverError(res, error)
  }
})

module.exports = router