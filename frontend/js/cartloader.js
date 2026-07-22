document.addEventListener("DOMContentLoaded", async function () {

  const API_BASE_URL = "https://shop-sanitary-production.up.railway.app/api";

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  const product = await response.json();

  if (!product) {
    document.querySelector(".main-card").innerHTML = `
      <div style="text-align:center; padding: 60px; width:100%">
        <p style="font-size:16px; color:#83887F">محصول مورد نظر یافت نشد.</p>
        <a href="products.html" style="color:#3C6E55; font-weight:600">بازگشت به محصولات</a>
      </div>`;
    return;
  }

  const hasDiscount = product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discountPercent / 100))
    : product.price;

  function formatPrice(p) { return p.toLocaleString("fa-IR"); }

  document.title = product.name;

  const mainImg = document.querySelector(".main-img");
  if (mainImg) { mainImg.style.backgroundImage = `url(${product.image})`; mainImg.innerHTML = ""; }

  const brandLine = document.querySelector(".brand-line");
  if (brandLine) brandLine.textContent = product.brand || "";

  const h1 = document.querySelector(".info-side h1");
  if (h1) h1.textContent = product.name;

  const featList = document.querySelector(".feat-list");
  if (featList && product.features) {
    featList.innerHTML = product.features.map(f => `
      <div class="feat-item">
        <span>${f}<br><b></b></span>
      </div>`).join("");
  }

  const priceNum = document.querySelector(".price-num");
  if (priceNum) priceNum.textContent = formatPrice(finalPrice);

  if (hasDiscount) {
    const priceRow = document.querySelector(".price-row");
    if (priceRow) {
      const oldPrice = document.createElement("span");
      oldPrice.style.cssText = "font-size:13px; color:#83887F; text-decoration:line-through;";
      oldPrice.textContent = formatPrice(product.price) + " تومان";
      priceRow.insertBefore(oldPrice, priceRow.firstChild);
      const tag = document.querySelector(".best-price-tag");
      if (tag) tag.textContent = `${product.discountPercent}٪ تخفیف ویژه`;
    }
  }

  const extraBuyers = document.querySelector(".extra-buyers");
  if (extraBuyers && product.buyers) extraBuyers.textContent = `${product.buyers} نفر در حال خرید این کالا`;

  const checkItems = document.querySelectorAll(".check-item span");
  if (checkItems.length >= 1) checkItems[0].innerHTML = `عملکرد <b>98%</b> رضایت از کالا`;
  if (checkItems.length >= 2 && product.warranty) checkItems[1].innerHTML = `<b>${product.warranty}</b> گارانتی اصالت کالا`;

  const featureTable = document.querySelector(".feature-table");
  if (featureTable && product.specs) {
    featureTable.innerHTML = product.specs.map(s => `<tr><td>${s.label}</td><td>${s.value}</td></tr>`).join("");
  }

  const descText = document.querySelector(".desc-text");
  if (descText && product.description) descText.textContent = product.description;


  // ─────────────────────────────────────────────
  //  کنترل دکمه سبد — از container ثابت استفاده میکنیم
  // ─────────────────────────────────────────────
  const container = document.getElementById("cart-btn-container");

  function getQty() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const item = cart.find(i => i._id === product._id);
    return item ? item.qty : 0;
  }

  function setQty(qty) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (qty <= 0) {
      const newCart = cart.filter(i => i._id !== product._id);
      localStorage.setItem("cart", JSON.stringify(newCart));
    } else {
      const item = cart.find(i => i._id === product._id);
      if (item) item.qty = qty;
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    updateCartBadge();
    renderCartUI();
  }

  function renderCartUI() {
    const qty = getQty();

    if (qty <= 0) {
      container.innerHTML = `<button class="btn-cart" id="addToCartBtn">افزودن به سبد خرید</button>`;
      document.getElementById("addToCartBtn").addEventListener("click", () => {

        const added = addToCart(product);

        if (!added) return;

        updateCartBadge();

        renderCartUI();

        showToast();

      });
    } else {
      container.innerHTML = `
        <div class="btn-cart-wrap">
          <div class="cart-status-text">
            <span>در سبد شما</span>
            <a href="/frontend/basket.html">مشاهده سبد خرید</a>
          </div>
          <div class="qty-control">
            <button class="qty-ctrl-btn" id="qtyPlus">+</button>
            <span class="qty-ctrl-num">${qty}</span>
            <button class="qty-ctrl-btn" id="qtyMinus">−</button>
          </div>
        </div>
      `;

      document.getElementById("qtyPlus").addEventListener("click", () => setQty(getQty() + 1));
      document.getElementById("qtyMinus").addEventListener("click", () => setQty(getQty() - 1));
    }
  }

  renderCartUI();
  updateCartBadge();


  // ─────────────────────────────────────────────
  //  Toast
  // ─────────────────────────────────────────────
  function showToast() {
    const existing = document.getElementById("cart-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "cart-toast";
    toast.innerHTML = `
      <div class="toast-content">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3C6E55" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>کالا اضافه شد!</span>
      </div>
      <div class="toast-actions">
        <a href="/frontend/basket.html" class="toast-btn-go">برو به سبد خرید</a>
        <button class="toast-btn-close" onclick="document.getElementById('cart-toast').remove()">✕</button>
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

});