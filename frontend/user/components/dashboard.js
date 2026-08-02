/* =====================================================================
   کامپوننت داشبورد
===================================================================== */

window.Views = window.Views || {};

window.Views.dashboard = {

    template: `
        <div class="cards">

            <div class="card">
                <div class="cart-svg svg-1">
                    <svg width="24" height="24" viewBox="0 0 27 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M25.375 12.7808H0.875C0.392 12.7808 0 12.3888 0 11.9058C0 11.4228 0.392 11.0308 0.875 11.0308H25.375C25.858 11.0308 26.25 11.4228 26.25 11.9058C26.25 12.3888 25.858 12.7808 25.375 12.7808Z" fill="#6F7B79" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M23.1933 7.86917C22.7103 7.86917 22.3183 7.47717 22.3183 6.99417V5.22783C22.3183 3.311 20.7573 1.75 18.8381 1.75H17.4323C16.9493 1.75 16.5573 1.358 16.5573 0.875C16.5573 0.392 16.9493 0 17.4323 0H18.8381C21.7221 0 24.0683 2.34617 24.0683 5.22783V6.99417C24.0683 7.47717 23.6763 7.86917 23.1933 7.86917Z" fill="#6F7B79" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M3.05688 7.86917C2.57388 7.86917 2.18188 7.47717 2.18188 6.99417V5.22783C2.18188 2.34617 4.52805 0 7.41205 0H8.85405C9.33705 0 9.72905 0.392 9.72905 0.875C9.72905 1.358 9.33705 1.75 8.85405 1.75H7.41205C5.49288 1.75 3.93188 3.311 3.93188 5.22783V6.99417C3.93188 7.47717 3.53988 7.86917 3.05688 7.86917Z" fill="#6F7B79" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M18.8382 21.8873H17.4324C16.9494 21.8873 16.5574 21.4953 16.5574 21.0123C16.5574 20.5293 16.9494 20.1373 17.4324 20.1373H18.8382C20.7574 20.1373 22.3184 18.5763 22.3184 16.6583V11.9042C22.3184 11.4212 22.7104 11.0292 23.1934 11.0292C23.6764 11.0292 24.0684 11.4212 24.0684 11.9042V16.6583C24.0684 19.5412 21.7222 21.8873 18.8382 21.8873Z" fill="#6F7B79" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M8.85381 21.8873H7.41181C4.52781 21.8873 2.18164 19.5412 2.18164 16.6583V11.9042C2.18164 11.4212 2.57364 11.0292 3.05664 11.0292C3.53964 11.0292 3.93164 11.4212 3.93164 11.9042V16.6583C3.93164 18.5763 5.49264 20.1373 7.41181 20.1373H8.85381C9.33681 20.1373 9.72881 20.5293 9.72881 21.0123C9.72881 21.4953 9.33681 21.8873 8.85381 21.8873Z" fill="#6F7B79" />
                    </svg>
                </div>
                <div class="cart-content">
                    <h3>سفارش‌ها</h3>
                    <p>سفارش های جاری</p>
                </div>
                <span id="currentOrders" class="dashboard-cards__number">0</span>
            </div>

            <div class="card">
                <div class="cart-svg svg-2">
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 12.8333L14 16.3333L25.6667 4.66667M24.5 14V22.1667C24.5 22.7855 24.2542 23.379 23.8166 23.8166C23.379 24.2542 22.7855 24.5 22.1667 24.5H5.83333C5.21449 24.5 4.621 24.2542 4.18342 23.8166C3.74583 23.379 3.5 22.7855 3.5 22.1667V5.83333C3.5 5.21449 3.74583 4.621 4.18342 4.18342C4.621 3.74583 5.21449 3.5 5.83333 3.5H18.6667" stroke="#17C964" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="cart-content">
                    <h3>تحویل شده</h3>
                    <p>تعداد تحویل شده ها</p>
                </div>
                <span id="delivered" class="dashboard-cards__number">0</span>
            </div>

            <div class="card">
                <div class="cart-svg svg-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M9.60253 15.1367C9.41053 15.1367 9.21853 15.0637 9.07253 14.9167C8.77953 14.6237 8.77953 14.1497 9.07253 13.8567L13.8645 9.06472C14.1575 8.77172 14.6315 8.77172 14.9245 9.06472C15.2175 9.35772 15.2175 9.83172 14.9245 10.1247L10.1325 14.9167C9.98653 15.0637 9.79453 15.1367 9.60253 15.1367Z" fill="#F76699" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M14.3965 15.1396C14.2045 15.1396 14.0125 15.0666 13.8665 14.9196L9.07046 10.1226C8.77746 9.82965 8.77746 9.35565 9.07046 9.06265C9.36446 8.76965 9.83846 8.76965 10.1305 9.06265L14.9265 13.8596C15.2195 14.1526 15.2195 14.6266 14.9265 14.9196C14.7805 15.0666 14.5875 15.1396 14.3965 15.1396Z" fill="#F76699" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M7.665 3.5C5.135 3.5 3.5 5.233 3.5 7.916V16.084C3.5 18.767 5.135 20.5 7.665 20.5H16.333C18.864 20.5 20.5 18.767 20.5 16.084V7.916C20.5 5.233 18.864 3.5 16.334 3.5H7.665ZM16.333 22H7.665C4.276 22 2 19.622 2 16.084V7.916C2 4.378 4.276 2 7.665 2H16.334C19.723 2 22 4.378 22 7.916V16.084C22 19.622 19.723 22 16.333 22Z" fill="#F76699" />
                    </svg>
                </div>
                <div class="cart-content">
                    <h3> لغو شده</h3>
                    <p>تعداد لغو شده ها</p>
                </div>
                <span id="cancelledCount" class="dashboard-cards__number">0</span>
            </div>

        </div>

        <div class="last-order">
            <div class="last-order__title">
                <h2>آخرین سفارش</h2>
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

            const currentOrders = data.pending + data.processing + data.shipped;

            document.getElementById("currentOrders").innerText = currentOrders;
            document.getElementById("delivered").innerText = data.delivered;
            document.getElementById("cancelledCount").innerText = data.cancelled;

            if (data.lastOrder) {

                const statusMap = {
                    pending: { text: "در انتظار بررسی", color: "#f59e0b" },
                    processing: { text: "در حال پردازش", color: "#3b82f6" },
                    shipped: { text: "ارسال شده", color: "#8b5cf6" },
                    delivered: { text: "تحویل شده", color: "#22c55e" },
                    cancelled: { text: "لغو شده", color: "#ef4444" }
                };

                const status = statusMap[data.lastOrder.status] || {
                    text: data.lastOrder.status,
                    color: "#f8f4f4"
                };

                document.getElementById("lastOrderBox").innerHTML = `
                    <div class="last-order-card">
                        <div class="order-row">
                            <span>کد سفارش</span>
                            <strong>#${data.lastOrder._id.slice(-8)}</strong>
                        </div>
                        <div class="order-row">
                            <span>وضعیت</span>
                            <span class="status-badge" id="status-badge-text" style="background:${status.color}">
                                ${status.text}
                            </span>
                        </div>
                        <div class="order-row">
                            <span>مبلغ</span>
                            <strong>${data.lastOrder.totalPrice.toLocaleString()} تومان</strong>
                        </div>
                        <div class="order-row">
                            <span>تاریخ</span>
                            <strong>${new Date(data.lastOrder.createdAt).toLocaleDateString("fa-IR")}</strong>
                        </div>
                    </div>
                `;
            }

        } catch (err) {
            console.log(err);
        }
    }
};
