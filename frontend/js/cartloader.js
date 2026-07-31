document.addEventListener("DOMContentLoaded", async function () {

  const API_BASE_URL = "http://localhost:5000/api";

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

  renderProduct(product);
  renderDetails(product);

  function renderProduct(product) {

    const productInfo = document.getElementById("product-info");

    const imageUrl = `http://localhost:5000/${product.image.replace(/^\/?/, "")}`;
    productInfo.innerHTML = `
  
<div class="wrap">

    <div class="card main-card">

        <div class="image-side">

            <div class="main-img"
                 style="background-image:url('${imageUrl}')">
            </div>

            <div class="icon-row">

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>
                </svg>

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <path d="M8.6 10.5 15.4 6.5M8.6 13.5 15.4 17.5"/>
                </svg>

            </div>

        </div>

        <div class="info-side">

            <h1>${product.name}</h1>

            <div class="brand-line">
                ${product.brand || ""}
            </div>

            <div class="feat-title">
                ویژگی ها
            </div>

            <ul class="feat-list">

                ${(product.features || [])
        .map(
          feature => `
                    <li class="feat-item">
                        <span>${feature}</span>
                    </li>
                `
        )
        .join("")}

            </ul>

            <a class="more-link" href="#products-info-id">

                <p>مشاهده همه ویژگی ها</p>

                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M10.6664 5L3.99976 12L10.6664 19M3.99976 12L19.9998 12"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
                </svg>

            </a>

        </div>

    </div>

    <div class="left-col">

        <div class="card seller-card">

            <div class="row-title">فروشنده</div>

            <b class="name">
                فروشگاه نرمین سانا گستر
            </b>

            <div class="check-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="9"/>
                </svg>

                <span>
                    عملکرد <b>98%</b> رضایت از کالا
                </span>
            </div>

            <div class="check-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2 4 5v6c0 5 8 11 8 11s8-6 8-11V5l-8-3Z"/>
                </svg>

                <span>
                    <b>${product.warranty || "-"}</b>
                    گارانتی اصالت کالا
                </span>

            </div>

            <div class="check-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 7h13v9H3z"/>
                    <path d="M16 10h4l1 3v3h-5z"/>
                    <circle cx="7" cy="18" r="1.5"/>
                    <circle cx="18" cy="18" r="1.5"/>
                </svg>

                <span>
                    موجود در انبار، ارسال توسط فروشنده
                </span>

            </div>

        </div>

        <div class="card buy-card">

            ${hasDiscount
        ? `<span class="best-price-tag">${product.discountPercent}٪ تخفیف ویژه</span>`
        : ""
      }

            <div class="price-row">

                ${hasDiscount
        ? `<span style="font-size:13px;color:#83887F;text-decoration:line-through">
                        ${formatPrice(product.price)} تومان
                      </span>`
        : ""
      }

                <span class="price-num">
                    ${formatPrice(finalPrice)}
                </span>

                <span class="price-unit">
                    تومان
                </span>

            </div>

            <div id="cart-btn-container"></div>

        </div>

    </div>

</div>

`;
  }

  function renderDetails(product) {

    const productDetails = document.getElementById("product-details");

    productDetails.innerHTML = `

    <div class="card lower-card" id="products-info-id">

        <div class="section-title">
            مشخصات کامل محصول
        </div>

        <table class="feature-table">

            ${(product.specs || []).map(spec => `
                <tr>
                    <td>${spec.label}</td>
                    <td>${spec.value}</td>
                </tr>
            `).join("")}

        </table>

        <div class="section-title">
            توضیحات محصول
        </div>

        <p class="desc-text">
            ${product.description || ""}
        </p>

    </div>

  `;

  }

  // ─────────────────────────────────────────────
  //  کنترل دکمه سبد — از container ثابت استفاده میکنیم
  // ─────────────────────────────────────────────

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

    const container = document.getElementById("cart-btn-container");

    if (!container) return;

    const qty = getQty();

    if (qty <= 0) {

      container.innerHTML = `
      <button class="btn-cart" id="addToCartBtn">
        افزودن به سبد خرید
      </button>
    `;

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

      document
        .getElementById("qtyPlus")
        .addEventListener("click", () => setQty(getQty() + 1));

      document
        .getElementById("qtyMinus")
        .addEventListener("click", () => setQty(getQty() - 1));

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