const products = [
  {
    id: 1, name: "پوشینه بزرگسال گلبهار سایز L", price: 300000, discountPercent: 20,
    image: "./img/poshinebozorgsalL.png", brand: "گلبهار", category: "پوشک-بزرگسال",
    buyers: 215, available: true, warranty: "۱۸ ماهه",
    features: ["جذب سریع رطوبت","لایه ضد نشت دوطرفه","نوار چسبی قابل بازچسبانی","بدون عطر و کلر"],
    specs: [{label:"سایز",value:"L"},{label:"محدوده وزنی",value:"۶۰ تا ۹۰ کیلوگرم"},{label:"تعداد در بسته",value:"۳۰ عدد"},{label:"کشور سازنده",value:"ایران"}],
    description: "پوشینه بزرگسال گلبهار سایز L با هسته سلولزی فوق‌جاذب، رطوبت را در کسری از ثانیه جذب می‌کند."
  },
  {
    id: 2, name: "پوشینه بزرگسال گلبهار سایز M", price: 85000, discountPercent: 0,
    image: "./img/poshakbozorgsalbig.png", brand: "گلبهار", category: "پوشک-بزرگسال",
    buyers: 98, available: true, warranty: "۱۸ ماهه",
    features: ["جذب سریع رطوبت","لایه ضد نشت","بدون عطر","مناسب پوست حساس"],
    specs: [{label:"سایز",value:"M"},{label:"محدوده وزنی",value:"۴۵ تا ۶۵ کیلوگرم"},{label:"تعداد در بسته",value:"۲۰ عدد"},{label:"کشور سازنده",value:"ایران"}],
    description: "پوشینه بزرگسال گلبهار سایز M با طراحی آناتومیک، راحتی حداکثری را فراهم می‌کند."
  },
  {
    id: 3, name: "پوشک نوزاد سایز بزرگ", price: 120000, discountPercent: 15,
    image: "./img/poshakkodakbig.png", brand: "گلبهار", category: "پوشک-کودک",
    buyers: 340, available: true, warranty: "۱۲ ماهه",
    features: ["هسته سلولزی فوق‌جاذب","نوارهای ضد نشتی دوطرفه","نوار چسبی بازچسبانی","بدون عطر، بدون کلر"],
    specs: [{label:"سایز",value:"۴ (Maxi)"},{label:"محدوده وزنی",value:"۹ تا ۱۴ کیلوگرم"},{label:"تعداد در بسته",value:"۶۰ عدد"},{label:"کشور سازنده",value:"ایران"}],
    description: "پوشک نازنوش سایز ۴ پوست کودک را تا ۱۲ ساعت خشک نگه می‌دارد."
  },
  {
    id: 4, name: "پوشک نوزاد سایز کوچک", price: 45000, discountPercent: 0,
    image: "./img/poshakkodak.png", brand: "نازنوش", category: "پوشک-کودک",
    buyers: 187, available: true, warranty: "۱۲ ماهه",
    features: ["طراحی مخصوص نوزادان","نرم و لطیف","جذب سریع","ضد حساسیت"],
    specs: [{label:"سایز",value:"۱ (Newborn)"},{label:"محدوده وزنی",value:"تا ۵ کیلوگرم"},{label:"تعداد در بسته",value:"۴۰ عدد"},{label:"کشور سازنده",value:"ایران"}],
    description: "پوشک نازنوش سایز نوزادی از پوست حساس نوزادان محافظت می‌کند."
  },
  {
    id: 5, name: "نوار بالدار ساده", price: 210000, discountPercent: 10,
    image: "./img/navarbig.png", brand: "نرمین", category: "نوار-بهداشتی",
    buyers: 120, available: true, warranty: "۶ ماهه",
    features: ["بال‌های محافظ","جذب سریع","بدون عطر","ضد حساسیت"],
    specs: [{label:"نوع",value:"بالدار ساده"},{label:"تعداد در بسته",value:"۳۰ عدد"},{label:"کشور سازنده",value:"ایران"}],
    description: "نوار بهداشتی بالدار نرمین برای استفاده روزانه مناسب است."
  },
  {
    id: 6, name: "پنبه هیدروفیل ۲۰۰ گرمی", price: 175000, discountPercent: 30,
    image: "./img/panbehidrofi.png", brand: "سانا", category: "پنبه",
    buyers: 89, available: false, warranty: "۶ ماهه",
    features: ["پنبه خالص طبیعی ۱۰۰٪","جذب بالای مایعات","مناسب کاربرد پزشکی","بسته‌بندی بهداشتی"],
    specs: [{label:"وزن",value:"۲۰۰ گرم"},{label:"جنس",value:"پنبه طبیعی ۱۰۰٪"},{label:"کشور سازنده",value:"ایران"}],
    description: "پنبه هیدروفیل سانا از خالص‌ترین الیاف پنبه طبیعی تهیه شده."
  },
  {
    id: 7, name: "پنبه ۱۰۰ گرمی", price: 95000, discountPercent: 25,
    image: "./img/panbe100g.png", brand: "سانا", category: "پنبه",
    buyers: 203, available: true, warranty: "۶ ماهه",
    features: ["پنبه خالص طبیعی","نرم و لطیف","چندمنظوره","بسته‌بندی بهداشتی"],
    specs: [{label:"وزن",value:"۱۰۰ گرم"},{label:"کشور سازنده",value:"ایران"}],
    description: "پنبه طبیعی سانا ۱۰۰ گرمی برای استفاده‌های روزمره آرایشی و بهداشتی مناسب است."
  },
  {
    id: 8, name: "پنبه ۵۰ گرمی", price: 38000, discountPercent: 0,
    image: "./img/panbe50g.png", brand: "سانا", category: "پنبه",
    buyers: 156, available: true, warranty: "۶ ماهه",
    features: ["پنبه خالص طبیعی","سایز کوچک مناسب سفر","نرم و لطیف","بسته‌بندی بهداشتی"],
    specs: [{label:"وزن",value:"۵۰ گرم"},{label:"کشور سازنده",value:"ایران"}],
    description: "پنبه طبیعی سانا ۵۰ گرمی نسخه کوچک و مناسب برای سفر است."
  },
  {
    id: 9, name: "نوار بالدار مشبک", price: 340000, discountPercent: 5,
    image: "./img/navarbehdashty.png", brand: "نرمین", category: "نوار-بهداشتی",
    buyers: 78, available: true, warranty: "۶ ماهه",
    features: ["رویه مشبک تنفس‌پذیر","بال‌های محافظ قوی","جذب سریع و عمیق","ضد حساسیت"],
    specs: [{label:"نوع",value:"بالدار مشبک"},{label:"اندازه",value:"Large"},{label:"تعداد در بسته",value:"۲۰ عدد"},{label:"کشور سازنده",value:"ایران"}],
    description: "نوار بهداشتی بالدار مشبک نرمین با رویه تنفس‌پذیر از تعریق جلوگیری می‌کند."
  }
]
module.exports = products;