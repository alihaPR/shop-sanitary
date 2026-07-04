// -------------------- helpers --------------------

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function formatPrice(price) {
  return price.toLocaleString("fa-IR");
}

// -------------------- summary --------------------

const cart = getCart();

const subtotal = cart.reduce((sum, item) => {
  const price = item.discountPercent > 0
    ? Math.round(item.price * (1 - item.discountPercent / 100))
    : item.price;

  return sum + price * item.qty;
}, 0);

const shippingCost = subtotal >= 500000 ? 0 : 35000;
const total = subtotal + shippingCost;

document.getElementById("subtotal").textContent =
  formatPrice(subtotal) + " تومان";

document.getElementById("shipping").textContent =
  shippingCost === 0 ? "رایگان" : formatPrice(shippingCost) + " تومان";

document.getElementById("total").textContent =
  formatPrice(total) + " تومان";

// -------------------- checkout --------------------

document
  .getElementById("checkout-btn")
  .addEventListener("click", checkout);

async function checkout() {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("ابتدا وارد حساب کاربری شوید.");
    location.href = "login.html";
    return;
  }

  if (cart.length === 0) {
    alert("سبد خرید خالی است.");
    return;
  }

  const fullname = document.getElementById("fullname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const city = document.getElementById("city").value.trim();
  const postalCode = document.getElementById("postalCode").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!fullname || !phone || !city || !postalCode || !address) {
    alert("تمام اطلاعات را وارد کنید.");
    return;
  }

  const order = {
    items: cart.map(item => ({
      product: item._id,
      quantity: item.qty,
      price: item.price
    })),

    shippingAddress: {
      fullname,
      phone,
      city,
      postalCode,
      address
    },

    shippingCost,
    totalPrice: total
  };

  try {

    const res = await fetch(`${API_BASE_URL}/orders`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify(order)

    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "ثبت سفارش انجام نشد.");
      return;
    }

    localStorage.removeItem("cart");

    alert("سفارش با موفقیت ثبت شد.");

    location.href = "index.html";

  } catch (err) {

    console.error(err);

    alert("خطا در ارتباط با سرور.");

  }

}