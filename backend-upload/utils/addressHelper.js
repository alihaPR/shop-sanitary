const mongoose = require('mongoose')
const Address = require('../models/Address')

const MAX_ADDRESSES = 10

function httpError(status, message) {
  const e = new Error(message)
  e.status = status
  return e
}

// تبدیل ارقام فارسی/عربی به انگلیسی
function toEn(v) {
  return String(v)
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

function str(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

// موبایل ایران: 09xxxxxxxxx (پیش‌شماره‌های +98 / 0098 / 98 هم پذیرفته می‌شود)
function normalizePhone(v) {
  if (typeof v !== 'string') return ''
  let p = toEn(v).replace(/[\s\-()]/g, '')
  p = p.replace(/^(\+98|0098|98)/, '0')
  if (/^9\d{9}$/.test(p)) p = '0' + p
  return p
}

// اعتبارسنجی و پاک‌سازی ورودی آدرس (فقط فیلدهای مجاز برمی‌گردند)
function cleanAddressInput(body) {
  const b = body || {}

  const data = {
    recipientName: str(b.recipientName, 100),
    recipientPhone: normalizePhone(b.recipientPhone),
    province: str(b.province, 60),
    city: str(b.city, 60),
    neighborhood: str(b.neighborhood, 100),
    address: str(b.address, 500),
    plaque: toEn(str(b.plaque, 20)),
    unit: toEn(str(b.unit, 20)),
    postalCode: toEn(str(b.postalCode, 20)).replace(/\s/g, ''),
    isDefault: b.isDefault === true
  }

  if (data.recipientName.length < 3) return { error: 'نام و نام خانوادگی گیرنده را وارد کنید.' }
  if (!/^09\d{9}$/.test(data.recipientPhone)) return { error: 'شماره موبایل گیرنده معتبر نیست.' }
  if (!data.province) return { error: 'استان را انتخاب کنید.' }
  if (!data.city) return { error: 'شهر را انتخاب کنید.' }
  if (data.address.length < 10) return { error: 'آدرس دقیق را کامل وارد کنید.' }
  if (!data.plaque) return { error: 'پلاک را وارد کنید.' }
  if (!/^\d{10}$/.test(data.postalCode)) return { error: 'کد پستی باید ۱۰ رقم باشد.' }

  return { data }
}

// Snapshot آدرس برای ذخیره داخل سفارش (مستقل از ویرایش/حذف بعدی آدرس)
function snapshotFromAddress(a) {
  return {
    addressId: a._id,
    recipientName: a.recipientName,
    recipientPhone: a.recipientPhone,
    province: a.province,
    city: a.city,
    neighborhood: a.neighborhood || '',
    address: a.address,
    plaque: a.plaque,
    unit: a.unit || '',
    postalCode: a.postalCode
  }
}

// اگر درخواست addressId داشته باشد: مالکیت را در دیتابیس بررسی می‌کند و Snapshot برمی‌گرداند.
// اگر addressId نباشد null برمی‌گرداند (منطق قدیمی shippingAddress دست‌نخورده می‌ماند).
async function resolveShippingAddress(req) {
  const id = req.body && req.body.addressId

  if (id === undefined || id === null || id === '') return null

  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'شناسه آدرس نامعتبر است.')
  }

  if (!req.user) throw httpError(401, 'دسترسی ندارید.')

  const addr = await Address.findOne({ _id: id, user: req.user._id })

  if (!addr) throw httpError(404, 'آدرس انتخاب‌شده پیدا نشد.')

  return snapshotFromAddress(addr)
}

module.exports = {
  MAX_ADDRESSES,
  httpError,
  cleanAddressInput,
  snapshotFromAddress,
  resolveShippingAddress
}
