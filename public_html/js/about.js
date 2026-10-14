// صفحه درباره ما — آکاردئون سوالات متداول (فقط UI)
(function () {
    var items = document.querySelectorAll(".ab-faq__item");
    if (!items.length) return;

    function setOpen(item, open) {
        item.classList.toggle("is-open", open);
        var btn = item.querySelector(".ab-faq__q");
        if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    items.forEach(function (item) {
        var btn = item.querySelector(".ab-faq__q");
        if (!btn) return;
        btn.addEventListener("click", function () {
            var willOpen = !item.classList.contains("is-open");
            items.forEach(function (i) { setOpen(i, false); });
            setOpen(item, willOpen);
        });
    });
})();
