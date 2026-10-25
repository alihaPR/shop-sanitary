// ------------------------------------ state -----------------------------------

let currentPage = 1
let activeCategory = null
let activeSort = "default"
let priceMin = 0
let priceMax = Infinity
let activeBrands = []
let onlyAvailable = false

// فیلترهای اعمال‌شده روی لیست. متغیرهای بالا (priceMin / priceMax / activeBrands / onlyAvailable)
// فقط وضعیت کنترل‌های فیلتر هستند و تا زدن دکمه‌ی «نمایش محصولات» روی لیست اثر ندارند.
let applied = { onlyAvailable: false, brands: [], priceMin: 0, priceMax: Infinity }

const PER_PAGE = 10
const MAX_VAL = 400000

// ------------------------------------ data -----------------------------------


let products = [];

// ------------------------------------ helpers -----------------------------------

function getDiscountedPrice(price, percent) {
  return Math.round(price * (1 - percent / 100))
}

function formatPrice(price) {
  return price.toLocaleString("fa-IR")
}

// ------------------------------------ filter + sort -----------------------------------

function getFilteredSortedProducts() {
  let list = [...products]

  if (activeCategory) list = list.filter(p => p.category === activeCategory)
  if (applied.onlyAvailable) list = list.filter(p => p.available)
  if (applied.brands.length > 0) list = list.filter(p => applied.brands.includes(p.brand))

  list = list.filter(p => {
    const final = p.discountPercent > 0 ? getDiscountedPrice(p.price, p.discountPercent) : p.price
    return final >= applied.priceMin && final <= applied.priceMax
  })

  switch (activeSort) {
    case "cheapest":
      list.sort((a, b) => {
        const pa = a.discountPercent > 0 ? getDiscountedPrice(a.price, a.discountPercent) : a.price
        const pb = b.discountPercent > 0 ? getDiscountedPrice(b.price, b.discountPercent) : b.price
        return pa - pb
      }); break
    case "expensive":
      list.sort((a, b) => {
        const pa = a.discountPercent > 0 ? getDiscountedPrice(a.price, a.discountPercent) : a.price
        const pb = b.discountPercent > 0 ? getDiscountedPrice(b.price, b.discountPercent) : b.price
        return pb - pa
      }); break
    case "available":
      list.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0)); break
    case "bestseller":
      list.sort((a, b) => b.buyers - a.buyers); break
    case "newest":
      list.sort((a, b) => b.id - a.id); break
  }

  return list
}

// ------------------------------------ render -----------------------------------

function renderProducts(categoryFilter) {
  if (categoryFilter) activeCategory = categoryFilter
  currentPage = 1
  render()
}

function render() {
  const grid = document.getElementById("products-grid")
  if (!grid) return

  const list = getFilteredSortedProducts()
  const start = (currentPage - 1) * PER_PAGE
  const pageItems = list.slice(start, start + PER_PAGE)

  grid.innerHTML = ""

  if (pageItems.length === 0) {
    grid.innerHTML = `<p style="color:#aaa; font-size:14px; padding:40px 0">محصولی یافت نشد.</p>`
    document.getElementById("pagination").innerHTML = ""
    return
  }

  pageItems.forEach(p => grid.appendChild(createCard(p)))

  const countEl = document.querySelector(".control-bar-count")
  if (countEl) countEl.textContent = `${list.length} محصول`

  renderPagination(list.length)
}

function createCard(product) {
  var tomanSvg =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M3.93051 2.23964L4.91279 1.28564L5.91565 2.24993L4.91794 3.20264L3.93051 2.23964ZM8.08336 5.42822C8.08336 6.22793 7.87765 6.85664 7.46879 7.31436C7.21036 7.5985 6.87479 7.81579 6.46208 7.96364C6.01313 8.11174 5.54231 8.1826 5.06965 8.17322H4.35608C3.81479 8.17322 3.32622 8.07807 2.89165 7.8865C2.42217 7.68897 2.02017 7.35933 1.73451 6.93764C1.42997 6.45874 1.27385 5.90048 1.28579 5.33307C1.28579 5.25722 1.28708 5.18264 1.29094 5.10679C1.32951 4.39964 1.55322 3.61793 1.96594 2.75779L3.37379 3.38007C3.04336 4.06407 2.86336 4.66579 2.83508 5.18393C2.83251 5.23536 2.82994 5.28679 2.82994 5.33822C2.82994 5.66222 2.90065 5.92707 3.04336 6.13279C3.19679 6.35604 3.42468 6.51738 3.68622 6.58793C3.79551 6.62393 3.91508 6.64964 4.04365 6.66507C4.14522 6.67793 4.24936 6.68307 4.35608 6.68307H5.06965C5.65851 6.68307 6.05836 6.57893 6.26922 6.36936C6.44922 6.19064 6.53922 5.87693 6.53922 5.4295V2.59707H8.08208V5.42822H8.08336ZM15.0687 9.52193L14.1429 8.62193L15.0545 7.71422L15.9995 8.62322L15.0687 9.52193ZM11.3967 9.91793C12.0935 9.91793 12.6477 10.1622 13.0591 10.6495C13.4409 11.0944 13.6312 11.6485 13.6312 12.3119V12.7799H13.8626V12.7748H14.3898C14.6739 12.7748 14.8745 12.7388 14.9902 12.6668C15.1098 12.5961 15.1702 12.4868 15.1702 12.3351V12.2464C15.1754 11.9339 15.1921 10.9041 15.1702 10.8128L16.7144 10.3499V12.3736C16.7183 12.7743 16.5884 13.1647 16.3454 13.4832C15.9519 14.0039 15.3117 14.2636 14.4232 14.2636H13.6171C13.5387 15.2061 13.0591 15.8798 12.1809 16.2861C11.8377 16.4429 11.4352 16.5561 10.9762 16.6268C10.5874 16.6862 10.1944 16.715 9.80108 16.7129V15.2228C10.5879 15.2228 11.1794 15.1174 11.5754 14.9052C11.8968 14.7355 12.0588 14.5221 12.0588 14.2636H11.3967C10.8361 14.2636 10.3591 14.1184 9.96565 13.8278C9.49379 13.4768 9.25851 12.9702 9.25851 12.3106C9.25851 11.6832 9.41536 11.1522 9.73036 10.7164C10.1109 10.1828 10.6664 9.91664 11.3967 9.91664V9.91793ZM12.0819 12.7799V12.3119C12.0819 12.0329 12.0202 11.8118 11.8981 11.6485C11.8403 11.5707 11.7645 11.5082 11.6771 11.4663C11.5897 11.4244 11.4935 11.4044 11.3967 11.4081C11.2988 11.4047 11.2015 11.4247 11.1129 11.4665C11.0244 11.5084 10.9471 11.5708 10.8875 11.6485C10.765 11.8153 10.7033 12.019 10.7127 12.2258C10.7125 12.2545 10.7137 12.2833 10.7165 12.3119C10.7268 12.4726 10.8014 12.5948 10.9441 12.6758C11.0637 12.7452 11.2141 12.7786 11.3967 12.7786L12.0819 12.7799ZM12.2144 8.62322L13.1401 9.52322L14.0709 8.62322L13.1259 7.71422L12.2144 8.62322ZM3.60779 14.9078H3.64636C4.20308 14.8949 4.60422 14.7715 4.85108 14.5349C4.88194 14.5504 4.93465 14.5799 5.00536 14.6224L5.10051 14.6725L5.20465 14.7265C5.37822 14.8204 5.54022 14.8975 5.69194 14.9579C6.13551 15.1456 6.55336 15.2408 6.94808 15.2408C7.15414 15.2452 7.35905 15.2089 7.55101 15.1339C7.74298 15.0589 7.91822 14.9466 8.06665 14.8036C8.45236 14.4372 8.64394 13.8856 8.64394 13.1502C8.63936 12.6291 8.49026 12.1195 8.21322 11.6781C7.82879 11.0905 7.27208 10.7974 6.54179 10.7974C5.89636 10.7974 5.36408 11.0442 4.94494 11.5366C4.79965 11.7064 4.67494 11.9018 4.56694 12.1229C4.52579 12.2026 4.48979 12.2836 4.45894 12.3685C4.44333 12.4008 4.43042 12.4343 4.42036 12.4688C4.41045 12.4943 4.40101 12.52 4.39208 12.5459C4.25965 12.9432 4.17222 13.1695 4.12851 13.2274C4.03594 13.3431 3.85336 13.4074 3.57951 13.4164C3.42136 13.4099 3.31079 13.3778 3.25036 13.3186C3.17708 13.2492 3.14108 13.1219 3.14108 12.9368V8.99993L1.59694 8.35707V12.9368C1.59694 13.2724 1.65865 13.5745 1.78079 13.8406C1.87208 14.0438 1.99679 14.2212 2.15365 14.3716C2.31179 14.5234 2.49565 14.6429 2.70651 14.7316C2.96108 14.8396 3.24651 14.8988 3.56151 14.9065V14.9078H3.60779ZM7.14608 13.6041C7.19973 13.4592 7.2191 13.3038 7.20265 13.1502C7.19249 12.9324 7.11874 12.7223 6.99051 12.5459C6.86194 12.3736 6.71151 12.2875 6.54051 12.2875C6.30908 12.2875 6.11622 12.4199 5.96579 12.6861C5.91179 12.7774 5.86294 12.8892 5.81922 13.0229C5.80075 13.0739 5.7836 13.1253 5.76779 13.1772L5.74851 13.2454L5.72922 13.3045C5.91179 13.4562 6.14451 13.5822 6.42865 13.6812C6.66008 13.7609 6.84651 13.7995 6.98536 13.7995C7.04194 13.7995 7.09594 13.7352 7.14608 13.6041Z" fill="#1E1E1E" fill-rule="evenodd" clip-rule="evenodd"/>' +
    '</svg>';
  const hasDiscount = product.discountPercent > 0
  const finalPrice = hasDiscount ? getDiscountedPrice(product.price, product.discountPercent) : product.price
  const lowStock = typeof product.stock === "number" && product.stock > 0 && product.stock <= 3

  const card = document.createElement("a")
  card.className = "cart"
  card.href = `cart.html?id=${product._id}`

  const svgBasket = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.32759 8.3474L6.93059 15.5194C6.97459 16.0714 7.42559 16.4854 7.97659 16.4854H7.98059H18.8916H18.8936C19.4146 16.4854 19.8596 16.0974 19.9336 15.5824L20.8836 9.0234C20.9056 8.8674 20.8666 8.7114 20.7716 8.5854C20.6776 8.4584 20.5396 8.3764 20.3836 8.3544C20.1746 8.3624 11.5016 8.3504 6.32759 8.3474ZM7.97459 17.9854C6.65759 17.9854 5.54259 16.9574 5.43559 15.6424L4.51959 4.7484L3.01259 4.4884C2.60359 4.4164 2.33059 4.0294 2.40059 3.6204C2.47259 3.2114 2.86759 2.9454 3.26759 3.0094L5.34759 3.3694C5.68259 3.4284 5.93759 3.7064 5.96659 4.0464L6.20159 6.8474C20.4776 6.8534 20.5236 6.8604 20.5926 6.8684C21.1496 6.9494 21.6396 7.2404 21.9736 7.6884C22.3076 8.1354 22.4476 8.6864 22.3676 9.2384L21.4186 15.7964C21.2396 17.0444 20.1556 17.9854 18.8956 17.9854H18.8906H7.98259H7.97459Z" fill="black"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.2874 12.0437H14.5154C14.1004 12.0437 13.7654 11.7077 13.7654 11.2937C13.7654 10.8797 14.1004 10.5437 14.5154 10.5437H17.2874C17.7014 10.5437 18.0374 10.8797 18.0374 11.2937C18.0374 11.7077 17.7014 12.0437 17.2874 12.0437Z" fill="black"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.54351 21.0408C7.43051 21.0408 7.33851 21.1328 7.33851 21.2458C7.33851 21.4728 7.74951 21.4728 7.74951 21.2458C7.74951 21.1328 7.65651 21.0408 7.54351 21.0408ZM7.54351 22.5408C6.82951 22.5408 6.24951 21.9598 6.24951 21.2458C6.24951 20.5318 6.82951 19.9518 7.54351 19.9518C8.25751 19.9518 8.83851 20.5318 8.83851 21.2458C8.83851 21.9598 8.25751 22.5408 7.54351 22.5408Z" fill="black"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.8238 21.0408C18.7118 21.0408 18.6198 21.1328 18.6198 21.2458C18.6208 21.4748 19.0308 21.4728 19.0298 21.2458C19.0298 21.1328 18.9368 21.0408 18.8238 21.0408ZM18.8238 22.5408C18.1098 22.5408 17.5298 21.9598 17.5298 21.2458C17.5298 20.5318 18.1098 19.9518 18.8238 19.9518C19.5388 19.9518 20.1198 20.5318 20.1198 21.2458C20.1198 21.9598 19.5388 22.5408 18.8238 22.5408Z" fill="black"/>
  </svg>`
  const imageUrl = `https://api.narmcenter.com/${product.image.replace(/^\/?/, "")}`;
  card.innerHTML = `
    ${hasDiscount ? `<span class="cart-Discount">${product.discountPercent} <br> %</span>` : ""}
    ${!product.available ? `<span class="cart-unavailable">ناموجود</span>` : ""}
    <img class="cart-image" src="${imageUrl}" alt="${product.name}">
    <div class="cart-head"><h5>${product.name}</h5></div>
    <div class="cart-line"></div>
    <div class="cart-price">
      ${hasDiscount ? `<p class="cart-price-before">${formatPrice(product.price)}</p>` : `<p></p>`}
  <strong class="cart-price-after">
  ${formatPrice(finalPrice)}
  ${tomanSvg}
</strong>
    </div>
    <div class="cart-link">
      ${svgBasket}
      <span class="cart-link-btn">مشاهده</span>
    </div>
  `
  // ${lowStock ? `<p class="cart-lowstock">تنها ${product.stock} عدد در انبار باقی مانده</p>` : ""}

  return card
}

// ------------------------------------ pagination -----------------------------------

function renderPagination(totalItems) {
  const container = document.getElementById("pagination")
  if (!container) return
  const totalPages = Math.ceil(totalItems / PER_PAGE)
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
  const totalPages = Math.ceil(getFilteredSortedProducts().length / PER_PAGE)
  if (page < 1 || page > totalPages) return
  currentPage = page
  render()
  document.getElementById("products-grid").scrollIntoView({ behavior: "smooth", block: "start" })
}

function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", current - 1, current, current + 1, "...", total]
}

// ------------------------------------ dual range -----------------------------------

let rangeMin, rangeMax, track

function updateTrack() {
  if (!rangeMin || !rangeMax || !track) return
  const low = parseInt(rangeMin.value)
  const high = parseInt(rangeMax.value)
  const lowPct = (low / MAX_VAL) * 100
  const highPct = (high / MAX_VAL) * 100
  track.style.right = lowPct + '%'
  track.style.left = (100 - highPct) + '%'
  track.style.width = (highPct - lowPct) + '%'
  priceMin = low
  priceMax = high === MAX_VAL ? Infinity : high
}

function syncInputsFromRange(priceInputs) {
  const low = parseInt(rangeMin.value)
  const high = parseInt(rangeMax.value)
  if (priceInputs[0]) priceInputs[0].value = formatPrice(low)
  if (priceInputs[1]) priceInputs[1].value = formatPrice(high)
}

function resetRange(priceInputs) {
  if (rangeMin) rangeMin.value = 0
  if (rangeMax) rangeMax.value = MAX_VAL
  priceMin = 0
  priceMax = Infinity
  updateTrack()
  syncInputsFromRange(priceInputs)
}
// فیلترها فقط با دکمه‌ی «نمایش محصولات» (یا حذف فیلترها) روی لیست اعمال می‌شوند
function applyFilters() {
  applied = {
    onlyAvailable,
    brands: activeBrands.slice(),
    priceMin,
    priceMax
  }
  currentPage = 1
  render()
}

// اگر پنل فیلتر بدون اعمال بسته شد، کنترل‌ها به وضعیت اعمال‌شده برمی‌گردند
function restoreFilterControls() {
  onlyAvailable = applied.onlyAvailable
  activeBrands = applied.brands.slice()

  const stock = document.querySelector('.stock input[type="checkbox"]')
  if (stock) stock.checked = onlyAvailable

  document.querySelectorAll('.brand-label-item input[type="checkbox"]').forEach(cb => {
    const name = cb.closest('.brand-label-item').querySelector('span').textContent.trim()
    cb.checked = activeBrands.includes(name)
  })

  if (rangeMin && rangeMax) {
    rangeMin.value = applied.priceMin
    rangeMax.value = applied.priceMax === Infinity ? MAX_VAL : applied.priceMax
    updateTrack()
    syncInputsFromRange(document.querySelectorAll('.price-input'))
  }
}

function appliedFilterCount() {
  return (applied.onlyAvailable ? 1 : 0)
    + applied.brands.length
    + ((applied.priceMin > 0 || applied.priceMax !== Infinity) ? 1 : 0)
}

// ------------------------------------ init -----------------------------------

document.addEventListener("DOMContentLoaded", function () {

  // تاگل قیمت
  const filterprice = document.getElementById('filter-price')
  const bodyprice = document.querySelector('.price-body')
  if (filterprice && bodyprice) {
    let flag = true
    filterprice.addEventListener('click', () => {
      bodyprice.style.display = flag ? 'block' : 'none'
      flag = !flag
    })
  }

  // تاگل برند
  const filterbrand = document.getElementById('filter-brand')
  const bodybrand = document.querySelector('.brand-body')
  if (filterbrand && bodybrand) {
    let flag = true
    filterbrand.addEventListener('click', () => {
      bodybrand.style.display = flag ? 'block' : 'none'
      flag = !flag
    })
  }

  // فیلتر موجودی
  const stockToggle = document.querySelector('.stock input[type="checkbox"]')
  if (stockToggle) {
    stockToggle.addEventListener('change', () => {
      onlyAvailable = stockToggle.checked
    })
  }

  // dual range slider
  rangeMin = document.getElementById('rangeMin')
  rangeMax = document.getElementById('rangeMax')
  track = document.querySelector('.price-range-track')
  const priceInputs = document.querySelectorAll('.price-input')

  if (rangeMin && rangeMax) {

    rangeMin.addEventListener('input', () => {
      updateTrack()
      syncInputsFromRange(priceInputs)
    })

    rangeMax.addEventListener('input', () => {
      updateTrack()
      syncInputsFromRange(priceInputs)
    })

    if (priceInputs[0]) {
      priceInputs[0].addEventListener('input', () => {
        const val = parseInt(priceInputs[0].value.replace(/[^0-9]/g, '')) || 0
        rangeMin.value = val
        updateTrack()
      })
    }

    if (priceInputs[1]) {
      priceInputs[1].addEventListener('input', () => {
        const val = parseInt(priceInputs[1].value.replace(/[^0-9]/g, '')) || MAX_VAL
        rangeMax.value = Math.min(val, MAX_VAL)
        updateTrack()
      })
    }

    updateTrack()
    syncInputsFromRange(priceInputs)
  }

  // فیلتر برند
  const brandCheckboxes = document.querySelectorAll('.brand-label-item input[type="checkbox"]')
  brandCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const brandName = cb.closest('.brand-label-item').querySelector('span').textContent.trim()
      if (cb.checked) {
        activeBrands.push(brandName)
      } else {
        activeBrands = activeBrands.filter(b => b !== brandName)
      }
    })
  })

  // سرچ برند
  const brandSearch = document.querySelector('.body-search')
  if (brandSearch) {
    brandSearch.addEventListener('input', () => {
      const val = brandSearch.value.trim().toLowerCase()
      document.querySelectorAll('.brand-label-item').forEach(item => {
        const name = item.querySelector('span').textContent.trim().toLowerCase()
        item.style.display = name.includes(val) ? 'flex' : 'none'
      })
    })
  }

  // مرتب‌سازی
  const sortMap = {
    'جدیدترین': 'newest', 'ارزان ترین': 'cheapest', 'گران ترین': 'expensive',
    'موجودی': 'available', 'پرفروش ترین': 'bestseller', 'بزودی': 'default'
  }

  const sortItems = document.querySelectorAll('.bar-wrapper-item a')
  sortItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault()
      sortItems.forEach(i => i.classList.remove('active-sort'))
      item.classList.add('active-sort')
      activeSort = sortMap[item.textContent.trim()] || 'default'
      currentPage = 1
      render()
    })
  })

  // ریست
  const resetBtn = document.querySelector('.filter-reset')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeSort = 'default'
      activeBrands = []
      onlyAvailable = false
      currentPage = 1
      if (stockToggle) stockToggle.checked = false
      brandCheckboxes.forEach(cb => cb.checked = false)
      sortItems.forEach(i => i.classList.remove('active-sort'))
      if (brandSearch) brandSearch.value = ''
      document.querySelectorAll('.brand-label-item').forEach(i => i.style.display = 'flex')
      resetRange(priceInputs)
      applyFilters()
    })
  }

  // دکمه‌ی «نمایش محصولات»: فیلترهای انتخاب‌شده اینجا اعمال می‌شوند
  const applyBtn = document.querySelector('.filter-apply')
  if (applyBtn) applyBtn.addEventListener('click', applyFilters)

  // URL params
  const params = new URLSearchParams(window.location.search)

  const categoryParam = params.get("category")
  const searchParam = params.get("search")


  if (categoryParam && document.getElementById("active-category-title")) {
    const categoryNames = {
      "پوشک-کودک": "پوشک کودک", "پوشک-بزرگسال": "پوشک بزرگسال",
      "نوار-بهداشتی": "نوار بهداشتی", "پنبه": "پنبه", "دستمال-مرطوب": "دستمال مرطوب"
    }
    const el = document.getElementById("active-category-title")
    el.textContent = categoryNames[categoryParam] || categoryParam
    el.style.display = "block"
  }

  if (document.getElementById("products-grid")) {

    let url = `${API_BASE_URL}/products`;

    if (searchParam) {

      url += `?search=${encodeURIComponent(searchParam)}`;

    }

    fetch(url)
      .then(res => res.json())
      .then(data => {

        products = data;

        renderProducts(categoryParam);

      })
      .catch(err => {

        console.error(err);

      });

  }

})

if (typeof module !== "undefined") {
  module.exports = products;
}

// ------------------------------------------------------------------------------------------------
const filterBox = document.querySelector(".filter-box");
const categoryWrapper = document.querySelector(".daste-bandy-wraper");

const sortHTML = `
<ul class="mobile-sort-list">
    <li data-sort="newest">جدیدترین</li>
    <li data-sort="cheap">ارزان‌ترین</li>
    <li data-sort="expensive">گران‌ترین</li>
    <li data-sort="stock">موجودی</li>
    <li data-sort="bestseller">پرفروش‌ترین</li>
</ul>
`;

const sheet = document.querySelector(".mobile-sheet");
const overlay = document.querySelector(".mobile-sheet-overlay");
const title = document.querySelector(".sheet-title");
const content = document.querySelector(".sheet-content");
const mobileFilterBtn = document.querySelector(".mobile-filter-btn");
const mobileSortBtn = document.querySelector(".mobile-sort-btn");
const sheetCloseBtn = document.querySelector(".sheet-close");
const mobileHeaderIcon = document.querySelector(".mobile-header-icon");

// جایی که filterBox اصلا در صفحه قرار داره، برای اینکه بعد از استفاده در
// شیت موبایل، بدون از دست دادن رویدادهاش (event listener) برگرده سرجاش
let filterBoxHome = null;

function releaseFilterBox() {

  if (filterBox && filterBoxHome && filterBox.parentNode === content) {
    filterBoxHome.parent.insertBefore(filterBox, filterBoxHome.next);
  }

}

function openSheet(titleText) {

  if (title) title.textContent = titleText;

  if (sheet) sheet.classList.add("active");
  if (overlay) overlay.classList.add("active");

}

if (mobileFilterBtn) {
  mobileFilterBtn.addEventListener("click", () => {

    if (filterBox && content) {

      if (!filterBoxHome) {
        filterBoxHome = {
          parent: filterBox.parentNode,
          next: filterBox.nextSibling
        };
      }

      // به جای کپی کردن innerHTML (که رویدادهای فیلتر رو از دست می‌داد)
      // خود المنت اصلی فیلتر رو منتقل می‌کنیم تا سالم کار کنه
      content.innerHTML = "";
      content.appendChild(filterBox);

    }

    openSheet("فیلترها");

  });
}

if (mobileSortBtn) {
  mobileSortBtn.addEventListener("click", () => {

    releaseFilterBox();

    if (content) content.innerHTML = sortHTML;

    openSheet("مرتب سازی");

  });
}

// دسته‌بندی محصولات در موبایل، از طریق آیکون بالای هدر موبایل
// if (mobileHeaderIcon && categoryWrapper && sheet && overlay && content) {

//   mobileHeaderIcon.style.cursor = "pointer";

//   mobileHeaderIcon.addEventListener("click", () => {

//     releaseFilterBox();

//     content.innerHTML = `<div class="mobile-category-list">${categoryWrapper.innerHTML}</div>`;

//     openSheet("دسته‌بندی محصولات");

//   });

// }

function closeSheet() {

  restoreFilterControls();

  if (sheet) sheet.classList.remove("active");
  if (overlay) overlay.classList.remove("active");

  // بعد از اتمام انیمیشن بسته شدن شیت، فیلتر رو برگردون سرجای اصلیش
  setTimeout(releaseFilterBox, 350);

}

if (overlay) overlay.addEventListener("click", closeSheet);

if (sheetCloseBtn) sheetCloseBtn.addEventListener("click", closeSheet);

function sortProducts(type) {
  const map = {
    newest: "newest",
    cheap: "cheapest",
    expensive: "expensive",
    stock: "available",
    bestseller: "bestseller"
  };

  activeSort = map[type] || "default";
  currentPage = 1;
  render();
}

document.addEventListener("click", (e) => {

  if (!e.target.matches(".mobile-sort-list li")) return;

  const type = e.target.dataset.sort;

  sortProducts(type);

  closeSheet();

});