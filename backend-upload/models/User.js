const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String
  },
  // آدرس کامل ذخیره‌شده برای چک‌اوت (روی هر دستگاهی در دسترس است)
  shippingAddress: {
    province: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    plaque: { type: String, trim: true },
    unit: { type: String, trim: true },
    postalCode: { type: String, trim: true }
  },
  // انتقال یک‌باره‌ی آدرس‌های قبلی به دفترچه آدرس انجام شده یا نه
  addressesMigrated: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }
],

}, { timestamps: true })

// هش کردن پسورد قبل از ذخیره
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// مقایسه پسورد
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)