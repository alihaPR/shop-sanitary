// منوی حساب کاربری هدر — فقط ظاهر.
// باز/بسته شدن، نام کاربر، پنل مدیریت و خروج همچنان در authUI.js هستند.
// این فایل فقط شماره موبایل را (اگر در اطلاعات ذخیره‌شده‌ی کاربر باشد) زیر نام نشان می‌دهد.
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("userDropdownPhone");
  if (!el) return;
  var user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch (e) { /* ignore */ }
  var phone = user && (user.phone || user.mobile || user.phoneNumber);
  if (phone) {
    el.textContent = String(phone);
    el.hidden = false;
  }
});
