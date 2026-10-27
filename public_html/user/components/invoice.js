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

            const issueDate = new Date(order.createdAt || Date.now()).toLocaleDateString("fa-IR");

            const rowsHtml = (order.items || []).map((item, idx) => {

                const qty = item.qty || 1;
                const unitPrice = item.price || 0;

                return `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${item.product?.name || item.name || "محصول"}</td>
                        <td>${qty}</td>
                        <td>${unitPrice.toLocaleString()} تومان</td>
                        <td>${(unitPrice * qty).toLocaleString()} تومان</td>
                    </tr>
                `;

            }).join("");

            document.getElementById("invoiceBox").innerHTML = `
                <div class="uinv-top">
                    <button class="invoice-print" onclick="window.print()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6v-7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                        </svg>
                        چاپ فاکتور
                    </button>
                </div>

                <div class="uinv-sheet" dir="rtl">

                    <div class="uinv-brand-header">
                        <div class="uinv-brand">
                            <h1>نرم سنتر</h1>
                            <span>فاکتور فروش</span>
                        </div>

                        <div class="uinv-meta">
                            <p><b>شماره فاکتور:</b> #${order._id.slice(-6)}</p>
                            <p><b>تاریخ صدور:</b> ${issueDate}</p>
                        </div>
                    </div>

                    <div class="uinv-parties">

                        <div class="uinv-party-box">
                            <h4>اطلاعات خریدار</h4>
                            <p><b>نام و نام خانوادگی:</b> ${order.user?.name || "-"}</p>
                            <p><b>شماره تماس:</b> ${order.shippingAddress?.phone || order.user?.phone || "-"}</p>
                        </div>

                        <div class="uinv-party-box">
                            <h4>اطلاعات ارسال</h4>
                            <p><b>استان و شهر:</b> ${order.shippingAddress?.province ? order.shippingAddress.province + " ، " : ""}${order.shippingAddress?.city || "-"}</p>
                            <p><b>کد پستی:</b> ${order.shippingAddress?.postalCode || "-"}</p>
                            <p><b>آدرس:</b> ${order.shippingAddress?.address || "-"}</p>
                        </div>

                    </div>

                    <table class="uinv-items">
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
                            ${rowsHtml}
                        </tbody>
                    </table>

                    <div class="uinv-summary">
                        <div class="uinv-summary-box">
                            <span>جمع کل قابل پرداخت</span>
                            <b>${(order.totalPrice || 0).toLocaleString()} تومان</b>
                        </div>
                    </div>

                    <div class="uinv-footer">
                        <p class="uinv-thanks">از خرید شما سپاسگزاریم</p>

                        <div class="uinv-signatures">
                            <div class="uinv-signature-box"><span>امضا و مهر فروشنده</span></div>
                            <div class="uinv-signature-box"><span>امضای گیرنده</span></div>
                        </div>
                    </div>

                </div>
            `;

        } catch (err) {
            console.log(err);
        }
    }
};