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
                    <h2>سفارش #${order._id.slice(-8)}</h2>
                    <br>
                    <p>
                        <b>وضعیت:</b>
                        <span class="status ${order.status}">${translateStatus(order.status)}</span>
                    </p>
                    <br>
                    <p>
                        <b>تاریخ:</b>
                        ${new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                    <br>
                    <p>
                        <b>مبلغ کل:</b>
                        ${order.totalPrice.toLocaleString()} تومان
                    </p>
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
