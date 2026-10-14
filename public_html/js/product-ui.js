// =====================================================================
// صفحه تک‌محصول — رفتار ظاهری (UI فقط)
// هیچ منطقی از cartloader.js (دریافت محصول، سبد، علاقه‌مندی، اشتراک‌گذاری) اینجا نیست.
// کارِ این فایل بعد از اینکه cartloader کارت «مشخصات» را ساخت:
//   ۱) نوار تب (توضیحات کامل / مشخصات کامل) که فقط تا همان بخش اسکرول می‌کند
//   ۲) «مشاهده بیشتر» برای توضیحات طولانی و جدول مشخصات
//   ۳) دکمه‌ی بازگشت به بالای فوتر
// =====================================================================
(function () {
  "use strict";

  // ------------------------------------------------------------ بازگشت به بالا
  var up = document.getElementById("toTop");
  if (up) {
    up.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  var host = document.getElementById("product-details");
  if (!host) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function makeMore(label) {
    var wrap = document.createElement("div");
    wrap.className = "pd-more";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pd-more-btn";
    btn.innerHTML = '<span>' + label + '</span><i aria-hidden="true"></i>';
    wrap.appendChild(btn);
    return { wrap: wrap, btn: btn };
  }

  function setLabel(btn, text) {
    btn.querySelector("span").textContent = text;
  }

  function enhance(card) {
    if (card.dataset.pdReady) return;
    card.dataset.pdReady = "1";

    var titles = card.querySelectorAll(".section-title");
    var specsTitle = titles[0] || null;   // «مشخصات کامل محصول»
    var descTitle = titles[1] || null;    // «توضیحات محصول»
    if (specsTitle) specsTitle.id = "pd-specs";
    if (descTitle) {
      descTitle.id = "pd-desc";
      if (descTitle.textContent.trim() === "توضیحات محصول") descTitle.textContent = "توضیحات کامل";
    }

    // ---- تب‌ها
    var tabs = document.createElement("nav");
    tabs.className = "pd-tabs";
    tabs.setAttribute("aria-label", "بخش‌های صفحه محصول");
    [["pd-desc", "توضیحات کامل"], ["pd-specs", "مشخصات کامل محصول"]].forEach(function (t, i) {
      if (!document.getElementById(t[0])) return;
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = t[1];
      b.dataset.target = t[0];
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", function () {
        tabs.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        scrollToEl(document.getElementById(t[0]));
      });
      tabs.appendChild(b);
    });
    if (tabs.children.length) card.insertBefore(tabs, card.firstChild);

    // ---- توضیحات: چهار خط، بعد «مشاهده بیشتر»
    var desc = card.querySelector(".desc-text");
    if (desc && desc.textContent.trim()) {
      var d = makeMore("مشاهده بیشتر");
      d.wrap.classList.add("pd-more--desc");
      desc.after(d.wrap);
      desc.classList.add("is-clamped");
      d.btn.addEventListener("click", function () {
        var open = desc.classList.toggle("is-clamped") === false;
        setLabel(d.btn, open ? "مشاهده کمتر" : "مشاهده بیشتر");
        d.btn.classList.toggle("is-open", open);
      });
      var measure = function () {
        if (desc.classList.contains("is-clamped")) {
          d.btn.hidden = !(desc.scrollHeight > desc.clientHeight + 2);
        }
      };
      measure();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      window.addEventListener("resize", measure);
    } else if (desc) {
      var d0 = makeMore("");
      d0.wrap.classList.add("pd-more--desc");
      d0.btn.hidden = true;
      desc.after(d0.wrap);
    }

    // ---- جدول مشخصات: سه ردیف، بعد «مشاهده بیشتر»
    var table = card.querySelector(".feature-table");
    if (table) {
      var rows = table.querySelectorAll("tr");
      var s = makeMore("مشاهده بیشتر");
      s.wrap.classList.add("pd-more--specs");
      table.after(s.wrap);
      if (rows.length > 3) {
        table.classList.add("is-collapsed");
        s.btn.addEventListener("click", function () {
          var open = table.classList.toggle("is-collapsed") === false;
          setLabel(s.btn, open ? "مشاهده کمتر" : "مشاهده بیشتر");
          s.btn.classList.toggle("is-open", open);
        });
      } else {
        s.btn.hidden = true;
      }
    }
  }

  function scan() {
    var card = host.querySelector(".lower-card");
    if (card) enhance(card);
  }

  scan();
  if ("MutationObserver" in window) {
    new MutationObserver(scan).observe(host, { childList: true });
  }
})();
