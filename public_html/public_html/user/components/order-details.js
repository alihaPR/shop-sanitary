/* =====================================================================
   کامپوننت جزئیات سفارش
===================================================================== */

window.Views = window.Views || {};

window.Views["order-details"] = {

    template: `
        <div id="orderDetails"></div>
    `,

    init: async function (params) {

        const id = (params && params.orderId) || localStorage.getItem("selectedOrder");

        try {

            const res = await fetch(`${API_BASE}/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const order = await res.json();

            document.getElementById("orderDetails").innerHTML = `
                <div class="order-details-card">

                    <div class="order-details-top">
                        <h2>سفارش #${order._id.slice(-8)}</h2>
                        <span class="status ${order.status}">${translateStatus(order.status)}</span>
                    </div>

                    <div class="order-details-info">
                        <div class="info-box">
                            <span>تاریخ ثبت</span>
                            <strong>${new Date(order.createdAt).toLocaleDateString("fa-IR")}</strong>
                        </div>
                        <div class="info-box">
                            <span>مبلغ کل</span>
                            <strong>${order.totalPrice.toLocaleString()} تومان</strong>
                        </div>
                    </div>

                    <div class="order-products">
                        ${order.items.map(item => `
                            <div class="product-row">
                                <img src="../${item.product.image}" alt="${item.product.name}">
                                <div class="product-info">
                                    <h4>${item.product.name}</h4>
                                    <div class="product-meta">
                                        <span>تعداد: ${item.qty || 1}</span>
                                        <span>قیمت: ${item.price.toLocaleString()} تومان</span>
                                    </div>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;

        } catch (err) {
            console.log(err);
        }
    }
};
