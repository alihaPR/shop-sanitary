// ===========================
//   Sidebar
//   گروه‌بندی «اصلی / تنظیمات»، زیرمنوی سفارش‌ها، سوییچ حالت تیره،
//   جمع‌شدن منو و کارت بازگشت به فروشگاه
// ===========================
(function () {

    const { icon } = window.AdminUI;

    const PAGE_TITLES = {
        dashboard: "داشبورد",
        products: "محصولات",
        orders: "سفارش‌ها",
        users: "کاربران",
        settings: "تنظیمات",
        help: "راهنما"
    };

    const ORDER_FILTERS = [
        { key: "all", label: "همه سفارش‌ها" },
        { key: "pending", label: "در انتظار" },
        { key: "processing", label: "در حال پردازش" },
        { key: "shipped", label: "ارسال شده" },
        { key: "cancelled", label: "لغو شده" }
    ];

    const SEARCH_INPUT = { products: "#productSearch", orders: "#orderSearch", users: "#userSearch" };

    function navItem(page, label, ico, extra = "") {
        return `
            <button class="menu-item ${page === "dashboard" ? "active" : ""}" data-page="${page}" title="${label}">
                <span class="menu-icon">${icon(ico, 18)}</span>
                <span class="menu-text">${label}</span>
                ${extra}
            </button>`;
    }

    function renderSidebar() {

        const el = document.getElementById("sidebar");

        el.innerHTML = `
            <div class="sb-top">
                <div class="sb-brand">
                    <span class="sb-logo">${icon("sparkle", 18)}</span>
                    <span class="sb-brand-text">پنل مدیریت</span>
                </div>
                <button class="sb-collapse" id="sidebarCollapse" type="button" aria-label="جمع کردن منو" title="جمع کردن منو">
                    ${icon("panel", 18)}
                </button>
            </div>

            <div class="sb-profile">
                <span class="sb-avatar" id="sbAvatar">م</span>
                <span class="sb-profile-text">
                    <b id="admin-name">در حال بارگذاری...</b>
                    <small>مدیر فروشگاه</small>
                </span>
            </div>

            <div class="sb-scroll">
                <div class="sb-group-label">اصلی</div>
                <nav class="sidebar-menu" aria-label="منوی اصلی">
                    ${navItem("dashboard", "داشبورد", "grid")}
                    ${navItem("products", "محصولات", "box")}

                    <div class="menu-group" id="ordersGroup">
                        ${navItem("orders", "سفارش‌ها", "cart", `<span class="menu-chevron" id="ordersChevron" role="button" aria-label="زیرمنوی سفارش‌ها">${icon("chevron", 14)}</span>`)}
                        <div class="submenu" id="ordersSubmenu">
                            ${ORDER_FILTERS.map(f => `
                                <button class="submenu-item" type="button" data-filter="${f.key}">
                                    <span class="submenu-dot"></span>${f.label}
                                </button>`).join("")}
                        </div>
                    </div>

                    ${navItem("users", "کاربران", "users")}
                </nav>

                <div class="sb-group-label">تنظیمات</div>
                <nav class="sidebar-menu" aria-label="تنظیمات">
                    ${navItem("settings", "تنظیمات", "sliders")}
                    ${navItem("help", "راهنما", "help")}
                </nav>
            </div>

            <div class="sb-bottom">
                <div class="sb-theme" id="sbThemeRow">
                    <span class="menu-icon" id="sbThemeIcon"></span>
                    <span class="menu-text" id="sbThemeLabel">حالت تیره</span>
                    <button class="switch" id="sbThemeSwitch" type="button" role="switch" aria-label="حالت تیره"><i></i></button>
                </div>

                <a class="sb-store-card" href="../index.html">
                    <span class="sb-store-ico">${icon("store", 18)}</span>
                    <span class="sb-store-text">
                        <b>مشاهده فروشگاه</b>
                        <small>صفحه‌ی اصلی سایت</small>
                    </span>
                    ${icon("external", 14, "sb-store-arrow")}
                </a>

                <button class="logout-btn" id="logoutBtn" type="button">
                    <span class="menu-icon">${icon("logout", 18)}</span>
                    <span class="menu-text">خروج</span>
                </button>
            </div>
        `;
    }

    renderSidebar();

    // ---------- ناوبری مرکزی ----------
    const renderers = {
        dashboard: () => window.renderDashboard && window.renderDashboard(),
        products: () => window.renderProducts && window.renderProducts(),
        orders: () => window.renderOrders && window.renderOrders(),
        users: () => window.renderUsers && window.renderUsers(),
        settings: () => window.renderSettings && window.renderSettings(),
        help: () => window.renderHelp && window.renderHelp()
    };

    function markActive(page, filter) {
        document.querySelectorAll(".menu-item").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.page === page);
        });

        const isOrders = page === "orders";
        document.querySelectorAll(".submenu-item").forEach(btn => {
            btn.classList.toggle("active", isOrders && btn.dataset.filter === (filter || "all"));
        });
        if (isOrders) document.getElementById("ordersGroup").classList.add("open");
    }

    /**
     * رفتن به یک صفحه‌ی پنل.
     * opts.search  → متن جستجو در صفحه‌ی مقصد
     * opts.filter  → فیلتر وضعیت (فقط سفارش‌ها)
     * opts.action  → "add-product" برای باز کردن فرم افزودن محصول
     */
    async function adminNavigate(page, opts = {}) {

        if (!renderers[page]) page = "dashboard";

        markActive(page, opts.filter);
        sessionStorage.setItem("adminActivePage", JSON.stringify({ page, ts: Date.now() }));
        if (window.setPageTitle) window.setPageTitle(page);

        document.body.classList.remove("sidebar-open");
        const main = document.getElementById("main-content");
        if (main) main.scrollTop = 0;

        try {
            await renderers[page]();
        } catch (err) {
            console.error(err);
            return;
        }

        if (opts.filter && opts.filter !== "all" && page === "orders") {
            const btn = document.querySelector(`#orderStatusFilterMenu button[data-filter="${opts.filter}"]`);
            if (btn) btn.click();
        }

        if (opts.search && SEARCH_INPUT[page]) {
            const input = document.querySelector(SEARCH_INPUT[page]);
            if (input) {
                input.value = opts.search;
                input.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }

        if (opts.action === "add-product" && page === "products") {
            const btn = document.querySelector(".add-product-btn");
            if (btn) btn.click();
        }
    }

    window.adminNavigate = adminNavigate;
    window.ADMIN_PAGE_TITLES = PAGE_TITLES;

    // ---------- رویدادها ----------
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", (e) => {
            // کلیک روی فلش فقط زیرمنو را باز/بسته می‌کند
            if (e.target.closest("#ordersChevron")) {
                e.stopPropagation();
                document.getElementById("ordersGroup").classList.toggle("open");
                return;
            }
            adminNavigate(item.dataset.page);
        });
    });

    document.querySelectorAll(".submenu-item").forEach(btn => {
        btn.addEventListener("click", () => adminNavigate("orders", { filter: btn.dataset.filter }));
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../login.html";
    });

    // ---------- جمع‌شدن منو ----------
    const COLLAPSE_KEY = "adminSidebarCollapsed";

    function setCollapsed(v) {
        document.body.classList.toggle("sidebar-collapsed", v);
        localStorage.setItem(COLLAPSE_KEY, v ? "1" : "0");
        const b = document.getElementById("sidebarCollapse");
        if (b) b.setAttribute("aria-pressed", v ? "true" : "false");
    }

    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    document.getElementById("sidebarCollapse").addEventListener("click", () => {
        setCollapsed(!document.body.classList.contains("sidebar-collapsed"));
    });
    window.setSidebarCollapsed = setCollapsed;

    // ---------- سوییچ تم ----------
    function syncThemeRow() {
        const dark = window.AdminUI.theme.resolved() === "dark";
        const sw = document.getElementById("sbThemeSwitch");
        if (!sw) return;
        sw.classList.toggle("on", dark);
        sw.setAttribute("aria-checked", dark ? "true" : "false");
        document.getElementById("sbThemeIcon").innerHTML = icon(dark ? "moon" : "sun", 18);
        document.getElementById("sbThemeLabel").textContent = dark ? "حالت تیره" : "حالت روشن";
    }

    document.getElementById("sbThemeRow").addEventListener("click", () => window.AdminUI.theme.toggle());
    document.addEventListener("adminthemechange", syncThemeRow);
    syncThemeRow();

})();
