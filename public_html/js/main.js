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
/* ---------------- کارت محصول ---------------- */
function card(p, offer) {
    var u = imgUrl(p);
    var out = p.available === false;

    var tomanSvg =
        '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M3.93051 2.23964L4.91279 1.28564L5.91565 2.24993L4.91794 3.20264L3.93051 2.23964ZM8.08336 5.42822C8.08336 6.22793 7.87765 6.85664 7.46879 7.31436C7.21036 7.5985 6.87479 7.81579 6.46208 7.96364C6.01313 8.11174 5.54231 8.1826 5.06965 8.17322H4.35608C3.81479 8.17322 3.32622 8.07807 2.89165 7.8865C2.42217 7.68897 2.02017 7.35933 1.73451 6.93764C1.42997 6.45874 1.27385 5.90048 1.28579 5.33307C1.28579 5.25722 1.28708 5.18264 1.29094 5.10679C1.32951 4.39964 1.55322 3.61793 1.96594 2.75779L3.37379 3.38007C3.04336 4.06407 2.86336 4.66579 2.83508 5.18393C2.83251 5.23536 2.82994 5.28679 2.82994 5.33822C2.82994 5.66222 2.90065 5.92707 3.04336 6.13279C3.19679 6.35604 3.42468 6.51738 3.68622 6.58793C3.79551 6.62393 3.91508 6.64964 4.04365 6.66507C4.14522 6.67793 4.24936 6.68307 4.35608 6.68307H5.06965C5.65851 6.68307 6.05836 6.57893 6.26922 6.36936C6.44922 6.19064 6.53922 5.87693 6.53922 5.4295V2.59707H8.08208V5.42822H8.08336ZM15.0687 9.52193L14.1429 8.62193L15.0545 7.71422L15.9995 8.62322L15.0687 9.52193ZM11.3967 9.91793C12.0935 9.91793 12.6477 10.1622 13.0591 10.6495C13.4409 11.0944 13.6312 11.6485 13.6312 12.3119V12.7799H13.8626V12.7748H14.3898C14.6739 12.7748 14.8745 12.7388 14.9902 12.6668C15.1098 12.5961 15.1702 12.4868 15.1702 12.3351V12.2464C15.1754 11.9339 15.1921 10.9041 15.1702 10.8128L16.7144 10.3499V12.3736C16.7183 12.7743 16.5884 13.1647 16.3454 13.4832C15.9519 14.0039 15.3117 14.2636 14.4232 14.2636H13.6171C13.5387 15.2061 13.0591 15.8798 12.1809 16.2861C11.8377 16.4429 11.4352 16.5561 10.9762 16.6268C10.5874 16.6862 10.1944 16.715 9.80108 16.7129V15.2228C10.5879 15.2228 11.1794 15.1174 11.5754 14.9052C11.8968 14.7355 12.0588 14.5221 12.0588 14.2636H11.3967C10.8361 14.2636 10.3591 14.1184 9.96565 13.8278C9.49379 13.4768 9.25851 12.9702 9.25851 12.3106C9.25851 11.6832 9.41536 11.1522 9.73036 10.7164C10.1109 10.1828 10.6664 9.91664 11.3967 9.91664V9.91793ZM12.0819 12.7799V12.3119C12.0819 12.0329 12.0202 11.8118 11.8981 11.6485C11.8403 11.5707 11.7645 11.5082 11.6771 11.4663C11.5897 11.4244 11.4935 11.4044 11.3967 11.4081C11.2988 11.4047 11.2015 11.4247 11.1129 11.4665C11.0244 11.5084 10.9471 11.5708 10.8875 11.6485C10.765 11.8153 10.7033 12.019 10.7127 12.2258C10.7125 12.2545 10.7137 12.2833 10.7165 12.3119C10.7268 12.4726 10.8014 12.5948 10.9441 12.6758C11.0637 12.7452 11.2141 12.7786 11.3967 12.7786L12.0819 12.7799ZM12.2144 8.62322L13.1401 9.52322L14.0709 8.62322L13.1259 7.71422L12.2144 8.62322ZM3.60779 14.9078H3.64636C4.20308 14.8949 4.60422 14.7715 4.85108 14.5349C4.88194 14.5504 4.93465 14.5799 5.00536 14.6224L5.10051 14.6725L5.20465 14.7265C5.37822 14.8204 5.54022 14.8975 5.69194 14.9579C6.13551 15.1456 6.55336 15.2408 6.94808 15.2408C7.15414 15.2452 7.35905 15.2089 7.55101 15.1339C7.74298 15.0589 7.91822 14.9466 8.06665 14.8036C8.45236 14.4372 8.64394 13.8856 8.64394 13.1502C8.63936 12.6291 8.49026 12.1195 8.21322 11.6781C7.82879 11.0905 7.27208 10.7974 6.54179 10.7974C5.89636 10.7974 5.36408 11.0442 4.94494 11.5366C4.79965 11.7064 4.67494 11.9018 4.56694 12.1229C4.52579 12.2026 4.48979 12.2836 4.45894 12.3685C4.44333 12.4008 4.43042 12.4343 4.42036 12.4688C4.41045 12.4943 4.40101 12.52 4.39208 12.5459C4.25965 12.9432 4.17222 13.1695 4.12851 13.2274C4.03594 13.3431 3.85336 13.4074 3.57951 13.4164C3.42136 13.4099 3.31079 13.3778 3.25036 13.3186C3.17708 13.2492 3.14108 13.1219 3.14108 12.9368V8.99993L1.59694 8.35707V12.9368C1.59694 13.2724 1.65865 13.5745 1.78079 13.8406C1.87208 14.0438 1.99679 14.2212 2.15365 14.3716C2.31179 14.5234 2.49565 14.6429 2.70651 14.7316C2.96108 14.8396 3.24651 14.8988 3.56151 14.9065V14.9078H3.60779ZM7.14608 13.6041C7.19973 13.4592 7.2191 13.3038 7.20265 13.1502C7.19249 12.9324 7.11874 12.7223 6.99051 12.5459C6.86194 12.3736 6.71151 12.2875 6.54051 12.2875C6.30908 12.2875 6.11622 12.4199 5.96579 12.6861C5.91179 12.7774 5.86294 12.8892 5.81922 13.0229C5.80075 13.0739 5.7836 13.1253 5.76779 13.1772L5.74851 13.2454L5.72922 13.3045C5.91179 13.4562 6.14451 13.5822 6.42865 13.6812C6.66008 13.7609 6.84651 13.7995 6.98536 13.7995C7.04194 13.7995 7.09594 13.7352 7.14608 13.6041Z" fill="#1E1E1E" fill-rule="evenodd" clip-rule="evenodd"/>' +
        '</svg>';

    return '<a class="pc' + (out ? " is-out" : "") + '" href="./cart.html?id=' + encodeURIComponent(p._id) + '">' +
        '<span class="pc__media">' +
        (u ? '<img src="' + esc(u) + '" alt="' + esc(p.name) + '" loading="lazy" draggable="false">' : "") +
        (out ? '<span class="pc__out">ناموجود</span>' : "") +
        '</span>' +
        '<h3 class="pc__name">' + esc(p.name) + '</h3>' +
        '<div class="pc__prices">' +
        (offer ? '<div class="pc__old"><span class="pc__off">٪' + toFa(p.discountPercent) + '</span><s>' + money(p.price) + '</s></div>' : "") +
        '<div class="pc__price"><b>' + money(finalPrice(p)) + '</b>' + tomanSvg + '</div>' +
        '</div>' +
        '</a>';
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