/* =====================================================================
   کامپوننت داشبورد
===================================================================== */

window.Views = window.Views || {};

window.Views.dashboard = {

    template: `
        <div class="summary-card">
        <div class="summary-card__head">
            <h2 class="summary-title">سفارش‌های من</h2>
            <a class="see-all" href="#" data-view-link="orders">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M13.3586 3.72468C13.5805 3.94657 13.6007 4.29379 13.4191 4.53847L13.3586 4.60857L7.96749 9.99996L13.3586 15.3914C13.5805 15.6132 13.6007 15.9605 13.4191 16.2051L13.3586 16.2752C13.1367 16.4971 12.7895 16.5173 12.5448 16.3357L12.4747 16.2752L6.64138 10.4419C6.41949 10.22 6.39932 9.87279 6.58087 9.62812L6.64138 9.55802L12.4747 3.72468C12.7188 3.48061 13.1145 3.48061 13.3586 3.72468Z" fill="currentColor"/></svg>
                <p>مشاهده همه</p>
            </a>
        </div>
        <div class="cards">

            <a class="card" href="#" data-view-link="orders" data-filter="current">
                <div class="cart-svg svg-1">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19.5h14" /></svg>
                </div>
                <div class="cart-content">
                    <h3><span id="currentOrders" class="dashboard-cards__number">0</span> سفارش</h3>
                    <p>جاری</p>
                </div>
            </a>

            <a class="card" href="#" data-view-link="orders" data-filter="shipped">
                <div class="cart-svg svg-2">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M5 12.5 9.5 17 19 7" /></svg>
                </div>
                <div class="cart-content">
                    <h3><span id="delivered" class="dashboard-cards__number">0</span> سفارش</h3>
                    <p>ارسال شده</p>
                </div>
            </a>

            <a class="card" href="#" data-view-link="orders" data-filter="cancelled">
                <div class="cart-svg svg-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </div>
                <div class="cart-content">
                    <h3><span id="cancelledCount" class="dashboard-cards__number">0</span> سفارش</h3>
                    <p>لغو شده</p>
                </div>
            </a>

        </div>
        </div>

        <div class="last-order">
            <div class="last-order__title">
                <h2 class="last-order__heading"><i class="dot"></i>سفارش های اخیر</h2>
                <a href="#" data-view-link="orders">
                    <p>مشاهده همه</p>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3586 3.72468C13.5805 3.94657 13.6007 4.29379 13.4191 4.53847L13.3586 4.60857L7.96749 9.99996L13.3586 15.3914C13.5805 15.6132 13.6007 15.9605 13.4191 16.2051L13.3586 16.2752C13.1367 16.4971 12.7895 16.5173 12.5448 16.3357L12.4747 16.2752L6.64138 10.4419C6.41949 10.22 6.39932 9.87279 6.58087 9.62812L6.64138 9.55802L12.4747 3.72468C12.7188 3.48061 13.1145 3.48061 13.3586 3.72468Z" fill="#336DFF" />
                    </svg>
                </a>
            </div>

            <div id="lastOrderBox">
                سفارشی وجود ندارد
            </div>
        </div>
    `,

    init: async function () {

        try {

            const res = await fetch(`${API_BASE}/users/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            const currentOrders = data.pending + data.processing;

            document.getElementById("currentOrders").innerText = currentOrders;
            document.getElementById("delivered").innerText = (data.shipped || 0) + (data.delivered || 0);
            document.getElementById("cancelledCount").innerText = data.cancelled;

            if (data.lastOrder) {

                const statusMap = {
                    pending: { text: "در انتظار بررسی", bg: "#fdf3e0", color: "#a8730f" },
                    processing: { text: "در حال پردازش", bg: "#e5eefc", color: "#2b5fc4" },
                    shipped: { text: "ارسال شده", bg: "#e3f6ea", color: "#18874a" },
                    delivered: { text: "ارسال شده", bg: "#e3f6ea", color: "#18874a" },
                    cancelled: { text: "لغو شده", bg: "#fde8e8", color: "#c53030" }
                };

                const status = statusMap[data.lastOrder.status] || {
                    text: data.lastOrder.status,
                    bg: "#f1f1f1",
                    color: "#555"
                };

                const itemNames = (data.lastOrder.items || []).map(i => i.name).filter(Boolean).join("، ");

                document.getElementById("lastOrderBox").innerHTML = `
                    <div class="last-order-card">
                        <div class="order-row order-row--main">
                            <strong>سفارش #${data.lastOrder._id.slice(-8)}</strong>
                            <span class="order-row__date">${new Date(data.lastOrder.createdAt).toLocaleDateString("fa-IR")}</span>
                            ${itemNames ? `<p class="order-row__items">${itemNames}</p>` : ""}
                        </div>
                        <div class="order-row order-row--status">
                            <span class="status-badge" id="status-badge-text" style="background:${status.bg};color:${status.color}">
                                ${status.text}
                            </span>
                        </div>
                        <div class="order-row order-row--price">
                            <strong>${data.lastOrder.totalPrice.toLocaleString()} <small>تومان</small></strong>
                            <span>مبلغ نهایی</span>
                        </div>
                        <div class="order-row order-row--action">
                            <a class="track-btn" href="#" onclick="openOrder('${data.lastOrder._id}'); return false;">
                                پیگیری سفارش
                                <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M13.3586 3.72468C13.5805 3.94657 13.6007 4.29379 13.4191 4.53847L13.3586 4.60857L7.96749 9.99996L13.3586 15.3914C13.5805 15.6132 13.6007 15.9605 13.4191 16.2051L13.3586 16.2752C13.1367 16.4971 12.7895 16.5173 12.5448 16.3357L12.4747 16.2752L6.64138 10.4419C6.41949 10.22 6.39932 9.87279 6.58087 9.62812L6.64138 9.55802L12.4747 3.72468C12.7188 3.48061 13.1145 3.48061 13.3586 3.72468Z" fill="currentColor"/></svg>
                            </a>
                        </div>
                    </div>
                `;
            }

        } catch (err) {
            console.log(err);
        }
    }
};
