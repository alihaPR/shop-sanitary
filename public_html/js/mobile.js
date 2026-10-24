/* =====================================================================
   رفتارهای مخصوص موبایل (فقط نمایشی؛ منطق سایت دست‌نخورده)
   - آکاردئون فوتر («دسترسی سریع» و «اطلاعات تماس»)
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".footer-col h4").forEach((h) => {
        h.setAttribute("role", "button");
        h.setAttribute("tabindex", "0");
        h.setAttribute("aria-expanded", "false");
        const toggle = () => {
            const col = h.parentElement;
            const open = col.classList.toggle("is-open");
            h.setAttribute("aria-expanded", open ? "true" : "false");
        };
        h.addEventListener("click", toggle);
        h.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
        });
    });
});
