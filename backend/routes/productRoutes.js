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

// Seed Products (فقط موقت)
router.get('/seed', async (req, res) => {
  try {
    await Product.deleteMany();

const products = [
  {
    name: "پوشینه بزرگسال گلبهار سایز L",
    description: "پوشینه بزرگسال گلبهار سایز L با هسته سلولزی فوق‌جاذب، رطوبت را در کسری از ثانیه جذب می‌کند.",
    price: 300000,
    discountPercent: 20,
    image: "./img/poshinebozorgsalL.png",
    brand: "گلبهار",
    category: "پوشک-بزرگسال",
    available: true,
    buyers: 215,
    warranty: "۱۸ ماهه",
    features: [
      "جذب سریع رطوبت",
      "لایه ضد نشت دوطرفه",
      "نوار چسبی قابل بازچسبانی",
      "بدون عطر و کلر"
    ],
    specs: [
      { label: "سایز", value: "L" },
      { label: "محدوده وزنی", value: "۶۰ تا ۹۰ کیلوگرم" },
      { label: "تعداد در بسته", value: "۳۰ عدد" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "پوشینه بزرگسال گلبهار سایز M",
    description: "پوشینه بزرگسال گلبهار سایز M با طراحی آناتومیک، راحتی حداکثری را فراهم می‌کند.",
    price: 85000,
    discountPercent: 0,
    image: "./img/poshakbozorgsalbig.png",
    brand: "گلبهار",
    category: "پوشک-بزرگسال",
    available: true,
    buyers: 98,
    warranty: "۱۸ ماهه",
    features: [
      "جذب سریع رطوبت",
      "لایه ضد نشت",
      "بدون عطر",
      "مناسب پوست حساس"
    ],
    specs: [
      { label: "سایز", value: "M" },
      { label: "محدوده وزنی", value: "۴۵ تا ۶۵ کیلوگرم" },
      { label: "تعداد در بسته", value: "۲۰ عدد" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "پوشک نوزاد سایز بزرگ",
    description: "پوشک نازنوش سایز ۴ پوست کودک را تا ۱۲ ساعت خشک نگه می‌دارد.",
    price: 120000,
    discountPercent: 15,
    image: "./img/poshakkodakbig.png",
    brand: "گلبهار",
    category: "پوشک-کودک",
    available: true,
    buyers: 340,
    warranty: "۱۲ ماهه",
    features: [
      "هسته سلولزی فوق‌جاذب",
      "نوارهای ضد نشتی دوطرفه",
      "نوار چسبی بازچسبانی",
      "بدون عطر، بدون کلر"
    ],
    specs: [
      { label: "سایز", value: "۴ (Maxi)" },
      { label: "محدوده وزنی", value: "۹ تا ۱۴ کیلوگرم" },
      { label: "تعداد در بسته", value: "۶۰ عدد" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "پوشک نوزاد سایز کوچک",
    description: "پوشک نازنوش سایز نوزادی از پوست حساس نوزادان محافظت می‌کند.",
    price: 45000,
    discountPercent: 0,
    image: "./img/poshakkodak.png",
    brand: "نازنوش",
    category: "پوشک-کودک",
    available: true,
    buyers: 187,
    warranty: "۱۲ ماهه",
    features: [
      "طراحی مخصوص نوزادان",
      "نرم و لطیف",
      "جذب سریع",
      "ضد حساسیت"
    ],
    specs: [
      { label: "سایز", value: "۱ (Newborn)" },
      { label: "محدوده وزنی", value: "تا ۵ کیلوگرم" },
      { label: "تعداد در بسته", value: "۴۰ عدد" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "نوار بالدار ساده",
    description: "نوار بهداشتی بالدار نرمین برای استفاده روزانه مناسب است.",
    price: 210000,
    discountPercent: 10,
    image: "./img/navarbig.png",
    brand: "نرمین",
    category: "نوار-بهداشتی",
    available: true,
    buyers: 120,
    warranty: "۶ ماهه",
    features: [
      "بال‌های محافظ",
      "جذب سریع",
      "بدون عطر",
      "ضد حساسیت"
    ],
    specs: [
      { label: "نوع", value: "بالدار ساده" },
      { label: "تعداد در بسته", value: "۳۰ عدد" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "پنبه هیدروفیل ۲۰۰ گرمی",
    description: "پنبه هیدروفیل سانا از خالص‌ترین الیاف پنبه طبیعی تهیه شده.",
    price: 175000,
    discountPercent: 30,
    image: "./img/panbehidrofi.png",
    brand: "سانا",
    category: "پنبه",
    available: false,
    buyers: 89,
    warranty: "۶ ماهه",
    features: [
      "پنبه خالص طبیعی ۱۰۰٪",
      "جذب بالای مایعات",
      "مناسب کاربرد پزشکی",
      "بسته‌بندی بهداشتی"
    ],
    specs: [
      { label: "وزن", value: "۲۰۰ گرم" },
      { label: "جنس", value: "پنبه طبیعی ۱۰۰٪" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "پنبه ۱۰۰ گرمی",
    description: "پنبه طبیعی سانا ۱۰۰ گرمی برای استفاده‌های روزمره آرایشی و بهداشتی مناسب است.",
    price: 95000,
    discountPercent: 25,
    image: "./img/panbe100g.png",
    brand: "سانا",
    category: "پنبه",
    available: true,
    buyers: 203,
    warranty: "۶ ماهه",
    features: [
      "پنبه خالص طبیعی",
      "نرم و لطیف",
      "چندمنظوره",
      "بسته‌بندی بهداشتی"
    ],
    specs: [
      { label: "وزن", value: "۱۰۰ گرم" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "پنبه ۵۰ گرمی",
    description: "پنبه طبیعی سانا ۵۰ گرمی نسخه کوچک و مناسب برای سفر است.",
    price: 38000,
    discountPercent: 0,
    image: "./img/panbe50g.png",
    brand: "سانا",
    category: "پنبه",
    available: true,
    buyers: 156,
    warranty: "۶ ماهه",
    features: [
      "پنبه خالص طبیعی",
      "سایز کوچک مناسب سفر",
      "نرم و لطیف",
      "بسته‌بندی بهداشتی"
    ],
    specs: [
      { label: "وزن", value: "۵۰ گرم" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  },
  {
    name: "نوار بالدار مشبک",
    description: "نوار بهداشتی بالدار مشبک نرمین با رویه تنفس‌پذیر از تعریق جلوگیری می‌کند.",
    price: 340000,
    discountPercent: 5,
    image: "./img/navarbehdashty.png",
    brand: "نرمین",
    category: "نوار-بهداشتی",
    available: true,
    buyers: 78,
    warranty: "۶ ماهه",
    features: [
      "رویه مشبک تنفس‌پذیر",
      "بال‌های محافظ قوی",
      "جذب سریع و عمیق",
      "ضد حساسیت"
    ],
    specs: [
      { label: "نوع", value: "بالدار مشبک" },
      { label: "اندازه", value: "Large" },
      { label: "تعداد در بسته", value: "۲۰ عدد" },
      { label: "کشور سازنده", value: "ایران" }
    ]
  }
];

    await Product.insertMany(products);

    res.json({
      message: "محصولات وارد شدند",
      count: products.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
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