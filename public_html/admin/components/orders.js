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
    `${API_BASE_URL}/orders`,
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
        fetch(`${API_BASE_URL}/orders/${id}`, {
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
                    <p><b>ایمیل:</b> ${order.user?.email || "-"}</p>

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
    `${API_BASE_URL}/orders/${id}/status`,
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