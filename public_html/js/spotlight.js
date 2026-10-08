/* =====================================================================
   نرم سنتر — جستجوی اسپات‌لایت (جایگزین search.js در صفحه‌ی اصلی)
   منطق همان منطق قبلی است:
     - پیشنهاد حین تایپ:  GET {API}/products?search=...   (۶ نتیجه‌ی اول)
     - کلیک روی نتیجه:     cart.html?id=...
     - Enter / «مشاهده همه»: products.html?search=...
     - تاریخچه در localStorage با همان کلید قبلی ("search-history")
   میان‌بر: کلید «/» یا Ctrl+K برای باز کردن، Esc برای بستن، ↑ ↓ برای حرکت
   ===================================================================== */
(function () {
    "use strict";

    var API = (typeof API_BASE_URL !== "undefined") ? API_BASE_URL : "https://api.narmcenter.com/api";
    var IMG_BASE = "https://api.narmcenter.com/";
    var HISTORY_KEY = "search-history";
    var MAX_HISTORY = 8;
    var MAX_RESULTS = 6;

    var CATEGORY_NAMES = {
        "پوشک-کودک": "پوشک کودک",
        "پوشک-بزرگسال": "پوشک بزرگسال",
        "نوار-بهداشتی": "نوار بهداشتی",
        "پنبه": "پنبه",
        "دستمال-مرطوب": "دستمال مرطوب",
        "دستمال-کاغذی": "دستمال کاغذی"
    };

    var root = document.getElementById("spot");
    var trigger = document.getElementById("searchTrigger");
    var input = document.getElementById("spotInput");
    var body = document.getElementById("spotBody");
    var form = document.getElementById("spotForm");
    if (!root || !trigger || !input || !body) return;

    var isOpen = false, lastFocus = null, timer = null, controller = null, token = 0;

    /* ---------------- ابزار ---------------- */
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    function toFa(s) { return String(s).replace(/\d/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
    function money(n) { return toFa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")); }
    function finalPrice(p) { return p.discountPercent > 0 ? Math.round(p.price * (1 - p.discountPercent / 100)) : p.price; }
    function imgUrl(p) { return p && p.image ? IMG_BASE + String(p.image).replace(/^\/?/, "") : ""; }

    function highlight(name, q) {
        var safe = esc(name);
        if (!q) return safe;
        var i = String(name).toLowerCase().indexOf(q.toLowerCase());
        if (i < 0) return safe;
        return esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + q.length)) + "</mark>" + esc(name.slice(i + q.length));
    }

    function getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch (e) { return []; }
    }
    function setHistory(list) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) { /* حالت خصوصی مرورگر */ } }
    function saveToHistory(q) {
        var h = getHistory().filter(function (x) { return x !== q; });
        h.unshift(q);
        setHistory(h.slice(0, MAX_HISTORY));
    }
    function goSearch(q) {
        q = (q || "").trim();
        if (!q) return;
        saveToHistory(q);
        window.location.href = "products.html?search=" + encodeURIComponent(q);
    }

    var ARROW = '<svg class="spot__go" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M14 9H4M8.5 4.5L4 9l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var CLOCK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

    /* ---------------- نمایش حالت‌ها ---------------- */
    function showIdle() {
        var h = getHistory();
        var html = "";
        if (h.length) {
            html += '<div class="spot__label">جستجوهای اخیر</div>';
            html += h.map(function (q, i) {
                return '<div class="spot__hist">' +
                    '<button type="button" class="spot__item" data-hist="' + i + '">' + CLOCK +
                    '<span class="spot__txt"><span class="spot__name">' + esc(q) + "</span></span></button>" +
                    '<button type="button" class="spot__x" data-del="' + i + '" aria-label="حذف از تاریخچه">×</button></div>';
            }).join("");
        }
        html += '<div class="spot__label">دسته‌بندی‌های پرطرفدار</div><div class="spot__chips">' +
            Object.keys(CATEGORY_NAMES).map(function (k) {
                return '<a class="spot__chip" href="products.html?category=' + encodeURIComponent(k) + '">' + esc(CATEGORY_NAMES[k]) + "</a>";
            }).join("") + "</div>";
        body.innerHTML = html;
        setActive(-1);
    }

    function showLoading() {
        var row = '<div class="spot__sk"><i></i><i></i></div>';
        body.innerHTML = '<div class="spot__label">در حال جستجو…</div>' + row + row + row;
    }

    function showResults(list, q) {
        if (!list.length) {
            body.innerHTML = '<div class="spot__msg">نتیجه‌ای برای «<b>' + esc(q) + '</b>» پیدا نشد.<br>املای دیگری را امتحان کنید یا از دسته‌بندی‌ها محصول را پیدا کنید.</div>' +
                '<div class="spot__chips">' + Object.keys(CATEGORY_NAMES).map(function (k) {
                    return '<a class="spot__chip" href="products.html?category=' + encodeURIComponent(k) + '">' + esc(CATEGORY_NAMES[k]) + "</a>";
                }).join("") + "</div>";
            setActive(-1);
            return;
        }
        var html = '<div class="spot__label">نتایج جستجو</div>';
        html += list.slice(0, MAX_RESULTS).map(function (p) {
            var u = imgUrl(p);
            return '<a class="spot__item" href="cart.html?id=' + encodeURIComponent(p._id) + '">' +
                '<span class="spot__thumb">' + (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : "") + "</span>" +
                '<span class="spot__txt"><span class="spot__name">' + highlight(p.name || "", q) + "</span>" +
                '<span class="spot__cat">' + esc(CATEGORY_NAMES[p.category] || "") + "</span></span>" +
                '<span class="spot__price"><b>' + money(finalPrice(p)) + '</b><img src="./img/toman.svg" alt="تومان" width="18" height="18"></span>' +
                ARROW + "</a>";
        }).join("");
        html += '<a class="spot__all" href="products.html?search=' + encodeURIComponent(q) + '" data-all="1">' +
            "مشاهده همه نتایج" + (list.length > MAX_RESULTS ? " (" + toFa(list.length) + ")" : "") + "</a>";
        body.innerHTML = html;
        setActive(-1);
    }

    function showError() {
        body.innerHTML = '<div class="spot__msg">ارتباط با سرور برقرار نشد.<br>اینترنت را بررسی کنید و دوباره تلاش کنید.</div>';
        setActive(-1);
    }

    /* ---------------- جستجو ---------------- */
    function search(q) {
        var my = ++token;
        if (controller) controller.abort();
        controller = ("AbortController" in window) ? new AbortController() : null;
        showLoading();
        fetch(API + "/products?search=" + encodeURIComponent(q), controller ? { signal: controller.signal } : undefined)
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function (list) { if (my === token) showResults(Array.isArray(list) ? list : [], q); })
            .catch(function (e) { if (e && e.name === "AbortError") return; if (my === token) showError(); });
    }

    input.addEventListener("input", function () {
        var q = input.value.trim();
        clearTimeout(timer);
        if (!q) { token++; if (controller) controller.abort(); showIdle(); return; }
        timer = setTimeout(function () { search(q); }, 220);
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var act = items()[active];
        if (act) { act.click(); return; }
        goSearch(input.value);
    });

    /* ---------------- حرکت با کیبورد ---------------- */
    var active = -1;
    function items() { return Array.prototype.slice.call(body.querySelectorAll(".spot__item, .spot__all")); }
    function setActive(i) {
        var list = items();
        active = i;
        list.forEach(function (el, k) { el.classList.toggle("is-active", k === i); });
        if (list[i]) list[i].scrollIntoView({ block: "nearest" });
    }
    input.addEventListener("keydown", function (e) {
        var list = items();
        if (e.key === "ArrowDown") { e.preventDefault(); if (list.length) setActive((active + 1) % list.length); }
        else if (e.key === "ArrowUp") { e.preventDefault(); if (list.length) setActive((active - 1 + list.length) % list.length); }
    });

    /* ---------------- کلیک‌ها داخل بدنه ---------------- */
    body.addEventListener("click", function (e) {
        var del = e.target.closest("[data-del]");
        if (del) {
            e.preventDefault();
            var h = getHistory(); h.splice(+del.getAttribute("data-del"), 1); setHistory(h);
            showIdle(); return;
        }
        var hist = e.target.closest("[data-hist]");
        if (hist) {
            input.value = getHistory()[+hist.getAttribute("data-hist")] || "";
            input.focus();
            input.dispatchEvent(new Event("input"));
            return;
        }
        var all = e.target.closest("[data-all]");
        if (all) { e.preventDefault(); goSearch(input.value); }
    });

    /* ---------------- باز و بسته ---------------- */
    function open() {
        if (isOpen) return;
        isOpen = true;
        lastFocus = document.activeElement;
        root.hidden = false;
        document.documentElement.style.overflow = "hidden";
        input.value = "";
        showIdle();
        requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add("is-open"); input.focus(); }); });
        trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
        if (!isOpen) return;
        isOpen = false;
        clearTimeout(timer); token++; if (controller) controller.abort();
        root.classList.remove("is-open");
        document.documentElement.style.overflow = "";
        trigger.setAttribute("aria-expanded", "false");
        setTimeout(function () { if (!isOpen) root.hidden = true; }, 320);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    trigger.addEventListener("click", open);
    root.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) close(); });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && isOpen) { e.preventDefault(); close(); return; }
        var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName) || (document.activeElement || {}).isContentEditable;
        if (!isOpen && ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"))) { e.preventDefault(); open(); }
        /* نگه داشتن Tab داخل پنل */
        if (isOpen && e.key === "Tab") {
            var f = root.querySelectorAll("input, button, a[href]");
            var vis = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
            if (!vis.length) return;
            var first = vis[0], last = vis[vis.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
})();
