/* ===========================
    Orders Page State
=========================== */
let allOrders = [];
let filteredOrders = [];
let ordersCurrentPage = 1;
const ORDERS_PER_PAGE = 5;
let orderStatusFilter = "all"; // all | pending | processing | shipped | delivered | cancelled
let selectedOrderIds = new Set();

const ORDER_STATUS_LABELS = {
    pending: "در انتظار",
    processing: "در حال پردازش",
    shipped: "ارسال شده",
    delivered: "ارسال شده",
    cancelled: "لغو شده"
};

function getOrderStatusLabel(status) {
    return ORDER_STATUS_LABELS[status] || status;
}

async function renderOrders() {

 const token = localStorage.getItem("token");

const res = await fetch(
    "https://api.narmcenter.com/api/orders",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

    const orders = await res.json();

    allOrders = orders;
    ordersCurrentPage = 1;
    orderStatusFilter = "all";
    selectedOrderIds = new Set();

    document.getElementById("main-content").innerHTML = `

<div class="orders-page">

<div class="products-header">

    <div class="products-heading">
        <h2>مدیریت سفارش‌ها و ارسال پستی</h2>
        <p>سفارش پرداخت شده آماده چاپ و تحویل به پست است.</p>
    </div>

</div>

<div class="products-card">

    <div class="orders-print-row">

        <button type="button" class="btn-print-all" id="printAllReadyBtn">
   
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M6 9V3h12v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 14h12v7H6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            چاپ همه آماده ارسال
        </button>

        <button type="button" class="btn-print-selected" id="printSelectedBtn" disabled>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M6 9V3h12v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 14h12v7H6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        چاپ انتخاب شده‌ها (<span id="selectedCount">0</span>)
        </button>

    </div>

    <div class="orders-toolbar-row2">

        <div class="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            
            <input
                type="text"
                id="orderSearch"
                placeholder="جستجوی سفارش..."
            >
        </div>

        <div class="filter-dropdown" id="orderStatusFilterDropdown">

            <span id="orderStatusFilterLabel">همه سفارش‌ها</span>

            <svg class="dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

            <div class="filter-dropdown-menu" id="orderStatusFilterMenu">
                <button type="button" data-filter="all" class="active">همه سفارش‌ها</button>
                <button type="button" data-filter="pending">در انتظار</button>
                <button type="button" data-filter="processing">در حال پردازش</button>
                <button type="button" data-filter="shipped">ارسال شده</button>
                <button type="button" data-filter="cancelled">لغو شده</button>
            </div>

        </div>

        <button type="button" class="cancel-selection-btn" id="cancelSelectionBtn">
            لغو انتخاب نتایج
        </button>

    </div>

    <div class="products-table-wrap">

        <table class="products-table orders-table">

            <thead>

                <tr>

                    <th></th>

                    <th>شماره سفارش</th>

                    <th>مشتری</th>

                    <th>نشانی</th>

                    <th>مبلغ</th>

                    <th>وضعیت</th>

                    <th>عملیات</th>

                </tr>

            </thead>

            <tbody id="ordersTableBody">
            </tbody>

        </table>

    </div>

    <div class="products-pagination">

        <span id="ordersPaginationInfo"></span>

        <div class="pagination-controls">
            <button type="button" id="ordersPrevPage" class="page-btn" title="قبلی">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </button>
            <button type="button" id="ordersNextPage" class="page-btn" title="بعدی">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </button>
        </div>

    </div>

</div>

</div>

    `;

    applyOrdersFilter();
    renderOrdersTableBody();

    const orderSearch = document.getElementById("orderSearch");

    orderSearch.addEventListener("input", () => {

        applyOrdersFilter(orderSearch.value);
        ordersCurrentPage = 1;
        renderOrdersTableBody();

    });

    const dropdown = document.getElementById("orderStatusFilterDropdown");

    dropdown.addEventListener("click", (e) => {

        e.stopPropagation();
        dropdown.classList.toggle("open");

    });

    document.querySelectorAll("#orderStatusFilterMenu button").forEach(btn => {

        btn.addEventListener("click", (e) => {

            e.stopPropagation();

            orderStatusFilter = btn.dataset.filter;

            document.getElementById("orderStatusFilterLabel").textContent = btn.textContent;

            document.querySelectorAll("#orderStatusFilterMenu button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            dropdown.classList.remove("open");

            applyOrdersFilter(orderSearch.value);
            ordersCurrentPage = 1;
            renderOrdersTableBody();

        });

    });

    document.getElementById("cancelSelectionBtn").addEventListener("click", () => {

        selectedOrderIds.clear();
        renderOrdersTableBody();

    });

    document.getElementById("printAllReadyBtn").addEventListener("click", () => {

        const readyOrders = allOrders.filter(order => order.status === "processing");

        const ids = readyOrders.map(order => order._id);

        printOrdersByIds(ids);

    });

    document.getElementById("printSelectedBtn").addEventListener("click", () => {

        printOrdersByIds(Array.from(selectedOrderIds));

    });

    document.getElementById("ordersPrevPage").addEventListener("click", () => {

        if (ordersCurrentPage > 1) {

            ordersCurrentPage--;
            renderOrdersTableBody();

        }

    });

    document.getElementById("ordersNextPage").addEventListener("click", () => {

        const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

        if (ordersCurrentPage < totalPages) {

            ordersCurrentPage++;
            renderOrdersTableBody();

        }

    });

}

/* بستن دراپ‌داون فیلتر وضعیت با کلیک بیرون از آن (فقط یک بار به document وصل می‌شود) */
document.addEventListener("click", () => {

    const dropdown = document.getElementById("orderStatusFilterDropdown");

    if (dropdown) dropdown.classList.remove("open");

});

function applyOrdersFilter(keyword = "") {

    const kw = keyword.toLowerCase();

    filteredOrders = allOrders.filter(order => {

        const statusMatch =
            orderStatusFilter === "all" ||
            order.status === orderStatusFilter;

        const text = `
            ${order._id}
            ${order.user?.name || ""}
            ${order.shippingAddress?.city || ""}
            ${order.shippingAddress?.address || ""}
            ${getOrderStatusLabel(order.status)}
        `.toLowerCase();

        const searchMatch = text.includes(kw);

        return statusMatch && searchMatch;

    });

}

function renderOrdersTableBody() {

    const tbody = document.getElementById("ordersTableBody");

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

    if (ordersCurrentPage > totalPages) ordersCurrentPage = totalPages;

    const start = (ordersCurrentPage - 1) * ORDERS_PER_PAGE;

    const pageItems = filteredOrders.slice(start, start + ORDERS_PER_PAGE);

    if (pageItems.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">سفارشی یافت نشد</td>
            </tr>
        `;

    } else {

        tbody.innerHTML = pageItems.map(order => {

            const isChecked = selectedOrderIds.has(order._id);

            return `

                    <tr>

                        <td>
                            <input
                                type="checkbox"
                                class="order-checkbox"
                                data-id="${order._id}"
                                ${isChecked ? "checked" : ""}
                            >
                        </td>

                        <td>#${order._id.slice(-6)}</td>

                        <td>${order.user?.name || "-"}</td>

                        <td>
                            <div class="order-address-cell">
                                <b>${order.shippingAddress?.city || "-"}</b>
                                <span>${order.shippingAddress?.address || "-"}</span>
                                <small>کد پستی : ${order.shippingAddress?.postalCode || "-"}</small>
                            </div>
                        </td>

                        <td>${order.totalPrice.toLocaleString()} تومان</td>

                        <td>
                            <span class="status-badge ${order.status}">
                                ${getOrderStatusLabel(order.status)}
                            </span>
                            ${cardPayBadge(order)}
                        </td>

                        <td>

                            <div class="table-actions">

                                <button class="print-single-btn" data-id="${order._id}" title="چاپ فاکتور">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 9V3h12v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M6 14h12v7H6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                                <button class="change-status-btn" data-id="${order._id}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    تغییر وضعیت
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

        }).join("");

    }

    document.querySelectorAll(".order-checkbox").forEach(cb => {

        cb.addEventListener("change", () => {

            const id = cb.dataset.id;

            if (cb.checked) {
                selectedOrderIds.add(id);
            } else {
                selectedOrderIds.delete(id);
            }

            updateSelectedCount();

        });

    });

    document.querySelectorAll(".print-single-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            printOrdersByIds([btn.dataset.id]);

        });

    });

    document.querySelectorAll(".change-status-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const order = allOrders.find(o => o._id === btn.dataset.id);

            openStatusModal(order);

        });

    });

    updateSelectedCount();
    updateOrdersPaginationInfo(totalPages);

}

function updateSelectedCount() {

    const count = selectedOrderIds.size;

    const countEl = document.getElementById("selectedCount");
    const printSelectedBtn = document.getElementById("printSelectedBtn");

    if (countEl) countEl.textContent = count;
    if (printSelectedBtn) printSelectedBtn.disabled = count === 0;

}

function updateOrdersPaginationInfo(totalPages) {

    const total = filteredOrders.length;

    const start = total === 0 ? 0 : (ordersCurrentPage - 1) * ORDERS_PER_PAGE + 1;

    const end = Math.min(ordersCurrentPage * ORDERS_PER_PAGE, total);

    document.getElementById("ordersPaginationInfo").textContent =
        `نمایش ${start} تا ${end} از ${total} ردیف`;

    document.getElementById("ordersPrevPage").disabled = ordersCurrentPage <= 1;
    document.getElementById("ordersNextPage").disabled = ordersCurrentPage >= totalPages;

}

/* ===========================
    Print Invoices (چاپ تکی / چاپ همه آماده ارسال / چاپ انتخاب‌شده‌ها)
=========================== */

async function printOrdersByIds(ids) {

    if (!ids.length) {
        showToast("warning", "توجه", "سفارشی برای چاپ انتخاب یا یافت نشد.");
        return;
    }

    const token = localStorage.getItem("token");

    try {

const orders = await Promise.all(

    ids.map(id =>
        fetch(`https://api.narmcenter.com/api/orders/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json())
    )

);

        renderPrintArea(orders);

        window.print();

    } catch (err) {

        console.error(err);
        showToast("error", "خطا", "خطا در آماده‌سازی چاپ سفارش‌ها.");

    }

}

function renderPrintArea(orders) {

    let printArea = document.getElementById("printArea");

    if (!printArea) {

        printArea = document.createElement("div");
        printArea.id = "printArea";
        document.body.appendChild(printArea);

    }

    printArea.innerHTML = orders.map(buildInvoiceHTML).join("");

}

function buildInvoiceHTML(order) {

    const issueDate = new Date(order.createdAt || Date.now()).toLocaleDateString("fa-IR");

    const items = order.items || [];

    return `

        <div class="invoice-page" dir="rtl">

            <div class="invoice-brand-header">

                <div class="invoice-brand">
                    <h1>نرم سنتر</h1>
                    <span>فاکتور فروش</span>
                </div>

                <div class="invoice-meta">
                    <p><b>شماره فاکتور:</b> #${order._id.slice(-6)}</p>
                    <p><b>تاریخ صدور:</b> ${issueDate}</p>
                </div>

            </div>

            <div class="invoice-parties">

                <div class="invoice-party-box">

                    <h4>اطلاعات خریدار</h4>

                    <p><b>نام و نام خانوادگی:</b> ${order.user?.name || "-"}</p>
                    <p><b>شماره تماس:</b> ${order.shippingAddress?.phone || order.user?.phone || "-"}</p>

                </div>

                <div class="invoice-party-box">

                    <h4>اطلاعات ارسال</h4>

                    <p><b>استان و شهر:</b> ${order.shippingAddress?.province ? order.shippingAddress.province + " ، " : ""}${order.shippingAddress?.city || "-"}</p>
                    <p><b>کد پستی:</b> ${order.shippingAddress?.postalCode || "-"}</p>
                    <p><b>آدرس:</b> ${order.shippingAddress?.address || "-"}</p>

                </div>

            </div>

            <table class="invoice-items">

                <thead>
                    <tr>
                        <th>#</th>
                        <th>شرح کالا</th>
                        <th>تعداد</th>
                        <th>قیمت واحد</th>
                        <th>قیمت کل</th>
                    </tr>
                </thead>

                <tbody>

                    ${items.map((item, idx) => {

        const qty = item.quantity ?? item.qty ?? item.count ?? 1;
        const unitPrice = item.price || 0;
        const lineTotal = unitPrice * qty;

        return `
                        <tr>
                            <td>${idx + 1}</td>
                            <td>${item.product?.name || item.name || "محصول"}</td>
                            <td>${qty}</td>
                            <td>${unitPrice.toLocaleString()} تومان</td>
                            <td>${lineTotal.toLocaleString()} تومان</td>
                        </tr>
                        `;

    }).join("")}

                </tbody>

            </table>

            <div class="invoice-summary">

                <div class="invoice-summary-box">
                    <span>جمع کل قابل پرداخت</span>
                    <b>${order.totalPrice.toLocaleString()} تومان</b>
                </div>

            </div>

            <div class="invoice-footer">

                <p class="invoice-thanks">از خرید شما سپاسگزاریم</p>

                <div class="invoice-signatures">

                    <div class="invoice-signature-box">
                        <span>امضا و مهر فروشنده</span>
                    </div>

                    <div class="invoice-signature-box">
                        <span>امضای گیرنده</span>
                    </div>

                </div>

            </div>

        </div>

    `;

}

/* ===========================
    Status-Only Modal (بدون جزئیات کامل سفارش)
=========================== */

function openStatusModal(order) {

    if (!order) return;

    document.body.insertAdjacentHTML("beforeend", `

        <div class="modal-overlay">

            <div class="stock-modal">

                <div class="modal-header">

                    <h2>تغییر وضعیت سفارش</h2>

                    <button class="close-modal">✕</button>

                </div>

                <form id="statusForm">

                    <div class="stock-modal-product">
                        <span>سفارش #${order._id.slice(-6)} — ${order.user?.name || "-"}</span>
                    </div>

                    ${cardPaymentBlock(order)}

                    <label for="orderStatusSelect">وضعیت سفارش</label>

                    <select id="orderStatusSelect">

                        <option value="pending" ${order.status === "pending" ? "selected" : ""}>در انتظار</option>
                        <option value="processing" ${order.status === "processing" ? "selected" : ""}>در حال پردازش</option>
                        <option value="shipped" ${order.status === "shipped" || order.status === "delivered" ? "selected" : ""}>ارسال شده</option>
                        <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>لغو شده</option>

                    </select>

                    <button type="submit">ذخیره وضعیت</button>

                </form>

            </div>

        </div>

    `);

    document.querySelector(".close-modal").onclick = () => {

        document.querySelector(".modal-overlay").remove();

    };

    bindCardPaymentActions(order);

    document.getElementById("statusForm").addEventListener("submit", (e) => {

        e.preventDefault();

        const newStatus = document.getElementById("orderStatusSelect").value;

        submitOrderStatus(order._id, newStatus);

    });

}

async function submitOrderStatus(id, status) {

    const token = localStorage.getItem("token");
    const statusBtn = document.querySelector('#statusForm button[type="submit"]');
    setBtnLoading(statusBtn, true);

    try {

const res = await fetch(
    `https://api.narmcenter.com/api/orders/${id}/status`,
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    }
);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "خطا در تغییر وضعیت");
        }

        showToast("success", "موفق", "وضعیت سفارش تغییر کرد");

        document.querySelector(".modal-overlay").remove();

        renderOrders();

    } catch (err) {

        console.error(err);
        showToast("error", "خطا", err.message);

    } finally {

        setBtnLoading(statusBtn, false);

    }

}


/* ===========================
    پرداخت کارت‌به‌کارت (بررسی رسید)
=========================== */

const CARD_PAY_LABELS = {
    unpaid: "منتظر واریز مشتری",
    receipt_submitted: "رسید ارسال شده — نیاز به بررسی",
    paid: "پرداخت تأیید شد",
    rejected: "رسید رد شد — منتظر رسید جدید",
    expired: "مهلت پرداخت تمام شد"
};

function ensureCardPayStyle() {
    if (document.getElementById("cpayStyle")) return;
    const st = document.createElement("style");
    st.id = "cpayStyle";
    st.textContent = `
        .modal-overlay { padding: 16px; box-sizing: border-box; }

        /* مودال مستطیلی دو ستونه: پرداخت سمت راست، وضعیت سمت چپ */
        .stock-modal:has(#statusForm .cpay) { width: 780px; max-width: 100%; }
        #statusForm:has(.cpay) { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); column-gap: 28px; align-items: start; }
        #statusForm:has(.cpay) > .cpay { grid-column: 1; grid-row: 1 / span 99; margin: 0; }
        #statusForm:has(.cpay) > :not(.cpay) { grid-column: 2; }

        @media (max-width: 820px) {
            .stock-modal:has(#statusForm .cpay) { width: 100%; max-height: calc(100dvh - 32px); overflow-y: auto; }
            #statusForm:has(.cpay) { display: block; }
            #statusForm:has(.cpay) > .cpay { margin: 0 0 22px; }
        }
        .cpay-sub { display: block; margin-top: 4px; font-size: 11.5px; color: #6b7280; }
        .cpay-sub.is-review { color: #d97706; font-weight: 600; }

        .cpay { margin: 0 0 22px; padding: 14px; border-radius: 24px; background: #fff; box-shadow: 0 2px 6px rgba(15,23,42,.04), 0 14px 34px rgba(15,23,42,.08); }

        /* کارت نارنجی بالا */
        .cpay__card { position: relative; overflow: hidden; padding: 16px 18px; border-radius: 20px; color: #fff; background: linear-gradient(135deg, #ff9a6c 0%, #f97b4a 55%, #f4693a 100%); box-shadow: 0 10px 22px rgba(249,123,74,.35); }
        .cpay__card::before { content: ""; position: absolute; top: -40px; left: -30px; width: 190px; height: 190px; background: radial-gradient(circle, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 68%); }
        .cpay__card-top { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12.5px; opacity: .95; }
        .cpay__chip { font-style: normal; font-size: 11px; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.22); backdrop-filter: blur(4px); white-space: nowrap; }
        .cpay__amount { position: relative; margin: 18px 0 16px; display: flex; align-items: baseline; gap: 6px; }
        .cpay__amount b { font-size: 26px; font-weight: 700; letter-spacing: .3px; }
        .cpay__amount span { font-size: 12px; opacity: .9; }
        .cpay__card-bottom { position: relative; display: flex; align-items: center; justify-content: space-between; font-size: 12px; opacity: .95; }
        .cpay__code { direction: ltr; letter-spacing: 2px; }
        .cpay__sim { width: 34px; height: 24px; border-radius: 6px; border: 1.5px solid rgba(255,255,255,.55); background: rgba(255,255,255,.18); }

        /* ردیف رسید مثل لیست روش‌های پرداخت */
        .cpay__row { display: flex; align-items: center; gap: 12px; margin-top: 12px; padding: 10px; border-radius: 16px; background: #f7f7f8; }
        .cpay__icon { width: 44px; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: #fff; color: #1f1f1f; box-shadow: 0 1px 3px rgba(15,23,42,.08); }
        .cpay__row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .cpay__row-text b { font-size: 13px; color: #1f1f1f; }
        .cpay__row-text small { font-size: 11.5px; color: #8b8f98; }
        .cpay__check { width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; border: 1.5px solid #d4d4d8; display: flex; align-items: center; justify-content: center; color: transparent; }
        .cpay__check.is-on { background: #1f1f1f; border-color: #1f1f1f; color: #fff; }

        /* دکمه‌ها */
        .cpay__actions { display: flex; gap: 8px; margin-top: 12px; }
        .cpay__actions > .cpay__btn { flex: 1; }
        #statusForm .cpay__btn { height: 48px; border: 0; border-radius: 999px; font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: transform .15s, background .2s; }
        #statusForm .cpay__btn:active { transform: scale(.98); }
        #statusForm .cpay__btn--dark { background: #1f1f1f; color: #fff; }
        #statusForm .cpay__btn--dark:hover { background: #000; }
        #statusForm .cpay__btn--soft { background: #f1f1f2; color: #1f1f1f; }
        #statusForm .cpay__btn--soft:hover { background: #e7e7e9; }
        #statusForm .cpay__btn--danger { background: #f1f1f2; color: #dc2626; }
        #statusForm .cpay__btn--danger:hover { background: #fee2e2; }

        /* کادر دلیل رد */
        .cpay__reject { margin-top: 12px; padding: 12px; border-radius: 16px; background: #f7f7f8; }
        .cpay__reject[hidden] { display: none; }
        #statusForm .cpay__reject label { margin-bottom: 8px; font-size: 12.5px; color: #6b7280; }
        #statusForm .cpay__reject textarea { width: 100%; min-height: 80px; padding: 12px 14px; border: 1.5px solid transparent; border-radius: 14px; background: #fff; font-family: inherit; font-size: 13px; color: #1f1f1f; resize: vertical; outline: none; box-sizing: border-box; transition: border-color .2s; }
        #statusForm .cpay__reject textarea:focus { border-color: #1f1f1f; }
        .cpay__reject .cpay__actions { margin-top: 10px; }
    `;
    document.head.appendChild(st);
}

function cardPayBadge(order) {
    if (order.paymentMethod !== "card") return "";
    ensureCardPayStyle();
    const review = order.paymentStatus === "receipt_submitted" ? " is-review" : "";
    return `<small class="cpay-sub${review}">کارت‌به‌کارت: ${CARD_PAY_LABELS[order.paymentStatus] || ""}</small>`;
}

function cardPaymentBlock(order) {
    ensureCardPayStyle();
    if (order.paymentMethod !== "card") return "";

    const canDecide = order.status !== "cancelled" &&
        ["unpaid", "receipt_submitted", "rejected"].includes(order.paymentStatus);
    const hasReceipt = !!order.receiptImage;
    const payable = ((order.totalPrice || 0) + (order.shippingCost || 0)).toLocaleString();
    const code = String(order._id || "").slice(-8);
    const sentAt = order.receiptSubmittedAt
        ? new Date(order.receiptSubmittedAt).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" })
        : "";

    return `
        <div class="cpay">

            <div class="cpay__card">
                <div class="cpay__card-top">
                    <span>پرداخت کارت‌به‌کارت</span>
                    <em class="cpay__chip">${CARD_PAY_LABELS[order.paymentStatus] || ""}</em>
                </div>
                <div class="cpay__amount">
                    <b>${payable}</b>
                    <span>تومان</span>
                </div>
                <div class="cpay__card-bottom">
                    <span class="cpay__code">•••• ${code}</span>
                    <span class="cpay__sim"></span>
                </div>
            </div>

            <div class="cpay__row">
                <span class="cpay__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                        <path d="M9 8h6M9 12h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                </span>
                <span class="cpay__row-text">
                    <b>رسید پرداخت</b>
                    <small>${hasReceipt ? (sentAt || "رسید ارسال شده") : "هنوز رسیدی ارسال نشده است"}</small>
                </span>
                <span class="cpay__check ${hasReceipt ? "is-on" : ""}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
            </div>

            ${hasReceipt ? `<div class="cpay__actions">
                <button type="button" id="viewReceiptBtn" class="cpay__btn cpay__btn--soft">مشاهده رسید</button>
                ${canDecide ? `<button type="button" id="approvePayBtn" class="cpay__btn cpay__btn--dark">تأیید پرداخت</button>` : ""}
                ${canDecide && order.paymentStatus === "receipt_submitted" ? `<button type="button" id="rejectPayBtn" class="cpay__btn cpay__btn--danger">رد رسید</button>` : ""}
            </div>` : ""}
        </div>

        <div class="cpay__reject" id="rejectBox" hidden>
            <label for="rejectNote">دلیل رد رسید (برای مشتری نمایش داده می‌شود)</label>
            <textarea id="rejectNote" maxlength="300" placeholder="مثلاً: مبلغ واریزی با مبلغ سفارش مطابقت ندارد."></textarea>
            <div class="cpay__actions">
                <button type="button" id="confirmRejectBtn" class="cpay__btn cpay__btn--dark">ثبت رد رسید</button>
                <button type="button" id="cancelRejectBtn" class="cpay__btn cpay__btn--soft">انصراف</button>
            </div>
        </div>
    `;
}

function bindCardPaymentActions(order) {
    const view = document.getElementById("viewReceiptBtn");
    const approve = document.getElementById("approvePayBtn");
    const reject = document.getElementById("rejectPayBtn");
    const box = document.getElementById("rejectBox");

    if (view) view.onclick = () => viewOrderReceipt(order._id);
    if (approve) approve.onclick = () => decideCardPayment(order._id, "approve");
    if (reject) reject.onclick = () => { box.hidden = false; document.getElementById("rejectNote").focus(); };

    const cancel = document.getElementById("cancelRejectBtn");
    if (cancel) cancel.onclick = () => { box.hidden = true; };

    const confirm = document.getElementById("confirmRejectBtn");
    if (confirm) confirm.onclick = () => {
        const note = document.getElementById("rejectNote").value.trim();
        if (!note) return showToast("error", "خطا", "دلیل رد رسید را بنویسید.");
        decideCardPayment(order._id, "reject", note);
    };
}

async function viewOrderReceipt(id) {
    const win = window.open("", "_blank");
    try {
        const res = await fetch(`https://api.narmcenter.com/api/orders/${id}/receipt`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) throw new Error("رسید پیدا نشد");
        const blob = await res.blob();
        win.location = URL.createObjectURL(blob);
    } catch (err) {
        if (win) win.close();
        showToast("error", "خطا", err.message);
    }
}

async function decideCardPayment(id, action, note = "") {
    try {
        const res = await fetch(`https://api.narmcenter.com/api/orders/${id}/payment`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ action, note })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "خطا در ثبت نتیجه");

        showToast("success", "موفق", action === "approve" ? "پرداخت تأیید شد" : "رسید رد شد");
        const overlay = document.querySelector(".modal-overlay");
        if (overlay) overlay.remove();
        renderOrders();
    } catch (err) {
        showToast("error", "خطا", err.message);
    }
}