// ===========================
//   Shared UI helpers
//   آیکون‌ها، فرمت‌کننده‌ها و مدیریت تم (روشن / تیره)
//   این فایل باید قبل از همه‌ی کامپوننت‌ها لود شود.
// ===========================
(function () {

    const ICONS = {
        grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
        box: '<path d="M16.5 9.4 7.5 4.21"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
        cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
        bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
        help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
        moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
        chevron: '<path d="m6 9 6 6 6-6"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
        panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
        external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
        pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
        activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
        chart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
        wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
        up: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
        down: '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
        filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
        sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
        alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        store: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
        menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        keyboard: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M8 13h8"/>',
        arrow: '<path d="m15 18-6-6 6-6"/>',
        tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
        sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>'
    };

    function icon(name, size = 18, extra = "") {
        return `<svg class="ico ${extra}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
    }

    // ---------- فرمت‌ها ----------
    const nf = new Intl.NumberFormat("fa-IR");

    function num(n) { return nf.format(Math.round(n || 0)); }
    function toman(n) { return `${num(n)} تومان`; }

    // عدد فشرده برای محور نمودار (مثلاً ۱٫۲ میلیون)
    function compact(n) {
        const v = Math.abs(n || 0);
        const f = (x) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(x);
        if (v >= 1e9) return `${f(n / 1e9)} میلیارد`;
        if (v >= 1e6) return `${f(n / 1e6)} میلیون`;
        if (v >= 1e3) return `${f(n / 1e3)} هزار`;
        return f(n);
    }

    function esc(s) {
        return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    // ---------- تم ----------
    const THEME_KEY = "adminTheme"; // light | dark | system
    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    function pref() { return localStorage.getItem(THEME_KEY) || "system"; }

    function resolved() {
        const p = pref();
        if (p === "system") return media && media.matches ? "dark" : "light";
        return p;
    }

    function applyTheme(silent) {
        document.documentElement.setAttribute("data-theme", resolved());
        if (!silent) document.dispatchEvent(new CustomEvent("adminthemechange", { detail: resolved() }));
    }

    function setTheme(value) {
        localStorage.setItem(THEME_KEY, value);
        applyTheme();
    }

    function toggleTheme() {
        setTheme(resolved() === "dark" ? "light" : "dark");
    }

    if (media && media.addEventListener) {
        media.addEventListener("change", () => { if (pref() === "system") applyTheme(); });
    }
    applyTheme(true);

    // ---------- تراکم (compact) ----------
    function applyDensity() {
        document.documentElement.classList.toggle("is-compact", localStorage.getItem("adminCompact") === "1");
    }
    applyDensity();

    // ---------- Toast ساده ----------
    function toast(message) {
        let host = document.getElementById("adminToastHost");
        if (!host) {
            host = document.createElement("div");
            host.id = "adminToastHost";
            document.body.appendChild(host);
        }
        const el = document.createElement("div");
        el.className = "admin-toast";
        el.textContent = message;
        host.appendChild(el);
        setTimeout(() => el.classList.add("out"), 2200);
        setTimeout(() => el.remove(), 2600);
    }

    window.AdminUI = {
        icon, num, toman, compact, esc, toast,
        theme: { pref, resolved, set: setTheme, toggle: toggleTheme, applyDensity },
        isMac: /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    };
})();
