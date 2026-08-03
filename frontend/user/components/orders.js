/* =====================================================================
   کامپوننت سفارش‌ها
===================================================================== */

window.Views = window.Views || {};

function createOrderCard(order) {
    return `
    <div class="order-wrapper">
        <div class="order-card">
            <div class="order-info">
                <div class="order-status__wraper">
                    <div class="order-status__cercel ${order.status}"></div>
                    <span class="order-status">${translateStatus(order.status)}</span>
                </div>
                <div class="order-dtail">
                    <div class="order-date">${new Date(order.createdAt).toLocaleDateString("fa-IR")}</div>
                    <div class="order-price">${order.totalPrice.toLocaleString()} تومان</div>
                </div>
                <div class="order-products-images">
                    ${order.items.map(item => `
                        <img src="http://localhost:5000/${item.image}" alt="${item.name}" class="order-product-image">
                    `).join("")}
                </div>
            </div>
            <div class="order-a">
                <a class="view-order" data-open-order="${order._id}">
                    <p>مشاهده</p>
                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3589 3.72481C13.5808 3.9467 13.601 4.29391 13.4194 4.53859L13.3589 4.60869L7.96782 10.0001L13.3589 15.3915C13.5808 15.6134 13.601 15.9606 13.4194 16.2053L13.3589 16.2754C13.137 16.4972 12.7898 16.5174 12.5451 16.3359L12.4751 16.2754L6.64172 10.442C6.41983 10.2201 6.39966 9.87291 6.5812 9.62824L6.64172 9.55814L12.4751 3.72481C12.7191 3.48073 13.1149 3.48073 13.3589 3.72481Z" fill="black"/>
                    </svg>
                </a>
                <a class="view-invoice" data-open-invoice="${order._id}">
                    <p>مشاهده فاکتور</p>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 0 1 1-1Z" stroke="#336DFF" stroke-width="1.5" stroke-linejoin="round"/>
                        <path d="M8.5 8h7M8.5 11h7M8.5 14h4" stroke="#336DFF" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>
    `;
}

window.Views.orders = {

    template: `
        <div class="order-filter__wraper">
            <h2>تاریخچه سفارشات</h2>
            <div class="orders-filter">
                <button class="filter-btn" data-status="all">
                    همه
                    <span id="allOrdersCount">0</span>
                </button>
                <button class="filter-btn" data-status="current">
                    جاری
                    <span id="currentOrdersCount">0</span>
                </button>
                <button class="filter-btn" data-status="delivered">
                    تحویل شده
                    <span id="deliveredOrdersCount">0</span>
                </button>
                <button class="filter-btn" data-status="cancelled">
                    لغو شده
                    <span id="cancelledOrdersCount">0</span>
                </button>
            </div>
        </div>
        <div id="ordersContainer"></div>
    `,

    /* params.filter میتونه از کارت‌های داشبورد بیاد (current/delivered/cancelled)
       تا مستقیم همون فیلتر روی صفحه سفارش‌ها اعمال بشه */
    init: async function (params) {

        try {

            const res = await fetch(`${API_BASE}/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const orders = await res.json();
            const container = document.getElementById("ordersContainer");

            if (orders.length === 0) {
                container.innerHTML = `<h3 style="text-align:center">هنوز سفارشی ثبت نکرده‌اید.</h3>`;
                return;
            }

            const currentOrders = orders.filter(o => ["pending", "processing", "shipped"].includes(o.status)).length;
            const deliveredOrders = orders.filter(o => o.status === "delivered").length;
            const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
            const allOrders = orders.length;

            document.getElementById("currentOrdersCount").textContent = currentOrders;
            document.getElementById("deliveredOrdersCount").textContent = deliveredOrders;
            document.getElementById("cancelledOrdersCount").textContent = cancelledOrders;
            document.getElementById("allOrdersCount").textContent = allOrders;

            function renderOrders(list) {
                container.innerHTML = list.map(createOrderCard).join("");
            }

            function applyFilter(status) {

                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                const activeBtn = document.querySelector(`.filter-btn[data-status="${status}"]`);
                if (activeBtn) activeBtn.classList.add("active");

                switch (status) {
                    case "current":
                        renderOrders(orders.filter(o => ["pending", "processing", "shipped"].includes(o.status)));
                        break;
                    case "delivered":
                        renderOrders(orders.filter(o => o.status === "delivered"));
                        break;
                    case "cancelled":
                        renderOrders(orders.filter(o => o.status === "cancelled"));
                        break;
                    default:
                        renderOrders(orders);
                }
            }

            const initialFilter = (params && params.filter) || "all";
            applyFilter(initialFilter);

            /* کلیک روی دکمه "مشاهده" یا "مشاهده فاکتور" هر سفارش */
            container.addEventListener("click", (e) => {

                const viewBtn = e.target.closest("[data-open-order]");
                if (viewBtn) {
                    openOrder(viewBtn.dataset.openOrder);
                    return;
                }

                const invoiceBtn = e.target.closest("[data-open-invoice]");
                if (invoiceBtn) {
                    openInvoice(invoiceBtn.dataset.openInvoice);
                }
            });

            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.addEventListener("click", () => applyFilter(btn.dataset.status));
            });

        } catch (err) {
            console.log(err);
        }
    }
};
