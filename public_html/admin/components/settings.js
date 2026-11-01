// ===========================
//   Settings + Help
//   تنظیمات ظاهری پنل (تم، تراکم، منو، اعلان‌ها) و صفحه‌ی راهنما.
//   همه‌ی تنظیمات فقط روی همین مرورگر ذخیره می‌شوند (localStorage).
// ===========================
(function () {

    const { icon } = window.AdminUI;
    const kbdKey = window.AdminUI.isMac ? "⌘" : "Ctrl";

    function switchRow(id, title, desc, on) {
        return `
            <div class="setting-row">
                <div class="setting-text"><b>${title}</b><small>${desc}</small></div>
                <button class="switch ${on ? "on" : ""}" id="${id}" type="button" role="switch" aria-checked="${on}" aria-label="${title}"><i></i></button>
            </div>`;
    }

    function renderSettings() {

        const theme = window.AdminUI.theme.pref();
        const compact = localStorage.getItem("adminCompact") === "1";
        const collapsed = localStorage.getItem("adminSidebarCollapsed") === "1";
        const badge = localStorage.getItem("adminNotifBadge") !== "0";

        document.getElementById("main-content").innerHTML = `
            <div class="page-narrow">
                <div class="page-head">
                    <h2>تنظیمات پنل</h2>
                    <p>ظاهر و رفتار پنل را مطابق سلیقه‌ی خودتان تنظیم کنید. این تنظیمات فقط روی همین مرورگر اعمال می‌شود.</p>
                </div>

                <section class="card setting-card">
                    <header class="card-head"><h3>${icon("sun", 18)}ظاهر</h3></header>

                    <div class="setting-row">
                        <div class="setting-text"><b>حالت نمایش</b><small>روشن، تیره یا هماهنگ با سیستم‌عامل</small></div>
                        <div class="segmented" id="themeSeg">
                            <button type="button" data-theme="light" class="${theme === "light" ? "active" : ""}">روشن</button>
                            <button type="button" data-theme="dark" class="${theme === "dark" ? "active" : ""}">تیره</button>
                            <button type="button" data-theme="system" class="${theme === "system" ? "active" : ""}">سیستم</button>
                        </div>
                    </div>

                    ${switchRow("setCompact", "نمایش فشرده", "فاصله‌ها کمتر می‌شود تا اطلاعات بیشتری در صفحه جا شود", compact)}
                    ${switchRow("setCollapsed", "جمع‌شده بودن منوی کناری", "فقط آیکن‌ها در منوی کناری نمایش داده می‌شود", collapsed)}
                </section>

                <section class="card setting-card">
                    <header class="card-head"><h3>${icon("bell", 18)}اعلان‌ها</h3></header>

                    ${switchRow("setBadge", "نشان تعداد روی زنگ", "تعداد سفارش‌های در انتظار و محصولات کم‌موجود روی آیکن زنگ نمایش داده شود", badge)}

                    <div class="setting-row">
                        <div class="setting-text"><b>به‌روزرسانی اعلان‌ها</b><small>اعلان‌ها هر ۳ دقیقه خودکار به‌روز می‌شوند</small></div>
                        <button class="btn btn-outline btn-sm" id="refreshNotif" type="button">به‌روزرسانی</button>
                    </div>
                </section>

                <section class="card setting-card">
                    <header class="card-head"><h3>${icon("store", 18)}فروشگاه و حساب</h3></header>

                    <div class="setting-row">
                        <div class="setting-text"><b>مشاهده فروشگاه</b><small>رفتن به صفحه‌ی اصلی سایت</small></div>
                        <a class="btn btn-outline btn-sm" href="../index.html">${icon("external", 15)}باز کردن</a>
                    </div>

                    <div class="setting-row">
                        <div class="setting-text"><b>خروج از حساب</b><small>برای ورود دوباره باید رمز عبور را وارد کنید</small></div>
                        <button class="btn btn-danger btn-sm" id="settingsLogout" type="button">${icon("logout", 15)}خروج</button>
                    </div>
                </section>
            </div>
        `;

        document.getElementById("themeSeg").addEventListener("click", (e) => {
            const b = e.target.closest("[data-theme]");
            if (!b) return;
            window.AdminUI.theme.set(b.dataset.theme);
            document.querySelectorAll("#themeSeg button").forEach(x => x.classList.toggle("active", x === b));
        });

        function bindSwitch(id, handler) {
            const el = document.getElementById(id);
            el.addEventListener("click", () => {
                const on = !el.classList.contains("on");
                el.classList.toggle("on", on);
                el.setAttribute("aria-checked", on ? "true" : "false");
                handler(on);
            });
        }

        bindSwitch("setCompact", (on) => {
            localStorage.setItem("adminCompact", on ? "1" : "0");
            window.AdminUI.theme.applyDensity();
        });

        bindSwitch("setCollapsed", (on) => window.setSidebarCollapsed(on));

        bindSwitch("setBadge", (on) => {
            localStorage.setItem("adminNotifBadge", on ? "1" : "0");
            if (window.updateNotificationBadge) window.updateNotificationBadge();
        });

        document.getElementById("refreshNotif").addEventListener("click", async () => {
            await window.refreshNotifications();
            window.AdminUI.toast("اعلان‌ها به‌روز شد");
        });

        document.getElementById("settingsLogout").addEventListener("click", () => {
            document.getElementById("logoutBtn").click();
        });
    }

    function renderHelp() {

        const shortcuts = [
            [`${kbdKey} + K`, "باز کردن جستجوی سراسری"],
            ["/", "باز کردن جستجوی سراسری (وقتی در فیلد متنی نیستید)"],
            ["↑  ↓  Enter", "حرکت بین نتایج جستجو و انتخاب"],
            ["Esc", "بستن جستجو و منوهای باز"]
        ];

        const guide = [
            ["grid", "داشبورد", "آمار امروز و ماه، نمودار فروش، دسته‌بندی‌ها، فعالیت‌های اخیر و پرفروش‌ترین محصولات."],
            ["box", "محصولات", "افزودن، ویرایش، حذف و به‌روزرسانی موجودی محصولات."],
            ["cart", "سفارش‌ها", "بررسی سفارش‌ها، تغییر وضعیت، ثبت پرداخت و چاپ فاکتور. از زیرمنو می‌توانید مستقیم یک وضعیت را فیلتر کنید."],
            ["users", "کاربران", "مشاهده کاربران، تغییر نقش و حذف حساب."]
        ];

        document.getElementById("main-content").innerHTML = `
            <div class="page-narrow">
                <div class="page-head">
                    <h2>راهنمای پنل</h2>
                    <p>میانبرها و توضیح کوتاه هر بخش.</p>
                </div>

                <section class="card setting-card">
                    <header class="card-head"><h3>${icon("keyboard", 18)}میانبرهای صفحه‌کلید</h3></header>
                    ${shortcuts.map(([k, d]) => `
                        <div class="setting-row">
                            <div class="setting-text"><b>${d}</b></div>
                            <kbd class="kbd-chip" dir="ltr">${k}</kbd>
                        </div>`).join("")}
                </section>

                <section class="card setting-card">
                    <header class="card-head"><h3>${icon("help", 18)}بخش‌های پنل</h3></header>
                    ${guide.map(([ico, t, d]) => `
                        <div class="setting-row">
                            <span class="act-ico tone-indigo">${icon(ico, 18)}</span>
                            <div class="setting-text grow"><b>${t}</b><small>${d}</small></div>
                        </div>`).join("")}
                </section>
            </div>
        `;
    }

    window.renderSettings = renderSettings;
    window.renderHelp = renderHelp;

})();
