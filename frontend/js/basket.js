function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item._id === product._id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item._id !== productId);
  saveCart(cart);
  if (document.querySelector(".cart-items-wrap")) renderBasket();
  updateCartBadge();
}

function clearCart() {
  saveCart([]);
  if (document.querySelector(".cart-items-wrap")) renderBasket();
  updateCartBadge();
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i._id === productId);
  if (!item) return;
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
    b.style.display = total > 0 ? "flex" : "none";
  });
}

function renderBasket() {
  const cart = getCart();
  const emptyBasketWrap = document.querySelector(".empty-basket-wraper");
  const emptyState = document.getElementById("emptyState");
  const fullBasket = document.querySelector(".full-basket");
  const cartItemsWrap = document.querySelector(".cart-items-wrap");

  if (!cartItemsWrap) return;

  if (cart.length === 0) {
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

    const div = document.createElement("div");
    div.className = "cart-item";
div.dataset.id = item._id;    

    div.innerHTML = `
      <div class="item-img" style="background-image: url('${item.image}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
      <div class="item-info">
        <h4>${item.name}</h4>
        <div class="item-cat">بهداشتی</div>
        <div class="item-unit">هر بسته ${formatPrice(finalPrice)} تومان</div>
      </div>
      <div class="item-qty">
        <button class="qty-btn" onclick="changeQty('${item._id}', -1)" >−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item._id}', 1)">+</button>
      </div>
      <div class="item-price">
        <span class="price">${formatPrice(totalPrice)}</span>
        <span class="unit-price">تومان</span>
      </div>
      <button class="item-remove" onclick="removeFromCart('${item._id}')" title="حذف">✕</button>
    `;

    if (couponBox) {
      cartItemsWrap.insertBefore(div, couponBox);
    } else {
      cartItemsWrap.appendChild(div);
    }
  });

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
  const shippingCost = freeShipping ? 0 : shipping;
  const total = subtotal + shippingCost;

  const rows = document.querySelectorAll(".summary-row .value");
  if (rows[0]) rows[0].textContent = formatPrice(subtotal) + " تومان";
  if (rows[1]) rows[1].textContent = freeShipping ? "رایگان" : formatPrice(shippingCost) + " تومان";
  if (rows[2]) rows[2].textContent = discount > 0 ? `— ${formatPrice(discount)} تومان` : "—";

  const totalEl = document.querySelector(".summary-total .value");
  if (totalEl) totalEl.innerHTML = `${formatPrice(total)}<small>تومان</small>`;
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
});