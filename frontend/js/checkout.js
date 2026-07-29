const checkoutForm = document.getElementById("checkoutForm");
function validateCheckoutForm() {

  clearErrors(checkoutForm);

  let valid = true;

  const province = document.getElementById("province");
  const city = document.getElementById("city");
  const address = document.getElementById("address");
  const plaque = document.getElementById("plaque");
  const postalCode = document.getElementById("postalCode");

  if (!province.value) {

    setError(province, "استان را انتخاب کنید.");

    valid = false;

  } else {

    setSuccess(province);

  }

  if (!city.value) {

    setError(city, "شهر را انتخاب کنید.");

    valid = false;

  } else {

    setSuccess(city);

  }

  if (address.value.trim().length < 10) {

    setError(address, "آدرس را کامل وارد کنید.");

    valid = false;

  } else {

    setSuccess(address);

  }

  if (!plaque.value.trim()) {

    setError(plaque, "پلاک را وارد کنید.");

    valid = false;

  } else {

    setSuccess(plaque);

  }

  const postal = postalCode.value.trim();

  if (!/^\d{10}$/.test(postal)) {

    setError(postalCode, "کد پستی باید ۱۰ رقم باشد.");

    valid = false;

  } else {

    setSuccess(postalCode);

  }

  return valid;

}

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

checkoutForm.addEventListener("submit", checkout);

async function checkout(e) {
  e.preventDefault();
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

  if (!validateCheckoutForm()) {

    return;

  }

  const province = document.getElementById("province").value.trim();
  const city = document.getElementById("city").value.trim();
  const address = document.getElementById("address").value.trim();
  const plaque = document.getElementById("plaque").value.trim();
  const unit = document.getElementById("unit").value.trim();
  const postalCode = document.getElementById("postalCode").value.trim();

  const order = {

    items: cart.map(item => ({
      product: item._id,
      quantity: item.qty
    })),

    shippingAddress: {

      province,
      city,
      address,
      plaque,
      unit,
      postalCode
    }

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

    const paymentRes = await fetch(`${API_BASE_URL}/payment/create`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`

      },

      body: JSON.stringify({

        orderId: data._id

      })

    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {

      alert(paymentData.message || "خطا در ایجاد پرداخت.");

      return;

    }

    localStorage.removeItem("cart");

    window.location.href = paymentData.paymentUrl;
  } catch (err) {

    console.error(err);

    alert("خطا در ارتباط با سرور.");

  }

}