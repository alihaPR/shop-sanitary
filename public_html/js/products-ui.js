// =====================================================================
// صفحه محصولات — رفتار ظاهری (UI فقط)
// این فایل هیچ منطق فیلتر/مرتب‌سازی/صفحه‌بندی ندارد؛ آن‌ها همچنان در products.js هستند.
// کار این فایل:
//   ۱) نمایش .filter-box (همان المنت اصلی، با همه‌ی رویدادهایش) داخل پنلی که زیر دکمه‌ی «فیلتر» باز می‌شود (دسکتاپ)
//   ۲) نشان تعداد فیلترهای فعال روی دکمه‌ی «فیلتر»
//   ۳) نوشتن تعداد نتیجه روی دکمه‌ی «نمایش محصولات» (فقط خواندن از DOM)
//   ۴) دکمه‌ی بازگشت به بالای فوتر
// =====================================================================
(function () {
  "use strict";

  var openBtn = document.getElementById("fp-open");
  var modal = document.getElementById("fp-modal");
  var overlay = document.getElementById("fp-overlay");
  var body = modal && modal.querySelector(".fp-body");
  var closeBtn = modal && modal.querySelector(".fp-close");
  var box = document.querySelector(".filter-box");
  var grid = document.getElementById("products-grid");

  var home = null;        // جای اصلی .filter-box (داخل aside)
  var expanded = false;   // قیمت و برند فقط بار اول باز می‌شوند
  var lastFocus = null;

  var DESKTOP = window.matchMedia("(min-width: 1025px)");

  // ------------------------------------------------------------ بازگشت به بالا
  var up = document.getElementById("toTop");
  if (up) {
    up.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  if (!box) return;

  // ------------------------------------------------------------ نشان تعداد فیلترهای اعمال‌شده روی دکمه‌ی «فیلتر»
  // (تعداد از وضعیت اعمال‌شده‌ی products.js خوانده می‌شود، نه از کنترل‌هایی که هنوز اعمال نشده‌اند)
  function updateBadge() {
    var badge = openBtn && openBtn.querySelector(".fp-count");
    if (!badge) return;
    var n = typeof window.appliedFilterCount === "function" ? window.appliedFilterCount() : 0;
    badge.hidden = n === 0;
    badge.textContent = n.toLocaleString("fa-IR");
  }

  function refresh() { updateBadge(); }

  // حذف فیلترها: products.js همان لحظه اعمالش می‌کند؛ بعدش نشان را به‌روز کن
  box.addEventListener("click", function (e) {
    if (e.target.closest(".filter-reset")) setTimeout(refresh, 0);
  });

  refresh();

  // ------------------------------------------------------------ پاپ‌آپ (فقط دسکتاپ؛ در موبایل شیت پایین همان کار را می‌کند)
  if (!openBtn || !modal || !overlay || !body) return;

  function rememberHome() {
    if (!home && box.parentNode && box.parentNode.classList.contains("filter")) {
      home = { parent: box.parentNode, next: box.nextSibling };
    }
  }

  function giveBack() {
    if (home && box.parentNode === body) {
      home.parent.insertBefore(box, home.next);
    }
  }

  function openModal() {
    if (!DESKTOP.matches) return;
    rememberHome();
    lastFocus = document.activeElement;

    if (box.parentNode !== body) body.appendChild(box);

    // اولین باز شدن: بخش‌های قیمت و برند با همان کلیک خودِ سایت باز می‌شوند (منطق toggle دست‌نخورده)
    if (!expanded) {
      expanded = true;
      ["filter-price", "filter-brand"].forEach(function (id) {
        var head = document.getElementById(id);
        if (head) head.click();
      });
    }

    overlay.classList.add("is-open");
    modal.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    modal.setAttribute("aria-hidden", "false");
        modal.setAttribute("tabindex", "-1");
    modal.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;
    // اگر بدون «نمایش محصولات» بسته شد، انتخاب‌های اعمال‌نشده کنار گذاشته می‌شوند
    if (typeof window.restoreFilterControls === "function") window.restoreFilterControls();
    refresh();
    overlay.classList.remove("is-open");
    modal.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-hidden", "true");
    // بعد از پایان انیمیشن، جعبه‌ی فیلتر سر جای اولش برمی‌گردد
    setTimeout(function () {
      if (!modal.classList.contains("is-open")) giveBack();
    }, 380);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  openBtn.addEventListener("click", function () {
    if (modal.classList.contains("is-open")) closeModal(); else openModal();
  });
  overlay.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  // «نمایش محصولات»: هم پاپ‌آپ دسکتاپ و هم شیت موبایل (closeSheet از products.js)
  box.addEventListener("click", function (e) {
    if (!e.target.closest(".filter-apply")) return;
    // فیلترها را همین حالا products.js اعمال کرده؛ حالا نشان را به‌روز و پنل را ببند
    refresh();
    closeModal();
    if (typeof window.closeSheet === "function") window.closeSheet();
  });

  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") { closeModal(); return; }
    });

  // اگر پنجره کوچک شد و پاپ‌آپ باز بود، ببندش (موبایل شیت دارد)
  var onChange = function () { if (!DESKTOP.matches) closeModal(); };
  if (DESKTOP.addEventListener) DESKTOP.addEventListener("change", onChange);
  else if (DESKTOP.addListener) DESKTOP.addListener(onChange);
})();
