/* =====================================================================
   card-payment.js — صفحه‌ی پرداخت کارت‌به‌کارت
   نمایش شماره کارت، تایمر مهلت پرداخت و آپلود رسید
   ===================================================================== */
(function () {
    "use strict";

    const token = localStorage.getItem("token");
    const orderId = new URLSearchParams(location.search).get("orderId");
    const root = document.getElementById("cpRoot");

    const fa = n => Number(n).toLocaleString("fa-IR");
    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const toast = (m, t) => window.showAppToast ? window.showAppToast(m, t || "info") : alert(m);

    let timerId = null;

    if (!token) { location.href = "login.html"; return; }

    function message(icon, title, text, extra) {
        root.innerHTML = `
            <div class="cp-state cp-state--${icon}">
                <h1>${title}</h1>
                <p>${text}</p>
                ${extra || ""}
                <a class="cp-btn cp-btn--ghost" href="./user/index.html">مشاهده سفارش‌های من</a>
            </div>`;
    }

    async function api(path, opts) {
        const o = opts || {};
        const res = await fetch(API_BASE_URL + path, Object.assign({}, o, {
            headers: Object.assign({}, o.headers || {}, { Authorization: "Bearer " + token })
        }));
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "خطا در ارتباط با سرور");
        return data;
    }

    async function load() {
        if (!orderId) return message("error", "سفارش پیدا نشد", "شناسه‌ی سفارش نامعتبر است.");
        try {
            const [order, info] = await Promise.all([
                api("/orders/" + orderId),
                api("/orders/card-info")
            ]);
            render(order, info);
        } catch (err) {
            message("error", "خطا", esc(err.message));
        }
    }

    function render(order, info) {
        clearInterval(timerId);

        if (order.paymentMethod !== "card")
            return message("error", "این سفارش کارت‌به‌کارت نیست", "");

        if (order.status === "cancelled" || order.paymentStatus === "expired")
            return message("error", "سفارش لغو شد", "مهلت پرداخت این سفارش تمام شده است. می‌توانید دوباره سفارش ثبت کنید.");

        if (order.paymentStatus === "paid")
            return message("success", "پرداخت تأیید شد", "سفارش شما در حال پردازش است. از خرید شما سپاسگزاریم.");

        if (order.paymentStatus === "receipt_submitted")
            return message("wait", "رسید شما دریافت شد",
                "پس از بررسی و تأیید پرداخت، سفارش شما پردازش می‌شود. وضعیت را از پنل کاربری می‌توانید ببینید.");

        const goods = order.totalPrice || 0;
        const shipping = order.shippingCost || 0;
        const payable = goods + shipping;
        const code = order._id.slice(-8);
        const card = String(info.cardNumber || "").replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

        root.innerHTML = `
            <div class="cp-head">
                <h1>پرداخت کارت‌به‌کارت</h1>
                <p class="cp-sub">سفارش شما ثبت شد؛ با واریز مبلغ و ارسال رسید، نهایی می‌شود.</p>
            </div>

            ${order.paymentStatus === "rejected" ? `
                <div class="cp-alert"><b>رسید قبلی تأیید نشد.</b>${order.adminNote ? " دلیل: " + esc(order.adminNote) : ""} لطفاً رسید صحیح را دوباره ارسال کنید.</div>` : ""}

            <div class="cp-timer"><span>زمان باقی‌مانده برای پرداخت</span><b id="cpTimer">--:--</b></div>

            <div class="cp-bank">
                <div class="cp-bank__top">
                    <span>${esc(info.bank || "کارت بانکی")}</span>
                    <button type="button" class="cp-copy" data-copy="${esc(card.replace(/\s/g, ""))}">کپی شماره کارت</button>
                </div>
                <div class="cp-bank__num cp-ltr">${esc(card)}</div>
                <div class="cp-bank__bottom">
                    <div><small>به نام</small><b>${esc(info.cardHolder)}</b></div>
                    <span class="cp-bank__sim"></span>
                </div>
            </div>

            <div class="cp-panel">
                <h2>خلاصه پرداخت</h2>
                <div class="cp-line"><span>مبلغ کالاها</span><b>${fa(goods)} تومان</b></div>
                <div class="cp-line"><span>هزینه ارسال</span><b>${shipping ? fa(shipping) + " تومان" : "رایگان"}</b></div>
                <div class="cp-line"><span>کد سفارش</span><b class="cp-ltr">${esc(code)}</b></div>
                <div class="cp-total">
                    <span>مبلغ قابل واریز</span>
                    <span class="cp-total__val">${fa(payable)} تومان
                        <button type="button" class="cp-copy cp-copy--soft" data-copy="${payable}">کپی</button>
                    </span>
                </div>
            </div>

            <form id="cpForm" novalidate style="display:flex;flex-direction:column;gap:14px">
                <label class="cp-upload" for="cpFile">
                    <span class="cp-upload__icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8h6M9 12h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    </span>
                    <span class="cp-upload__text">
                        <b>تصویر رسید پرداخت</b>
                        <small id="cpFileName">برای انتخاب تصویر لمس کنید</small>
                    </span>
                    <input type="file" id="cpFile" accept="image/jpeg,image/png,image/webp" hidden>
                </label>
                <img id="cpPreview" class="cp-preview" alt="" hidden>
                <button type="submit" class="cp-btn" id="cpSubmit">ارسال رسید</button>
            </form>

            ${info.supportPhone ? `<p class="cp-note">اگر امکان آپلود ندارید، تصویر رسید را همراه کد سفارش
                (<b class="cp-ltr">${esc(code)}</b>) به شماره <b class="cp-ltr">${esc(info.supportPhone)}</b> ارسال کنید.</p>` : ""}
        `;

        // کپی
        root.querySelectorAll(".cp-copy").forEach(btn => btn.addEventListener("click", async () => {
            try { await navigator.clipboard.writeText(btn.dataset.copy); toast("کپی شد", "success"); }
            catch (e) { toast("کپی نشد، دستی کپی کنید.", "error"); }
        }));

        // تایمر
        const timerEl = document.getElementById("cpTimer");
        const end = order.paymentExpiresAt ? new Date(order.paymentExpiresAt).getTime() : 0;
        function tick() {
            const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
            const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
            timerEl.textContent = (h ? h + ":" : "") + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
            if (left === 0) {
                clearInterval(timerId);
                message("error", "مهلت پرداخت تمام شد", "این سفارش لغو می‌شود. می‌توانید دوباره سفارش ثبت کنید.");
            }
        }
        if (end) { tick(); timerId = setInterval(tick, 1000); } else timerEl.style.display = "none";

        // انتخاب فایل و پیش‌نمایش
        const fileInput = document.getElementById("cpFile");
        const preview = document.getElementById("cpPreview");
        fileInput.addEventListener("change", () => {
            const f = fileInput.files[0];
            if (!f) return;
            document.getElementById("cpFileName").textContent = f.name;
            preview.src = URL.createObjectURL(f);
            preview.hidden = false;
        });

        // ارسال رسید
        document.getElementById("cpForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const f = fileInput.files[0];
            if (!f) return toast("تصویر رسید را انتخاب کنید.", "error");
            if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return toast("فقط تصویر jpg, png یا webp مجاز است.", "error");
            if (f.size > 5 * 1024 * 1024) return toast("حجم تصویر باید کمتر از ۵ مگابایت باشد.", "error");

            const btn = document.getElementById("cpSubmit");
            btn.disabled = true;
            btn.textContent = "در حال ارسال...";
            try {
                const fd = new FormData();
                fd.append("receipt", f);
                await api("/orders/" + order._id + "/receipt", { method: "POST", body: fd });
                toast("رسید با موفقیت ارسال شد.", "success");
                load();
            } catch (err) {
                toast(err.message, "error");
                btn.disabled = false;
                btn.textContent = "ارسال رسید";
            }
        });
    }

    load();
})();