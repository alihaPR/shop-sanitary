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

        // عدد انگلیسی → فارسی، با جداکننده دلخواه
        const faDigits = (str) => String(str).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
        const money = (n, sep) => faDigits((Number(n) || 0).toLocaleString("en").replace(/,/g, sep || ","));

        try {

            const res = await fetch(`${API_BASE}/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const order = await res.json();

            const addr = order.shippingAddress || {};

            const dateText = new Date(order.createdAt).toLocaleDateString("fa-IR-u-nu-latn", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            const addressText = [
                addr.province,
                addr.city,
                addr.address,
                addr.plaque ? "پلاک " + addr.plaque : "",
                addr.unit ? "واحد " + addr.unit : ""
            ].filter(Boolean).join("، ");

            const shippingText = order.shippingCost > 0
                ? `${money(order.shippingCost, "،")} تومان`
                : "رایگان";

            const rowsHtml = (order.items || []).map(item => {

                const qty = item.qty || 1;
                const unit = item.price || 0;
                const name = item.product?.name || item.name || "محصول";
                const image = item.product?.image || item.image || "";

                return `
                    <div class="od-row">
                        <div class="od-prod">
                            <img src="../${image}" alt="${name}">
                            <span>${name}</span>
                        </div>
                        <div class="od-cell" data-label="تعداد">${faDigits(qty)}</div>
                        <div class="od-cell" data-label="قیمت واحد">${money(unit)} تومان</div>
                        <div class="od-cell" data-label="جمع">${money(unit * qty)} تومان</div>
                    </div>
                `;

            }).join("");

            document.getElementById("orderDetails").innerHTML = `

                <div class="od-card">

                    <div class="od-head">

                        <div class="od-title">
                            <button type="button" class="od-back" onclick="navigateTo('orders')" aria-label="بازگشت">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M5 12h14M13 6l6 6-6 6"/>
                                </svg>
                            </button>
                            <h2>جزئیات سفارش</h2>
                        </div>

                        <a class="od-invoice-link" href="javascript:void(0)" onclick="openInvoice('${order._id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="4" y="3" width="16" height="18" rx="4"/>
                                <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>
                            </svg>
                            مشاهده فاکتور
                        </a>

                    </div>

                    <div class="od-line">
                        <div class="od-item"><span>کد پیگیری سفارش</span><strong>#${order._id.slice(-8)}</strong></div>
                        <div class="od-item"><span>تاریخ ثبت سفارش</span><strong>${dateText}</strong></div>
                    </div>

                    <div class="od-line">
                        <div class="od-item"><span>تحویل گیرنده</span><strong>${order.user?.name || "-"}</strong></div>
                        <div class="od-item"><span>شماره موبایل</span><strong>${order.user?.phone || "-"}</strong></div>
                        <div class="od-item od-item--grow"><span>آدرس</span><strong>${addressText || "-"}</strong></div>
                    </div>

                    <div class="od-line">
                        <div class="od-item"><span>مبلغ</span><strong>${money(order.totalPrice, "،")} تومان</strong></div>
                        <div class="od-item"><span>هزینه ارسال</span><strong>${shippingText}</strong></div>
                    </div>

                </div>

                <div class="od-card od-card--items">

                    <div class="od-table-head">
                        <span>کالا</span>
                        <span>تعداد</span>
                        <span>قیمت واحد</span>
                        <span>جمع</span>
                    </div>

                    <div class="od-rows">
                        ${rowsHtml}
                    </div>

                </div>
            `;

        } catch (err) {
            console.log(err);
        }
    }
};