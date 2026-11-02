// ===========================
//   Header + Command palette + Notifications
//   عنوان صفحه، جستجوی سراسری (Ctrl/⌘ + K)، اعلان‌ها، افزودن سریع و پروفایل
// ===========================
(function () {

    const { icon, esc } = window.AdminUI;
    const header = document.getElementById("header");
    const isMac = window.AdminUI.isMac;
    const kbd = isMac ? "⌘ K" : "Ctrl K";

    header.innerHTML = `
        <button id="menuToggle" class="menu-toggle" type="button" aria-label="باز کردن منو" aria-expanded="false">
            ${icon("menu", 20)}
        </button>

        <h1 class="header-title" id="pageTitle">داشبورد</h1>

        <div class="header-actions">

            <button class="hd-search" id="openPalette" type="button" aria-label="جستجو در پنل">
                ${icon("search", 16)}
                <span class="hd-search-text">جستجو در پنل...</span>
                <kbd dir="ltr">${kbd}</kbd>
            </button>

            <div class="hd-pop" id="quickWrap">
                <button class="hd-icon-btn" id="quickBtn" type="button" aria-label="افزودن سریع" aria-haspopup="true">
                    ${icon("plus", 18)}
                </button>
                <div class="pop-menu" id="quickMenu" role="menu">
                    <button type="button" role="menuitem" data-quick="add-product">${icon("box", 16)}افزودن محصول جدید</button>
                    <button type="button" role="menuitem" data-quick="pending-orders">${icon("cart", 16)}سفارش‌های در انتظار</button>
                    <button type="button" role="menuitem" data-quick="users">${icon("users", 16)}مدیریت کاربران</button>
                </div>
            </div>

            <div class="hd-pop" id="notifWrap">
                <button class="hd-icon-btn" id="notifBtn" type="button" aria-label="اعلان‌ها" aria-haspopup="true">
                    ${icon("bell", 18)}
                    <span class="hd-badge" id="notifBadge" hidden>0</span>
                </button>
                <div class="pop-menu notif-menu" id="notifMenu">
                    <div class="pop-title">اعلان‌ها</div>
                    <div id="notifList"><div class="pop-empty">در حال بارگذاری...</div></div>
                </div>
            </div>

            <button class="hd-icon-btn hd-theme" id="hdTheme" type="button" aria-label="تغییر حالت روشن/تیره"></button>

            <div class="hd-pop" id="profileWrap">
                <button class="hd-profile" id="profileBtn" type="button" aria-haspopup="true">
                    <span class="sb-avatar" id="hdAvatar">م</span>
                    ${icon("chevron", 14, "hd-profile-chevron")}
                </button>
                <div class="pop-menu profile-menu" id="profileMenu">
                    <div class="profile-head">
                        <b id="hdName">مدیر</b>
                        <small>مدیر فروشگاه</small>
                    </div>
                    <button type="button" data-profile="settings">${icon("sliders", 16)}تنظیمات</button>
                    <button type="button" data-profile="store">${icon("store", 16)}بازگشت به فروشگاه</button>
                    <button type="button" data-profile="logout" class="danger">${icon("logout", 16)}خروج</button>
                </div>
            </div>
        </div>
    `;

    // ---------- عنوان صفحه ----------
    window.setPageTitle = function (page) {
        const t = (window.ADMIN_PAGE_TITLES || {})[page] || "داشبورد";
        document.getElementById("pageTitle").textContent = t;
        document.title = `${t} | پنل مدیریت`;
    };

    // ---------- منوهای کشویی (popover) ----------
    const pops = ["quickWrap", "notifWrap", "profileWrap"].map(id => document.getElementById(id));

    function closePops(except) {
        pops.forEach(p => { if (p !== except) p.classList.remove("open"); });
    }

    pops.forEach(wrap => {
        wrap.firstElementChild.addEventListener("click", (e) => {
            e.stopPropagation();
            const willOpen = !wrap.classList.contains("open");
            closePops(wrap);
            wrap.classList.toggle("open", willOpen);
            if (willOpen && wrap.id === "notifWrap") refreshNotifications();
        });
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".hd-pop")) closePops();
    });

    document.getElementById("quickMenu").addEventListener("click", (e) => {
        const b = e.target.closest("[data-quick]");
        if (!b) return;
        closePops();
        const k = b.dataset.quick;
        if (k === "add-product") window.adminNavigate("products", { action: "add-product" });
        if (k === "pending-orders") window.adminNavigate("orders", { filter: "pending" });
        if (k === "users") window.adminNavigate("users");
    });

    document.getElementById("profileMenu").addEventListener("click", (e) => {
        const b = e.target.closest("[data-profile]");
        if (!b) return;
        closePops();
        const k = b.dataset.profile;
        if (k === "settings") window.adminNavigate("settings");
        if (k === "store") window.location.href = "../index.html";
        if (k === "logout") document.getElementById("logoutBtn").click();
    });

    // ---------- تم ----------
    function syncThemeBtn() {
        const dark = window.AdminUI.theme.resolved() === "dark";
        document.getElementById("hdTheme").innerHTML = icon(dark ? "sun" : "moon", 18);
    }
    document.getElementById("hdTheme").addEventListener("click", () => window.AdminUI.theme.toggle());
    document.addEventListener("adminthemechange", syncThemeBtn);
    syncThemeBtn();

    // ---------- اطلاعات ادمین ----------
    async function loadAdminInfo() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;

            const user = await res.json();
            const name = user.name || "مدیر";
            const initial = Array.from(name.trim())[0] || "م";

            document.getElementById("admin-name").textContent = name;
            document.getElementById("hdName").textContent = name;
            document.getElementById("sbAvatar").textContent = initial;
            document.getElementById("hdAvatar").textContent = initial;
        } catch (err) {
            console.log(err);
        }
    }
    loadAdminInfo();

    // ---------- اعلان‌ها ----------
    const notifState = { pending: 0, low: [], out: 0, loaded: false };

    function renderNotifications() {
        const list = document.getElementById("notifList");
        const badge = document.getElementById("notifBadge");
        const items = [];

        if (notifState.pending > 0) {
            items.push({
                ico: "cart", tone: "amber",
                title: `${window.AdminUI.num(notifState.pending)} سفارش در انتظار بررسی`,
                sub: "برای پردازش و ارسال وارد سفارش‌ها شوید",
                go: () => window.adminNavigate("orders", { filter: "pending" })
            });
        }
        if (notifState.out > 0) {
            items.push({
                ico: "alert", tone: "red",
                title: `${window.AdminUI.num(notifState.out)} محصول ناموجود شده`,
                sub: "موجودی این محصولات را به‌روز کنید",
                go: () => window.adminNavigate("products")
            });
        }
        const lowOnly = notifState.low.length - notifState.out;
        if (lowOnly > 0) {
            items.push({
                ico: "box", tone: "blue",
                title: `${window.AdminUI.num(lowOnly)} محصول رو به اتمام است`,
                sub: "موجودی کم؛ زمان مناسب برای تأمین مجدد",
                go: () => window.adminNavigate("products")
            });
        }

        const total = (notifState.pending > 0 ? notifState.pending : 0) + notifState.low.length;
        badge.hidden = total === 0 || localStorage.getItem("adminNotifBadge") === "0";
        badge.textContent = total > 99 ? "۹۹+" : window.AdminUI.num(total);

        if (!notifState.loaded) return;

        list.innerHTML = items.length
            ? items.map((it, i) => `
                <button class="notif-item" type="button" data-i="${i}">
                    <span class="notif-ico tone-${it.tone}">${icon(it.ico, 16)}</span>
                    <span class="notif-text"><b>${esc(it.title)}</b><small>${esc(it.sub)}</small></span>
                </button>`).join("")
            : `<div class="pop-empty">اعلان جدیدی ندارید 🎉</div>`;

        list.querySelectorAll(".notif-item").forEach(btn => {
            btn.addEventListener("click", () => {
                closePops();
                items[Number(btn.dataset.i)].go();
            });
        });
    }

    async function refreshNotifications() {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [statsRes, ordersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/stats`, { headers }),
                fetch(`${API_BASE_URL}/orders`, { headers })
            ]);

            if (statsRes.ok) {
                const stats = await statsRes.json();
                notifState.low = stats.lowStockProducts || [];
                notifState.out = notifState.low.filter(p => p.stock === 0).length;
            }
            if (ordersRes.ok) {
                const orders = await ordersRes.json();
                notifState.pending = Array.isArray(orders) ? orders.filter(o => o.status === "pending").length : 0;
            }
            notifState.loaded = true;
            renderNotifications();
        } catch (err) {
            console.log(err);
        }
    }
    window.refreshNotifications = refreshNotifications;
    window.updateNotificationBadge = renderNotifications;

    refreshNotifications();
    setInterval(refreshNotifications, 3 * 60 * 1000);

    // ---------- جستجوی سراسری (Command palette) ----------
    const PAGES = [
        { label: "داشبورد", page: "dashboard", ico: "grid", kw: "dashboard خانه آمار" },
        { label: "محصولات", page: "products", ico: "box", kw: "products کالا موجودی" },
        { label: "تخفیف‌ها", page: "discounts", ico: "tag", kw: "discounts تخفیف شگفت‌انگیز حراج" },
        { label: "سفارش‌ها", page: "orders", ico: "cart", kw: "orders فروش ارسال" },
        { label: "کاربران", page: "users", ico: "users", kw: "users مشتری مشتریان" },
        { label: "تنظیمات", page: "settings", ico: "sliders", kw: "settings تم ظاهر" },
        { label: "راهنما", page: "help", ico: "help", kw: "help میانبر کمک" }
    ];

    const ACTIONS = [
        { label: "افزودن محصول جدید", ico: "plus", kw: "add product محصول جدید", run: () => window.adminNavigate("products", { action: "add-product" }) },
        { label: "سفارش‌های در انتظار", ico: "cart", kw: "pending در انتظار", run: () => window.adminNavigate("orders", { filter: "pending" }) },
        { label: "تغییر حالت روشن / تیره", ico: "moon", kw: "dark theme تم تیره روشن", run: () => window.AdminUI.theme.toggle() },
        { label: "بازگشت به فروشگاه", ico: "store", kw: "store فروشگاه سایت", run: () => { window.location.href = "../index.html"; } }
    ];

    const cache = { at: 0, products: [], users: [], orders: [] };

    async function loadSearchData() {
        if (Date.now() - cache.at < 60 * 1000) return;
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const get = (url, auth) => fetch(url, auth ? { headers } : undefined).then(r => r.ok ? r.json() : []).catch(() => []);

        const [products, users, orders] = await Promise.all([
            get(`${API_BASE_URL}/products`, false),
            get(`${API_BASE_URL}/users`, true),
            get(`${API_BASE_URL}/orders`, true)
        ]);

        cache.products = Array.isArray(products) ? products : [];
        cache.users = Array.isArray(users) ? users : [];
        cache.orders = Array.isArray(orders) ? orders : [];
        cache.at = Date.now();
    }

    const palette = document.createElement("div");
    palette.className = "palette-overlay";
    palette.hidden = true;
    palette.innerHTML = `
        <div class="palette" role="dialog" aria-modal="true" aria-label="جستجو در پنل">
            <div class="palette-input">
                ${icon("search", 18)}
                <input id="paletteInput" type="text" placeholder="محصول، سفارش، کاربر یا صفحه را جستجو کنید..." autocomplete="off">
                <kbd>Esc</kbd>
            </div>
            <div class="palette-results" id="paletteResults"></div>
            <div class="palette-foot">
                <span><kbd>↑</kbd><kbd>↓</kbd> حرکت</span>
                <span><kbd>Enter</kbd> انتخاب</span>
            </div>
        </div>`;
    document.body.appendChild(palette);

    const pInput = palette.querySelector("#paletteInput");
    const pResults = palette.querySelector("#paletteResults");
    let pItems = [];
    let pIndex = 0;

    const norm = (s) => String(s || "").toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک");

    function buildResults(q) {
        const query = norm(q.trim());
        const groups = [];
        const has = (text) => !query || norm(text).includes(query);

        const pages = PAGES.filter(p => has(`${p.label} ${p.kw}`))
            .map(p => ({ label: p.label, ico: p.ico, run: () => window.adminNavigate(p.page) }));
        const actions = ACTIONS.filter(a => has(`${a.label} ${a.kw}`))
            .map(a => ({ label: a.label, ico: a.ico, run: a.run }));

        if (pages.length) groups.push({ title: "صفحه‌ها", items: pages });
        if (actions.length) groups.push({ title: "کارهای سریع", items: actions });

        if (query.length >= 2) {
            const products = cache.products
                .filter(p => has(`${p.name} ${p.category} ${p.brand || ""}`)).slice(0, 5)
                .map(p => ({ label: p.name, sub: p.category, ico: "box", run: () => window.adminNavigate("products", { search: p.name }) }));

            const orders = cache.orders
                .filter(o => has(`${String(o._id).slice(-6)} ${o.user?.name || ""}`)).slice(0, 5)
                .map(o => {
                    const code = "#" + String(o._id).slice(-6).toUpperCase();
                    return { label: `سفارش ${code}`, sub: o.user?.name || "کاربر حذف‌شده", ico: "bag", run: () => window.adminNavigate("orders", { search: String(o._id).slice(-6) }) };
                });

            const users = cache.users
                .filter(u => has(`${u.name} ${u.email || ""} ${u.phone || u.mobile || ""}`)).slice(0, 5)
                .map(u => ({ label: u.name, sub: u.email || u.phone || u.mobile || "", ico: "user", run: () => window.adminNavigate("users", { search: u.name }) }));

            if (products.length) groups.push({ title: "محصولات", items: products });
            if (orders.length) groups.push({ title: "سفارش‌ها", items: orders });
            if (users.length) groups.push({ title: "کاربران", items: users });
        }
        return groups;
    }

    function renderResults() {
        const groups = buildResults(pInput.value);
        pItems = [];
        if (!groups.length) {
            pResults.innerHTML = `<div class="pop-empty">نتیجه‌ای پیدا نشد</div>`;
            return;
        }
        pResults.innerHTML = groups.map(g => `
            <div class="palette-group">${g.title}</div>
            ${g.items.map(it => {
                const i = pItems.push(it) - 1;
                return `<button type="button" class="palette-item ${i === pIndex ? "active" : ""}" data-i="${i}">
                    <span class="palette-ico">${icon(it.ico, 16)}</span>
                    <span class="palette-label">${esc(it.label)}</span>
                    ${it.sub ? `<small>${esc(it.sub)}</small>` : ""}
                </button>`;
            }).join("")}
        `).join("");
    }

    function paintActive() {
        pResults.querySelectorAll(".palette-item").forEach(b => {
            const on = Number(b.dataset.i) === pIndex;
            b.classList.toggle("active", on);
            if (on) b.scrollIntoView({ block: "nearest" });
        });
    }

    function openPalette() {
        closePops();
        palette.hidden = false;
        pInput.value = "";
        pIndex = 0;
        renderResults();
        setTimeout(() => pInput.focus(), 0);
        loadSearchData().then(() => { if (!palette.hidden) renderResults(); });
    }

    function closePalette() { palette.hidden = true; }

    function runItem(i) {
        const it = pItems[i];
        if (!it) return;
        closePalette();
        it.run();
    }

    pInput.addEventListener("input", () => { pIndex = 0; renderResults(); });
    pInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); pIndex = Math.min(pIndex + 1, pItems.length - 1); paintActive(); }
        if (e.key === "ArrowUp") { e.preventDefault(); pIndex = Math.max(pIndex - 1, 0); paintActive(); }
        if (e.key === "Enter") { e.preventDefault(); runItem(pIndex); }
    });
    pResults.addEventListener("click", (e) => {
        const b = e.target.closest(".palette-item");
        if (b) runItem(Number(b.dataset.i));
    });
    pResults.addEventListener("mousemove", (e) => {
        const b = e.target.closest(".palette-item");
        if (b && Number(b.dataset.i) !== pIndex) { pIndex = Number(b.dataset.i); paintActive(); }
    });
    palette.addEventListener("mousedown", (e) => { if (e.target === palette) closePalette(); });
    document.getElementById("openPalette").addEventListener("click", openPalette);

    document.addEventListener("keydown", (e) => {
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            palette.hidden ? openPalette() : closePalette();
        } else if (e.key === "/" && !typing && palette.hidden) {
            e.preventDefault();
            openPalette();
        } else if (e.key === "Escape") {
            closePalette();
            closePops();
        }
    });

    // ---------- منوی کشویی سایدبار در موبایل و تبلت ----------
    (function () {
        const toggle = document.getElementById("menuToggle");

        const backdrop = document.createElement("div");
        backdrop.className = "sidebar-backdrop";
        document.body.appendChild(backdrop);

        function setSidebar(open) {
            document.body.classList.toggle("sidebar-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        }

        toggle.addEventListener("click", () => setSidebar(!document.body.classList.contains("sidebar-open")));
        backdrop.addEventListener("click", () => setSidebar(false));

        // با انتخاب هر آیتم منو، کشو بسته شود
        document.getElementById("sidebar").addEventListener("click", (e) => {
            if (e.target.closest(".menu-item") && !e.target.closest("#ordersChevron")) setSidebar(false);
            if (e.target.closest(".submenu-item")) setSidebar(false);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 1024) setSidebar(false);
        });
    })();

})();
