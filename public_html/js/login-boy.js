// شخصیت تعاملی صفحه ورود (برگرفته از دموی login-boy) — فقط ظاهر.
// هیچ منطقی از auth.js (ورود، ثبت‌نام، کد تایید) اینجا نیست و هیچ رویدادی متوقف نمی‌شود.
//  • مردمک‌ها نشانگر ماوس را دنبال می‌کنند (روی کل صفحه، نه فقط روی خود عکس)
//  • فوکوس روی فیلد رمز عبور: به حالت «چشم‌ها با دست پوشیده» می‌رود؛ با خروج از فیلد برمی‌گردد
//  • فوکوس روی فیلدهای دیگر: به همان فیلد نگاه می‌کند
(function () {
  "use strict";

  var visual = document.getElementById("boyVisual");
  if (!visual) return;

  var pupils = Array.prototype.slice.call(visual.querySelectorAll(".eye i"));
  var covering = false;
  var gazeEl = null;
  var pointer = null;
  var raf = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function setPupils(dx, dy) {
    pupils.forEach(function (p) {
      p.style.transform = "translate(" + dx.toFixed(2) + "px," + dy.toFixed(2) + "px)";
    });
  }

  function target() {
    if (gazeEl && document.body.contains(gazeEl)) {
      var r = gazeEl.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return pointer;
  }

  function update() {
    raf = 0;
    if (covering) return;
    var t = target();
    if (!t) { setPupils(0, 0); return; }
    var r = visual.getBoundingClientRect();
    var x = (t.x - r.left) / r.width;
    var y = (t.y - r.top) / r.height;
    var s = r.width / 400; // مقیاس حرکت نسبت به اندازه‌ی نمایش (دمو روی ۴۰۰px تنظیم شده)
    setPupils(clamp((x - 0.5) * 8, -4, 4) * s, clamp((y - 0.33) * 5, -2.5, 2.5) * s);
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(update); }

  document.addEventListener("pointermove", function (e) {
    pointer = { x: e.clientX, y: e.clientY };
    schedule();
  }, { passive: true });

  document.addEventListener("pointerleave", function () {
    pointer = null;
    schedule();
  });

  window.addEventListener("resize", schedule);

  function isField(el) {
    return el && el.matches && el.matches(".auth-form input");
  }

  document.addEventListener("focusin", function (e) {
    if (!isField(e.target)) return;
    if (e.target.type === "password") {
      covering = true;
      visual.classList.add("covering");
    } else {
      covering = false;
      visual.classList.remove("covering");
      gazeEl = e.target;
      schedule();
    }
  });

  document.addEventListener("focusout", function (e) {
    if (!isField(e.target)) return;
    covering = false;
    visual.classList.remove("covering");
    gazeEl = null;
    schedule();
  });
})();
