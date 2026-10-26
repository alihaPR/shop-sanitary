/* =====================================================================
   select-ui.js — ظاهر سفارشی برای لیست‌های «استان» و «شهر» در checkout
   فقط نمایشی: <select> اصلی در DOM می‌ماند و منطق (checkout.js) همان را می‌خواند.
   - با انتخاب، مقدار select ست و رویداد change ارسال می‌شود (برای loadCities).
   - وقتی checkout.js گزینه‌های select را عوض کند (MutationObserver)، لیست دوباره ساخته می‌شود.
   - دسکتاپ: منوی کشویی زیر فیلد | موبایل: شیت پایین صفحه
   ===================================================================== */
(function () {
    "use strict";

    var CHEVRON = '<svg class="cs-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    var mq = window.matchMedia("(max-width:768px)");
    var current = null;

    function norm(s) {
        return String(s || "").replace(/ي/g, "ی").replace(/ك/g, "ک")
            .replace(/[\u200c\u064B-\u065F]/g, "").toLowerCase().trim();
    }

    function el(tag, cls, attrs) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
        return e;
    }

    function enhance(select) {
        if (select.dataset.csReady) return;
        select.dataset.csReady = "1";

        var group = select.closest(".form-group");
        var label = group ? group.querySelector('label[for="' + select.id + '"]') : null;
        var labelText = label ? label.textContent.replace(/\*/g, "").replace(/\s+/g, " ").trim() : "";

        var wrap = el("div", "cs");
        select.parentNode.insertBefore(wrap, select);
        wrap.appendChild(select);
        select.classList.add("cs-native");
        select.tabIndex = -1;
        select.setAttribute("aria-hidden", "true");

        var trigger = el("button", "cs-trigger", { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false" });
        if (labelText) trigger.setAttribute("aria-label", labelText);
        var valueEl = el("span", "cs-value");
        trigger.appendChild(valueEl);
        trigger.insertAdjacentHTML("beforeend", CHEVRON);

        var backdrop = el("div", "cs-backdrop");
        var pop = el("div", "cs-pop");
        var title = el("div", "cs-title");
        title.textContent = labelText ? "انتخاب " + labelText : "انتخاب";
        var searchBox = el("div", "cs-search");
        var search = el("input", "", { type: "search", autocomplete: "off", placeholder: "جستجو…", "aria-label": "جستجو" });
        searchBox.appendChild(search);
        var list = el("ul", "cs-list", { role: "listbox", tabindex: "-1" });
        var empty = el("div", "cs-empty");
        empty.hidden = true;

        pop.appendChild(el("span", "cs-grip"));
        pop.appendChild(title);
        pop.appendChild(searchBox);
        pop.appendChild(list);
        pop.appendChild(empty);
        wrap.appendChild(trigger);
        wrap.appendChild(backdrop);
        wrap.appendChild(pop);

        var opts = [];
        var activeEl = null;

        function visible() { return opts.filter(function (li) { return !li.hidden; }); }

        function setActive(li) {
            opts.forEach(function (o) { o.classList.remove("is-active"); });
            activeEl = li || null;
            if (!li) return;
            li.classList.add("is-active");
            var t = li.offsetTop, b = t + li.offsetHeight;
            if (t < list.scrollTop) list.scrollTop = t;
            else if (b > list.scrollTop + list.clientHeight) list.scrollTop = b - list.clientHeight;
        }

        function sync() {
            var sel = select.options[select.selectedIndex];
            var has = !!(sel && sel.value);
            var ph = select.options[0] ? select.options[0].textContent.trim() : "";
            valueEl.textContent = has ? sel.textContent.trim() : ph;
            trigger.classList.toggle("is-placeholder", !has);
            opts.forEach(function (li) {
                li.setAttribute("aria-selected", has && li.getAttribute("data-value") === select.value ? "true" : "false");
            });
        }

        function filter(q) {
            q = norm(q);
            var n = 0;
            opts.forEach(function (li) {
                var ok = !q || norm(li.textContent).indexOf(q) > -1;
                li.hidden = !ok;
                if (ok) n++;
            });
            empty.textContent = (opts.length === 0 && select.id === "city")
                ? "ابتدا استان را انتخاب کنید." : "موردی پیدا نشد.";
            empty.hidden = n > 0;
        }

        function build() {
            list.innerHTML = "";
            opts = [];
            Array.prototype.forEach.call(select.options, function (o) {
                if (!o.value) return;
                var li = el("li", "cs-opt", { role: "option", "data-value": o.value });
                li.textContent = o.textContent.trim();
                list.appendChild(li);
                opts.push(li);
            });
            searchBox.hidden = opts.length <= 10;
            filter("");
            sync();
        }

        function open() {
            if (current && current !== api) current.close();
            wrap.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
            search.value = "";
            filter("");
            if (!mq.matches) {
                var r = trigger.getBoundingClientRect();
                var below = window.innerHeight - r.bottom;
                wrap.classList.toggle("cs--up", below < 330 && r.top > below);
            } else {
                document.documentElement.classList.add("cs-lock");
            }
            var sel = list.querySelector('[aria-selected="true"]');
            setActive(sel || visible()[0]);
            list.scrollTop = sel ? Math.max(0, sel.offsetTop - list.clientHeight / 2) : 0;
            if (!mq.matches && !searchBox.hidden) search.focus();
            else list.focus({ preventScroll: true });
            current = api;
        }

        function close(refocus) {
            wrap.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
            document.documentElement.classList.remove("cs-lock");
            if (current === api) current = null;
            if (refocus) trigger.focus({ preventScroll: true });
        }

        function choose(value) {
            if (select.value !== value) {
                select.value = value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
            }
            sync();
            close(true);
        }

        var api = { wrap: wrap, close: close };

        trigger.addEventListener("click", function () {
            wrap.classList.contains("is-open") ? close(true) : open();
        });
        trigger.addEventListener("keydown", function (e) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(); }
        });
        backdrop.addEventListener("click", function () { close(true); });

        list.addEventListener("click", function (e) {
            var li = e.target.closest(".cs-opt");
            if (li) choose(li.getAttribute("data-value"));
        });
        list.addEventListener("mouseover", function (e) {
            var li = e.target.closest(".cs-opt");
            if (li) setActive(li);
        });
        search.addEventListener("input", function () {
            filter(search.value);
            setActive(visible()[0]);
        });

        pop.addEventListener("keydown", function (e) {
            var vis = visible(), i = vis.indexOf(activeEl);
            if (e.key === "ArrowDown") { e.preventDefault(); setActive(vis[Math.min(i + 1, vis.length - 1)] || vis[0]); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive(vis[Math.max(i - 1, 0)]); }
            else if (e.key === "Enter") { e.preventDefault(); if (activeEl) choose(activeEl.getAttribute("data-value")); }
            else if (e.key === "Escape") { e.preventDefault(); close(true); }
            else if (e.key === "Tab") { close(false); }
        });

        if (label) label.addEventListener("click", function (e) { e.preventDefault(); trigger.focus(); });

        select.addEventListener("change", sync);
        new MutationObserver(build).observe(select, { childList: true });

        build();
    }

    document.addEventListener("pointerdown", function (e) {
        if (current && !current.wrap.contains(e.target)) current.close(false);
    });

    function init() {
        document.querySelectorAll("#checkoutForm select").forEach(enhance);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
