// ------------------------------------ filter toggles -----------------------------------

document.addEventListener("DOMContentLoaded", function () {

  const filterprice = document.getElementById('filter-price')
  const bodyprice = document.querySelector('.price-body')
  if (filterprice && bodyprice) {
    let Flagp = true
    filterprice.addEventListener('click', function () {
      bodyprice.style.display = Flagp ? 'block' : 'none'
      Flagp = !Flagp
    })
  }

  const filterbrand = document.getElementById('filter-brand')
  const bodybrand = document.querySelector('.brand-body')
  if (filterbrand && bodybrand) {
    let Flagb = true
    filterbrand.addEventListener('click', function () {
      bodybrand.style.display = Flagb ? 'block' : 'none'
      Flagb = !Flagb
    })
  }

  // فقط توی صفحه محصولات render بشه
  if (document.getElementById("products-grid")) {
    renderProducts()
  }

})

// ------------------------------------ product data -----------------------------------

// ------------------------------------ filter toggles -----------------------------------

document.addEventListener("DOMContentLoaded", function () {

  const filterprice = document.getElementById('filter-price')
  const bodyprice = document.querySelector('.price-body')
  if (filterprice && bodyprice) {
    let Flagp = true
    filterprice.addEventListener('click', function () {
      bodyprice.style.display = Flagp ? 'block' : 'none'
      Flagp = !Flagp
    })
  }

  const filterbrand = document.getElementById('filter-brand')
  const bodybrand = document.querySelector('.brand-body')
  if (filterbrand && bodybrand) {
    let Flagb = true
    filterbrand.addEventListener('click', function () {
      bodybrand.style.display = Flagb ? 'block' : 'none'
      Flagb = !Flagb
    })


  }

  // خوندن category از URL
  const params = new URLSearchParams(window.location.search)
  const categoryParam = params.get("category")
  const searchParam = params.get("search")
  if (searchParam) {
    const grid = document.getElementById("products-grid")
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchParam.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchParam.toLowerCase())
    )
    grid.innerHTML = ""
    filtered.length === 0
      ? grid.innerHTML = `<p style="color:#aaa;font-size:14px;padding:40px 0">محصولی یافت نشد.</p>`
      : filtered.forEach(p => grid.appendChild(createCard(p)))
    return
  }

  // نمایش عنوان دسته‌بندی فعال
  if (categoryParam && document.getElementById("active-category-title")) {
    const categoryNames = {
      "پوشک-کودک": "پوشک کودک",
      "پوشک-بزرگسال": "پوشک بزرگسال",
      "نوار-بهداشتی": "نوار بهداشتی",
      "پنبه": "پنبه",
      "دستمال-مرطوب": "دستمال مرطوب"
    }
    document.getElementById("active-category-title").textContent =
      categoryNames[categoryParam] || categoryParam
    document.getElementById("active-category-title").style.display = "block"
  }

  if (document.getElementById("products-grid")) {
    renderProducts(categoryParam)
  }

})

// ------------------------------------ product data -----------------------------------

const products = [
  {
    id: 1,
    name: "پوشینه بزرگسال گلبهار سایز L",
    price: 300000,
    discountPercent: 20,
    image: "./img/poshinebozorgsalL.png",
    brand: "گلبهار",
    category: "پوشک-بزرگسال",
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
      { label: "جنس رویه", value: "پنبه‌ای نرم" },
      { label: "هسته جاذب", value: "سلولز + پلیمر فوق‌جاذب" },
      { label: "نشانگر رطوبت", value: "دارد" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "پوشینه بزرگسال گلبهار سایز L با هسته سلولزی فوق‌جاذب، رطوبت را در کسری از ثانیه جذب می‌کند و پوست را تا ۸ ساعت خشک نگه می‌دارد."
  },
  {
    id: 2,
    name: "پوشینه بزرگسال گلبهار سایز M",
    price: 85000,
    discountPercent: 0,
    image: "./img/poshakbozorgsalbig.png",
    brand: "گلبهار",
    category: "پوشک-بزرگسال",
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
      { label: "جنس رویه", value: "پنبه‌ای نرم" },
      { label: "هسته جاذب", value: "سلولز + پلیمر فوق‌جاذب" },
      { label: "نشانگر رطوبت", value: "دارد" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "پوشینه بزرگسال گلبهار سایز M با طراحی آناتومیک، راحتی حداکثری را برای کاربر فراهم می‌کند."
  },
  {
    id: 3,
    name: "پوشک نوزاد سایز بزرگ",
    price: 120000,
    discountPercent: 15,
    image: "./img/poshakkodakbig.png",
    brand: "نازنوش",
    category: "پوشک-کودک",
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
      { label: "جنس رویه", value: "پنبه‌ای نرم" },
      { label: "هسته جاذب", value: "سلولز + پلیمر فوق‌جاذب" },
      { label: "نوار چسبی", value: "قابل بازچسبانی" },
      { label: "نشانگر رطوبت", value: "دارد" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "پوشک نازنوش سایز ۴ با فناوری هسته سلولزی فوق‌جاذب، پوست کودک را تا ۱۲ ساعت خشک نگه می‌دارد."
  },
  {
    id: 4,
    name: "پوشک نوزاد سایز کوچک",
    price: 45000,
    discountPercent: 0,
    image: "./img/poshakkodak.png",
    brand: "نازنوش",
    category: "پوشک-کودک",
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
      { label: "جنس رویه", value: "الیاف نرم مخصوص نوزاد" },
      { label: "هسته جاذب", value: "سلولز طبیعی" },
      { label: "نوار چسبی", value: "قابل بازچسبانی" },
      { label: "نشانگر رطوبت", value: "دارد" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "پوشک نازنوش سایز نوزادی با طراحی ویژه برای نوزادان تازه متولد شده، از پوست حساس آن‌ها محافظت می‌کند."
  },
  {
    id: 5,
    name: "نوار بالدار ساده",
    price: 210000,
    discountPercent: 10,
    image: "./img/navarbig.png",
    brand: "نرمین",
    category: "نوار-بهداشتی",
    buyers: 126,
    warranty: "۶ ماهه",
    features: [
      "بال‌های محافظ دوطرفه",
      "لایه نرم و لطیف",
      "جذب سریع",
      "بدون عطر"
    ],
    specs: [
      { label: "نوع", value: "بالدار ساده" },
      { label: "اندازه", value: "Regular" },
      { label: "تعداد در بسته", value: "۳۰ عدد" },
      { label: "جنس رویه", value: "الیاف نرم" },
      { label: "نوع جذب", value: "جذب سریع" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "نوار بهداشتی بالدار ساده نرمین با لایه رویی نرم و لطیف، راحتی کامل را در طول روز فراهم می‌کند."
  },
  {
    id: 6,
    name: "پنبه هیدروفیل ۱۰۰ گرمی",
    price: 75000,
    discountPercent: 0,
    image: "./img/panbehidrofi.png",
    brand: "سانا",
    category: "پنبه",
    buyers: 89,
    warranty: "۶ ماهه",
    features: [
      "۱۰۰٪ پنبه طبیعی",
      "جذب بالای آب",
      "استریل و بهداشتی",
      "مناسب مصارف پزشکی"
    ],
    specs: [
      { label: "وزن", value: "۱۰۰ گرم" },
      { label: "نوع", value: "هیدروفیل (آب‌دوست)" },
      { label: "جنس", value: "پنبه طبیعی ۱۰۰٪" },
      { label: "کاربرد", value: "پزشکی و بهداشتی" },
      { label: "بسته‌بندی", value: "کیسه فشرده" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "پنبه هیدروفیل سانا از خالص‌ترین الیاف پنبه طبیعی تهیه شده و قابلیت جذب بالای آب و مایعات را دارد."
  },
  {
    id: 7,
    name: "پنبه ۱۰۰ گرمی",
    price: 95000,
    discountPercent: 25,
    image: "./img/panbe100g.png",
    brand: "سانا",
    category: "پنبه",
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
      { label: "نوع", value: "معمولی" },
      { label: "جنس", value: "پنبه طبیعی" },
      { label: "کاربرد", value: "آرایشی و بهداشتی" },
      { label: "بسته‌بندی", value: "کیسه زیپ‌دار" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "پنبه طبیعی سانا ۱۰۰ گرمی برای استفاده‌های روزمره آرایشی و بهداشتی مناسب است."
  },
  {
    id: 8,
    name: "پنبه ۵۰ گرمی",
    price: 38000,
    discountPercent: 0,
    image: "./img/panbe50g.png",
    brand: "سانا",
    category: "پنبه",
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
      { label: "نوع", value: "معمولی" },
      { label: "جنس", value: "پنبه طبیعی" },
      { label: "کاربرد", value: "آرایشی و بهداشتی" },
      { label: "بسته‌بندی", value: "کیسه زیپ‌دار" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "پنبه طبیعی سانا ۵۰ گرمی نسخه کوچک و مناسب برای سفر است."
  },
  {
    id: 9,
    name: "نوار بالدار مشبک",
    price: 340000,
    discountPercent: 5,
    image: "./img/navarbehdashty.png",
    brand: "نرمین",
    category: "نوار-بهداشتی",
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
      { label: "جنس رویه", value: "مشبک تنفس‌پذیر" },
      { label: "نوع جذب", value: "جذب عمیق دو لایه" },
      { label: "کشور سازنده", value: "ایران" }
    ],
    description: "نوار بهداشتی بالدار مشبک نرمین با رویه تنفس‌پذیر مشبک، جریان هوا را حفظ کرده و از تعریق جلوگیری می‌کند."
  }
]

// ------------------------------------ pagination -----------------------------------

const PER_PAGE = 8
let currentPage = 1
let activeCategory = null

function getDiscountedPrice(price, percent) {
  return Math.round(price * (1 - percent / 100))
}

function formatPrice(price) {
  return price.toLocaleString("fa-IR")
}

function getFilteredProducts() {
  if (!activeCategory) return products
  return products.filter(p => p.category === activeCategory)
}

function createCard(product) {
  const hasDiscount = product.discountPercent > 0
  const finalPrice = hasDiscount ? getDiscountedPrice(product.price, product.discountPercent) : product.price

  const card = document.createElement("div")
  card.className = "cart"

  card.innerHTML = `
    ${hasDiscount ? `<span class="cart-Discount">${product.discountPercent} <br> %</span>` : ""}
    <img class="cart-image" src="${product.image}" alt="${product.name}">
    <div class="cart-head">
      <h5>${product.name}</h5>
    </div>
    <div class="cart-line"></div>
    <div class="cart-price">
      ${hasDiscount ? `<p class="cart-price-before">${formatPrice(product.price)}</p>` : `<p></p>`}
      <strong class="cart-price-after">${formatPrice(finalPrice)}</strong>
    </div>
    <div class="cart-link">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.32759 8.3474L6.93059 15.5194C6.97459 16.0714 7.42559 16.4854 7.97659 16.4854H7.98059H18.8916H18.8936C19.4146 16.4854 19.8596 16.0974 19.9336 15.5824L20.8836 9.0234C20.9056 8.8674 20.8666 8.7114 20.7716 8.5854C20.6776 8.4584 20.5396 8.3764 20.3836 8.3544C20.1746 8.3624 11.5016 8.3504 6.32759 8.3474ZM7.97459 17.9854C6.65759 17.9854 5.54259 16.9574 5.43559 15.6424L4.51959 4.7484L3.01259 4.4884C2.60359 4.4164 2.33059 4.0294 2.40059 3.6204C2.47259 3.2114 2.86759 2.9454 3.26759 3.0094L5.34759 3.3694C5.68259 3.4284 5.93759 3.7064 5.96659 4.0464L6.20159 6.8474C20.4776 6.8534 20.5236 6.8604 20.5926 6.8684C21.1496 6.9494 21.6396 7.2404 21.9736 7.6884C22.3076 8.1354 22.4476 8.6864 22.3676 9.2384L21.4186 15.7964C21.2396 17.0444 20.1556 17.9854 18.8956 17.9854H18.8906H7.98259H7.97459Z" fill="black"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.2874 12.0437H14.5154C14.1004 12.0437 13.7654 11.7077 13.7654 11.2937C13.7654 10.8797 14.1004 10.5437 14.5154 10.5437H17.2874C17.7014 10.5437 18.0374 10.8797 18.0374 11.2937C18.0374 11.7077 17.7014 12.0437 17.2874 12.0437Z" fill="black"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.54351 21.0408C7.43051 21.0408 7.33851 21.1328 7.33851 21.2458C7.33851 21.4728 7.74951 21.4728 7.74951 21.2458C7.74951 21.1328 7.65651 21.0408 7.54351 21.0408ZM7.54351 22.5408C6.82951 22.5408 6.24951 21.9598 6.24951 21.2458C6.24951 20.5318 6.82951 19.9518 7.54351 19.9518C8.25751 19.9518 8.83851 20.5318 8.83851 21.2458C8.83851 21.9598 8.25751 22.5408 7.54351 22.5408Z" fill="black"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M18.8238 21.0408C18.7118 21.0408 18.6198 21.1328 18.6198 21.2458C18.6208 21.4748 19.0308 21.4728 19.0298 21.2458C19.0298 21.1328 18.9368 21.0408 18.8238 21.0408ZM18.8238 22.5408C18.1098 22.5408 17.5298 21.9598 17.5298 21.2458C17.5298 20.5318 18.1098 19.9518 18.8238 19.9518C19.5388 19.9518 20.1198 20.5318 20.1198 21.2458C20.1198 21.9598 19.5388 22.5408 18.8238 22.5408Z" fill="black"/>
      </svg>
      <a href="cart.html?id=${product.id}" class="cart-link-btn">مشاهده</a>
    </div>
  `

  return card
}

function renderProducts(categoryFilter) {
  if (categoryFilter) activeCategory = categoryFilter

  const grid = document.getElementById("products-grid")
  if (!grid) return

  const filtered = getFilteredProducts()
  const start = (currentPage - 1) * PER_PAGE
  const pageItems = filtered.slice(start, start + PER_PAGE)

  grid.innerHTML = ""

  if (pageItems.length === 0) {
    grid.innerHTML = `<p style="color:#aaa; font-size:14px; padding:40px 0">محصولی در این دسته‌بندی یافت نشد.</p>`
    return
  }

  pageItems.forEach(p => grid.appendChild(createCard(p)))

  // آپدیت تعداد در control-bar
  const countEl = document.querySelector(".control-bar-count")
  if (countEl) countEl.textContent = `${filtered.length} محصول`

  renderPagination(filtered.length)
}

function renderPagination(totalItems) {
  const container = document.getElementById("pagination")
  if (!container) return
  const totalPages = Math.ceil((totalItems || products.length) / PER_PAGE)
  container.innerHTML = ""
  if (totalPages <= 1) return

  const next = document.createElement("button")
  next.className = "page-btn page-arrow"
  next.textContent = "❮"
  next.disabled = currentPage === 1
  next.onclick = () => goTo(currentPage - 1)
  container.appendChild(next)

  getPages(currentPage, totalPages).forEach(p => {
    if (p === "...") {
      const dots = document.createElement("span")
      dots.className = "page-dots"
      dots.textContent = "..."
      container.appendChild(dots)
    } else {
      const btn = document.createElement("button")
      btn.className = "page-btn" + (p === currentPage ? " active" : "")
      btn.textContent = p
      btn.onclick = () => goTo(p)
      container.appendChild(btn)
    }
  })

  const prev = document.createElement("button")
  prev.className = "page-btn page-arrow"
  prev.textContent = "❯"
  prev.disabled = currentPage === totalPages
  prev.onclick = () => goTo(currentPage + 1)
  container.appendChild(prev)
}

function goTo(page) {
  const filtered = getFilteredProducts()
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  if (page < 1 || page > totalPages) return
  currentPage = page
  renderProducts()
  document.getElementById("products-grid").scrollIntoView({ behavior: "smooth", block: "start" })
}

function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", current - 1, current, current + 1, "...", total]
}