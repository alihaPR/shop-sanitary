document.addEventListener("DOMContentLoaded", async function () {

  const API_BASE_URL = "http://localhost:5000/api";

  const FAVORITES_VIEW_URL = "/frontend/user/index.html?view=favorites";

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
  const lowStock = typeof product.stock === "number" && product.stock > 0 && product.stock <= 3;

  function formatPrice(p) { return p.toLocaleString("fa-IR"); }

  document.title = product.name;

  renderProduct(product);
  loadFavoriteState();
  renderDetails(product);
  initShareButtons();

  document
    .getElementById("favoriteBtn")
    .addEventListener("click", () => toggleFavorite(product));

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

    <svg
        id="favoriteBtn"
        class="favorite-btn"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2">

        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>

    </svg>

    <svg class="share-btn" viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2">

        <circle cx="18" cy="5" r="3"/>

        <circle cx="6" cy="12" r="3"/>

        <circle cx="18" cy="19" r="3"/>

        <path d="M8.6 10.5 15.4 6.5M8.6 13.5 15.4 17.5"/>

    </svg>

</div>

        </div>

        <div class="info-side">

            <h1>${product.name}</h1>

            ${product.shortDescription
        ? `<div class="short-desc-line" style="font-size:14px;color:#6b7280;margin:6px 0 10px">${product.shortDescription}</div>`
        : ""
      }

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
                فروشگاه نرم سنتر
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

            ${lowStock
        ? `<div class="stock-warning">تنها ${product.stock} عدد در انبار باقی مانده</div>`
        : ""
      }

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

    const maxQty = typeof product.stock === "number" ? product.stock : Infinity;

    if (qty > maxQty) qty = maxQty;

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

      const outOfStock = typeof product.stock === "number" && product.stock <= 0;

      if (outOfStock) {

        container.innerHTML = `
        <button class="btn-cart" id="addToCartBtn" disabled>
          ناموجود
        </button>
      `;

        return;

      }

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

        showCartToast(product);

      });

    } else {

      const maxQty = typeof product.stock === "number" ? product.stock : Infinity;
      const atMax = qty >= maxQty;

      container.innerHTML = `
<div class="btn-cart-wrap">

    <div class="btn-cart-wrap_top">

         <div class="cart-status-text">
            <span>در سبد شما</span>
            <a href="/frontend/basket.html">مشاهده سبد خرید</a>
        </div>
        
        <div class="qty-control">
            <button class="qty-ctrl-btn" id="qtyPlus" ${atMax ? "disabled" : ""}>+</button>
            
            <span class="qty-ctrl-num">${qty}</span>
            
            <button class="qty-ctrl-btn" id="qtyMinus">−</button>
        </div>
       
    </div>

    ${atMax ? `<div class="qty-max-warning">به سقف موجودی این محصول رسیدید</div>` : ""}
</div>
    `;

      document
        .getElementById("qtyPlus")
        .addEventListener("click", () => {
          if (getQty() >= maxQty) return;
          setQty(getQty() + 1);
        });

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
  function renderToast({ id, position, type, title, subtitle = "", actionHref = null, actionLabel = "", icon, duration = 3800 }) {

    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = id;
    toast.className = `pill-toast pos-${position} type-${type}`;
    toast.innerHTML = `
      <div class="pill-toast-icon">${icon}</div>
      <div class="pill-toast-body">
        <p class="pill-toast-title">${title}</p>
        ${actionHref ? `<a href="${actionHref}" class="pill-toast-action">${actionLabel}</a>` : ""}
      </div>
      <button class="pill-toast-close" onclick="document.getElementById('${id}').remove()">✕</button>
    `;

    // ${subtitle ? `<p class="pill-toast-sub">${subtitle}</p>` : ""}

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  const toastIcons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`,
    like: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
    neutral: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`
  };

  function showCartToast(product) {
    renderToast({
      id: "cart-toast-box",
      position: "bottom-left",
      type: "success",
      icon: toastIcons.success,
      title: "کالا به سبد خرید اضافه شد",
      subtitle: product.name,
      actionHref: "/frontend/basket.html",
      actionLabel: "مشاهده سبد خرید"
    });
  }

  function showToast({ title, subtitle = "", actionHref = null, actionLabel = "", type = "like" }) {

    const typeMap = {
      like: { cssType: "like", icon: toastIcons.like },
      unlike: { cssType: "neutral", icon: toastIcons.neutral }
    };

    const cfg = typeMap[type] || typeMap.like;

    renderToast({
      id: "app-toast",
      position: "top-center",
      type: cfg.cssType,
      icon: cfg.icon,
      title,
      subtitle,
      actionHref,
      actionLabel,
      duration: 4000
    });
  }

  async function loadFavoriteState() {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

      const res = await fetch(`${API_BASE_URL}/users/favorites`, {

        headers: {
          Authorization: `Bearer ${token}`
        }

      });

      if (!res.ok) return;

      const favorites = await res.json();

      const liked = favorites.some(item => item._id === product._id);

      const heart = document.getElementById("favoriteBtn");

      if (!heart) return;

      if (liked) {

        heart.classList.add("active");

      }

    } catch (err) {

      console.error(err);

    }

  }

  /* =========================================================
     افزودن/حذف علاقه‌مندی با کلیک روی آیکون قلب
     ⚠️ آدرس این روت‌ها هنوز با بک‌اند تأیید نشده، طبق همون
     الگویی نوشته شده که تو داشبورد یوزر (favorites.js) استفاده کردیم:
     POST   /users/favorites/:id  -> افزودن
     DELETE /users/favorites/:id  -> حذف
  ========================================================= */

  async function toggleFavorite(product) {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("ابتدا وارد حساب کاربری شوید.");
      location.href = "/frontend/login.html";
      return;
    }

    const heart = document.getElementById("favoriteBtn");

    if (!heart) return;

    const isActive = heart.classList.contains("active");
    const willBeActive = !isActive;

    // آپدیت فوری ظاهر دکمه (Optimistic UI) — بدون صبر برای جواب سرور
    heart.classList.toggle("active", willBeActive);

    if (willBeActive) {
      showToast({
        title: "به لیست علاقه‌مندی‌ها اضافه شد",
        subtitle: product.name,
        actionHref: FAVORITES_VIEW_URL,
        actionLabel: "مشاهده",
        type: "like"
      });
    } else {
      showToast({
        title: "از لیست علاقه‌مندی‌ها حذف شد",
        type: "unlike"
      });
    }

    try {

      const res = await fetch(`${API_BASE_URL}/users/favorites/${product._id}`, {
        method: isActive ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "خطا در به‌روزرسانی علاقه‌مندی");
      }

    } catch (err) {

      // خطا خورد؟ برگردون به حالت قبلی
      heart.classList.toggle("active", isActive);

      console.error(err);
      alert(err.message);

    }

  }
});

// ===========================
//   Share Button (Web Share API + Clipboard Fallback)
// ===========================

function initShareButtons() {

  document.querySelectorAll(".share-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

      const shareUrl = btn.dataset.url || window.location.href;
      const shareTitle = btn.dataset.title || document.title;

      if (navigator.share) {

        try {
          await navigator.share({
            title: shareTitle,
            url: shareUrl
          });
        } catch (err) {
          // کاربر خودش لغو کرده، نیازی به کار خاصی نیست
          if (err.name !== "AbortError") console.error(err);
        }

      } else {

        try {
          await navigator.clipboard.writeText(shareUrl);
          showShareToast("لینک کپی شد ✅");
        } catch (err) {
          console.error(err);
          showShareToast("خطا در کپی لینک");
        }

      }

    });

  });

}

function showShareToast(message) {

  let toast = document.querySelector(".share-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "share-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);

}