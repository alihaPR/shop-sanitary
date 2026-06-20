// =====================================================
// cart-loader.js
// این فایل رو توی cart.html قبل از بسته شدن </body> اضافه کن:
// <script src="/frontend/js/products.js"></script>
// <script src="/frontend/js/cart-loader.js"></script>
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

  // خوندن id از URL
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));

  // پیدا کردن محصول
  const product = products.find(p => p.id === productId);

  // اگه محصول پیدا نشد
  if (!product) {
    document.querySelector(".main-card").innerHTML = `
      <div style="text-align:center; padding: 60px; width:100%">
        <p style="font-size:16px; color:#83887F">محصول مورد نظر یافت نشد.</p>
        <a href="products.html" style="color:#3C6E55; font-weight:600">بازگشت به محصولات</a>
      </div>`;
    return;
  }

  // ---- قیمت ----
  const hasDiscount = product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discountPercent / 100))
    : product.price;

  function formatPrice(p) {
    return p.toLocaleString("fa-IR");
  }

  // ---- عنوان صفحه ----
  document.title = product.name;

  // ---- عکس محصول ----
  const mainImg = document.querySelector(".main-img");
  if (mainImg) {
    mainImg.style.backgroundImage = `url(${product.image})`;
    mainImg.innerHTML = ""; // حذف SVG پیش‌فرض
  }

  // ---- برند ----
  const brandLine = document.querySelector(".brand-line");
  if (brandLine) brandLine.textContent = product.brand;

  // ---- نام محصول ----
  const h1 = document.querySelector(".info-side h1");
  if (h1) h1.textContent = product.name;

  // ---- ویژگی‌ها ----
  const featList = document.querySelector(".feat-list");
  if (featList && product.features) {
    featList.innerHTML = product.features.map(f => `
      <div class="feat-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>${f}</span>
      </div>
    `).join("");
  }

  // ---- قیمت ----
  const priceNum = document.querySelector(".price-num");
  const priceUnit = document.querySelector(".price-unit");
  if (priceNum) priceNum.textContent = formatPrice(finalPrice);

  // نمایش قیمت قبل از تخفیف
  if (hasDiscount) {
    const priceRow = document.querySelector(".price-row");
    if (priceRow) {
      const oldPrice = document.createElement("span");
      oldPrice.style.cssText = "font-size:13px; color:#83887F; text-decoration:line-through;";
      oldPrice.textContent = formatPrice(product.price) + " تومان";
      priceRow.insertBefore(oldPrice, priceRow.firstChild);

      // تگ تخفیف
      const tag = document.querySelector(".best-price-tag");
      if (tag) tag.textContent = `${product.discountPercent}٪ تخفیف ویژه`;
    }
  }

  // ---- تعداد خریداران ----
  const extraBuyers = document.querySelector(".extra-buyers");
  if (extraBuyers) extraBuyers.textContent = `${product.buyers} نفر در حال خرید این کالا`;

  // ---- گارانتی توی seller-card ----
  const checkItems = document.querySelectorAll(".check-item span");
  if (checkItems.length >= 1) {
    checkItems[0].innerHTML = `عملکرد <b>98%</b> رضایت از کالا`;
  }
  if (checkItems.length >= 2) {
    checkItems[1].innerHTML = `<b>${product.warranty}</b> گارانتی اصالت کالا`;
  }

  // ---- جدول مشخصات ----
  const featureTable = document.querySelector(".feature-table");
  if (featureTable && product.specs) {
    featureTable.innerHTML = product.specs.map(s => `
      <tr>
        <td>${s.label}</td>
        <td>${s.value}</td>
      </tr>
    `).join("");
  }

  // ---- توضیحات ----
  const descText = document.querySelector(".desc-text");
  if (descText) descText.textContent = product.description;

});