/* =====================================================================
   checkout-ui.js — فقط نمایشی (موبایل): پنجره‌ی «جزئیات پرداخت» نوار شناور چک‌اوت
   - منطق سفارش/قیمت در checkout.js است؛ اینجا فقط متن #subtotal / #shipping / #total
     برای نمایش در پنجره کپی می‌شود و تعداد کالا از سبد خوانده می‌شود.
   ===================================================================== */
(function () {
    "use strict";

    function init() {
        var toggle = document.getElementById("coToggle");
        var sheet = document.getElementById("coSheet");
        var back = document.getElementById("coBackdrop");
        if (!toggle || !sheet || !back) return;

        function text(id) {
            var e = document.getElementById(id);
            return e ? e.textContent.trim() : "";
        }
        function set(id, v) {
            var e = document.getElementById(id);
            if (e) e.textContent = v;
        }
        function count() {
            try {
                var cart = JSON.parse(localStorage.getItem("cart") || "[]");
                return cart.reduce(function (s, i) { return s + (i.qty || 0); }, 0);
            } catch (e) { return 0; }
        }
        function fa(n) { return Number(n).toLocaleString("fa-IR"); }

        function refresh() {
            var n = count();
            set("coToggleText", "جمع " + fa(n) + " کالا");
            set("coSheetCountLabel", "مجموع قیمت کالاها (" + fa(n) + " کالا)");
            set("coSheetSubtotal", text("subtotal"));
            set("coSheetShipping", text("shipping"));
            set("coSheetTotal", text("total"));
        }

        function setOpen(open) {
            if (open) refresh();
            sheet.classList.toggle("is-open", open);
            back.classList.toggle("is-open", open);
            sheet.setAttribute("aria-hidden", String(!open));
            toggle.setAttribute("aria-expanded", String(open));
        }

        refresh();
        toggle.addEventListener("click", function () { setOpen(!sheet.classList.contains("is-open")); });
        back.addEventListener("click", function () { setOpen(false); });
        document.getElementById("coClose").addEventListener("click", function () { setOpen(false); });
        document.getElementById("coOk").addEventListener("click", function () { setOpen(false); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
        window.addEventListener("resize", function () { if (window.innerWidth > 768) setOpen(false); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
