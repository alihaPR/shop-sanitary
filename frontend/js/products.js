let $ = document

let filterprice = $.getElementById('filter-price')
let bodyprice = $.querySelector('.price-body')
let Flagp = true

filterprice.addEventListener('click', function () {
    if (Flagp) {
        bodyprice.style.display = 'block'
        Flagp = false
    } else {
        bodyprice.style.display = 'none'
        Flagp = true
    }
})

let filterbrand = $.getElementById('filter-brand')
let bodybrand = $.querySelector('.brand-body')
let Flagb = true

filterbrand.addEventListener('click', function () {
    if (Flagb) {
        bodybrand.style.display = 'block'
        Flagb = false
    } else {
        bodybrand.style.display = 'none'
        Flagb = true
    }
})

// ------------------------------------ product - Pagination -----------------------------------


const products = [
  { id: 1,  name: "پوشک بزرگسال گلبهار",       price: 300000, discountPercent: 20, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 2,  name: "دستمال مرطوب نوزاد گلبهار",  price: 85000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 3,  name: "پوشک نوزاد سایز ۳",          price: 120000, discountPercent: 15, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 4,  name: "دستمال کاغذی ۱۰۰ برگ",       price: 45000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 5,  name: "پوشک شبانه گلبهار",          price: 210000, discountPercent: 10, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 6,  name: "دستمال مرطوب حساس",          price: 75000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 7,  name: "پوشک نوزاد سایز ۱",          price: 95000,  discountPercent: 25, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 8,  name: "دستمال کاغذی جعبه‌ای",       price: 38000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 9,  name: "پوشک بزرگسال شبانه",         price: 340000, discountPercent: 5,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 10, name: "دستمال مرطوب ۷۲ عددی",       price: 62000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 11, name: "پوشک نوزاد سایز ۵",          price: 175000, discountPercent: 30, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 12, name: "دستمال کاغذی رولی",          price: 55000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 13, name: "پوشک گلبهار سایز ۴",         price: 145000, discountPercent: 10, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 14, name: "دستمال مرطوب ۱۲۰ عددی",      price: 98000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 15, name: "پوشک بزرگسال روزانه",        price: 280000, discountPercent: 8,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 16, name: "دستمال کاغذی نرم",           price: 42000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 17, name: "پوشک نوزاد سایز ۲",          price: 105000, discountPercent: 20, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 18, name: "دستمال مرطوب آنتی‌باکتریال", price: 88000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 19, name: "پوشک گلبهار سایز ۶",         price: 195000, discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 20, name: "دستمال کاغذی ۲۰۰ برگ",       price: 72000,  discountPercent: 15, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 21, name: "پوشک بزرگسال مراقبتی",       price: 320000, discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 22, name: "دستمال مرطوب کودک",          price: 68000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 23, name: "پوشک نوزاد پریمیوم",         price: 220000, discountPercent: 12, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 24, name: "دستمال کاغذی فله",           price: 35000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 25, name: "پوشک گلبهار سایز ۷",         price: 240000, discountPercent: 8,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 26, name: "دستمال مرطوب بدون عطر",      price: 79000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 27, name: "پوشک بزرگسال اقتصادی",       price: 260000, discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 28, name: "دستمال کاغذی مینی",          price: 28000,  discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 29, name: "پوشک نوزاد ارگانیک",         price: 310000, discountPercent: 20, image: "./img/poshak-bozorg-sal-larg.png" },
  { id: 30, name: "دستمال مرطوب خانوادگی",      price: 115000, discountPercent: 0,  image: "./img/poshak-bozorg-sal-larg.png" },
];

const PER_PAGE = 8;
let currentPage = 1;

function getDiscountedPrice(price, percent) {
  return Math.round(price * (1 - percent / 100));
}

function formatPrice(price) {
  return price.toLocaleString("fa-IR");
}

function createCard(product) {
  const hasDiscount = product.discountPercent > 0;
  const finalPrice = hasDiscount ? getDiscountedPrice(product.price, product.discountPercent) : product.price;

  const card = document.createElement("div");
  card.className = "cart";

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
      <a href="product-detail.html?id=${product.id}" class="cart-link-btn">مشاهده</a>
    </div>
  `;

  return card;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = products.slice(start, start + PER_PAGE);

  grid.innerHTML = "";
  pageItems.forEach(p => grid.appendChild(createCard(p)));

  renderPagination();
}

function renderPagination() {
  const container = document.getElementById("pagination");
  const totalPages = Math.ceil(products.length / PER_PAGE);
  container.innerHTML = "";

  if (totalPages <= 1) return;

  // دکمه بعدی (چون RTL سمت راست است)
  const next = document.createElement("button");
  next.className = "page-btn page-arrow";
  next.textContent = "❮";
  next.disabled = currentPage === 1;
  next.onclick = () => goTo(currentPage - 1);
  container.appendChild(next);

  // شماره صفحات
  getPages(currentPage, totalPages).forEach(p => {
    if (p === "...") {
      const dots = document.createElement("span");
      dots.className = "page-dots";
      dots.textContent = "...";
      container.appendChild(dots);
    } else {
      const btn = document.createElement("button");
      btn.className = "page-btn" + (p === currentPage ? " active" : "");
      btn.textContent = p;
      btn.onclick = () => goTo(p);
      container.appendChild(btn);
    }
  });

  // دکمه قبلی
  const prev = document.createElement("button");
  prev.className = "page-btn page-arrow";
  prev.textContent = "❯";
  prev.disabled = currentPage === totalPages;
  prev.onclick = () => goTo(currentPage + 1);
  container.appendChild(prev);
}

function goTo(page) {
  const totalPages = Math.ceil(products.length / PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderProducts();
  document.getElementById("products-grid").scrollIntoView({ behavior: "smooth", block: "start" });
}

function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
  return [1, "...", current-1, current, current+1, "...", total];
}

document.addEventListener("DOMContentLoaded", renderProducts);