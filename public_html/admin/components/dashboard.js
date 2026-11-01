// ===========================
//   Dashboard
//   کارت‌های آمار، نمودار فروش، دسته‌بندی‌ها (دونات)، فعالیت‌های اخیر
//   و جدول پرفروش‌ترین محصولات
//   (همه‌چیز داخل یه IIFE محصور شده تا با متغیرهای هم‌نام فایل‌های دیگه
//    تداخل نکنه؛ فقط renderDashboard گلوبال می‌شه.)
// ===========================
(function () {

    const { icon, num, toman, compact, esc } = window.AdminUI;

    const ORDER_STATUS = {
        pending: { label: "در انتظار", tone: "amber" },
        processing: { label: "در حال پردازش", tone: "blue" },
        shipped: { label: "ارسال شده", tone: "green" },
        delivered: { label: "ارسال شده", tone: "green" },
        cancelled: { label: "لغو شده", tone: "red" }
    };

    const CATEGORY_LABELS = {
        "پوشک-کودک": "پوشک کودک",
        "پوشک-بزرگسال": "پوشک بزرگسال",
        "نوار-بهداشتی": "نوار بهداشتی",
        "پنبه": "پنبه",
        "دستمال-مرطوب": "دستمال مرطوب"
    };

    const SORTS = {
        sales: { label: "بیشترین فروش", fn: (a, b) => b.sales - a.sales || b.earnings - a.earnings },
        earnings: { label: "بیشترین درآمد", fn: (a, b) => b.earnings - a.earnings },
        price: { label: "بیشترین قیمت", fn: (a, b) => b.price - a.price },
        stock: { label: "کمترین موجودی", fn: (a, b) => a.stock - b.stock }
    };

    const TOP_LIMIT = 6;

    const state = {
        data: null,
        rows: [],
        hasOrders: false,
        metric: "revenue",   // revenue | orders
        period: "month",     // today | week | month
        sort: "sales",
        category: "all"
    };

    let revenueChart = null;
    let categoryChart = null;
    let renderToken = 0;

    // ---------- ابزارها ----------
    function jalaliDate(dateStr) {
        return new Date(dateStr).toLocaleDateString("fa-IR");
    }

    function resolveImageUrl(imagePath) {
        if (!imagePath) return "";
        if (/^https?:\/\//.test(imagePath)) return imagePath;
        const origin = API_BASE_URL.replace(/\/api\/?$/, "");
        return imagePath.startsWith("/") ? `${origin}${imagePath}` : `${origin}/${imagePath}`;
    }

    function weekdayLabel(ymd) {
        return new Date(ymd + "T00:00:00").toLocaleDateString("fa-IR", { weekday: "long" });
    }

    // وقتی مبنای مقایسه خیلی کوچیک باشه درصد تغییر عجیب می‌شه؛ سقف ۹۹۹٪
    function percentText(percent) {
        const abs = Math.abs(percent || 0);
        return abs > 999 ? "۹۹۹٪+" : `${num(abs)}٪`;
    }

    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function categoryLabel(c) {
        return CATEGORY_LABELS[c] || (c ? String(c).replace(/-/g, " ") : "بدون دسته");
    }

    function trendChip(percent, label) {
        const up = (percent || 0) >= 0;
        return `<span class="trend ${up ? "up" : "down"}">${icon(up ? "up" : "down", 13)}${percentText(percent)}</span>${label ? `<span class="trend-note">${label}</span>` : ""}`;
    }

    // ---------- اسکلت و خطا ----------
    function skeleton() {
        const card = (h) => `<div class="card sk" style="height:${h}px"></div>`;
        return `
            <div class="dash dash-skeleton" aria-busy="true">
                <div class="stat-grid">${card(104)}${card(104)}${card(104)}${card(104)}</div>
                <div class="dash-row dash-row--main">${card(380)}${card(380)}</div>
                <div class="dash-row dash-row--bottom">${card(340)}${card(340)}</div>
            </div>`;
    }

    function errorView() {
        return `
            <div class="card empty-state">
                <span class="empty-ico">${icon("alert", 26)}</span>
                <b>دریافت اطلاعات داشبورد ممکن نشد</b>
                <p>اتصال اینترنت یا دسترسی خود را بررسی کنید و دوباره تلاش کنید.</p>
                <button class="btn btn-primary" id="dashRetry" type="button">تلاش دوباره</button>
            </div>`;
    }

    // ---------- داده‌ی جدول پرفروش‌ها ----------
    function buildRows(products, orders) {
        const agg = new Map();

        (orders || []).filter(o => o.status !== "cancelled").forEach(o => {
            (o.items || []).forEach(it => {
                const id = String(it.product?._id || it.product || it.name || "");
                if (!id) return;
                const qty = it.quantity ?? it.qty ?? it.count ?? 1;
                const a = agg.get(id) || { sales: 0, earnings: 0 };
                a.sales += qty;
                a.earnings += qty * (it.price || 0);
                agg.set(id, a);
            });
        });

        return (products || []).map(p => {
            const a = agg.get(String(p._id)) || { sales: 0, earnings: 0 };
            return {
                id: p._id,
                name: p.name,
                image: p.image,
                category: p.category,
                stock: p.stock ?? 0,
                price: p.price ?? 0,
                sales: a.sales,
                earnings: a.earnings
            };
        });
    }

    // ---------- رندر اصلی ----------
    async function renderDashboard() {

        const my = ++renderToken;
        const main = document.getElementById("main-content");

        if (revenueChart) { revenueChart.destroy(); revenueChart = null; }
        if (categoryChart) { categoryChart.destroy(); categoryChart = null; }

        main.innerHTML = skeleton();

        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const safe = (url, auth) =>
            fetch(url, auth ? { headers } : undefined).then(r => (r.ok ? r.json() : null)).catch(() => null);

        const [data, products, orders] = await Promise.all([
            safe(`${API_BASE_URL}/admin/stats`, true),
            safe(`${API_BASE_URL}/products`, false),
            safe(`${API_BASE_URL}/orders`, true)
        ]);

        // کاربر وسط بارگذاری به صفحه‌ی دیگه رفته
        if (my !== renderToken || !main.querySelector(".dash-skeleton")) return;

        if (!data) {
            main.innerHTML = `<div class="dash">${errorView()}</div>`;
            document.getElementById("dashRetry").addEventListener("click", renderDashboard);
            return;
        }

        state.data = data;
        state.hasOrders = Array.isArray(orders);
        state.rows = buildRows(Array.isArray(products) ? products : [], Array.isArray(orders) ? orders : []);
        state.metric = "revenue";
        state.period = "month";
        state.sort = state.hasOrders ? "sales" : "stock";
        state.category = "all";

        main.innerHTML = `<div class="dash" id="dashRoot">${statCards(data)}
            <div class="dash-row dash-row--main">${revenueCard(data)}${categoriesCard()}</div>
            <div class="dash-row dash-row--bottom">${activityCard(data)}${topProductsCard()}</div>
        </div>`;

        drawRevenue();
        drawCategories();
        renderCategoryLegend();
        renderTopProducts();
        bindDashboard();
    }

    // ---------- کارت‌های آمار ----------
    function statCards(d) {

        const ordersTrend = d.ordersYesterday > 0 || d.ordersToday > 0
            ? trendChip(d.ordersTodayChangePercent, "نسبت به دیروز") : "";

        const cards = [
            { tone: "indigo", ico: "box", label: "تعداد محصولات", value: num(d.productCount), foot: "", go: "products" },
            { tone: "amber", ico: "cart", label: "سفارش امروز", value: num(d.ordersToday), foot: ordersTrend, go: "orders" },
            { tone: "green", ico: "wallet", label: "فروش این ماه", value: toman(d.revenueThisMonth), foot: trendChip(d.revenueChangePercent, "نسبت به ماه قبل"), go: "orders" },
            { tone: "pink", ico: "users", label: "تعداد کاربران", value: num(d.userCount), foot: "", go: "users" }
        ];

        return `<div class="stat-grid">${cards.map(c => `
            <button class="card stat-card" type="button" data-go="${c.go}">
                <span class="stat-ico tone-${c.tone}">${icon(c.ico, 20)}</span>
                <span class="stat-body">
                    <span class="stat-label">${c.label}</span>
                    <b class="stat-value">${c.value}</b>
                    ${c.foot ? `<span class="stat-foot">${c.foot}</span>` : ""}
                </span>
            </button>`).join("")}</div>`;
    }

    // ---------- نمودار فروش ----------
    function revenueCard(d) {
        return `
            <section class="card revenue-card">
                <header class="card-head">
                    <h3>${icon("chart", 18)}فروش و درآمد</h3>
                    <div class="card-tools">
                        <div class="segmented" id="metricToggle" role="tablist">
                            <button class="active" data-metric="revenue" type="button">درآمد</button>
                            <button data-metric="orders" type="button">سفارش‌ها</button>
                        </div>
                        <div class="segmented" id="periodToggle" role="tablist">
                            <button data-period="today" type="button">امروز</button>
                            <button data-period="week" type="button">هفته</button>
                            <button class="active" data-period="month" type="button">ماه</button>
                        </div>
                    </div>
                </header>

                <div class="chart-summary">
                    <b id="chartTotal"></b>
                    <span id="chartChange"></span>
                </div>
                <div class="chart-legend"><span class="legend-dot"></span><span id="chartLegend">درآمد (تومان)</span></div>

                <div class="chart-wrap"><canvas id="revenueChart"></canvas></div>
            </section>`;
    }

    function series() {
        const d = state.data;
        let labels = [], values = [], counts = [];

        if (state.period === "today") {
            const byHour = new Map((d.revenueHourly || []).map(i => [i._id, i]));
            labels = Array.from({ length: 24 }, (_, h) => `${num(h)}:۰۰`);
            values = Array.from({ length: 24 }, (_, h) => byHour.get(h)?.total || 0);
            counts = Array.from({ length: 24 }, (_, h) => byHour.get(h)?.count || 0);
        } else if (state.period === "week") {
            labels = (d.revenueDaily || []).map(i => weekdayLabel(i._id));
            values = (d.revenueDaily || []).map(i => i.total);
            counts = (d.revenueDaily || []).map(i => i.count || 0);
        } else {
            labels = (d.monthlyRevenue || []).map(i => i.label);
            values = (d.monthlyRevenue || []).map(i => i.total);
            counts = (d.monthlyRevenue || []).map(i => i.count || 0);
        }
        return { labels, values, counts };
    }

    // پس‌زمینه‌ی روشن پشت هر ستون (مثل طرح مرجع)
    const trackPlugin = {
        id: "barTrack",
        beforeDatasetsDraw(chart, args, opts) {
            const meta = chart.getDatasetMeta(0);
            const { top, bottom } = chart.chartArea;
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = opts.color;
            meta.data.forEach(bar => {
                const w = bar.width;
                const x = bar.x - w / 2;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x, top, w, bottom - top, Math.min(10, w / 2));
                else ctx.rect(x, top, w, bottom - top);
                ctx.fill();
            });
            ctx.restore();
        }
    };

    function drawRevenue() {
        const canvas = document.getElementById("revenueChart");
        if (!canvas) return;

        const { labels, values, counts } = series();
        const isRevenue = state.metric === "revenue";
        const data = isRevenue ? values : counts;

        // خلاصه بالای نمودار
        const total = data.reduce((a, b) => a + b, 0);
        document.getElementById("chartTotal").textContent = isRevenue ? toman(total) : `${num(total)} سفارش`;
        document.getElementById("chartLegend").textContent = isRevenue ? "درآمد (تومان)" : "تعداد سفارش";
        document.getElementById("chartChange").innerHTML =
            state.period === "month" && isRevenue ? trendChip(state.data.revenueChangePercent, "نسبت به ماه قبل") : "";

        if (revenueChart) revenueChart.destroy();

        const rgb = cssVar("--accent-rgb") || "91,95,239";
        const muted = cssVar("--text-light");

        revenueChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: isRevenue ? "درآمد" : "تعداد سفارش",
                    data,
                    backgroundColor: `rgba(${rgb},0.55)`,
                    hoverBackgroundColor: `rgb(${rgb})`,
                    borderRadius: 10,
                    borderSkipped: false,
                    maxBarThickness: 44
                }]
            },
            plugins: [trackPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                font: { family: "regular, IRANYekan, sans-serif" },
                plugins: {
                    barTrack: { color: cssVar("--chart-track") },
                    legend: { display: false },
                    tooltip: {
                        rtl: true,
                        textDirection: "rtl",
                        backgroundColor: cssVar("--surface"),
                        titleColor: cssVar("--text"),
                        bodyColor: cssVar("--text-light"),
                        borderColor: cssVar("--border"),
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 12,
                        boxPadding: 4,
                        displayColors: true,
                        callbacks: {
                            title: (items) => {
                                const idx = items[0].dataIndex;
                                return state.period === "today" ? `ساعت ${num(idx)}:۰۰ تا ${num(idx)}:۵۹` : items[0].label;
                            },
                            label: (c) => isRevenue ? `درآمد: ${toman(c.parsed.y)}` : `سفارش: ${num(c.parsed.y)}`,
                            afterLabel: (c) => {
                                const i = c.dataIndex;
                                return isRevenue
                                    ? (counts[i] > 0 ? `${num(counts[i])} سفارش` : "بدون سفارش")
                                    : `درآمد: ${toman(values[i])}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: muted, maxRotation: 0, minRotation: 0, autoSkip: true, font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        border: { display: false },
                        grid: { color: cssVar("--grid") },
                        ticks: {
                            color: muted,
                            maxTicksLimit: 6,
                            font: { size: 11 },
                            callback: (v) => isRevenue ? compact(v) : num(v),
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    // ---------- دسته‌بندی‌ها ----------
    const CATEGORY_COLORS = ["#5B5FEF", "#8B5CF6", "#F5B83D", "#EC6FB5", "#2DB6A3", "#94A3B8"];

    function categoriesCard() {
        return `
            <section class="card cat-card">
                <header class="card-head">
                    <h3>${icon("pie", 18)}دسته‌بندی‌ها</h3>
                    <button class="btn btn-ghost btn-sm" type="button" data-go="products">مشاهده همه</button>
                </header>
                <div class="donut-wrap">
                    <canvas id="categoryChart"></canvas>
                    <div class="donut-center"><small>مجموع</small><b id="donutTotal">۰</b></div>
                </div>
                <div class="cat-legend" id="categoryLegend"></div>
            </section>`;
    }

    function drawCategories() {
        const canvas = document.getElementById("categoryChart");
        if (!canvas) return;

        const stats = state.data.categoryStats || [];
        const total = stats.reduce((a, b) => a + b.count, 0);
        document.getElementById("donutTotal").textContent = num(total);

        if (categoryChart) categoryChart.destroy();

        categoryChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: stats.map(i => categoryLabel(i._id)),
                datasets: [{
                    data: stats.length ? stats.map(i => i.count) : [1],
                    backgroundColor: stats.length ? stats.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]) : [cssVar("--chart-track")],
                    borderWidth: 0,
                    borderRadius: 14,
                    spacing: 4,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "76%",
                font: { family: "regular, IRANYekan, sans-serif" },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: stats.length > 0,
                        rtl: true,
                        textDirection: "rtl",
                        backgroundColor: cssVar("--surface"),
                        titleColor: cssVar("--text"),
                        bodyColor: cssVar("--text-light"),
                        borderColor: cssVar("--border"),
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 10,
                        callbacks: { label: (c) => ` ${num(c.parsed)} عدد` }
                    }
                }
            }
        });
    }

    function renderCategoryLegend() {
        const stats = state.data.categoryStats || [];
        const total = stats.reduce((a, b) => a + b.count, 0);
        const el = document.getElementById("categoryLegend");

        if (!stats.length) {
            el.innerHTML = `<div class="muted-note">هنوز دسته‌بندی ثبت نشده است.</div>`;
            return;
        }

        el.innerHTML = stats.map((i, idx) => {
            const percent = total > 0 ? Math.round((i.count / total) * 100) : 0;
            return `
                <div class="cat-row">
                    <span class="cat-name"><i class="cat-dot" style="background:${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}"></i>${esc(categoryLabel(i._id))}</span>
                    <span class="cat-count">${num(i.count)}</span>
                    <b class="cat-percent">${num(percent)}٪</b>
                </div>`;
        }).join("");
    }

    // ---------- فعالیت‌های اخیر ----------
    function activityCard(d) {

        const orders = (d.recentOrders || []).slice(0, 4).map(o => {
            const st = ORDER_STATUS[o.status || "pending"] || ORDER_STATUS.pending;
            const code = String(o._id).slice(-6).toUpperCase();
            return {
                ico: "bag", tone: "indigo",
                title: `سفارش #${code}`,
                sub: `${esc(o.user?.name || "کاربر حذف‌شده")} • ${jalaliDate(o.createdAt)}`,
                extra: toman(o.totalPrice),
                badge: st,
                go: { page: "orders", search: code }
            };
        });

        const stock = (d.lowStockProducts || []).slice(0, 3).map(p => {
            const out = p.stock === 0;
            return {
                ico: "alert", tone: out ? "red" : "amber",
                title: out ? "ناموجود شد" : "هشدار کم‌موجودی",
                sub: `${esc(p.name)} • موجودی ${num(p.stock)}`,
                extra: "",
                badge: out ? { label: "ناموجود", tone: "red" } : { label: "کم موجود", tone: "amber" },
                go: { page: "products", search: p.name }
            };
        });

        const items = [...orders, ...stock];

        const body = items.length
            ? `<div class="activity-list">${items.map((it, i) => `
                <button class="activity-item" type="button" data-act="${i}">
                    <span class="act-ico tone-${it.tone}">${icon(it.ico, 18)}</span>
                    <span class="act-text"><b>${it.title}</b><small>${it.sub}</small></span>
                    <span class="badge tone-${it.badge.tone}">${it.badge.label}</span>
                </button>`).join("")}</div>`
            : `<div class="muted-note">هنوز فعالیتی ثبت نشده است.</div>`;

        // برای کلیک روی آیتم‌ها
        activityCard.items = items;

        return `
            <section class="card activity-card">
                <header class="card-head">
                    <h3>${icon("activity", 18)}فعالیت‌های اخیر</h3>
                    <button class="btn btn-ghost btn-sm" type="button" data-go="orders">مشاهده همه</button>
                </header>
                ${body}
            </section>`;
    }

    // ---------- پرفروش‌ترین محصولات ----------
    function topProductsCard() {

        const sortOptions = Object.entries(SORTS)
            .filter(([k]) => state.hasOrders || (k !== "sales" && k !== "earnings"))
            .map(([k, v]) => `<button type="button" data-sort="${k}" class="${k === state.sort ? "active" : ""}">${v.label}</button>`).join("");

        const cats = [...new Set(state.rows.map(r => r.category).filter(Boolean))];
        const catOptions = `<button type="button" data-cat="all" class="active">همه دسته‌ها</button>` +
            cats.map(c => `<button type="button" data-cat="${esc(c)}">${esc(categoryLabel(c))}</button>`).join("");

        return `
            <section class="card top-card">
                <header class="card-head">
                    <h3>${icon("box", 18)}${state.hasOrders ? "پرفروش‌ترین محصولات" : "محصولات"}</h3>
                    <div class="card-tools">
                        <div class="pop-wrap" id="sortWrap">
                            <button class="btn btn-outline btn-sm" type="button" data-pop>${icon("sort", 15)}<span id="sortLabel">${SORTS[state.sort].label}</span></button>
                            <div class="pop-menu" id="sortMenu">${sortOptions}</div>
                        </div>
                        <div class="pop-wrap" id="catWrap">
                            <button class="btn btn-outline btn-sm" type="button" data-pop>${icon("filter", 15)}<span id="catLabel">همه دسته‌ها</span></button>
                            <div class="pop-menu" id="catMenu">${catOptions}</div>
                        </div>
                    </div>
                </header>
                <div class="table-scroll" id="topTable"></div>
            </section>`;
    }

    function renderTopProducts() {
        const el = document.getElementById("topTable");
        if (!el) return;

        let rows = state.rows.filter(r => state.category === "all" || r.category === state.category);
        rows = rows.sort(SORTS[state.sort].fn).slice(0, TOP_LIMIT);

        if (!rows.length) {
            el.innerHTML = `<div class="muted-note">محصولی برای نمایش وجود ندارد.</div>`;
            return;
        }

        const showSales = state.hasOrders;

        el.innerHTML = `
            <table class="top-table">
                <thead>
                    <tr>
                        <th>محصول</th>
                        <th>موجودی</th>
                        <th>قیمت</th>
                        ${showSales ? "<th>فروش</th><th>درآمد</th>" : ""}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td>
                                <span class="prod-cell">
                                    <img src="${esc(resolveImageUrl(r.image))}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
                                    <span>${esc(r.name)}</span>
                                </span>
                            </td>
                            <td><span class="stock-chip ${r.stock === 0 ? "out" : r.stock <= 5 ? "low" : ""}">${num(r.stock)}</span></td>
                            <td>${toman(r.price)}</td>
                            ${showSales ? `<td>${num(r.sales)}</td><td><b>${toman(r.earnings)}</b></td>` : ""}
                        </tr>`).join("")}
                </tbody>
            </table>`;
    }

    // ---------- رویدادها ----------
    function bindDashboard() {

        const root = document.getElementById("dashRoot");

        // رفتن به صفحه‌ها
        root.addEventListener("click", (e) => {
            const go = e.target.closest("[data-go]");
            if (go) { window.adminNavigate(go.dataset.go); return; }

            const act = e.target.closest("[data-act]");
            if (act) {
                const it = activityCard.items[Number(act.dataset.act)];
                if (it) window.adminNavigate(it.go.page, { search: it.go.search });
            }
        });

        // معیار و بازه‌ی نمودار
        document.getElementById("metricToggle").addEventListener("click", (e) => {
            const b = e.target.closest("[data-metric]");
            if (!b) return;
            state.metric = b.dataset.metric;
            document.querySelectorAll("#metricToggle button").forEach(x => x.classList.toggle("active", x === b));
            drawRevenue();
        });

        document.getElementById("periodToggle").addEventListener("click", (e) => {
            const b = e.target.closest("[data-period]");
            if (!b) return;
            state.period = b.dataset.period;
            document.querySelectorAll("#periodToggle button").forEach(x => x.classList.toggle("active", x === b));
            drawRevenue();
        });

        // منوهای مرتب‌سازی و فیلتر
        root.querySelectorAll(".pop-wrap").forEach(wrap => {
            wrap.querySelector("[data-pop]").addEventListener("click", (e) => {
                e.stopPropagation();
                const open = !wrap.classList.contains("open");
                root.querySelectorAll(".pop-wrap").forEach(w => w.classList.remove("open"));
                wrap.classList.toggle("open", open);
            });
        });

        document.getElementById("sortMenu").addEventListener("click", (e) => {
            const b = e.target.closest("[data-sort]");
            if (!b) return;
            state.sort = b.dataset.sort;
            document.getElementById("sortLabel").textContent = SORTS[state.sort].label;
            document.querySelectorAll("#sortMenu button").forEach(x => x.classList.toggle("active", x === b));
            document.getElementById("sortWrap").classList.remove("open");
            renderTopProducts();
        });

        document.getElementById("catMenu").addEventListener("click", (e) => {
            const b = e.target.closest("[data-cat]");
            if (!b) return;
            state.category = b.dataset.cat;
            document.getElementById("catLabel").textContent = b.textContent;
            document.querySelectorAll("#catMenu button").forEach(x => x.classList.toggle("active", x === b));
            document.getElementById("catWrap").classList.remove("open");
            renderTopProducts();
        });
    }

    // بستن منوهای باز با کلیک بیرون (یک‌بار ثبت می‌شود)
    document.addEventListener("click", (e) => {
        if (e.target.closest(".pop-wrap")) return;
        document.querySelectorAll(".pop-wrap.open").forEach(w => w.classList.remove("open"));
    });

    // با تغییر تم، نمودارها با رنگ‌های جدید دوباره کشیده می‌شوند
    document.addEventListener("adminthemechange", () => {
        if (document.getElementById("revenueChart")) {
            drawRevenue();
            drawCategories();
        }
    });

    window.renderDashboard = renderDashboard;

})();
