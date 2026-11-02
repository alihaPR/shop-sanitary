// ===========================
//   Discounts (تخفیف‌ها)
//   مدیریت درصد تخفیف محصولات؛ تخفیف‌دارها خودکار در «شگفت‌انگیز» صفحه‌ی اصلی
//   و با نشان تخفیف در صفحه‌ی محصولات دیده می‌شوند و قیمت نهایی سفارش هم
//   در بکند با همین درصد محاسبه می‌شود.
// ===========================
(function () {

    const { icon, num, esc, toast } = window.AdminUI;

    const MAX_PCT = 90;
    const IMG_BASE = "https://api.narmcenter.com/";

    const CATEGORY_LABELS = {
        "پوشک-کودک": "پوشک کودک",
        "پوشک-بزرگسال": "پوشک بزرگسال",
        "نوار-بهداشتی": "نوار بهداشتی",
        "پنبه": "پنبه",
        "دستمال-مرطوب": "دستمال مرطوب",
        "دستمال-کاغذی": "دستمال کاغذی"
    };

    const state = {
        rows: [],          // { id, name, image, category, price, available, saved, pct }
        filter: "all",     // all | on | off
        category: "all",
        search: "",
        selected: new Set(),
        saving: false
    };

    // اعداد فارسی/عربی → انگلیسی
    function toEn(str) {
        return String(str ?? "")
            .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
            .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    }

    function clampPct(v) {
        const n = parseInt(toEn(v), 10);
        if (!Number.isFinite(n) || n < 0) return 0;
        return Math.min(MAX_PCT, n);
    }

    function finalPrice(price, pct) {
        return pct > 0 ? Math.round(price * (1 - pct / 100)) : price;
    }

    function imgSrc(image) {
        if (!image) return "";
        return IMG_BASE + String(image).replace(/^\.?\//, "");
    }

    const dirtyRows = () => state.rows.filter(r => r.pct !== r.saved);

    function visibleRows() {
        const q = state.search.trim().toLowerCase();
        return state.rows.filter(r => {
            if (state.filter === "on" && !(r.pct > 0)) return false;
            if (state.filter === "off" && r.pct > 0) return false;
            if (state.category !== "all" && r.category !== state.category) return false;
            if (q && !r.name.toLowerCase().includes(q)) return false;
            return true;
        });
    }

    // ---------- رندر صفحه ----------
    async function renderDiscounts() {

        const main = document.getElementById("main-content");
        main.innerHTML = `<div class="dsc-loading">در حال بارگذاری محصولات...</div>`;

        let products = [];
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            if (!res.ok) throw new Error(res.status);
            products = await res.json();
        } catch (err) {
            console.error(err);
            main.innerHTML = `<div class="dsc-loading">بارگذاری محصولات انجام نشد. صفحه را دوباره باز کنید.</div>`;
            return;
        }

        state.rows = (Array.isArray(products) ? products : []).map(p => ({
            id: p._id,
            name: p.name || "",
            image: p.image || "",
            category: p.category || "",
            price: Number(p.price) || 0,
            available: p.available !== false,
            saved: clampPct(p.discountPercent),
            pct: clampPct(p.discountPercent)
        }));
        state.filter = "all";
        state.category = "all";
        state.search = "";
        state.selected = new Set();

        const cats = [...new Set(state.rows.map(r => r.category).filter(Boolean))];

        main.innerHTML = `
        <div class="dsc-page">

            <div class="products-header">
                <div class="products-heading">
                    <h2>مدیریت تخفیف‌ها</h2>
                    <p>درصد تخفیف هر محصول را تعیین کنید؛ محصولات تخفیف‌دار خودکار در بخش «شگفت‌انگیز» صفحه‌ی اصلی نمایش داده می‌شوند.</p>
                </div>
            </div>

            <div class="dsc-stats" id="dscStats"></div>

            <div class="dsc-card">

                <div class="dsc-toolbar">
                    <div class="dsc-chips" id="dscChips">
                        <button type="button" class="dsc-chip active" data-filter="all">همه</button>
                        <button type="button" class="dsc-chip" data-filter="on">تخفیف‌دار</button>
                        <button type="button" class="dsc-chip" data-filter="off">بدون تخفیف</button>
                    </div>

                    <select class="dsc-select" id="dscCategory" aria-label="دسته‌بندی">
                        <option value="all">همه‌ی دسته‌ها</option>
                        ${cats.map(c => `<option value="${esc(c)}">${esc(CATEGORY_LABELS[c] || c)}</option>`).join("")}
                    </select>

                    <div class="dsc-search">
                        ${icon("search", 16)}
                        <input type="text" id="dscSearch" placeholder="جستجوی محصول..." autocomplete="off">
                    </div>
                </div>

                <div class="dsc-bulk" id="dscBulk">
                    <label class="dsc-check-all">
                        <input type="checkbox" id="dscSelectAll">
                        <span>انتخاب همه‌ی موارد نمایش‌داده‌شده</span>
                    </label>
                    <span class="dsc-bulk-count" id="dscBulkCount"></span>
                    <div class="dsc-bulk-actions">
                        <div class="dsc-pct-box">
                            <input type="text" inputmode="numeric" id="dscBulkPct" placeholder="درصد" maxlength="2" aria-label="درصد تخفیف گروهی">
                            <span>٪</span>
                        </div>
                        <button type="button" class="dsc-btn" id="dscBulkApply">اعمال روی انتخاب‌شده‌ها</button>
                        <button type="button" class="dsc-btn dsc-btn-ghost" id="dscBulkClear">حذف تخفیف انتخاب‌شده‌ها</button>
                    </div>
                </div>

                <div class="dsc-table-wrap">
                    <table class="dsc-table">
                        <thead>
                            <tr>
                                <th class="dsc-col-check"></th>
                                <th>محصول</th>
                                <th>قیمت اصلی</th>
                                <th>درصد تخفیف</th>
                                <th>قیمت با تخفیف</th>
                                <th>وضعیت</th>
                            </tr>
                        </thead>
                        <tbody id="dscBody"></tbody>
                    </table>
                </div>

                <p class="dsc-note">
                    ${icon("sparkle", 14)}
                    در صفحه‌ی اصلی حداکثر ۱۰ محصول با بیشترین تخفیف نشان داده می‌شود و محصولات ناموجود در بخش شگفت‌انگیز نمایش داده نمی‌شوند.
                </p>
            </div>

            <div class="dsc-savebar" id="dscSaveBar" hidden>
                <span id="dscSaveText"></span>
                <div>
                    <button type="button" class="dsc-btn dsc-btn-ghost" id="dscDiscard">لغو تغییرات</button>
                    <button type="button" class="dsc-btn" id="dscSave">ذخیره‌ی تخفیف‌ها</button>
                </div>
            </div>

        </div>`;

        bind();
        paint();
    }

    // ---------- نمایش ----------
    function paintStats() {
        const on = state.rows.filter(r => r.saved > 0);
        const avg = on.length ? Math.round(on.reduce((s, r) => s + r.saved, 0) / on.length) : 0;
        const max = on.length ? Math.max(...on.map(r => r.saved)) : 0;
        const cards = [
            { label: "محصولات تخفیف‌دار", value: num(on.length), sub: `از ${num(state.rows.length)} محصول` },
            { label: "میانگین تخفیف", value: `${num(avg)}٪`, sub: "بین محصولات تخفیف‌دار" },
            { label: "بیشترین تخفیف", value: `${num(max)}٪`, sub: on.length ? "فعال در فروشگاه" : "—" }
        ];
        document.getElementById("dscStats").innerHTML = cards.map(c => `
            <div class="dsc-stat">
                <small>${c.label}</small>
                <b>${c.value}</b>
                <span>${c.sub}</span>
            </div>`).join("");
    }

    function rowHtml(r) {
        const dirty = r.pct !== r.saved;
        const fp = finalPrice(r.price, r.pct);
        return `
        <tr data-id="${esc(r.id)}" class="${dirty ? "is-dirty" : ""} ${state.selected.has(r.id) ? "is-selected" : ""}">
            <td class="dsc-col-check"><input type="checkbox" class="dsc-row-check" ${state.selected.has(r.id) ? "checked" : ""} aria-label="انتخاب ${esc(r.name)}"></td>
            <td>
                <div class="dsc-product">
                    <img src="${esc(imgSrc(r.image))}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
                    <div>
                        <b>${esc(r.name)}</b>
                        <small>${esc(CATEGORY_LABELS[r.category] || r.category)}</small>
                    </div>
                </div>
            </td>
            <td class="dsc-price">${num(r.price)} <small>تومان</small></td>
            <td>
                <div class="dsc-pct-cell">
                    <div class="dsc-pct-box">
                        <input type="text" inputmode="numeric" class="dsc-pct-input" value="${r.pct ? r.pct : ""}" placeholder="۰" maxlength="2" aria-label="درصد تخفیف ${esc(r.name)}">
                        <span>٪</span>
                    </div>
                    <div class="dsc-quick">
                        ${[10, 20, 30].map(v => `<button type="button" class="dsc-q" data-pct="${v}">${num(v)}</button>`).join("")}
                        <button type="button" class="dsc-q dsc-q-x" data-pct="0" title="حذف تخفیف">${icon("x", 12)}</button>
                    </div>
                </div>
            </td>
            <td class="dsc-final">
                ${r.pct > 0
                    ? `<b>${num(fp)} <small>تومان</small></b><s>${num(r.price)}</s>`
                    : `<span class="dsc-dash">—</span>`}
            </td>
            <td>
                ${r.pct > 0
                    ? `<span class="dsc-badge on">${r.available ? "تخفیف فعال" : "فعال (ناموجود)"}</span>`
                    : `<span class="dsc-badge">بدون تخفیف</span>`}
                ${!r.available ? `<span class="dsc-badge warn">ناموجود</span>` : ""}
            </td>
        </tr>`;
    }

    function paint() {
        paintStats();

        const rows = visibleRows();
        const body = document.getElementById("dscBody");
        body.innerHTML = rows.length
            ? rows.map(rowHtml).join("")
            : `<tr><td colspan="6" class="dsc-empty">محصولی با این فیلتر پیدا نشد.</td></tr>`;

        paintBulk(rows);
        paintSaveBar();
    }

    // به‌روزرسانی فقط یک ردیف (تا فوکوس input هنگام تایپ نپرد)
    function paintRow(id) {
        const r = state.rows.find(x => x.id === id);
        const tr = document.querySelector(`#dscBody tr[data-id="${CSS.escape(id)}"]`);
        if (!r || !tr) return;
        const fp = finalPrice(r.price, r.pct);
        tr.classList.toggle("is-dirty", r.pct !== r.saved);
        tr.querySelector(".dsc-final").innerHTML = r.pct > 0
            ? `<b>${num(fp)} <small>تومان</small></b><s>${num(r.price)}</s>`
            : `<span class="dsc-dash">—</span>`;
        const badgeCell = tr.lastElementChild;
        badgeCell.innerHTML =
            (r.pct > 0
                ? `<span class="dsc-badge on">${r.available ? "تخفیف فعال" : "فعال (ناموجود)"}</span>`
                : `<span class="dsc-badge">بدون تخفیف</span>`) +
            (!r.available ? `<span class="dsc-badge warn">ناموجود</span>` : "");
        paintSaveBar();
    }

    function paintBulk(rows = visibleRows()) {
        const count = state.selected.size;
        document.getElementById("dscBulk").classList.toggle("has-selection", count > 0);
        document.getElementById("dscBulkCount").textContent = count ? `${num(count)} محصول انتخاب شده` : "";
        const all = document.getElementById("dscSelectAll");
        all.checked = rows.length > 0 && rows.every(r => state.selected.has(r.id));
    }

    function paintSaveBar() {
        const n = dirtyRows().length;
        const bar = document.getElementById("dscSaveBar");
        bar.hidden = n === 0;
        document.getElementById("dscSaveText").textContent = `${num(n)} تغییر ذخیره‌نشده`;
        const btn = document.getElementById("dscSave");
        btn.disabled = state.saving;
        btn.textContent = state.saving ? "در حال ذخیره..." : "ذخیره‌ی تخفیف‌ها";
    }

    function setPct(id, pct) {
        const r = state.rows.find(x => x.id === id);
        if (!r) return;
        r.pct = clampPct(pct);
    }

    // ---------- رویدادها ----------
    function bind() {
        const body = document.getElementById("dscBody");

        document.getElementById("dscChips").addEventListener("click", e => {
            const b = e.target.closest(".dsc-chip");
            if (!b) return;
            state.filter = b.dataset.filter;
            document.querySelectorAll("#dscChips .dsc-chip").forEach(x => x.classList.toggle("active", x === b));
            paint();
        });

        document.getElementById("dscCategory").addEventListener("change", e => {
            state.category = e.target.value;
            paint();
        });

        document.getElementById("dscSearch").addEventListener("input", e => {
            state.search = e.target.value;
            paint();
        });

        // تایپ درصد در ردیف
        body.addEventListener("input", e => {
            const input = e.target.closest(".dsc-pct-input");
            if (!input) return;
            const tr = input.closest("tr");
            const clean = toEn(input.value).replace(/\D/g, "");
            const pct = clampPct(clean);
            if (clean !== "" && String(pct) !== clean) input.value = String(pct);
            else if (clean !== input.value) input.value = clean;
            setPct(tr.dataset.id, clean === "" ? 0 : pct);
            paintRow(tr.dataset.id);
        });

        body.addEventListener("click", e => {
            const q = e.target.closest(".dsc-q");
            if (!q) return;
            const tr = q.closest("tr");
            setPct(tr.dataset.id, q.dataset.pct);
            const r = state.rows.find(x => x.id === tr.dataset.id);
            tr.querySelector(".dsc-pct-input").value = r.pct ? r.pct : "";
            paintRow(tr.dataset.id);
        });

        body.addEventListener("change", e => {
            const c = e.target.closest(".dsc-row-check");
            if (!c) return;
            const tr = c.closest("tr");
            c.checked ? state.selected.add(tr.dataset.id) : state.selected.delete(tr.dataset.id);
            tr.classList.toggle("is-selected", c.checked);
            paintBulk();
        });

        document.getElementById("dscSelectAll").addEventListener("change", e => {
            visibleRows().forEach(r => e.target.checked ? state.selected.add(r.id) : state.selected.delete(r.id));
            paint();
        });

        const bulkInput = document.getElementById("dscBulkPct");
        bulkInput.addEventListener("input", () => {
            bulkInput.value = toEn(bulkInput.value).replace(/\D/g, "");
        });

        document.getElementById("dscBulkApply").addEventListener("click", () => {
            if (!state.selected.size) return toast("اول چند محصول را انتخاب کنید");
            const raw = toEn(bulkInput.value).replace(/\D/g, "");
            if (!raw) return toast("درصد تخفیف را وارد کنید");
            const pct = clampPct(raw);
            if (pct < 1) return toast("درصد باید بین ۱ تا ۹۰ باشد");
            state.selected.forEach(id => setPct(id, pct));
            paint();
        });

        document.getElementById("dscBulkClear").addEventListener("click", () => {
            if (!state.selected.size) return toast("اول چند محصول را انتخاب کنید");
            state.selected.forEach(id => setPct(id, 0));
            paint();
        });

        document.getElementById("dscDiscard").addEventListener("click", () => {
            state.rows.forEach(r => { r.pct = r.saved; });
            paint();
        });

        document.getElementById("dscSave").addEventListener("click", save);
    }

    // ---------- ذخیره ----------
    async function save() {
        const changed = dirtyRows();
        if (!changed.length || state.saving) return;

        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "../login.html"; return; }

        state.saving = true;
        paintSaveBar();

        try {
            const res = await fetch(`${API_BASE_URL}/products/discounts/bulk`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    updates: changed.map(r => ({ id: r.id, discountPercent: r.pct }))
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "ذخیره‌سازی انجام نشد");

            changed.forEach(r => { r.saved = r.pct; });
            toast("تخفیف‌ها ذخیره شد");
        } catch (err) {
            console.error(err);
            toast(err.message || "ذخیره‌سازی انجام نشد");
        } finally {
            state.saving = false;
            paint();
        }
    }

    window.renderDiscounts = renderDiscounts;

})();
