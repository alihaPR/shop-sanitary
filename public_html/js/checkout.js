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

  // ---- آدرس: اگر دفترچه آدرس فعال است فقط addressId ارسال می‌شود (مالکیت را بک‌اند بررسی می‌کند) ----
  const AD = window.NCCheckoutAddress;

  if (AD && AD.loading) {
    showAppToast("در حال دریافت آدرس‌ها، لحظه‌ای صبر کنید.", "warning");
    return;
  }

  const useBook = !!(AD && AD.ready);

  if (useBook) {

    if (!AD.selectedId) {
      showAppToast("لطفاً آدرس ارسال سفارش را انتخاب یا اضافه کنید.", "error");
      AD.open("form");
      return;
    }

  } else if (!validateCheckoutForm()) {

    return;

  }

  const submitBtn = checkoutForm.querySelector('button[type="submit"]');
  setBtnLoading(submitBtn, true);

  let addressPart;

  if (useBook) {

    addressPart = { addressId: AD.selectedId };

  } else {

    addressPart = {
      shippingAddress: {
        province: document.getElementById("province").value.trim(),
        city: document.getElementById("city").value.trim(),
        address: document.getElementById("address").value.trim(),
        plaque: document.getElementById("plaque").value.trim(),
        unit: document.getElementById("unit").value.trim(),
        postalCode: document.getElementById("postalCode").value.trim()
      }
    };

  }

  const payMethod = (document.querySelector('input[name="payMethod"]:checked') || {}).value || "gateway";

  const order = {

    items: cart.map(item => ({
      product: item._id,
      quantity: item.qty
    })),

    ...addressPart

  };

  try {

    // ---- پرداخت کارت‌به‌کارت: ثبت سفارش (در انتظار پرداخت) و رفتن به صفحه‌ی پرداخت ----
    if (payMethod === "card") {

      const cardRes = await fetch(`${API_BASE_URL}/orders/card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(order)
      });

      const cardData = await cardRes.json();

      if (!cardRes.ok) {
        showAppToast(cardData.message || "خطا در ثبت سفارش.", "error");
        return;
      }

      localStorage.removeItem("cart");
      window.location.href = `card-payment.html?orderId=${cardData._id}`;
      return;

    }

    const paymentRes = await fetch(`${API_BASE_URL}/payment/create`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify(order)

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


// -------------------- انتخاب روش پرداخت (فقط نمایشی) --------------------

(function () {
  const wrap = document.getElementById("payMethods");
  const btn = document.getElementById("checkout-btn");
  if (!wrap || !btn) return;

  function sync() {
    const val = (wrap.querySelector("input:checked") || {}).value;
    wrap.querySelectorAll(".pay-method").forEach(l =>
      l.classList.toggle("is-active", l.querySelector("input").checked));
    if (!btn.disabled) {
      btn.textContent = val === "card" ? "ثبت سفارش و پرداخت کارت‌به‌کارت" : "ثبت سفارش و ادامه پرداخت";
    }
  }

  wrap.addEventListener("change", sync);
  sync();
})();


// -------------------- آدرس ارسال سفارش (دفترچه آدرس) --------------------
// آدرس‌های ذخیره‌شده‌ی کاربر از /api/addresses خوانده می‌شود؛ کاربر می‌تواند آدرس را
// تغییر دهد یا آدرس جدید اضافه کند. اگر دریافت آدرس‌ها ناموفق باشد، فرم قدیمی آدرس فعال می‌ماند.

window.NCCheckoutAddress = (function () {

  const state = { ready: false, loading: false, selectedId: null, list: [], open: function () { } };

  const box = document.getElementById("abCheckout");
  const body = document.getElementById("abCheckoutBody");
  const token = localStorage.getItem("token");

  if (!box || !body || !token || !window.NCAddressBook) return state;

  const AB = window.NCAddressBook;
  const KEY = "nc_checkout_addr";

  AB.init({ apiBase: API_BASE_URL, token });

  function selected() {
    return state.list.find(a => a._id === state.selectedId) || null;
  }

  // آدرس انتخاب‌شده‌ی قبلی (همین نشست) ← آدرس پیش‌فرض ← اولین آدرس
  function choose() {
    let id = null;
    try { id = sessionStorage.getItem(KEY); } catch (e) { /* ignore */ }

    let a = state.list.find(x => x._id === id)
      || state.list.find(x => x.isDefault)
      || state.list[0]
      || null;

    state.selectedId = a ? a._id : null;
    remember();
  }

  function remember() {
    try {
      if (state.selectedId) sessionStorage.setItem(KEY, state.selectedId);
      else sessionStorage.removeItem(KEY);
    } catch (e) { /* ignore */ }
  }

  function render() {

    box.hidden = false;

    const a = selected();

    if (!a) {
      body.innerHTML =
        '<div class="ab-checkout__empty">' +
        '<p>هنوز آدرسی برای ارسال سفارش ثبت نکرده‌اید.</p>' +
        '<small>برای ادامه، یک آدرس جدید اضافه کنید.</small>' +
        '<button type="button" class="ab-btn ab-btn--primary" data-act="add">' + AB.icons.plus + '<span>افزودن آدرس جدید</span></button>' +
        '</div>';
      return;
    }

    body.innerHTML =
      AB.cardHTML(a, { selected: true }) +
      '<div class="ab-checkout__acts">' +
      '<button type="button" class="ab-btn ab-btn--ghost" data-act="change">تغییر آدرس</button>' +
      '<button type="button" class="ab-btn ab-btn--ghost" data-act="add">' + AB.icons.plus + '<span>افزودن آدرس جدید</span></button>' +
      '</div>';
  }

  state.open = function (view) {

    const opts = {
      view: view || "list",
      pick: true,
      selectedId: state.selectedId,

      onSelect(a) {
        state.selectedId = a._id;
        opts.selectedId = a._id;
        remember();
        render();
      },

      // بعد از افزودن / ویرایش / حذف / تغییر آدرس پیش‌فرض
      onChange(list) {
        state.list = list;
        if (!selected()) choose();
        opts.selectedId = state.selectedId;
        render();
      }
    };

    AB.openSheet(opts);
  };

  body.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    state.open(btn.dataset.act === "add" ? "form" : "list");
  });

  // ---- شروع: تا رسیدن آدرس‌ها، فرم قدیمی مخفی و اسکلت نمایش داده می‌شود ----
  state.loading = true;
  checkoutForm.classList.add("ab-hidden");
  box.hidden = false;
  body.innerHTML = '<div class="ab-skel"></div>';

  AB.list().then(function (list) {

    state.list = list;
    state.ready = true;
    choose();
    render();

  }).catch(function (err) {

    // دریافت آدرس‌ها ممکن نشد: فرم قدیمی آدرس فعال می‌ماند
    console.error(err);
    box.hidden = true;
    checkoutForm.classList.remove("ab-hidden");

  }).finally(function () {

    state.loading = false;

  });

  return state;

})();