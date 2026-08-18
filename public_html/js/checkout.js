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

// ---------------- Province & City ----------------

const provinceSelect = document.getElementById("province");
const citySelect = document.getElementById("city");

function loadProvinces() {

  provinceSelect.innerHTML =
    '<option value="">انتخاب استان</option>';

  Object.keys(IRAN_PROVINCES).forEach(province => {

    provinceSelect.innerHTML +=
      `<option value="${province}">${province}</option>`;

  });

}

function loadCities(province) {

  citySelect.innerHTML =
    '<option value="">انتخاب شهر</option>';

  if (!province) return;

  IRAN_PROVINCES[province].forEach(city => {

    citySelect.innerHTML +=
      `<option value="${city}">${city}</option>`;

  });

}

provinceSelect.addEventListener("change", () => {

  loadCities(provinceSelect.value);

});

loadProvinces();

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
    showAppToast("ابتدا وارد حساب کاربری شوید.", "error");
    location.href = "login.html";
    return;
  }

  if (cart.length === 0) {
    showAppToast("سبد خرید خالی است.", "error");
    return;
  }

  if (!validateCheckoutForm()) {

    return;

  }

  const submitBtn = checkoutForm.querySelector('button[type="submit"]');
  setBtnLoading(submitBtn, true);

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

    const paymentRes = await fetch(`${API_BASE_URL}/payment/create`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({

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

      })

    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {

      showAppToast(paymentData.message || "خطا در ایجاد پرداخت.", "error");

      return;

    }

    window.location.href = paymentData.paymentUrl;

  } catch (err) {

    console.error(err);

    showAppToast("خطا در ارتباط با سرور.", "error");

  } finally {

    setBtnLoading(submitBtn, false);

  }

}