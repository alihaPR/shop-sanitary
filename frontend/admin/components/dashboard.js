// ===========================
//   Dashboard helpers
//   (همه‌چیز داخل یه IIFE محصور شده تا با متغیرهای هم‌نام
//    توی components/orders.js یا فایل‌های دیگه تداخل نکنه.
//    فقط renderDashboard در نهایت گلوبال می‌شه، چون sidebar.js
//    و admin.js مستقیم صداش می‌زنن.)
// ===========================
(function () {

const ORDER_STATUS_LABELS = {
    pending: "در انتظار",
    processing: "در حال پردازش",
    shipped: "ارسال شده",
    delivered: "تحویل شده",
    cancelled: "لغو شده"
};

const ORDER_STATUS_CLASS = {
    pending: "pending",
    processing: "processing",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled"
};

const CATEGORY_LABELS = {
    "پوشک-کودک": "پوشک کودک",
    "پوشک-بزرگسال": "پوشک بزرگسال",
    "نوار-بهداشتی": "نوار بهداشتی",
    "پنبه": "پنبه",
    "دستمال-مرطوب": "دستمال مرطوب"
};

const CATEGORY_COLORS = ["#112A46", "#6155F5", "#9F67CA", "#00C0E8", "#9FE7E7", "#F2F2F6"];

function formatToman(n) {
    return `${Math.round(n || 0).toLocaleString("fa-IR")} تومان`;
}

function formatNumber(n) {
    return (n || 0).toLocaleString("fa-IR");
}

// وقتی مبنای مقایسه (دیروز/ماه قبل) خیلی کوچیک باشه (مثلاً ۱ سفارش)،
// درصد تغییر می‌تونه عددهای عجیبی مثل 1348% بشه. این تابع نمایش رو
// روی ۹۹۹٪ سقف می‌زنه تا کارت‌ها زشت/شکسته نشن.
function formatPercentDisplay(percent) {
    const abs = Math.abs(percent || 0);
    return abs > 999 ? "999%+" : `${Math.round(abs)}%`;
}

function jalaliDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fa-IR");
}

function resolveImageUrl(imagePath) {
    if (!imagePath) return "";
    if (/^https?:\/\//.test(imagePath)) return imagePath;
    const origin = API_BASE_URL.replace(/\/api\/?$/, "");
    return imagePath.startsWith("/") ? `${origin}${imagePath}` : `${origin}/${imagePath}`;
}

function weekdayLabel(ymd) {
    // ymd => "YYYY-MM-DD"
    return new Date(ymd + "T00:00:00").toLocaleDateString("fa-IR", { weekday: "long" });
}

let revenueChartInstance = null;
let weeklyChartInstance = null;
let categoryChartInstance = null;
let dashboardData = null;

async function renderDashboard() {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/admin/stats`, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    const data = await res.json();
    dashboardData = data;

    const ordersTodayTrend = data.ordersYesterday > 0 || data.ordersToday > 0
        ? `<div class="card-trend">
             <span class="trend-value ${data.ordersTodayChangePercent >= 0 ? "up" : "down"}"> ${formatPercentDisplay(data.ordersTodayChangePercent)} ${data.ordersTodayChangePercent >= 0 ? "↑" : "↓"}</span>
             <span class="trend-label">نسبت به دیروز</span>
           </div>`
        : "";

    const revenueTrend = `<div class="card-trend">
             <span class="trend-value ${data.revenueChangePercent >= 0 ? "up" : "down"}">${formatPercentDisplay(data.revenueChangePercent)} ${data.revenueChangePercent >= 0 ? "↑" : "↓"} </span>
             <span class="trend-label">نسبت به ماه قبل</span>
           </div>`;

    document.getElementById("main-content").innerHTML = `

        <h2 class="dashboard-title">
            داشبورد مدیریت
        </h2>

        <div class="dashboard-cards">

            <div class="dashboard-card">
                <div class="card-icon card-icon-blue">

                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.1984 8.32421C5.1984 11.627 7.8864 14.315 11.1904 14.315H11.2301C12.8249 14.3092 14.3241 13.6827 15.4464 12.5499C16.5711 11.4182 17.1882 9.91554 17.1812 8.32421C17.1812 5.02137 14.4932 2.33337 11.1904 2.33337C7.8864 2.33337 5.1984 5.02137 5.1984 8.32421ZM6.9484 8.32421C6.9484 5.98621 8.85124 4.08337 11.1904 4.08337C13.5284 4.08337 15.4312 5.98621 15.4312 8.32771C15.4359 9.45471 15.0007 10.5175 14.2051 11.3167C13.4106 12.1182 12.3512 12.5604 11.2266 12.565H11.1904C8.85124 12.565 6.9484 10.6622 6.9484 8.32421Z" fill="#18A6D9"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.33301 20.4389C2.33301 24.5666 8.76834 24.5666 11.1903 24.5666C13.3813 24.5666 20.0477 24.5666 20.0477 20.4156C20.0477 16.7114 14.9925 16.2832 11.1903 16.2832C8.99934 16.2832 2.33301 16.2832 2.33301 20.4389ZM4.08301 20.4389C4.08301 18.4497 7.94817 18.0332 11.1903 18.0332C15.906 18.0332 18.2977 18.8347 18.2977 20.4156C18.2977 22.0081 15.906 22.8166 11.1903 22.8166C6.47467 22.8166 4.08301 22.0162 4.08301 20.4389Z" fill="#18A6D9"/>
                    <path d="M19.2294 12.9871C18.8001 12.9871 18.4256 12.6709 18.3638 12.2334C18.2973 11.7551 18.6298 11.3118 19.1081 11.2453C20.5641 11.0411 21.6631 9.7776 21.6654 8.30527C21.6654 6.84227 20.6178 5.60793 19.1769 5.37227C18.6998 5.29293 18.3766 4.84377 18.4548 4.3666C18.5329 3.88943 18.9844 3.5686 19.4593 3.64443C21.7518 4.0201 23.4154 5.98127 23.4154 8.30643C23.4108 10.6456 21.6643 12.6546 19.3519 12.9789C19.3111 12.9848 19.2703 12.9871 19.2294 12.9871Z" fill="#18A6D9"/>
                    <path d="M22.3935 20.9731C22.5254 21.322 22.8579 21.5378 23.2114 21.5378C23.3152 21.5378 23.4202 21.5191 23.5217 21.4806C25.2752 20.8168 25.6427 19.6653 25.6427 18.8148C25.6427 17.6726 24.9812 16.2108 21.8242 15.7383C21.3552 15.6765 20.9014 15.9973 20.829 16.4756C20.7579 16.9528 21.088 17.3985 21.5664 17.4708C23.1099 17.7006 23.8927 18.1533 23.8927 18.8148C23.8927 19.0108 23.8927 19.4693 22.901 19.845C22.4495 20.0153 22.222 20.5216 22.3935 20.9731Z" fill="#18A6D9"/>
                    </svg>

                </div>
                <div class="card-info">
                    <span>تعداد کاربران</span>
                    <h2>${formatNumber(data.userCount)}</h2>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-icon card-icon-amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.4399 7.75H3.56006M14.5 11.5C12.4253 11.5 9.5 11.5 9.5 11.5M20.5 8.25164V18.375C20.5 19.5486 19.5486 20.5 18.375 20.5H5.625C4.4514 20.5 3.5 19.5486 3.5 18.375V8.25164C3.5 7.92175 3.57681 7.59638 3.72434 7.30132L5.1845 4.381C5.45447 3.84107 6.00632 3.5 6.60999 3.5H17.39C17.9937 3.5 18.5455 3.84107 18.8155 4.381L20.2757 7.30132C20.4232 7.59638 20.5 7.92175 20.5 8.25164Z" stroke="#F7AC2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>


                </div>
                <div class="card-info">
                    <span>تعداد محصولات</span>
                    <h2>${formatNumber(data.productCount)}</h2>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-icon card-icon-pink">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.32759 8.34736L6.93059 15.5194C6.97459 16.0714 7.42559 16.4854 7.97659 16.4854H7.98059H18.8916H18.8936C19.4146 16.4854 19.8596 16.0974 19.9336 15.5824L20.8836 9.02337C20.9056 8.86736 20.8666 8.71136 20.7716 8.58536C20.6776 8.45836 20.5396 8.37636 20.3836 8.35436C20.1746 8.36236 11.5016 8.35036 6.32759 8.34736ZM7.97459 17.9854C6.65759 17.9854 5.54259 16.9574 5.43559 15.6424L4.51959 4.74836L3.01259 4.48836C2.60359 4.41636 2.33059 4.02936 2.40059 3.62036C2.47259 3.21136 2.86759 2.94536 3.26759 3.00936L5.34759 3.36936C5.68259 3.42836 5.93759 3.70636 5.96659 4.04637L6.20159 6.84736C20.4776 6.85336 20.5236 6.86037 20.5926 6.86837C21.1496 6.94937 21.6396 7.24037 21.9736 7.68836C22.3076 8.13537 22.4476 8.68637 22.3676 9.23837L21.4186 15.7964C21.2396 17.0444 20.1556 17.9854 18.8956 17.9854H18.8906H7.98259H7.97459Z" fill="#6F7B79"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.2874 12.0437H14.5154C14.1004 12.0437 13.7654 11.7077 13.7654 11.2937C13.7654 10.8797 14.1004 10.5437 14.5154 10.5437H17.2874C17.7014 10.5437 18.0374 10.8797 18.0374 11.2937C18.0374 11.7077 17.7014 12.0437 17.2874 12.0437Z" fill="#6F7B79"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.54451 20.7019C7.84551 20.7019 8.08851 20.9449 8.08851 21.2459C8.08851 21.5469 7.84551 21.7909 7.54451 21.7909C7.24251 21.7909 6.99951 21.5469 6.99951 21.2459C6.99951 20.9449 7.24251 20.7019 7.54451 20.7019Z" fill="black"/>
<mask id="mask0_1588_2392" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="6" y="20" width="3" height="2">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.99878 21.2454C6.99878 21.5474 7.24178 21.7914 7.54478 21.7914C7.84578 21.7914 8.08878 21.5474 8.08878 21.2454C8.08878 20.9444 7.84578 20.7014 7.54478 20.7014C7.24178 20.7014 6.99878 20.9444 6.99878 21.2454Z" fill="white"/>
</mask>
<g mask="url(#mask0_1588_2392)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M1.99976 26.7904H13.0888V15.7014H1.99976V26.7904Z" fill="black"/>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.54351 21.0408C7.43051 21.0408 7.33851 21.1328 7.33851 21.2458C7.33851 21.4728 7.74951 21.4728 7.74951 21.2458C7.74951 21.1328 7.65651 21.0408 7.54351 21.0408ZM7.54351 22.5408C6.82951 22.5408 6.24951 21.9598 6.24951 21.2458C6.24951 20.5318 6.82951 19.9518 7.54351 19.9518C8.25751 19.9518 8.83851 20.5318 8.83851 21.2458C8.83851 21.9598 8.25751 22.5408 7.54351 22.5408Z" fill="#6F7B79"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.8248 20.7019C19.1258 20.7019 19.3698 20.9449 19.3698 21.2459C19.3698 21.5469 19.1258 21.7909 18.8248 21.7909C18.5228 21.7909 18.2798 21.5469 18.2798 21.2459C18.2798 20.9449 18.5228 20.7019 18.8248 20.7019Z" fill="black"/>
<mask id="mask1_1588_2392" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="18" y="20" width="2" height="2">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.2798 21.2454C18.2798 21.5474 18.5228 21.7914 18.8248 21.7914C19.1248 21.7914 19.3698 21.5474 19.3698 21.2454C19.3698 20.9444 19.1248 20.7014 18.8248 20.7014C18.5228 20.7014 18.2798 20.9444 18.2798 21.2454Z" fill="white"/>
</mask>
<g mask="url(#mask1_1588_2392)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.2798 26.7904H24.3698V15.7014H13.2798V26.7904Z" fill="black"/>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.8238 21.0408C18.7118 21.0408 18.6198 21.1328 18.6198 21.2458C18.6208 21.4748 19.0308 21.4728 19.0298 21.2458C19.0298 21.1328 18.9368 21.0408 18.8238 21.0408ZM18.8238 22.5408C18.1098 22.5408 17.5298 21.9598 17.5298 21.2458C17.5298 20.5318 18.1098 19.9518 18.8238 19.9518C19.5388 19.9518 20.1198 20.5318 20.1198 21.2458C20.1198 21.9598 19.5388 22.5408 18.8238 22.5408Z" fill="#6F7B79"/>
</svg>


                </div>
                <div class="card-info">
                    <span>سفارش امروز</span>
                    <h2>${formatNumber(data.ordersToday)}</h2>
                    ${ordersTodayTrend}
                </div>
            </div>


                <div class="dashboard-card">
                <div class="card-icon card-icon-green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.12109 17.5625C6.70709 17.5625 6.37109 17.2265 6.37109 16.8125V9.95251C6.37109 9.53851 6.70709 9.20251 7.12109 9.20251C7.53509 9.20251 7.87109 9.53851 7.87109 9.95251V16.8125C7.87109 17.2265 7.53509 17.5625 7.12109 17.5625Z" fill="#05BA58"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.7881 17.5615C11.3741 17.5615 11.0381 17.2255 11.0381 16.8115V6.66846C11.0381 6.25446 11.3741 5.91846 11.7881 5.91846C12.2021 5.91846 12.5381 6.25446 12.5381 6.66846V16.8115C12.5381 17.2255 12.2021 17.5615 11.7881 17.5615Z" fill="#05BA58"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3784 17.5615C15.9644 17.5615 15.6284 17.2255 15.6284 16.8115V13.5775C15.6284 13.1635 15.9644 12.8275 16.3784 12.8275C16.7924 12.8275 17.1284 13.1635 17.1284 13.5775V16.8115C17.1284 17.2255 16.7924 17.5615 16.3784 17.5615Z" fill="#05BA58"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.064 2.5C4.292 2.5 2.5 4.397 2.5 7.335V16.165C2.5 19.103 4.292 21 7.064 21H16.436C19.209 21 21 19.103 21 16.165V7.335C21 4.397 19.209 2.5 16.436 2.5H7.064ZM16.436 22.5H7.064C3.437 22.5 1 19.954 1 16.165V7.335C1 3.546 3.437 1 7.064 1H16.436C20.063 1 22.5 3.546 22.5 7.335V16.165C22.5 19.954 20.063 22.5 16.436 22.5Z" fill="#05BA58"/>
                    </svg>

                </div>
                <div class="card-info">
                    <span>فروش این ماه</span>
                    <h2>${formatToman(data.revenueThisMonth)}</h2>
                    ${revenueTrend}
                </div>
            </div>

        </div>

        <div class="dashboard-top-row">

            <div class="chart-card">
                <div class="chart-card-header">
                    <h3>درآمد</h3>
                    <div class="period-toggle" id="revenuePeriodToggle">
                        <button data-period="today">امروز</button>
                        <button data-period="week">هفته</button>
                        <button class="active" data-period="month">ماه</button>
                    </div>
                </div>
                <div class="revenue-amount-row">
                    <span class="revenue-amount" id="revenueAmount">${formatToman(data.revenueThisMonth)}</span>
                    <span class="revenue-change" id="revenueChangeLabel">
                        <span class="trend-value ${data.revenueChangePercent >= 0 ? "up" : "down"}">${data.revenueChangePercent >= 0 ? "↑" : "↓"} ${formatPercentDisplay(data.revenueChangePercent)}</span>
                        <span class="trend-label">در مقایسه با ماه گذشته</span>
                    </span>
                </div>
                <div class="dashboard-chart-canvas-wrap">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>

            <div class="chart-card cahrt-card-2">
                <div class="chart-card-header">
                    <h3>گزارش سفارش هفتگی</h3>
                </div>
                <div class="dashboard-chart-canvas-wrap">
                    <canvas id="weeklyOrdersChart"></canvas>
                </div>
            </div>

        </div>

        <div class="dashboard-bottom-row">
        
            <div class="dashboard-panel kam-mojod ">
                <div class="dashboard-panel-header">
                    <h3>محصولات کم موجود</h3>
                <a class="dashboard-panel-header-a" href="#">
                <p>مشاهده همه</p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.0303 4.46967C16.2966 4.73594 16.3208 5.1526 16.1029 5.44621L16.0303 5.53033L9.561 12L16.0303 18.4697C16.2966 18.7359 16.3208 19.1526 16.1029 19.4462L16.0303 19.5303C15.7641 19.7966 15.3474 19.8208 15.0538 19.6029L14.9697 19.5303L7.96967 12.5303C7.7034 12.2641 7.6792 11.8474 7.89705 11.5538L7.96967 11.4697L14.9697 4.46967C15.2626 4.17678 15.7374 4.17678 16.0303 4.46967Z" fill="#0d6efd"/>
                </svg>
                </a>
                </div>
                ${renderLowStockList(data.lowStockProducts)}
            </div>


            <div class="dashboard-panel">
                <div class="dashboard-panel-header sefaresh-akhir">
                <div class=" ashboard-panel-header-text">
                <h3>سفارشات اخیر</h3>
                <p>پنج سفارش اخیر</p>
                </div>
                <a class="dashboard-panel-header-a" href="#">
                <p>مشاهده همه</p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.0303 4.46967C16.2966 4.73594 16.3208 5.1526 16.1029 5.44621L16.0303 5.53033L9.561 12L16.0303 18.4697C16.2966 18.7359 16.3208 19.1526 16.1029 19.4462L16.0303 19.5303C15.7641 19.7966 15.3474 19.8208 15.0538 19.6029L14.9697 19.5303L7.96967 12.5303C7.7034 12.2641 7.6792 11.8474 7.89705 11.5538L7.96967 11.4697L14.9697 4.46967C15.2626 4.17678 15.7374 4.17678 16.0303 4.46967Z" fill="#0d6efd"/>
                </svg>

                </a>
                </div>
                ${renderRecentOrdersTable(data.recentOrders)}
            </div>



             <div class="dashboard-panel">
                <div class="dashboard-panel-header">
                    <h3>دسته‌بندی</h3>
                </div>
                <div class="category-donut-wrap">
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="category-legend" id="categoryLegend"></div>
            </div>

        </div>

    `;

    initRevenueChart(data, "month");
    initWeeklyOrdersChart(data);
    initCategoryChart(data);

    document.getElementById("revenuePeriodToggle").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-period]");
        if (!btn) return;

        document.querySelectorAll("#revenuePeriodToggle button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        initRevenueChart(dashboardData, btn.dataset.period);
    });

}

function renderRecentOrdersTable(orders) {

    if (!orders || orders.length === 0) {
        return `<div class="dashboard-empty-note">هنوز سفارشی ثبت نشده است.</div>`;
    }

    const rows = orders.map(order => {
        const statusKey = order.status || "pending";
        const statusLabel = ORDER_STATUS_LABELS[statusKey] || statusKey;
        const statusClass = ORDER_STATUS_CLASS[statusKey] || "pending";
        const customerName = order.user?.name || "کاربر حذف‌شده";
        const orderCode = "#" + String(order._id).slice(-6).toUpperCase();

        return `
            <tr>
                <td>${jalaliDate(order.createdAt)}</td>
                <td><span class="recent-order-status ${statusClass}">${statusLabel}</span></td>
                <td>${formatToman(order.totalPrice)}</td>
                <td>${customerName}</td>
                <td>${orderCode}</td>
            </tr>
        `;
    }).join("");

    return `
        <table class="recent-orders-table">
            <thead>
                <tr>
                    <th>تاریخ</th>
                    <th>وضعیت</th>
                    <th>مبلغ</th>
                    <th>مشتری</th>
                    <th>کد سفارش</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;

}

function renderLowStockList(products) {

    if (!products || products.length === 0) {
        return `<div class="dashboard-empty-note">همه محصولات موجودی کافی دارند.</div>`;
    }

    const items = products.map(p => {
        const isOut = p.stock === 0;
        return `
            <div class="low-stock-item">
                <div class="low-stock-info">
                <img class="low-stock-thumb" src="${resolveImageUrl(p.image)}" alt="${p.name}" onerror="this.style.visibility='hidden'">
                <div class="low-stock-text">
                <b>${p.name}</b>
                <span>موجودی: ${formatNumber(p.stock)}</span>
                </div>
                </div>
                <span class="low-stock-badge ${isOut ? "out" : "low"}">${isOut ? "ناموجود" : "کم موجود"}</span>
            </div>
        `;
    }).join("");

    return `<div class="low-stock-list">${items}</div>`;

}

function initRevenueChart(data, period) {

    let labels = [];
    let values = [];
    let counts = [];
    let periodTotal = 0;

    if (period === "today") {
        const byHour = new Map((data.revenueHourly || []).map(i => [i._id, i]));
        labels = Array.from({ length: 24 }, (_, h) => `${h}:00`);
        values = Array.from({ length: 24 }, (_, h) => byHour.get(h)?.total || 0);
        counts = Array.from({ length: 24 }, (_, h) => byHour.get(h)?.count || 0);
    } else if (period === "week") {
        labels = (data.revenueDaily || []).map(i => weekdayLabel(i._id));
        values = (data.revenueDaily || []).map(i => i.total);
        counts = (data.revenueDaily || []).map(i => i.count || 0);
    } else {
        labels = (data.monthlyRevenue || []).map(i => i.label);
        values = (data.monthlyRevenue || []).map(i => i.total);
        counts = (data.monthlyRevenue || []).map(i => i.count || 0);
    }

    periodTotal = values.reduce((a, b) => a + b, 0);

    document.getElementById("revenueAmount").textContent = formatToman(periodTotal);

    const changeLabel = document.getElementById("revenueChangeLabel");
    if (period === "month") {
        changeLabel.style.display = "";
        changeLabel.className = `revenue-change`;
        changeLabel.innerHTML = `<span class="trend-value ${data.revenueChangePercent >= 0 ? "up" : "down"}">${data.revenueChangePercent >= 0 ? "↑" : "↓"} ${formatPercentDisplay(data.revenueChangePercent)}</span><span class="trend-label">در مقایسه با ماه گذشته</span>`;
    } else {
        changeLabel.style.display = "none";
    }

    const ctx = document.getElementById("revenueChart");

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "درآمد",
                data: values,
                backgroundColor: "#289FB7",
                borderRadius: 6,
                maxBarThickness: 34
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const idx = items[0].dataIndex;
                            if (period === "today") {
                                const h = idx;
                                return `ساعت ${h}:00 تا ${h}:59`;
                            }
                            return items[0].label;
                        },
                        label: (ctx) => `مبلغ: ${formatToman(ctx.parsed.y)}`,
                        afterLabel: (ctx) => {
                            const c = counts[ctx.dataIndex] || 0;
                            return c > 0 ? `${formatNumber(c)} سفارش` : "بدون سفارش";
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        font: { size: 11 }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (v) => v.toLocaleString("fa-IR")
                    }
                }
            }
        }
    });

}

function initWeeklyOrdersChart(data) {

    const ctx = document.getElementById("weeklyOrdersChart");

    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    weeklyChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: (data.weeklyOrders || []).map(i => weekdayLabel(i._id)),
            datasets: [{
                label: "تعداد سفارش",
                data: (data.weeklyOrders || []).map(i => i.count),
                backgroundColor: "#289FB7",
                borderRadius: 6,
                maxBarThickness: 28
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        font: { size: 11 }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });

}

function initCategoryChart(data) {

    const stats = data.categoryStats || [];
    const total = stats.reduce((a, b) => a + b.count, 0);

    const ctx = document.getElementById("categoryChart");

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: stats.map(i => CATEGORY_LABELS[i._id] || i._id),
            datasets: [{
                data: stats.map(i => i.count),
                backgroundColor: stats.map((_, idx) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length]),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: { display: false }
            }
        }
    });

    const legend = document.getElementById("categoryLegend");
    legend.innerHTML = stats.map((i, idx) => {
        const percent = total > 0 ? Math.round((i.count / total) * 100) : 0;
        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
        const label = CATEGORY_LABELS[i._id] || i._id;
        return `
            <div class="category-legend-item">
                <div class="category-legend-label">
                    <span class="category-legend-dot" style="background:${color}"></span>
                    <span>${label}</span>
                </div>
                <span class="category-legend-percent">${percent}%</span>
            </div>
        `;
    }).join("");

}

window.renderDashboard = renderDashboard;

})();