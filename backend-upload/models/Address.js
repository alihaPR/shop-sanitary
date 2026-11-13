const mongoose = require('mongoose')

// دفترچه آدرس کاربران: هر کاربر می‌تواند چند آدرس داشته باشد
const addressSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  recipientName: { type: String, required: true, trim: true, maxlength: 100 },
  recipientPhone: { type: String, required: true, trim: true },

  province: { type: String, required: true, trim: true, maxlength: 60 },
  city: { type: String, required: true, trim: true, maxlength: 60 },
  neighborhood: { type: String, trim: true, default: '', maxlength: 100 },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  plaque: { type: String, required: true, trim: true, maxlength: 20 },
  unit: { type: String, trim: true, default: '', maxlength: 20 },
  postalCode: { type: String, required: true, trim: true },

  isDefault: { type: Boolean, default: false }

}, { timestamps: true })

// تضمین دیتابیس: برای هر کاربر حداکثر یک آدرس پیش‌فرض
addressSchema.index(
  { user: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
)

module.exports = mongoose.model('Address', addressSchema)
