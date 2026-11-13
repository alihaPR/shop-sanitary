/* =====================================================================
   ویو «آدرس‌های من»
   فهرست آدرس‌های کاربر + افزودن / ویرایش / حذف / تعیین پیش‌فرض
   (منطق و پنجره‌ها در ../js/address-book.js هستند)
===================================================================== */

window.Views.addresses = {

    template: `
        <div class="ab-panel">
            <div class="ab-panel__box">

                <div class="ab-panel__top">
                    <h2>آدرس ها</h2>
                    <button type="button" class="ab-btn ab-btn--primary" id="abPanelAdd"></button>
                </div>

                <button type="button" class="ab-panel__map" id="abPanelMap"></button>

                <h3 class="ab-panel__sub">آدرس های من</h3>

                <div id="abPanelList"></div>

            </div>
        </div>
    `,

    init: async function () {

        const AB = window.NCAddressBook;
        const listEl = document.getElementById("abPanelList");
        const addBtn = document.getElementById("abPanelAdd");
        const mapBtn = document.getElementById("abPanelMap");

        if (!AB || !listEl) return;

        AB.init({ apiBase: API_BASE, token: token });

        addBtn.innerHTML = "<span>افزودن آدرس جدید</span>" + AB.icons.plus;
        mapBtn.innerHTML = AB.icons.pin + "<span>انتخاب موقعیت از نقشه</span>";

        const DOTS =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
            '<circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';

        function closeMenus() {
            listEl.querySelectorAll(".ab-pcard__pop").forEach(p => { p.hidden = true; });
            listEl.querySelectorAll(".ab-pcard__dots").forEach(b => b.setAttribute("aria-expanded", "false"));
        }

        function cardHTML(a) {

            const id = AB.esc(a._id);

            return (
                '<div class="ab-pcard" data-id="' + id + '">' +
                '<span class="ab-pcard__pin">' + AB.icons.pin + '</span>' +
                '<div class="ab-pcard__main">' +
                '<p class="ab-pcard__addr">' + AB.esc(AB.fullText(a)) +
                (a.isDefault ? '<span class="ab-badge">پیش‌فرض</span>' : '') + '</p>' +
                '<p>کد پستی: ' + AB.esc(AB.fa(a.postalCode)) + '</p>' +
                '<p>گیرنده: ' + AB.esc(a.recipientName) +
                '<span class="ab-pcard__sep">|</span>' + AB.esc(AB.fa(a.recipientPhone)) + '</p>' +
                '</div>' +
                '<div class="ab-pcard__menu">' +
                '<button type="button" class="ab-pcard__dots" data-menu aria-label="گزینه‌های آدرس" aria-haspopup="true" aria-expanded="false">' + DOTS + '</button>' +
                '<div class="ab-pcard__pop" hidden>' +
                '<button type="button" data-ab="edit" data-id="' + id + '">' + AB.icons.edit + '<span>ویرایش</span></button>' +
                (a.isDefault ? '' : '<button type="button" data-ab="default" data-id="' + id + '">' + AB.icons.pin + '<span>پیش‌فرض شود</span></button>') +
                '<button type="button" class="is-danger" data-ab="delete" data-id="' + id + '">' + AB.icons.trash + '<span>حذف</span></button>' +
                '</div>' +
                '</div>' +
                '</div>'
            );
        }

        function render(list) {

            if (!list.length) {
                listEl.innerHTML =
                    '<div class="ab-empty">' +
                    '<div class="ab-empty__ico">' + AB.icons.pin + '</div>' +
                    '<p>هنوز آدرسی ثبت نکرده‌اید.</p>' +
                    '<small>با افزودن آدرس، ثبت سفارش سریع‌تر می‌شود.</small>' +
                    '</div>';
                return;
            }

            listEl.innerHTML =
                '<div class="ab-list">' +
                list.map(cardHTML).join("") +
                "</div>";
        }

        async function load() {

            listEl.innerHTML = '<div class="ab-skel"></div><div class="ab-skel"></div>';

            try {
                render(await AB.list());
            } catch (err) {
                listEl.innerHTML =
                    '<div class="ab-empty"><p>' + AB.esc(err.message) + '</p>' +
                    '<button type="button" class="ab-btn ab-btn--ghost" data-ab="retry">تلاش دوباره</button></div>';
            }
        }

        function find(id) {
            return AB.cache.find(a => a._id === id) || null;
        }

        // بستن منوی سه‌نقطه با کلیک بیرون یا Esc (شنونده‌ی قبلی پاک می‌شود تا تکراری نشود)
        if (window.__abPanelOutside) document.removeEventListener("click", window.__abPanelOutside);
        if (window.__abPanelEsc) document.removeEventListener("keydown", window.__abPanelEsc);

        window.__abPanelOutside = (e) => {
            if (!e.target.closest(".ab-pcard__menu")) closeMenus();
        };
        window.__abPanelEsc = (e) => {
            if (e.key === "Escape") closeMenus();
        };

        document.addEventListener("click", window.__abPanelOutside);
        document.addEventListener("keydown", window.__abPanelEsc);

        addBtn.addEventListener("click", () => {
            AB.openSheet({ view: "form", onChange: render });
        });

        // انتخاب از نقشه فعلاً در سایت پیاده‌سازی نشده
        mapBtn.addEventListener("click", () => {
            AB.toast("انتخاب موقعیت از نقشه به‌زودی فعال می‌شود.", "info");
        });

        listEl.addEventListener("click", async (e) => {

            const dots = e.target.closest("[data-menu]");

            if (dots) {
                const pop = dots.parentElement.querySelector(".ab-pcard__pop");
                const wasOpen = !pop.hidden;
                closeMenus();
                pop.hidden = wasOpen;
                pop.classList.remove("is-up");
                dots.setAttribute("aria-expanded", String(!wasOpen));
                if (!wasOpen && pop.getBoundingClientRect().bottom > window.innerHeight - 8) {
                    pop.classList.add("is-up");
                }
                return;
            }

            const el = e.target.closest("[data-ab]");
            if (!el) return;

            const act = el.dataset.ab;

            if (act === "retry") return load();

            closeMenus();

            const a = find(el.dataset.id);
            if (!a) return;

            if (act === "edit") {
                AB.openSheet({ view: "form", address: a, onChange: render });
            }

            if (act === "delete") {
                AB.openSheet({ view: "confirm", address: a, onChange: render });
            }

            if (act === "default") {

                el.disabled = true;

                try {
                    await AB.makeDefault(a._id);
                    AB.toast("آدرس پیش‌فرض تغییر کرد.", "success");
                    await load();
                } catch (err) {
                    AB.toast(err.message, "error");
                    el.disabled = false;
                }
            }
        });

        load();
    }
};