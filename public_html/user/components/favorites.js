/* =====================================================================
   ویو «لیست علاقه‌مندی»
   الگوی این فایل دقیقاً مثل بقیه فایل‌های components/ هست:
   یک template ثابت + یک تابع init که بعد از تزریق template اجرا میشه.
===================================================================== */

const FAVORITES_PER_PAGE = 8;

let favoritesOriginal = [];
let sortedFavorites = [];
let favoritesSort = "newest"; // newest | cheap | expensive
let favoritesPage = 1;

window.Views.favorites = {

    template: `

        <div class="favorites-header-card">

            <h2>لیست علاقه مندی</h2>

            <div class="favorites-toolbar">

                <div class="favorites-sort">

                    <span class="favorites-sort-label">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M8 3v14M8 17l-4-4M8 17l4-4M16 21V7M16 7l4 4M16 7l-4 4"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        مرتب سازی:
                    </span>

                    <button type="button" class="sort-btn" data-sort="cheap">ارزان ترین</button>
                    <button type="button" class="sort-btn" data-sort="expensive">گران ترین</button>
                    <button type="button" class="sort-btn active" data-sort="newest">جدید ترین</button>

                </div>
                <span class="favorites-count" id="favoritesCount">0 محصول</span>

            </div>

        </div>

        <div class="favorites-list-card">

            <div class="favorites-grid" id="favoritesGrid"></div>

            <div class="favorites-pagination" id="favoritesPagination">

                <span id="favoritesPaginationInfo"></span>

                <div class="fav-pagination-controls">

                    <button type="button" id="favPrevPage" class="fav-page-btn" title="قبلی">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    </button>
                    <button type="button" id="favNextPage" class="fav-page-btn" title="بعدی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>

                </div>

            </div>

        </div>

    `,

    init: initFavorites

};

async function initFavorites() {

    favoritesSort = "newest";
    favoritesPage = 1;

    const grid = document.getElementById("favoritesGrid");
    grid.innerHTML = `<p class="favorites-loading">در حال بارگذاری...</p>`;

    try {

        const res = await fetch(`${API_BASE}/users/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        favoritesOriginal = await res.json();

        if (!Array.isArray(favoritesOriginal)) favoritesOriginal = [];

    } catch (err) {

        console.error(err);
        favoritesOriginal = [];

    }

    applyFavoritesSort();
    renderFavoritesGrid();

    document.querySelectorAll(".sort-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            favoritesSort = btn.dataset.sort;

            document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            favoritesPage = 1;

            applyFavoritesSort();
            renderFavoritesGrid();

        });

    });

    document.getElementById("favPrevPage").addEventListener("click", () => {

        if (favoritesPage > 1) {
            favoritesPage--;
            renderFavoritesGrid();
        }

    });

    document.getElementById("favNextPage").addEventListener("click", () => {

        const totalPages = Math.max(1, Math.ceil(sortedFavorites.length / FAVORITES_PER_PAGE));

        if (favoritesPage < totalPages) {
            favoritesPage++;
            renderFavoritesGrid();
        }

    });

}

function applyFavoritesSort() {

    sortedFavorites = [...favoritesOriginal];

    if (favoritesSort === "cheap") {

        sortedFavorites.sort((a, b) => (a.price || 0) - (b.price || 0));

    } else if (favoritesSort === "expensive") {

        sortedFavorites.sort((a, b) => (b.price || 0) - (a.price || 0));

    }
    /* newest: همون ترتیبی که API برمی‌گردونه (فرض بر اینه که جدیدترین‌ها اول لیست هستن) */

}

function renderFavoritesGrid() {

    const grid = document.getElementById("favoritesGrid");
    const countEl = document.getElementById("favoritesCount");

    countEl.textContent = `${sortedFavorites.length} محصول`;

    if (sortedFavorites.length === 0) {

        grid.innerHTML = `
            <div class="favorites-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>
                </svg>
                <p>لیست علاقه‌مندی شما خالی است</p>
                <a class="favorites-empty-link" href="./products.html">مشاهده محصولات</a>
            </div>
        `;

        document.getElementById("favoritesPagination").style.display = "none";

        return;

    }

    document.getElementById("favoritesPagination").style.display = "flex";

    const totalPages = Math.max(1, Math.ceil(sortedFavorites.length / FAVORITES_PER_PAGE));

    if (favoritesPage > totalPages) favoritesPage = totalPages;

    const start = (favoritesPage - 1) * FAVORITES_PER_PAGE;

    const pageItems = sortedFavorites.slice(start, start + FAVORITES_PER_PAGE);

    grid.innerHTML = pageItems.map(product => {

        const imageUrl = `${SERVER_URL}/${(product.image || "").replace(/^\/?/, "")}`;
        return `

            <a class="favorite-card" href="./cart.html?id=${product._id}" data-id="${product._id}">

                <div class="favorite-card-image">
                    <img src="${imageUrl}" alt="${product.name}">
                </div>

                <h4>${product.name}</h4>

                <div class="favorite-card-price">${(product.price || 0).toLocaleString()}</div>

                <div class="favorite-card-actions">

                    <button type="button" class="fav-add-cart-btn" data-id="${product._id}">
                        افزودن به سبد خرید
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        </svg>
                    </button>

                    <button type="button" class="fav-remove-btn" data-id="${product._id}" title="حذف از علاقه‌مندی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>

                </div>

            </a>

        `;

    }).join("");

    document.querySelectorAll(".fav-remove-btn").forEach(btn => {

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            removeFavorite(btn.dataset.id);
        });

    });

    document.querySelectorAll(".fav-add-cart-btn").forEach(btn => {

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            addFavoriteToCart(btn.dataset.id);
        });

    });

    updateFavoritesPaginationInfo(totalPages);

}

function updateFavoritesPaginationInfo(totalPages) {

    const total = sortedFavorites.length;

    const start = total === 0 ? 0 : (favoritesPage - 1) * FAVORITES_PER_PAGE + 1;
    const end = Math.min(favoritesPage * FAVORITES_PER_PAGE, total);

    document.getElementById("favoritesPaginationInfo").textContent =
        `نمایش ${start} تا ${end} از ${total} ردیف`;

    document.getElementById("favPrevPage").disabled = favoritesPage <= 1;
    document.getElementById("favNextPage").disabled = favoritesPage >= totalPages;

}

/* =========================================================
   حذف از علاقه‌مندی
   ⚠️ آدرس دقیق این روت رو باید با بک‌اند چک کنیم؛ فعلاً طبق
   الگوی معمول REST نوشته شده: DELETE /users/favorites/:id
========================================================= */

async function removeFavorite(id) {

    try {

        const res = await fetch(`${API_BASE}/users/favorites/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "خطا در حذف از علاقه‌مندی");
        }

        favoritesOriginal = favoritesOriginal.filter(p => p._id !== id);

        applyFavoritesSort();
        renderFavoritesGrid();

    } catch (err) {

        console.error(err);
        showAppToast(err.message, "error");

    }

}

/* =========================================================
   افزودن به سبد خرید — دقیقاً هماهنگ با addToCart تو basket.js:
   کل آبجکت محصول (نام/قیمت/عکس/تخفیف) ذخیره میشه، نه فقط id.
   چون basket.js تو این صفحه لود نیست، منطقش اینجا تکرار شده.
========================================================= */

function addFavoriteToCart(id) {

    const cartToken = localStorage.getItem("token");

    if (!cartToken) {
        showAppToast("ابتدا وارد حساب کاربری شوید.", "error");
        location.href = "./login.html";
        return;
    }

    const product = favoritesOriginal.find(p => p._id === id);

    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existing = cart.find(item => item._id === id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    if (typeof updateCartBadge === "function") updateCartBadge();

    showAppToast("محصول به سبد خرید اضافه شد.", "success");

}