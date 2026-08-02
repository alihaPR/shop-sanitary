/* =====================================================================
   هسته اصلی پنل کاربری.
   این فایل فقط مسئول موارد مشترکه: توکن، آدرس API، روتر بین بخش‌ها،
   کلیک‌های ساید‌بار و خروج از حساب.
   منطق هر بخش (داشبورد/سفارش‌ها/پروفایل/جزئیات سفارش) داخل پوشه
   components هست و از طریق window.Views ثبت میشه.
===================================================================== */

const API_BASE = "http://localhost:5000/api";
const token = localStorage.getItem("token");

/* هر فایل داخل components/ یک ویو رو اینجا ثبت می‌کنه:
   Views.dashboard = { template: "...", init: async function(params) {...} } */
window.Views = window.Views || {};

const viewContainer = document.getElementById("viewContainer");

/* =========================================================
   روتر: سوییچ بین بخش‌ها بدون رفرش صفحه
========================================================= */

function setActiveSidebarItem(view) {
    document.querySelectorAll(".dashboard-ul__item[data-view]").forEach(li => {
        li.classList.toggle("active", li.dataset.view === view);
    });
}

function navigateTo(view, params = {}) {

    const viewDef = window.Views[view];

    if (!viewDef) {
        console.error(`ویو "${view}" هنوز ثبت نشده (فایلش رو تو components/ اضافه کن).`);
        return;
    }

    viewContainer.innerHTML = viewDef.template;
    setActiveSidebarItem(view);

    if (typeof viewDef.init === "function") {
        viewDef.init(params);
    }
}

/* کلیک روی آیتم‌های ساید‌بار */
document.querySelectorAll(".dashboard-ul__item[data-view]").forEach(li => {
    li.addEventListener("click", () => navigateTo(li.dataset.view));
});

/* کلیک روی لینک‌هایی که داخل یک ویو، ویو دیگه رو باز می‌کنن
   (مثلا "مشاهده همه" تو داشبورد -> میره به سفارش‌ها) */
viewContainer.addEventListener("click", (e) => {
    const link = e.target.closest("[data-view-link]");
    if (link) {
        e.preventDefault();
        navigateTo(link.dataset.viewLink);
    }
});

/* خروج از حساب */
document.getElementById("logout").onclick = () => {
    localStorage.removeItem("token");
    location.href = "../login.html";
};

/* باز کردن جزئیات یک سفارش خاص - از کامپوننت سفارش‌ها صدا زده میشه */
function openOrder(id) {
    localStorage.setItem("selectedOrder", id);
    navigateTo("order-details", { orderId: id });
}

/* ترجمه وضعیت سفارش - مشترک بین سفارش‌ها و جزئیات سفارش */
function translateStatus(status) {
    switch (status) {
        case "pending": return "در انتظار";
        case "processing": return "درحال پردازش";
        case "shipped": return "ارسال شده";
        case "delivered": return "تحویل شده";
        case "cancelled": return "لغو شده";
        default: return status;
    }
}

/* =========================================================
   نام کاربر بالای ساید‌بار
========================================================= */

async function loadSidebarUser() {
    try {
        const res = await fetch(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = await res.json();
        document.getElementById("userName").textContent = user.name;
    } catch (err) {
        console.log(err);
    }
}

/* =========================================================
   شروع برنامه - بعد از اینکه همه کامپوننت‌ها لود و ثبت شدن
   (DOMContentLoaded بعد از اجرای همه اسکریپت‌های صفحه اجرا میشه)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadSidebarUser();
    navigateTo("dashboard");
});
