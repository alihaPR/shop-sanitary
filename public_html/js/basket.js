function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {

  const token = localStorage.getItem("token");

  if (!token) {

    // اگر Toast وجود ندارد، بساز
    let toast = document.getElementById("toast-login");

    if (!toast) {

      toast = document.createElement("div");
      toast.id = "toast-login";

      toast.style.cssText = `
                position:fixed;
                bottom:25px;
                right:25px;
                background:#dc2626;
                color:#fff;
                padding:14px 18px;
                border-radius:12px;
                box-shadow:0 10px 30px rgba(0,0,0,.2);
                font-size:14px;
                z-index:999999;
                opacity:0;
                transform:translateY(20px);
                transition:.3s;
            `;

      document.body.appendChild(toast);
    }

    toast.innerText = "ابتدا وارد حساب کاربری شوید";

    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
    }, 1800);

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1800);

    return;
  }

  const cart = getCart();

  const existing = cart.find(item => item._id === product._id);

  // سقف تعداد = موجودی انبار
  const maxQty = typeof product.stock === "number" ? product.stock : Infinity;

  if (maxQty <= 0 || (existing && existing.qty >= maxQty)) {
    if (window.showAppToast) window.showAppToast("به سقف موجودی این محصول رسیدید", "warning");
    return false;
  }

  if (existing) {
    existing.qty += 1;
    existing.stock = product.stock;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);

  updateCartBadge();
  return true;
}

function removeFromCart(productId) {
  let cart = getCart();
  const removedIndex = cart.findIndex(item => item._id === productId);
  const removedItem = removedIndex >= 0 ? cart[removedIndex] : null;
  cart = cart.filter(item => item._id !== productId);
  saveCart(cart);
  // فقط در صفحه‌ی سبد خرید: چند ثانیه امکان «انصراف» از حذف (مثل دیجی‌کالا)
  if (removedItem && document.querySelector(".cart-items-wrap")) {
    // ارتفاع کارت فعلی نگه داشته می‌شود تا پیام انصراف هم‌اندازه‌ی کارت باشد و صفحه نپرد
    const cardEl = [...document.querySelectorAll(".cart-items-wrap .cart-item")].find(e => e.dataset.id === productId);
    queueUndo(removedItem, removedIndex, cardEl ? cardEl.getBoundingClientRect().height : 0);
  }
  if (document.querySelector(".cart-items-wrap")) renderBasket();
  updateCartBadge();
}

// ---------------------------------------------------------------------
//  انصراف از حذف محصول
//  محصول حذف‌شده بلافاصله از سبد (localStorage) خارج می‌شود، ولی تا UNDO_MS
//  میلی‌ثانیه با پیام «کالای موردنظر شما حذف شد» و دکمه‌ی «انصراف» نمایش
//  داده می‌شود. با انصراف، محصول با همان تعداد و در همان جایگاه برمی‌گردد.
// ---------------------------------------------------------------------
const UNDO_MS = 6000;
const pendingRemovals = []; // { item, index, startedAt, timer }

function dropPending(id) {
  const i = pendingRemovals.findIndex(p => p.item._id === id);
  if (i >= 0) {
    clearTimeout(pendingRemovals[i].timer);
    pendingRemovals.splice(i, 1);
  }
}

function queueUndo(item, index, height) {
  dropPending(item._id);
  const entry = { item: { ...item }, index, height: height || 0, startedAt: Date.now(), timer: null };
  entry.timer = setTimeout(() => {
    dropPending(item._id);
    if (document.querySelector(".cart-items-wrap")) renderBasket();
  }, UNDO_MS);
  pendingRemovals.push(entry);
}

function undoRemove(id) {
  const pending = pendingRemovals.find(p => p.item._id === id);
  if (!pending) return;
  dropPending(id);

  const cart = getCart();
  if (!cart.some(c => c._id === id)) {
    cart.splice(Math.min(pending.index, cart.length), 0, pending.item);
    saveCart(cart);
  }
  if (document.querySelector(".cart-items-wrap")) renderBasket();
  updateCartBadge();
}

function ensureUndoStyle() {
  if (document.getElementById("cart-undo-style")) return;
  const st = document.createElement("style");
  st.id = "cart-undo-style";
  st.textContent = `
    .cart-removed{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:150px;padding:0;text-align:center;animation:cartRemovedIn .25s ease}
    .cart-item+.cart-removed,.cart-removed+.cart-item,.cart-removed+.cart-removed{border-top:1px solid #efefef}
    .cart-removed__title{margin:0;font-size:15px;font-weight:700;color:#1f2937}
    .cart-removed__bar{position:relative;display:block;width:110px;height:3px;border-radius:3px;background:#e5e7eb;overflow:hidden}
    .cart-removed__bar i{position:absolute;inset:0;background:#3AA6A0;transform-origin:right center;animation:cartRemovedBar linear forwards}
    .cart-removed__undo{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:0;border-radius:10px;background:transparent;color:#1f2937;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:background .15s}
    .cart-removed__undo:hover{background:#f3f4f6}
    .cart-removed__undo:focus-visible{outline:2px solid #336DFF;outline-offset:2px}
    @keyframes cartRemovedBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    @keyframes cartRemovedIn{from{opacity:0}to{opacity:1}}
    @media (max-width:640px){.cart-removed{min-height:120px}}
  `;
  document.head.appendChild(st);
}

function renderRemovedPlaceholders(wrap, couponBox) {
  wrap.querySelectorAll(".cart-removed").forEach(el => el.remove());
  if (!pendingRemovals.length) return;

  ensureUndoStyle();

  const items = wrap.querySelectorAll(".cart-item");
  const sorted = [...pendingRemovals].sort((a, b) => a.index - b.index);

  sorted.forEach(p => {
    const before = sorted.filter(q => q.index < p.index).length;
    const pos = Math.max(0, Math.min(p.index - before, items.length));
    const ref = items[pos] || couponBox || null;
    const elapsed = Math.min(UNDO_MS, Date.now() - p.startedAt);

    const el = document.createElement("div");
    el.className = "cart-removed";
    el.setAttribute("role", "status");
    if (p.height > 0) el.style.cssText = `height:${p.height}px;min-height:0`;
    el.innerHTML = `
      <p class="cart-removed__title">کالای موردنظر شما حذف شد</p>
      <span class="cart-removed__bar"><i style="animation-duration:${UNDO_MS}ms;animation-delay:-${elapsed}ms"></i></span>
      <button type="button" class="cart-removed__undo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
        <span>انصراف</span>
      </button>`;
    el.querySelector("button").addEventListener("click", e => {
      e.stopPropagation();
      undoRemove(p.item._id);
    });

    wrap.insertBefore(el, ref);
  });
}

function clearCart() {
  pendingRemovals.splice(0).forEach(p => clearTimeout(p.timer));
  saveCart([]);
  if (document.querySelector(".cart-items-wrap")) renderBasket();
  updateCartBadge();
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i._id === productId);
  if (!item) return;
  if (delta > 0 && typeof item.stock === "number" && item.qty + delta > item.stock) {
    if (window.showAppToast) window.showAppToast("به سقف موجودی این محصول رسیدید", "warning");
    return;
  }
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
  if (document.querySelector(".cart-items-wrap")) renderBasket();
  updateCartBadge();
}

function formatPrice(p) {
  return p.toLocaleString("fa-IR");
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badges = document.querySelectorAll(".cart-badge");
  badges.forEach(b => {
    b.textContent = total;
  });
}

function renderBasket() {
  const cart = getCart();
  const emptyBasketWrap = document.querySelector(".empty-basket-wraper");
  const emptyState = document.getElementById("emptyState");
  const fullBasket = document.querySelector(".full-basket");
  const cartItemsWrap = document.querySelector(".cart-items-wrap");

  if (!cartItemsWrap) return;

  if (cart.length === 0 && pendingRemovals.length === 0) {
    if (emptyBasketWrap) emptyBasketWrap.style.display = "block";
    if (emptyState) emptyState.style.display = "flex";
    if (fullBasket) fullBasket.style.display = "none";
    return;
  }

  if (emptyBasketWrap) emptyBasketWrap.style.display = "none";
  if (emptyState) emptyState.style.display = "none";
  if (fullBasket) fullBasket.style.display = "block";

  const existingItems = cartItemsWrap.querySelectorAll(".cart-item");
  existingItems.forEach(el => el.remove());

  const couponBox = cartItemsWrap.querySelector(".coupon-box");

  cart.forEach(item => {
    const hasDiscount = item.discountPercent > 0;
    const finalPrice = hasDiscount
      ? Math.round(item.price * (1 - item.discountPercent / 100))
      : item.price;
    const totalPrice = finalPrice * item.qty;
    const imageUrl = item.image
      ? `https://api.narmcenter.com/${item.image.replace(/^\/?/, "")}`
      : "";
    const div = document.createElement("div");
    div.className = "cart-item";
    div.dataset.id = item._id;
    div.style.cursor = "pointer";

    div.addEventListener("click", () => {
      window.location.href = `cart.html?id=${item._id}`;
    });

    div.innerHTML = `
      <div class="item-img" style="background-image: url('${imageUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
      <div class="item-info">
        <h4>${item.name}</h4>
        <div class="item-cat">بهداشتی</div>
        <div class="item-unit">هر بسته ${formatPrice(finalPrice)} تومان</div>
      </div>
      <div class="item-qty">
        <button class="qty-btn" onclick="event.stopPropagation(); changeQty('${item._id}', -1)" >−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" ${typeof item.stock === "number" && item.qty >= item.stock ? "disabled" : ""} onclick="event.stopPropagation(); changeQty('${item._id}', 1)">+</button>
      </div>
      <div class="item-price">
        <span class="price">${formatPrice(totalPrice)}</span>
        <span class="unit-price">تومان</span>
      </div>
      <button class="item-remove" onclick="event.stopPropagation(); removeFromCart('${item._id}')" title="حذف">✕</button>
    `;

    if (couponBox) {
      cartItemsWrap.insertBefore(div, couponBox);
    } else {
      cartItemsWrap.appendChild(div);
    }
  });

  renderRemovedPlaceholders(cartItemsWrap, couponBox);

  renderSummary(cart);
  updateCartTitle();
}

function renderSummary(cart) {
  const shipping = 35000;
  const subtotal = cart.reduce((sum, item) => {
    const hasDiscount = item.discountPercent > 0;
    const finalPrice = hasDiscount
      ? Math.round(item.price * (1 - item.discountPercent / 100))
      : item.price;
    return sum + finalPrice * item.qty;
  }, 0);

  const discount = cart.reduce((sum, item) => {
    if (item.discountPercent > 0) {
      const saved = Math.round(item.price * (item.discountPercent / 100));
      return sum + saved * item.qty;
    }
    return sum;
  }, 0);

  const freeShipping = subtotal >= 500000;
  const shippingCost = (freeShipping || cart.length === 0) ? 0 : shipping;
  const total = subtotal + shippingCost;

  const rows = document.querySelectorAll(".summary-row .value");
  if (rows[0]) rows[0].textContent = formatPrice(subtotal) + " تومان";
  if (rows[1]) rows[1].textContent = freeShipping ? "رایگان" : formatPrice(shippingCost) + " تومان";
  if (rows[2]) rows[2].textContent = discount > 0 ? `— ${formatPrice(discount)} تومان` : "—";

  const totalEl = document.querySelector(".summary-total .value");
  if (totalEl) totalEl.innerHTML = `${formatPrice(total)}<small>تومان</small>`;

  // نوار شناور موبایل + پنجره‌ی جزئیات پرداخت
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const setT = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
  setT("sumToggleText", `جمع ${count} کالا`);
  setT("sheetCountLabel", `مجموع قیمت کالاها (${count} کالا)`);
  setT("sheetSubtotal", formatPrice(subtotal) + " تومان");
  setT("sheetShipping", freeShipping ? "رایگان" : formatPrice(shippingCost) + " تومان");
  setT("sheetDiscount", discount > 0 ? `— ${formatPrice(discount)} تومان` : "—");
  setT("sheetTotal", formatPrice(total) + " تومان");
}

function updateCartTitle() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const title = document.getElementById("cart-count-title");
  if (title) title.textContent = `محصولات (${total} عدد)`;
}

const clearBtn = document.querySelector(".clear-btn");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (confirm("همه محصولات از سبد حذف شوند؟")) clearCart();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderBasket();
  updateCartBadge();
  refreshCartStock();
});

// موجودی فعلی محصولات داخل سبد را از سرور می‌گیرد (فقط در صفحه سبد)
// تا تعداد هر کالا بیشتر از موجودی انبار نماند.
async function refreshCartStock() {
  if (!document.querySelector(".cart-items-wrap")) return;
  const cart = getCart();
  if (!cart.length) return;

  let changed = false;
  let trimmed = false;

  await Promise.all(cart.map(async (item) => {
    try {
      const res = await fetch(`https://api.narmcenter.com/api/products/${item._id}`);
      if (!res.ok) return;
      const fresh = await res.json();
      if (!fresh || typeof fresh.stock !== "number") return;
      if (item.stock !== fresh.stock) { item.stock = fresh.stock; changed = true; }
      if (fresh.stock > 0 && item.qty > fresh.stock) { item.qty = fresh.stock; changed = true; trimmed = true; }
    } catch (e) { /* خطای شبکه: همان موجودی ذخیره‌شده می‌ماند */ }
  }));

  const outOfStock = cart.filter(i => typeof i.stock === "number" && i.stock <= 0);
  const finalCart = cart.filter(i => !(typeof i.stock === "number" && i.stock <= 0));

  if (!changed && !outOfStock.length) return;
  saveCart(finalCart);
  renderBasket();
  updateCartBadge();

  if (window.showAppToast) {
    if (outOfStock.length) window.showAppToast("بعضی کالاها ناموجود شدند و از سبد حذف شدند", "warning");
    else if (trimmed) window.showAppToast("تعداد بعضی کالاها با موجودی انبار تنظیم شد", "warning");
  }
}

// باز و بسته شدن پنجره‌ی جزئیات پرداخت (موبایل)
document.addEventListener("DOMContentLoaded", function () {
  const sheet = document.getElementById("sumSheet");
  const back = document.getElementById("sumBackdrop");
  const toggle = document.getElementById("sumToggle");
  if (!sheet || !back || !toggle) return;
  const setOpen = (open) => {
    sheet.classList.toggle("is-open", open);
    back.classList.toggle("is-open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(!sheet.classList.contains("is-open")));
  back.addEventListener("click", () => setOpen(false));
  document.getElementById("sumClose").addEventListener("click", () => setOpen(false));
  document.getElementById("sumOk").addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 1024) setOpen(false); });
});

/* ===== مینی‌سبد خرید: هاور روی آیکن سبد در هدر (ظاهر دیجی‌کالا) ===== */
(function () {
  if (!window.matchMedia || !window.matchMedia("(hover: hover)").matches) return;

  function init() {
    if (document.querySelector(".cart-items-wrap")) return; // داخل صفحه‌ی سبد لازم نیست
    const btns = document.querySelectorAll(".header-basket");
    if (!btns.length) return;

    const style = document.createElement("style");
    style.textContent = `
      .mini-cart{position:fixed;z-index:99999;width:430px;max-width:calc(100vw - 16px);background:#fff;color:#1a1a1a;
        border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.2);direction:rtl;font-family:inherit;
        opacity:0;visibility:hidden;transform:translateY(6px);transition:opacity .18s,transform .18s,visibility .18s}
      .mini-cart.show{opacity:1;visibility:visible;transform:none}
      .mini-cart::before{content:"";position:absolute;top:-30px;left:0;right:0;height:30px}
      .mini-cart__head{display:flex;align-items:baseline;gap:10px;padding:18px 20px 6px}
      .mini-cart__title{font-size:16px;font-weight:800}
      .mini-cart__count{font-size:12px;color:#777}
      .mini-cart__list{max-height:320px;overflow-y:auto;padding:0 20px}
      .mini-cart__item{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #eee}
      .mini-cart__item:last-child{border-bottom:0}
      .mini-cart__img{width:64px;height:64px;flex:none;background:#fff center/contain no-repeat}
      .mini-cart__body{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:10px}
      .mini-cart__name{font-size:13px;line-height:1.8;color:#333;text-decoration:none;overflow:hidden;
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
      .mini-cart__name:hover{color:var(--ink,#1a5f63)}
      .mini-cart__row{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
      .mini-cart__qty{display:inline-flex;align-items:center;gap:2px;background:#f1f2f4;border-radius:24px;padding:3px}
      .mini-cart__qty button{width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:#444;
        display:grid;place-items:center;cursor:pointer;padding:0}
      .mini-cart__qty button:hover:not(:disabled){background:#e4e6e9}
      .mini-cart__qty button:disabled{opacity:.35;cursor:not-allowed}
      .mini-cart__qty span{min-width:22px;text-align:center;font-size:14px;font-weight:700}
      .mini-cart__price{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
      .mini-cart__off{display:flex;align-items:center;gap:6px}
      .mini-cart__badge{background:#ef394e;color:#fff;font-size:12px;font-weight:700;padding:1px 7px;border-radius:12px}
      .mini-cart__old{font-size:12px;color:#999;text-decoration:line-through}
      .mini-cart__now{font-size:16px;font-weight:800}
      .mini-cart__now small{font-size:11px;font-weight:400;color:#555;margin-right:3px}
      .mini-cart__empty{padding:34px 20px;text-align:center;font-size:13px;color:#777}
      .mini-cart__foot{display:flex;align-items:center;gap:16px;padding:16px 20px 20px;border-top:1px solid #eee}
      .mini-cart__btn{flex:1;height:38px;display:flex;align-items:center;justify-content:center;background:var(--ink,#1a5f63);
        color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:12px}
      .mini-cart__btn:hover{opacity:.92}
      .mini-cart__total{min-width:150px}
    `;
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.className = "mini-cart";
    document.body.appendChild(panel);

    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const fa = n => Number(n).toLocaleString("fa-IR");
    const ICON_TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>';
    const ICON_MINUS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>';
    const ICON_PLUS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
    let hideTimer, activeBtn;

    function priceBlock(final, old, pct) {
      return '<div class="mini-cart__price">' +
        (pct > 0 ? '<div class="mini-cart__off"><span class="mini-cart__old">' + fa(old) + '</span>' +
          '<span class="mini-cart__badge">' + fa(pct) + '٪</span></div>' : '') +
        '<div class="mini-cart__now">' + fa(final) + '<small>تومان</small></div></div>';
    }

    function render(btn) {
      const cart = getCart();
      if (!cart.length) {
        panel.innerHTML = '<div class="mini-cart__empty">سبد خرید شما خالی است</div>';
        return;
      }
      let count = 0, sum = 0, orig = 0;
      const rows = cart.map(item => {
        const pct = item.discountPercent > 0 ? item.discountPercent : 0;
        const price = pct ? Math.round(item.price * (1 - pct / 100)) : item.price;
        count += item.qty;
        sum += price * item.qty;
        orig += item.price * item.qty;
        const img = item.image
          ? "https://api.narmcenter.com/" + String(item.image).replace(/^\/?/, "") : "";
        const href = esc(new URL("cart.html?id=" + encodeURIComponent(item._id), btn.href).href);
        const id = esc(item._id);
        const atMax = typeof item.stock === "number" && item.qty >= item.stock;
        return '<div class="mini-cart__item">' +
          '<a class="mini-cart__img" href="' + href + '" style="background-image:url(\'' + esc(img) + '\')"></a>' +
          '<div class="mini-cart__body">' +
          '<a class="mini-cart__name" href="' + href + '">' + esc(item.name || item.title) + '</a>' +
          '<div class="mini-cart__row">' +
          '<div class="mini-cart__qty">' +
          '<button type="button" data-act="inc" data-id="' + id + '" aria-label="افزایش"' + (atMax ? " disabled" : "") + '>' + ICON_PLUS + '</button>' +
          '<span>' + fa(item.qty) + '</span>' +
          (item.qty > 1
            ? '<button type="button" data-act="dec" data-id="' + id + '" aria-label="کاهش">' + ICON_MINUS + '</button>'
            : '<button type="button" data-act="del" data-id="' + id + '" aria-label="حذف">' + ICON_TRASH + '</button>') +
          '</div>' + priceBlock(price, item.price, pct) + '</div></div></div>';
      }).join("");
      const totalPct = orig > sum ? Math.round((1 - sum / orig) * 100) : 0;
      panel.innerHTML =
        '<div class="mini-cart__head"><span class="mini-cart__title">خلاصه سبد خرید شما</span>' +
        '<span class="mini-cart__count">' + fa(count) + ' کالا</span></div>' +
        '<div class="mini-cart__list">' + rows + '</div>' +
        '<div class="mini-cart__foot"><a class="mini-cart__btn" href="' + esc(btn.href) + '">ثبت سفارش</a>' +
        '<div class="mini-cart__total">' + priceBlock(sum, orig, totalPct) + '</div></div>';
    }

    function show(btn) {
      clearTimeout(hideTimer);
      activeBtn = btn;
      render(btn);
      const r = btn.getBoundingClientRect();
      const w = Math.min(500, window.innerWidth - 16);
      // زیر هدر باز بشه و لبه‌ی چپش با لبه‌ی چپ هدر یکی باشه
      const hdr = document.querySelector(".site-header__row") || document.querySelector(".site-header");
      const hr = hdr ? hdr.getBoundingClientRect() : null;
      const topPos = hr ? hr.bottom + 6 : r.bottom + 10;
      const leftPos = hr ? hr.left : r.left + r.width / 2 - w / 2;
      panel.style.top = topPos + "px";
      panel.style.left = Math.max(8, Math.min(leftPos, window.innerWidth - w - 8)) + "px";
      panel.classList.add("show");
    }
    function hide() {
      hideTimer = setTimeout(() => panel.classList.remove("show"), 150);
    }

    panel.addEventListener("click", e => {
      const b = e.target.closest("[data-act]");
      if (!b || b.disabled) return;
      const id = b.dataset.id, act = b.dataset.act;
      if (act === "inc") changeQty(id, 1);
      else if (act === "dec") changeQty(id, -1);
      else removeFromCart(id);
      if (activeBtn) render(activeBtn);
    });

    btns.forEach(btn => {
      btn.addEventListener("mouseenter", () => show(btn));
      btn.addEventListener("mouseleave", hide);
    });
    panel.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    panel.addEventListener("mouseleave", hide);
    window.addEventListener("scroll", () => panel.classList.remove("show"), { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();