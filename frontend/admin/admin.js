async function checkAdminAccess() {

    const token = localStorage.getItem("token");

    if (!token) {

        window.location.href = "../login.html";
        return;

    }

    try {

        const res = await fetch(`${API_BASE_URL}/auth/profile`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        if (!res.ok) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "../login.html";
            return;

        }

        const user = await res.json();

        if (user.role !== "admin") {

            alert("شما دسترسی به پنل مدیریت ندارید.");

            window.location.href = "../index.html";

            return;

        }

    } catch (err) {

        console.error(err);

        window.location.href = "../login.html";

    }

}

// checkAdminAccess();
document.addEventListener("DOMContentLoaded", async () => {

    await checkAdminAccess();

    // فقط اگه صفحه به‌تازگی (کمتر از ۵ ثانیه پیش) رفرش شده باشه،
    // همون صفحه‌ی قبلی برمی‌گرده — تا این تدبیر جلوی افتادن ناخواسته
    // به داشبورد رو (بعد از اون باگ رفرش) بگیره، بدون اینکه هر بار
    // که پنل رو دوباره باز می‌کنی، به‌جای داشبورد یه صفحه‌ی دیگه بیاد.
    const RECENT_RELOAD_WINDOW_MS = 5000;

    let lastPage = "dashboard";
    const stored = sessionStorage.getItem("adminActivePage");

    if (stored) {
        try {
            const { page, ts } = JSON.parse(stored);
            if (page && Date.now() - ts < RECENT_RELOAD_WINDOW_MS) {
                lastPage = page;
            }
        } catch (e) {
            // مقدار قدیمی/نامعتبر - نادیده گرفته میشه
        }
    }

    const pageRenderers = {
        dashboard: () => renderDashboard(),
        products: () => renderProducts(),
        orders: () => renderOrders(),
        users: () => renderUsers(),
        settings: () => renderSettings()
    };

    const renderFn = pageRenderers[lastPage] || pageRenderers.dashboard;

    document.querySelectorAll(".menu-item").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === lastPage);
    });

    renderFn();

});