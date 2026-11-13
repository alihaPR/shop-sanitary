let editingProductId = null;

/* ===========================
    State صفحه‌ی محصولات
=========================== */
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 10;

const productsState = {
    sort: "recent",       // کلید PRODUCT_SORTS
    status: "all",        // all | in | low | out
    category: "all",
    search: "",
    selected: new Set(),  // انتخاب بین صفحه‌ها حفظ می‌شود
    busy: false
};

const PRODUCT_CATEGORIES = [
    ["پوشک-کودک", "پوشک کودک"],
    ["پوشک-بزرگسال", "پوشک بزرگسال"],
    ["نوار-بهداشتی", "نوار بهداشتی"],
    ["پنبه", "پنبه"],
    ["دستمال-مرطوب", "دستمال مرطوب"],
    ["دستمال-کاغذی", "دستمال کاغذی"]
];
const PRODUCT_CATEGORY_LABELS = Object.fromEntries(PRODUCT_CATEGORIES);

const PRODUCT_SORTS = {
    recent: "اخیر",
    price_asc: "قیمت: کم به زیاد",
    price_desc: "قیمت: زیاد به کم",
    stock_asc: "موجودی: کم به زیاد",
    stock_desc: "موجودی: زیاد به کم"
};

const PRODUCT_STATUS_CHIPS = [
    ["all", "همه"],
    ["in", "موجود"],
    ["low", "موجودی کم"],
    ["out", "ناموجود"]
];

/*
  آستانه وضعیت موجودی:
  stock === 0            -> ناموجود
  0 < stock <= 3         -> موجودی کم
  stock > 3              -> موجود
*/
function getStockStatus(stock) {

    if (stock === 0) {

        return { label: "ناموجود", className: "status-out" };

    }

    if (stock <= 3) {

        return { label: "موجودی کم", className: "status-low" };

    }

    return { label: "موجود", className: "status-in" };

}

/* ===========================
    کمک‌ها
=========================== */
const pdFa = (n) => (window.AdminUI && window.AdminUI.num) ? window.AdminUI.num(n) : String(n);

function pdEsc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function pdStatusKey(p) {
    return getStockStatus(p.stock).className.replace("status-", "");
}

function pdCategoryLabel(c) {
    return PRODUCT_CATEGORY_LABELS[c] || c || "";
}

// زمان ساخت: createdAt یا زمانِ داخل _id مونگو
function pdCreatedTs(p) {
    const t = Date.parse(p.createdAt);
    if (Number.isFinite(t)) return t;
    const s = parseInt(String(p._id || "").slice(0, 8), 16);
    return Number.isFinite(s) ? s * 1000 : 0;
}

function pdCompare(sort) {

    switch (sort) {
        case "price_asc":
            return (a, b) => (a.price || 0) - (b.price || 0);
        case "price_desc":
            return (a, b) => (b.price || 0) - (a.price || 0);
        case "stock_asc":
            return (a, b) => (a.stock || 0) - (b.stock || 0);
        case "stock_desc":
            return (a, b) => (b.stock || 0) - (a.stock || 0);
        default:
            return (a, b) => pdCreatedTs(b) - pdCreatedTs(a);
    }

}

function applyProductFilters() {

    const q = productsState.search.trim().toLowerCase();

    filteredProducts = allProducts.filter(p => {

        if (productsState.status !== "all" && pdStatusKey(p) !== productsState.status) return false;

        if (productsState.category !== "all" && p.category !== productsState.category) return false;

        if (q) {
            const text = `${p.name} ${p.category} ${pdCategoryLabel(p.category)} ${p.brand || ""}`.toLowerCase();
            if (!text.includes(q)) return false;
        }

        return true;

    }).sort(pdCompare(productsState.sort));

    // انتخاب همیشه فقط روی چیزی است که الان نمایش داده می‌شود
    const visible = new Set(filteredProducts.map(p => p._id));
    productsState.selected.forEach(id => { if (!visible.has(id)) productsState.selected.delete(id); });

}

/* ===========================
    استایل‌های اضافه‌ی همین صفحه
    (از کلاس‌های dsc-* صفحه‌ی تخفیف‌ها هم استفاده می‌شود)
=========================== */
function ensureProductsStyles() {

    if (document.getElementById("productsPageStyles")) return;

    const style = document.createElement("style");
    style.id = "productsPageStyles";
    style.textContent = `
        .dsc-toolbar .filter-dropdown{height:36px;box-sizing:border-box;padding:0 14px;border-radius:10px;background:var(--surface);color:var(--text)}
        .dsc-toolbar .dsc-chip i{font-style:normal;font-size:11px;opacity:.7;margin-inline-start:4px}
        #productFilterMenu{min-width:190px}
        #productFilterMenu button{white-space:nowrap}
        .pd-bulk{border-bottom:0}
        .pd-bulk .dsc-bulk-actions{display:none}
        .pd-bulk.has-selection .dsc-bulk-actions{display:flex}
        .dsc-bulk.pd-busy .dsc-bulk-actions{opacity:.5!important;pointer-events:none!important}
        .pd-danger{color:var(--red)!important;border-color:var(--red-soft)!important}
        .pd-danger:hover{background:var(--red-soft)!important}
        .pd-col-check{width:44px;padding-inline:14px!important;text-align:center}
        .products-table input[type=checkbox],.pd-bulk input[type=checkbox]{accent-color:var(--accent,#0f9d8a);width:16px;height:16px;cursor:pointer}
        .products-table tr.is-selected td{background:var(--accent-soft)}
        @media (max-width:768px){
            .dsc-toolbar .filter-dropdown{justify-content:space-between}
            .dsc-toolbar .csel--sm{width:100%}
            .dsc-chips{flex-wrap:wrap}
        }
    `;
    document.head.appendChild(style);

}

/* ===========================
    رندر صفحه
=========================== */
async function renderProducts(opts = {}) {

    ensureProductsStyles();

    const keepState = !!(opts && opts.keepState === true);
    const main = document.getElementById("main-content");

    let products = [];

    try {

        const res = await fetch("https://api.narmcenter.com/api/products");
        if (!res.ok) throw new Error(res.status);
        products = await res.json();

    } catch (err) {

        console.error(err);
        main.innerHTML = `<div class="dsc-loading">بارگذاری محصولات انجام نشد. صفحه را دوباره باز کنید.</div>`;
        return;

    }

    allProducts = Array.isArray(products) ? products : [];

    if (!keepState) {
        productsState.sort = "recent";
        productsState.status = "all";
        productsState.category = "all";
        productsState.search = "";
        productsState.selected.clear();
        currentPage = 1;
    }

    // دسته‌هایی که واقعاً محصول دارند (مثل صفحه‌ی تخفیف‌ها)
    const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    if (productsState.category !== "all" && !cats.includes(productsState.category)) productsState.category = "all";

    main.innerHTML = `

<div class="products-header">

    <div class="products-heading">
        <h2>لیست محصولات</h2>
        <p>مدیریت تمامی محصولات فروشگاه</p>
    </div>

    <button class="add-product-btn">
        + افزودن محصول
    </button>

</div>

<div class="products-card">

    <div class="dsc-toolbar">

        <div class="dsc-chips" id="productStatusChips"></div>

        <select class="dsc-select" id="productCategoryFilter" aria-label="دسته‌بندی">
            <option value="all">همه‌ی دسته‌ها</option>
            ${cats.map(c => `<option value="${pdEsc(c)}" ${c === productsState.category ? "selected" : ""}>${pdEsc(pdCategoryLabel(c))}</option>`).join("")}
        </select>

        <div class="filter-dropdown" id="productFilterDropdown">
            <span id="productFilterLabel">${pdEsc(PRODUCT_SORTS[productsState.sort])}</span>
            <svg class="dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="filter-dropdown-menu" id="productFilterMenu">
                ${Object.entries(PRODUCT_SORTS).map(([key, label]) => `
                <button type="button" data-sort="${key}" class="${key === productsState.sort ? "active" : ""}">${label}</button>`).join("")}
            </div>
        </div>

        <div class="dsc-search">
            ${window.AdminUI.icon("search", 16)}
            <input type="text" id="pdSearch" placeholder="جستجوی محصول..." autocomplete="off" value="${pdEsc(productsState.search)}">
        </div>

    </div>

    <div class="dsc-bulk pd-bulk" id="pdBulk">

        <label class="dsc-check-all">
            <input type="checkbox" id="pdSelectAll">
            <span>انتخاب همه‌ی موارد نمایش‌داده‌شده</span>
        </label>

        <span class="dsc-bulk-count" id="pdBulkCount"></span>

        <div class="dsc-bulk-actions">
            <button type="button" class="dsc-btn dsc-btn-ghost pd-danger" id="pdBulkDelete">حذف انتخاب‌شده‌ها</button>
            <button type="button" class="dsc-btn dsc-btn-ghost" id="pdClearSel">لغو انتخاب</button>
        </div>

    </div>

    <div class="products-table-wrap">

        <table class="products-table">

            <thead>

                <tr>

                    <th class="pd-col-check"></th>

                    <th>محصول</th>

                    <th>دسته بندی</th>

                    <th>قیمت</th>

                    <th>موجودی</th>

                    <th>وضعیت</th>

                    <th>عملیات</th>

                </tr>

            </thead>

            <tbody id="productsTableBody">
            </tbody>

        </table>

    </div>

    <div class="products-pagination">

        <span id="paginationInfo"></span>

        <div class="pagination-controls">
            <button type="button" id="prevPageBtn" class="page-btn" title="قبلی">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button type="button" id="nextPageBtn" class="page-btn" title="بعدی">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

    </div>

</div>

    `;

    bindProductsPage();
    refreshProductsView();

}

// فیلتر/مرتب‌سازی را دوباره اعمال می‌کند و همه‌چیز را از نو می‌کشد
function refreshProductsView({ resetPage = false } = {}) {

    if (resetPage) currentPage = 1;

    applyProductFilters();
    renderProductsTableBody();
    paintProductChips();

}

function paintProductChips() {

    const box = document.getElementById("productStatusChips");
    if (!box) return;

    const counts = { all: allProducts.length, in: 0, low: 0, out: 0 };
    allProducts.forEach(p => { counts[pdStatusKey(p)]++; });

    box.innerHTML = PRODUCT_STATUS_CHIPS.map(([key, label]) => `
        <button type="button" class="dsc-chip ${key === productsState.status ? "active" : ""}" data-status="${key}">
            ${label} <i>${pdFa(counts[key])}</i>
        </button>`).join("");

}

function paintProductBulk() {

    const bulk = document.getElementById("pdBulk");
    if (!bulk) return;

    const count = productsState.selected.size;

    bulk.classList.toggle("has-selection", count > 0);

    document.getElementById("pdBulkCount").textContent =
        count ? `${pdFa(count)} محصول انتخاب شده` : `${pdFa(filteredProducts.length)} محصول نمایش داده می‌شود`;

    const all = document.getElementById("pdSelectAll");
    const everyChecked = filteredProducts.length > 0 && filteredProducts.every(p => productsState.selected.has(p._id));

    all.checked = everyChecked;
    all.indeterminate = count > 0 && !everyChecked;

}

/* ===========================
    رویدادها
=========================== */
function bindProductsPage() {

    const searchInput = document.getElementById("pdSearch");

    searchInput.addEventListener("input", () => {

        productsState.search = searchInput.value;
        refreshProductsView({ resetPage: true });

    });

    // ---- دراپ‌داون مرتب‌سازی (اخیر) ----
    const dropdown = document.getElementById("productFilterDropdown");

    dropdown.addEventListener("click", (e) => {

        e.stopPropagation();
        dropdown.classList.toggle("open");

    });

    document.querySelectorAll("#productFilterMenu button").forEach(btn => {

        btn.addEventListener("click", (e) => {

            e.stopPropagation();

            productsState.sort = btn.dataset.sort;

            document.getElementById("productFilterLabel").textContent = btn.textContent;

            document.querySelectorAll("#productFilterMenu button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            dropdown.classList.remove("open");

            refreshProductsView({ resetPage: true });

        });

    });

    // ---- فیلتر دسته‌بندی و وضعیت ----
    document.getElementById("productCategoryFilter").addEventListener("change", (e) => {

        productsState.category = e.target.value;
        refreshProductsView({ resetPage: true });

    });

    document.getElementById("productStatusChips").addEventListener("click", (e) => {

        const chip = e.target.closest(".dsc-chip");
        if (!chip) return;

        productsState.status = chip.dataset.status;
        refreshProductsView({ resetPage: true });

    });

    document.querySelector(".add-product-btn").addEventListener("click", () => openProductModal());

    // ---- صفحه‌بندی ----
    document.getElementById("prevPageBtn").addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            renderProductsTableBody();

        }

    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {

        const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

        if (currentPage < totalPages) {

            currentPage++;

            renderProductsTableBody();

        }

    });

    // ---- ردیف‌ها: ویرایش / حذف / انتخاب ----
    const tbody = document.getElementById("productsTableBody");

    tbody.addEventListener("click", (e) => {

        const editBtn = e.target.closest(".edit-btn");
        const delBtn = e.target.closest(".delete-btn");

        if (editBtn) {

            const product = allProducts.find(p => p._id === editBtn.dataset.id);
            if (product) openProductModal(product);

        } else if (delBtn) {

            deleteProduct(delBtn.dataset.id);

        }

    });

    tbody.addEventListener("change", (e) => {

        const check = e.target.closest(".pd-row-check");
        if (!check) return;

        const tr = check.closest("tr");

        check.checked ? productsState.selected.add(tr.dataset.id) : productsState.selected.delete(tr.dataset.id);
        tr.classList.toggle("is-selected", check.checked);

        paintProductBulk();

    });

    // ---- انتخاب همه‌ی موارد نمایش‌داده‌شده ----
    document.getElementById("pdSelectAll").addEventListener("change", (e) => {

        filteredProducts.forEach(p => e.target.checked ? productsState.selected.add(p._id) : productsState.selected.delete(p._id));

        renderProductsTableBody();

    });

    // ---- عملیات گروهی ----
    document.getElementById("pdClearSel").addEventListener("click", () => {

        productsState.selected.clear();
        renderProductsTableBody();

    });

    document.getElementById("pdBulkDelete").addEventListener("click", pdBulkDelete);

}

// بستن دراپ‌داون مرتب‌سازی با کلیک بیرون از آن (فقط یک بار به document وصل می‌شود)
if (!window.__pdDropdownBound) {

    window.__pdDropdownBound = true;

    document.addEventListener("click", () => {

        const dropdown = document.getElementById("productFilterDropdown");

        if (dropdown) dropdown.classList.remove("open");

    });

}

/* ===========================
    جدول
=========================== */
function renderProductsTableBody() {

    const tbody = document.getElementById("productsTableBody");

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;

    const pageItems = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

    if (pageItems.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">محصولی یافت نشد</td>
            </tr>
        `;

    } else {

        tbody.innerHTML = pageItems.map(product => {

            const status = getStockStatus(product.stock);
            const selected = productsState.selected.has(product._id);

            return `

                    <tr data-id="${pdEsc(product._id)}" class="${selected ? "is-selected" : ""}">

                        <td class="pd-col-check">
                            <input type="checkbox" class="pd-row-check" ${selected ? "checked" : ""} aria-label="انتخاب ${pdEsc(product.name)}">
                        </td>

                        <td>
<div class="product-cell">
    <img src="https://api.narmcenter.com/${pdEsc(product.image)}" class="table-image">
    <span class="product-name">${pdEsc(product.name)}</span>
</div>
                        </td>

                        <td>${pdEsc(pdCategoryLabel(product.category))}</td>

                        <td>${(Number(product.price) || 0).toLocaleString()} تومان</td>

                        <td>${product.stock}</td>

                        <td>
                            <span class="status-pill ${status.className}">${status.label}</span>
                        </td>

                        <td>

                            <div class="table-actions">

                                <button class="edit-btn" data-id="${pdEsc(product._id)}" title="ویرایش">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                                <button class="delete-btn" data-id="${pdEsc(product._id)}" title="حذف">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

        }).join("");

    }

    updatePaginationInfo(totalPages);

    paintProductBulk();

}

function updatePaginationInfo(totalPages) {

    const total = filteredProducts.length;

    const start = total === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

    const end = Math.min(currentPage * PRODUCTS_PER_PAGE, total);

    document.getElementById("paginationInfo").textContent =
        `نمایش ${start} تا ${end} از ${total} ردیف`;

    document.getElementById("prevPageBtn").disabled = currentPage <= 1;

    document.getElementById("nextPageBtn").disabled = currentPage >= totalPages;

}

/* ===========================
    عملیات گروهی
    (همان APIهای تکی ویرایش/حذف؛ با ۴ درخواست هم‌زمان)
=========================== */
async function pdRunPool(items, worker, limit = 4) {

    let i = 0;

    const run = async () => {
        while (i < items.length) {
            const item = items[i++];
            await worker(item);
        }
    };

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));

}

function setProductsBusy(busy) {

    productsState.busy = busy;

    const bulk = document.getElementById("pdBulk");
    if (bulk) bulk.classList.toggle("pd-busy", busy);

}

async function pdBulkDelete() {

    if (productsState.busy) return;

    const ids = [...productsState.selected];

    if (!ids.length) return showToast("warning", "انتخابی انجام نشده", "اول چند محصول را انتخاب کنید.");

    const ok = await showConfirmDialog(
        `آیا از حذف ${pdFa(ids.length)} محصول انتخاب‌شده مطمئن هستید؟ این کار قابل بازگشت نیست.`
    );

    if (!ok) return;

    const token = localStorage.getItem("token");

    if (!token) {
        showToast("error", "خطا", "ابتدا وارد حساب ادمین شوید.");
        return;
    }

    setProductsBusy(true);

    const deleted = new Set();

    await pdRunPool(ids, async (id) => {

        try {

            const res = await fetch(`https://api.narmcenter.com/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || res.status);
            }

            deleted.add(id);

        } catch (err) {

            console.error(err);

        }

    });

    allProducts = allProducts.filter(p => !deleted.has(p._id));
    deleted.forEach(id => productsState.selected.delete(id));

    setProductsBusy(false);

    refreshProductsView();

    const failed = ids.length - deleted.size;

    if (failed === 0) {
        showToast("success", "حذف موفق", `${pdFa(deleted.size)} محصول حذف شد.`);
    } else if (deleted.size === 0) {
        showToast("error", "حذف انجام نشد", "هیچ محصولی حذف نشد.");
    } else {
        showToast("warning", "بخشی حذف شد", `${pdFa(deleted.size)} محصول حذف شد و ${pdFa(failed)} مورد ناموفق بود.`);
    }

}

/* ===========================
    Toast Notifications
    (کاملاً مستقل - به هیچ کد دیگری وابسته نیست)
=========================== */
function ensureToastStyles() {

    if (document.getElementById("toastStyles")) return;

    const style = document.createElement("style");
    style.id = "toastStyles";
    style.textContent = `
        @keyframes toastSlideIn {
            from { opacity: 0; transform: translateY(-12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastSlideOut {
            from { opacity: 1; transform: translateY(0); }
            to   { opacity: 0; transform: translateY(-12px); }
        }
    `;
    document.head.appendChild(style);

}

function ensureToastContainer() {

    let container = document.getElementById("toastContainer");

    if (!container) {

        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
        
            z-index: 99999;
            display: flex;
            flex-direction: column;

            gap: 10px;
            width: 320px;
            max-width: 90vw;
        `;
        document.body.appendChild(container);

    }

    return container;

}

function showToast(type, title, message = "") {

    ensureToastStyles();

    const config = {
        success: { icon: "✓", bg: "#22c55e" },
        error: { icon: "✕", bg: "#ef4444" },
        warning: { icon: "!", bg: "#f59e0b" },
        info: { icon: "i", bg: "#3b82f6" },
        neutral: { icon: "●", bg: "#9ca3af" }
    };

    const cfg = config[type] || config.neutral;
    const container = ensureToastContainer();

    const toast = document.createElement("div");
    toast.style.cssText = `
        display: flex;
        align-items: center;
         box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        gap: 12px;
        background: #ffffff;
        border-radius: 14px;
        padding: 14px 16px;
        direction: rtl;
        font-family: inherit;
        animation: toastSlideIn .25s ease;
    `;

    toast.innerHTML = `
        <div style="
            width: 32px; height: 32px; border-radius: 50%;
            background: ${cfg.bg}; color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; flex-shrink: 0;
        ">${cfg.icon}</div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: 14px; color: #111;">${pdEsc(title)}</div>
            ${message ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${pdEsc(message)}</div>` : ""}
        </div>
        <button type="button" style="
            background: none; border: none; color: #9ca3af;
            font-size: 16px; cursor: pointer; line-height: 1; padding: 0; flex-shrink: 0;
        ">×</button>
    `;

    const removeToast = () => {
        toast.style.animation = "toastSlideOut .2s ease forwards";
        setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector("button").addEventListener("click", removeToast);

    container.appendChild(toast);

    setTimeout(removeToast, 4000);

}

/* ===========================
    Confirm Dialog
    (جایگزین سفارشی و هم‌استایل به‌جای confirm() پیش‌فرض مرورگر)
=========================== */
function showConfirmDialog(message) {

    return new Promise((resolve) => {

        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        overlay.innerHTML = `
            <div style="
                background: #fff;
                border-radius: 16px;
                padding: 24px;
                width: 320px;
                max-width: 90vw;
                direction: rtl;
                text-align: center;
                box-shadow: 0 12px 32px rgba(0,0,0,0.2);
                font-family: inherit;
            ">
                <div style="
                    width: 44px; height: 44px; border-radius: 50%;
                    background: #fef2f2; color: #ef4444;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px; margin: 0 auto 14px;
                ">!</div>
                <div style="font-size: 14px; color: #111; margin-bottom: 20px; line-height: 1.8;">
                    ${pdEsc(message)}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" data-action="cancel" style="
                        flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #e5e7eb;
                        background: #fff; color: #374151; font-size: 13px; cursor: pointer;
                    ">انصراف</button>
                    <button type="button" data-action="confirm" style="
                        flex: 1; padding: 10px; border-radius: 10px; border: none;
                        background: #ef4444; color: #fff; font-size: 13px; cursor: pointer;
                    ">بله، حذف کن</button>
                </div>
            </div>
        `;

        const close = (result) => {
            overlay.remove();
            resolve(result);
        };

        overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => close(false));
        overlay.querySelector('[data-action="confirm"]').addEventListener("click", () => close(true));
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) close(false);
        });

        document.body.appendChild(overlay);

    });

}

function openProductModal(product = null) {

    // جلوگیری از تجمع چند مودال هم‌زمان روی هم (که باعث می‌شد
    // چند فرم با id="productForm" تکراری تو صفحه باشه و
    // addEventListener فقط روی اولی بشینه، نه فرمی که کاربر می‌بینه)
    document.querySelectorAll(".modal-overlay").forEach(el => el.remove());

    document.body.insertAdjacentHTML("beforeend", `

        <div class="modal-overlay">

            <div class="product-modal product-modal--redesign">

                <div class="modal-header">

                    <h2>${product ? "ویرایش محصول" : "افزودن محصول"}</h2>

                    <button class="close-modal">✕</button>

                </div>

                <form id="productForm" class="product-form-grid">

                    <div class="form-col form-col-main">

                        <div class="form-card">

                            <h3 class="form-card-title">اطلاعات عمومی</h3>

                            <div class="form-group">
                                <label>نام محصول</label>
                                <input id="productName" type="text" placeholder="نام محصول را وارد کنید">
                            </div>

                            <div class="form-group">
                                <label>توضیح کوتاه</label>
                                <input id="productShortDescription" type="text" placeholder="یک توضیح کوتاه زیر نام محصول">
                            </div>

                            <div class="form-group">
                                <label>برند</label>
                                <input id="productBrand" type="text" placeholder="نام برند">
                            </div>

                            <div class="form-group">
                                <label>توضیحات محصول</label>
                                <textarea id="productDescription" placeholder="توضیحات محصول را وارد کنید"></textarea>
                            </div>

                        </div>

                        <div class="form-card">

                            <h3 class="form-card-title">قیمت و موجودی</h3>

                            <div class="form-row">

                                <div class="form-group">
                                    <label>قیمت پایه (تومان)</label>
                                    <input id="productPrice" type="number" placeholder="مثلا 150000">
                                </div>

                                <div class="form-group">
                                    <label>موجودی</label>
                                    <input id="productStock" type="number" placeholder="تعداد موجودی">
                                </div>

                            </div>

                        </div>

                        <div class="form-card">

                            <div class="form-card-header-row">
                                <h3 class="form-card-title">مشخصات کالا</h3>
                                <button type="button" id="addSpecification" class="add-specification-btn">
                                    + افزودن مشخصه
                                </button>
                            </div>

                            <div id="specificationsContainer"></div>

                        </div>

                    </div>

                    <div class="form-col form-col-side">

                        <div class="form-card">

                            <h3 class="form-card-title">تصویر محصول</h3>

                            <label class="image-upload-box" for="productImageFile">
                                <img id="productImagePreview" alt="پیش نمایش تصویر">
                                <div class="upload-placeholder" id="uploadPlaceholder">
                                    <span class="upload-plus">+</span>
                                    <span class="upload-text">افزودن تصویر</span>
                                </div>
                            </label>

                            <input id="productImageFile" type="file" accept="image/*" hidden>

                        </div>

                        <div class="form-card">

                            <h3 class="form-card-title">دسته‌بندی</h3>

                            <select id="productCategory">

                                <option value="">
                                     انتخاب دسته‌بندی
                                </option>

                                 <option value="پوشک-کودک">
                                     پوشک کودک
                                </option>

                                <option value="پوشک-بزرگسال">
                                     پوشک بزرگسال
                                </option>

                                <option value="نوار-بهداشتی">
                                     نوار بهداشتی
                                </option>

                                <option value="پنبه">
                                 پنبه
                                </option>

                                <option value="دستمال-مرطوب">
                                 دستمال مرطوب
                                </option>
                                
                                <option value="دستمال-کاغذی">
                                  دستمال کاغذی
                                </option>
                                

                            </select>

                        </div>

                    </div>

                    <div class="form-actions">
                        <button type="submit">${product ? "ویرایش محصول" : "ثبت محصول"}</button>
                    </div>

                </form>

            </div>

        </div>

    `);
    if (product) {

        editingProductId = product._id;

        document.getElementById("productName").value = product.name || "";
        document.getElementById("productPrice").value = product.price || "";
        document.getElementById("productStock").value = product.stock || 0;
        document.getElementById("productCategory").value = product.category || "";
        document.getElementById("productBrand").value = product.brand || "";
        document.getElementById("productDescription").value = product.description || "";
        document.getElementById("productShortDescription").value = product.shortDescription || "";

        if (product.image) {

            const previewImg = document.getElementById("productImagePreview");
            const placeholder = document.getElementById("uploadPlaceholder");

            previewImg.src = `https://api.narmcenter.com/${product.image}`;
            previewImg.classList.add("has-image");
            placeholder.style.display = "none";

        }

    }
    else {

        editingProductId = null;

    }
    document.getElementById("productForm").addEventListener("submit", submitProduct);

    const imageInput = document.getElementById("productImageFile");
    const imagePreview = document.getElementById("productImagePreview");
    const uploadPlaceholder = document.getElementById("uploadPlaceholder");

    imageInput.addEventListener("change", () => {

        if (imageInput.files && imageInput.files[0]) {

            imagePreview.src = URL.createObjectURL(imageInput.files[0]);
            imagePreview.classList.add("has-image");
            uploadPlaceholder.style.display = "none";

        }

    });

    document.querySelector(".close-modal").onclick = () => {

        document.querySelector(".modal-overlay").remove();

    }

    function escapeAttr(str) {
        return pdEsc(str);
    }

    const specsContainer = document.getElementById("specificationsContainer");

    function addSpecRow(label = "", value = "") {

        specsContainer.insertAdjacentHTML(

            "beforeend",

            `
        <div class="spec-row">

            <input
                type="text"
                class="spec-title"
                placeholder="عنوان مشخصه"
                value="${escapeAttr(label)}"
            >

            <input
                type="text"
                class="spec-value"
                placeholder="مقدار"
                value="${escapeAttr(value)}"
            >

            <button
                type="button"
                class="remove-spec"
            >
                ×
            </button>

        </div>
        `

        );

    }

    document
        .getElementById("addSpecification")
        .addEventListener("click", () => addSpecRow());

    if (product) {

        (product.specs || []).forEach(spec => addSpecRow(spec.label, spec.value));

    }

}
document.addEventListener("click", (e) => {

    if (e.target.classList.contains("remove-spec")) {

        e.target.parentElement.remove();

    }

});
async function submitProduct(e) {

    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
        showToast("error", "خطا", "ابتدا وارد حساب ادمین شوید.");
        return;
    }

    const submitBtn = document.querySelector('#productForm button[type="submit"]');
    setBtnLoading(submitBtn, true);

    try {
        await submitProductInner(token, submitBtn);
    } finally {
        setBtnLoading(submitBtn, false);
    }

}

async function submitProductInner(token, submitBtn) {

    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const shortDescription = document.getElementById("productShortDescription").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const stock = Number(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const brand = document.getElementById("productBrand").value.trim();
    let image = editingProductId
        ? document.getElementById("productImagePreview")?.getAttribute("src")
            ?.replace("https://api.narmcenter.com/", "")
        : "";

    const imageFile = document.getElementById("productImageFile");

    if (imageFile.files.length > 0) {

        const formData = new FormData();

        formData.append("image", imageFile.files[0]);

        const uploadRes = await fetch(
    "https://api.narmcenter.com/api/upload",
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    }
);

        if (!uploadRes.ok) {
            const err = await uploadRes.json();
            throw new Error(err.message || "خطا در آپلود تصویر");
        }

        const uploadData = await uploadRes.json();

        image = uploadData.image.replace("/", "");

    }

    const specifications = [];

    document.querySelectorAll(".spec-row").forEach(row => {

        const label = row.querySelector(".spec-title").value.trim();
        const value = row.querySelector(".spec-value").value.trim();

        if (label && value) {
            specifications.push({
                label,
                value
            });
        }

    });

    try {

const url = editingProductId
    ? `https://api.narmcenter.com/api/products/${editingProductId}`
    : "https://api.narmcenter.com/api/products";

const method = editingProductId ? "PUT" : "POST";

        const res = await fetch(url, {

            method,

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({

                name,
                stock,
                description,
                shortDescription,
                price,
                image,
                brand,
                category,
                specs: specifications,
                features: []

            })

        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "خطا در ثبت محصول");
        }

        showToast(
            "success",
            editingProductId ? "ویرایش موفق" : "افزودن موفق",
            editingProductId
                ? "محصول با موفقیت ویرایش شد."
                : "محصول با موفقیت اضافه شد."
        );

        document.querySelector(".modal-overlay").remove();
        editingProductId = null;
        renderProducts({ keepState: true });

    } catch (err) {

        console.error(err);

        showToast("error", "خطا", err.message);

    }

}
async function deleteProduct(id) {

    const confirmDelete = await showConfirmDialog(
        "آیا از حذف این محصول مطمئن هستید؟"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {

const res = await fetch(
    `https://api.narmcenter.com/api/products/${id}`,
    {
        method: "DELETE",

        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

        const data = await res.json();

        if (!res.ok) {

            throw new Error(data.message);

        }

        showToast("success", "حذف موفق", "محصول با موفقیت حذف شد.");

        renderProducts({ keepState: true });

    } catch (err) {

        console.error(err);

        showToast("error", "خطا", err.message);

    }

}