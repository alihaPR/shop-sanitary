/* =====================================================================
   نرم سنتر — اسکریپت صفحه اصلی (جایگزین main.js در index.html)
   وابسته به: config.js (API_BASE_URL)
   ===================================================================== */
(function () {
    "use strict";

    var API = (typeof API_BASE_URL !== "undefined") ? API_BASE_URL : "https://api.narmcenter.com/api";
    var IMG_BASE = "https://api.narmcenter.com/";

    /* پایان پیشنهاد شگفت‌انگیز؛ مثال: "2026-10-20T23:59:59"
       اگر خالی بماند تا پایان همان روز شمارش می‌کند. */
    var OFFER_ENDS_AT = null;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function toFa(s) { return String(s).replace(/\d/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
    function money(n) { return toFa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")); }
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    function imgUrl(p) { return p && p.image ? IMG_BASE + String(p.image).replace(/^\/?/, "") : ""; }
    function finalPrice(p) { return p.discountPercent > 0 ? Math.round(p.price * (1 - p.discountPercent / 100)) : p.price; }

    /* ---------------- اسلایدر هیرو ---------------- */
    (function hero() {
        var box = document.getElementById("heroSlides");
        if (!box) return;
        var body = box.parentNode;
        var slides = Array.prototype.slice.call(box.querySelectorAll(".slide"));
        var dotsBox = document.getElementById("heroDots");
        var thumb = document.getElementById("heroThumb");
        var thumbImg = thumb && thumb.querySelector("img");
        var index = 0, timer = null;

        slides.forEach(function (_, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.setAttribute("role", "tab");
            b.setAttribute("aria-label", "اسلاید " + toFa(i + 1));
            b.addEventListener("click", function () { go(i, true); });
            dotsBox.appendChild(b);
        });

        function go(i, user) {
            var prev = index;
            index = (i + slides.length) % slides.length;
            var changed = index !== prev;
            slides.forEach(function (s, k) {
                var on = k === index;
                if (on) s.classList.remove("is-leaving");
                else if (changed && k === prev) {
                    s.classList.add("is-leaving");
                    setTimeout(function () { s.classList.remove("is-leaving"); }, 900);
                }
                s.classList.toggle("is-active", on);
                s.setAttribute("aria-hidden", on ? "false" : "true");
                var a = s.querySelector(".btn-white");
                if (a) a.tabIndex = on ? 0 : -1;
            });
            Array.prototype.forEach.call(dotsBox.children, function (d, k) {
                d.setAttribute("aria-selected", k === index ? "true" : "false");
            });
            if (thumbImg) {
                thumbImg.src = slides[(index + 1) % slides.length].querySelector(".slide__art img").getAttribute("src");
                if (changed && !reduceMotion) {
                    thumbImg.classList.remove("is-swap");
                    void thumbImg.offsetWidth;
                    thumbImg.classList.add("is-swap");
                }
            }
            if (user) restart();
        }
        function restart() {
            clearInterval(timer);
            if (reduceMotion || slides.length < 2) return;
            timer = setInterval(function () { go(index + 1); }, 6500);
        }

        if (thumb) thumb.addEventListener("click", function () { go(index + 1, true); });
        body.addEventListener("mouseenter", function () { clearInterval(timer); });
        body.addEventListener("mouseleave", restart);
        go(0);
        restart();
    })();

    /* ---------------- کشیدن ردیف ها با موس ---------------- */
    function enableDrag(rail) {
        var down = false, startX = 0, startScroll = 0, moved = false;
        rail.addEventListener("mousedown", function (e) { down = true; moved = false; startX = e.pageX; startScroll = rail.scrollLeft; });
        window.addEventListener("mouseup", function () { if (down) { down = false; rail.classList.remove("is-dragging"); } });
        window.addEventListener("mousemove", function (e) {
            if (!down) return;
            var dx = e.pageX - startX;
            if (Math.abs(dx) > 5) { moved = true; rail.classList.add("is-dragging"); }
            if (moved) rail.scrollLeft = startScroll - dx;
        });
        rail.addEventListener("dragstart", function (e) { e.preventDefault(); });
    }

    /* ---------------- کارت محصول ---------------- */
    function card(p, offer) {
        var u = imgUrl(p);
        var out = p.available === false;
        return '<a class="pc' + (out ? " is-out" : "") + '" href="./cart.html?id=' + encodeURIComponent(p._id) + '">' +
            '<span class="pc__media">' +
            (u ? '<img src="' + esc(u) + '" alt="' + esc(p.name) + '" loading="lazy" draggable="false">' : "") +
            (out ? '<span class="pc__out">ناموجود</span>' : "") +
            "</span>" +
            '<h3 class="pc__name">' + esc(p.name) + "</h3>" +
            '<div class="pc__prices">' +
            (offer ? '<div class="pc__old"><span class="pc__off">٪' + toFa(p.discountPercent) + '</span><s>' + money(p.price) + "</s></div>" : "") +
            '<div class="pc__price"><b>' + money(finalPrice(p)) + '</b><img src="./img/toman.svg" alt="تومان" width="22" height="22"></div>' +
            "</div></a>";
    }

    function ts(p) { var t = Date.parse(p.createdAt || p.updatedAt || ""); return isNaN(t) ? 0 : t; }
    function empty(msg, light) { return '<p class="rail-empty"' + (light ? ' style="color:#fff"' : "") + ">" + msg + "</p>"; }

    function load() {
        var newRail = document.getElementById("newestRail");
        var offRail = document.getElementById("offersRail");

        fetch(API + "/products")
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function (list) {
                if (!Array.isArray(list)) list = [];

                var newest = list.slice();
                if (newest.some(ts)) newest.sort(function (a, b) { return ts(b) - ts(a); });
                else newest.reverse();
                newest = newest.slice(0, 10);
                newRail.innerHTML = newest.length ? newest.map(function (p) { return card(p, false); }).join("")
                    : empty("هنوز محصولی ثبت نشده است.");

                var offers = list.filter(function (p) { return p.discountPercent > 0 && p.available !== false; })
                    .sort(function (a, b) { return b.discountPercent - a.discountPercent; }).slice(0, 10);
                offRail.innerHTML = offers.length ? offers.map(function (p) { return card(p, true); }).join("")
                    : empty("در حال حاضر پیشنهاد شگفت‌انگیزی ثبت نشده است.", true);
            })
            .catch(function (e) {
                console.error(e);
                newRail.innerHTML = empty("بارگذاری محصولات انجام نشد. صفحه را دوباره باز کنید.");
                offRail.innerHTML = empty("بارگذاری محصولات انجام نشد.", true);
            });
    }

    /* ---------------- شمارش معکوس ---------------- */
    function countdown() {
        var h = document.getElementById("tH"), m = document.getElementById("tM"), s = document.getElementById("tS");
        if (!h) return;
        function target() {
            if (OFFER_ENDS_AT) { var t = new Date(OFFER_ENDS_AT).getTime(); if (!isNaN(t)) return t; }
            var d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime();
        }
        var end = target();
        function pad(n) { return toFa(("0" + n).slice(-2)); }
        function tick() {
            var left = Math.max(0, Math.floor((end - Date.now()) / 1000));
            if (left === 0 && !OFFER_ENDS_AT) { end = target(); left = Math.max(0, Math.floor((end - Date.now()) / 1000)); }
            h.textContent = pad(Math.floor(left / 3600));
            m.textContent = pad(Math.floor((left % 3600) / 60));
            s.textContent = pad(left % 60);
        }
        tick();
        setInterval(tick, 1000);
    }

    document.querySelectorAll(".rail").forEach(enableDrag);
    load();
    countdown();

    var up = document.getElementById("toTop");
    if (up) up.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
})();