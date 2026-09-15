/* =====================================================================
   کامپوننت فاکتور سفارش
   با زدن دکمه "مشاهده فاکتور" تو کامپوننت سفارش‌ها باز میشه
===================================================================== */

window.Views = window.Views || {};

window.Views.invoice = {

    template: `
        <div id="invoiceBox"></div>
    `,

    init: async function (params) {

        const id = (params && params.orderId) || localStorage.getItem("selectedOrder");

        try {

            const res = await fetch(`${API_BASE}/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const order = await res.json();

            const rowsHtml = order.items.map(item => `
                <tr>
                    <td>
                        <div class="invoice-product">
                            <img src="../${item.product.image}" alt="${item.product.name}">
                            <span>${item.product.name}</span>
                        </div>
                    </td>
                    <td>${item.qty || 1}</td>
                    <td>${item.price.toLocaleString()} تومان</td>
                    <td>${((item.qty || 1) * item.price).toLocaleString()} تومان</td>
                </tr>
            `).join("");

            document.getElementById("invoiceBox").innerHTML = `
                <div class="invoice-card">

                    <div class="invoice-top">
                        <button class="invoice-print" onclick="window.print()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6v-7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                            چاپ فاکتور
                        </button>
                    </div>

                    <div class="invoice-header">
                        <div>
                            <h2>فاکتور خرید</h2>
                            <p class="invoice-order-id">شماره سفارش: #${order._id.slice(-8)}</p>
                        </div>
                        <span class="status ${order.status}">${translateStatus(order.status)}</span>
                    </div>

                    <div class="invoice-meta">
                        <div class="invoice-meta__item">
                            <span>تاریخ صدور</span>
                            <strong>${new Date(order.createdAt).toLocaleDateString("fa-IR")}</strong>
                        </div>
                        <div class="invoice-meta__item">
                            <span>وضعیت سفارش</span>
                            <strong>${translateStatus(order.status)}</strong>
                        </div>
                        <div class="invoice-meta__item">
                            <span>تعداد اقلام</span>
                            <strong>${order.items.length} کالا</strong>
                        </div>
                    </div>

                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>کالا</th>
                                <th>تعداد</th>
                                <th>قیمت واحد</th>
                                <th>جمع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>

                    <div class="invoice-total">
                        <span>مبلغ نهایی قابل پرداخت</span>
                        <strong>${order.totalPrice.toLocaleString()} تومان</strong>
                    </div>

                    <p class="invoice-footer">این فاکتور به‌صورت خودکار صادر شده و نیازی به مهر و امضا ندارد.</p>

                </div>
            `;

        } catch (err) {
            console.log(err);
        }
    }
};
