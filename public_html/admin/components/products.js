let editingProductId = null;

/* ===========================
    Pagination State
=========================== */
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 5;

/*
  آستانه وضعیت موجودی:
  stock === 0            -> ناموجود
  0 < stock < 3           -> موجودی کم
  stock >= 3              -> موجود
*/
function getStockStatus(stock) {

    if (stock === 0) {

        return { label: "ناموجود", className: "status-out" };

    }

    if (stock <= 3) {

        return { label: "موجودی کم", className: "status-low" };

    }

    return { label: "موجود", className: "status-in" };

}

async function renderProducts() {

    const token = localStorage.getItem("token");

    const res = await fetch(
        `${API_BASE_URL}/products`
    );
    const products = await res.json();

    allProducts = products;
    filteredProducts = products;
    currentPage = 1;

    document.getElementById("main-content").innerHTML = `

<div class="products-header">

    <div class="products-heading">
        <h2>لیست محصولات</h2>
        <p>مدیریت تمامی محصولات فروشگاه</p>
    </div>

    <button class="add-product-btn">
        + افزودن محصول
    </button>

</div>

<div class="products-card">

    <div class="products-toolbar">

        <div class="filter-dropdown" id="productFilterDropdown">
            <span>اخیر</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <div class="search-wrap search-wrap2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input
                type="text"
                id="productSearch"
                placeholder="جستجوی محصول..."
            >
        </div>

    </div>

    <div class="products-table-wrap">

        <table class="products-table">

            <thead>

                <tr>

                    <th>محصول</th>

                    <th>دسته بندی</th>

                    <th>قیمت</th>

                    <th>موجودی</th>

                    <th>وضعیت</th>

                    <th>عملیات</th>

                </tr>

            </thead>

            <tbody id="productsTableBody">
            </tbody>

        </table>

    </div>

    <div class="products-pagination">

        <span id="paginationInfo"></span>

        <div class="pagination-controls">
            <button type="button" id="prevPageBtn" class="page-btn" title="قبلی">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button type="button" id="nextPageBtn" class="page-btn" title="بعدی">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

    </div>

</div>

    `;

    renderProductsTableBody();

    const searchInput = document.getElementById("productSearch");

    searchInput.addEventListener("input", () => {

        const keyword = searchInput.value.toLowerCase();

        filteredProducts = allProducts.filter(product => {

            const text = `${product.name} ${product.category} ${product.brand || ""}`.toLowerCase();

            return text.includes(keyword);

        });

        currentPage = 1;

        renderProductsTableBody();

    });

    document.querySelector(".add-product-btn").addEventListener("click", () => openProductModal());

    document.getElementById("prevPageBtn").addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            renderProductsTableBody();

        }

    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {

        const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

        if (currentPage < totalPages) {

            currentPage++;

            renderProductsTableBody();

        }

    });

}

function renderProductsTableBody() {

    const tbody = document.getElementById("productsTableBody");

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;

    const pageItems = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

    if (pageItems.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">محصولی یافت نشد</td>
            </tr>
        `;

    } else {

        tbody.innerHTML = pageItems.map(product => {

            const status = getStockStatus(product.stock);

            return `

                    <tr>

                        <td>
<div class="product-cell">
    <img src="${SERVER_URL}/${product.image}" class="table-image">
    <span class="product-name">${product.name}</span>
</div>
                        </td>

                        <td>${product.category}</td>

                        <td>${product.price.toLocaleString()} تومان</td>

                        <td>${product.stock}</td>

                        <td>
                            <span class="status-pill ${status.className}">${status.label}</span>
                        </td>

                        <td>

                            <div class="table-actions">

                                <button class="edit-btn" data-id="${product._id}" title="ویرایش">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                                <button class="delete-btn" data-id="${product._id}" title="حذف">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

        }).join("");

    }

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const id = btn.dataset.id;

            const product = allProducts.find(p => p._id === id);

            openProductModal(product);

        });

    });

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            deleteProduct(btn.dataset.id);

        });

    });

    updatePaginationInfo(totalPages);

}

function updatePaginationInfo(totalPages) {

    const total = filteredProducts.length;

    const start = total === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

    const end = Math.min(currentPage * PRODUCTS_PER_PAGE, total);

    document.getElementById("paginationInfo").textContent =
        `نمایش ${start} تا ${end} از ${total} ردیف`;

    document.getElementById("prevPageBtn").disabled = currentPage <= 1;

    document.getElementById("nextPageBtn").disabled = currentPage >= totalPages;

}
/* ===========================
    Toast Notifications
    (کاملاً مستقل - به هیچ کد دیگری وابسته نیست)
=========================== */
function ensureToastStyles() {

    if (document.getElementById("toastStyles")) return;

    const style = document.createElement("style");
    style.id = "toastStyles";
    style.textContent = `
        @keyframes toastSlideIn {
            from { opacity: 0; transform: translateY(-12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastSlideOut {
            from { opacity: 1; transform: translateY(0); }
            to   { opacity: 0; transform: translateY(-12px); }
        }
    `;
    document.head.appendChild(style);

}

function ensureToastContainer() {

    let container = document.getElementById("toastContainer");

    if (!container) {

        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
        
            z-index: 99999;
            display: flex;
            flex-direction: column;

            gap: 10px;
            width: 320px;
            max-width: 90vw;
        `;
        document.body.appendChild(container);

    }

    return container;

}

function showToast(type, title, message = "") {

    ensureToastStyles();

    const config = {
        success: { icon: "✓", bg: "#22c55e" },
        error: { icon: "✕", bg: "#ef4444" },
        warning: { icon: "!", bg: "#f59e0b" },
        info: { icon: "i", bg: "#3b82f6" },
        neutral: { icon: "●", bg: "#9ca3af" }
    };

    const cfg = config[type] || config.neutral;
    const container = ensureToastContainer();

    const toast = document.createElement("div");
    toast.style.cssText = `
        display: flex;
        align-items: center;
         box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        gap: 12px;
        background: #ffffff;
        border-radius: 14px;
        padding: 14px 16px;
        direction: rtl;
        font-family: inherit;
        animation: toastSlideIn .25s ease;
    `;

    toast.innerHTML = `
        <div style="
            width: 32px; height: 32px; border-radius: 50%;
            background: ${cfg.bg}; color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; flex-shrink: 0;
        ">${cfg.icon}</div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: 14px; color: #111;">${title}</div>
            ${message ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${message}</div>` : ""}
        </div>
        <button type="button" style="
            background: none; border: none; color: #9ca3af;
            font-size: 16px; cursor: pointer; line-height: 1; padding: 0; flex-shrink: 0;
        ">×</button>
    `;

    const removeToast = () => {
        toast.style.animation = "toastSlideOut .2s ease forwards";
        setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector("button").addEventListener("click", removeToast);

    container.appendChild(toast);

    setTimeout(removeToast, 4000);

}

/* ===========================
    Confirm Dialog
    (جایگزین سفارشی و هم‌استایل به‌جای confirm() پیش‌فرض مرورگر)
=========================== */
function showConfirmDialog(message) {

    return new Promise((resolve) => {

        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        overlay.innerHTML = `
            <div style="
                background: #fff;
                border-radius: 16px;
                padding: 24px;
                width: 320px;
                max-width: 90vw;
                direction: rtl;
                text-align: center;
                box-shadow: 0 12px 32px rgba(0,0,0,0.2);
                font-family: inherit;
            ">
                <div style="
                    width: 44px; height: 44px; border-radius: 50%;
                    background: #fef2f2; color: #ef4444;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px; margin: 0 auto 14px;
                ">!</div>
                <div style="font-size: 14px; color: #111; margin-bottom: 20px; line-height: 1.8;">
                    ${message}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" data-action="cancel" style="
                        flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #e5e7eb;
                        background: #fff; color: #374151; font-size: 13px; cursor: pointer;
                    ">انصراف</button>
                    <button type="button" data-action="confirm" style="
                        flex: 1; padding: 10px; border-radius: 10px; border: none;
                        background: #ef4444; color: #fff; font-size: 13px; cursor: pointer;
                    ">بله، حذف کن</button>
                </div>
            </div>
        `;

        const close = (result) => {
            overlay.remove();
            resolve(result);
        };

        overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => close(false));
        overlay.querySelector('[data-action="confirm"]').addEventListener("click", () => close(true));
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) close(false);
        });

        document.body.appendChild(overlay);

    });

}

function openProductModal(product = null) {

    // جلوگیری از تجمع چند مودال هم‌زمان روی هم (که باعث می‌شد
    // چند فرم با id="productForm" تکراری تو صفحه باشه و
    // addEventListener فقط روی اولی بشینه، نه فرمی که کاربر می‌بینه)
    document.querySelectorAll(".modal-overlay").forEach(el => el.remove());

    document.body.insertAdjacentHTML("beforeend", `

        <div class="modal-overlay">

            <div class="product-modal product-modal--redesign">

                <div class="modal-header">

                    <h2>${product ? "ویرایش محصول" : "افزودن محصول"}</h2>

                    <button class="close-modal">✕</button>

                </div>

                <form id="productForm" class="product-form-grid">

                    <div class="form-col form-col-main">

                        <div class="form-card">

                            <h3 class="form-card-title">اطلاعات عمومی</h3>

                            <div class="form-group">
                                <label>نام محصول</label>
                                <input id="productName" type="text" placeholder="نام محصول را وارد کنید">
                            </div>

                            <div class="form-group">
                                <label>توضیح کوتاه</label>
                                <input id="productShortDescription" type="text" placeholder="یک توضیح کوتاه زیر نام محصول">
                            </div>

                            <div class="form-group">
                                <label>برند</label>
                                <input id="productBrand" type="text" placeholder="نام برند">
                            </div>

                            <div class="form-group">
                                <label>توضیحات محصول</label>
                                <textarea id="productDescription" placeholder="توضیحات محصول را وارد کنید"></textarea>
                            </div>

                        </div>

                        <div class="form-card">

                            <h3 class="form-card-title">قیمت و موجودی</h3>

                            <div class="form-row">

                                <div class="form-group">
                                    <label>قیمت پایه (تومان)</label>
                                    <input id="productPrice" type="number" placeholder="مثلا 150000">
                                </div>

                                <div class="form-group">
                                    <label>موجودی</label>
                                    <input id="productStock" type="number" placeholder="تعداد موجودی">
                                </div>

                            </div>

                        </div>

                        <div class="form-card">

                            <div class="form-card-header-row">
                                <h3 class="form-card-title">مشخصات کالا</h3>
                                <button type="button" id="addSpecification" class="add-specification-btn">
                                    + افزودن مشخصه
                                </button>
                            </div>

                            <div id="specificationsContainer"></div>

                        </div>

                        <div class="form-card">

                            <div class="form-card-header-row">
                                <h3 class="form-card-title">ویژگی‌ها</h3>
                                <button type="button" id="addFeature" class="add-specification-btn">
                                    + افزودن ویژگی
                                </button>
                            </div>

                            <div id="featuresContainer"></div>

                        </div>

                    </div>

                    <div class="form-col form-col-side">

                        <div class="form-card">

                            <h3 class="form-card-title">تصویر محصول</h3>

                            <label class="image-upload-box" for="productImageFile">
                                <img id="productImagePreview" alt="پیش نمایش تصویر">
                                <div class="upload-placeholder" id="uploadPlaceholder">
                                    <span class="upload-plus">+</span>
                                    <span class="upload-text">افزودن تصویر</span>
                                </div>
                            </label>

                            <input id="productImageFile" type="file" accept="image/*" hidden>

                        </div>

                        <div class="form-card">

                            <h3 class="form-card-title">دسته‌بندی</h3>

                            <select id="productCategory">

                                <option value="">
                                     انتخاب دسته‌بندی
                                </option>

                                 <option value="پوشک-کودک">
                                     پوشک کودک
                                </option>

                                <option value="پوشک-بزرگسال">
                                     پوشک بزرگسال
                                </option>

                                <option value="نوار-بهداشتی">
                                     نوار بهداشتی
                                </option>

                                <option value="پنبه">
                                 پنبه
                                </option>

                                <option value="دستمال-مرطوب">
                                 دستمال مرطوب
                                </option>

                            </select>

                        </div>

                    </div>

                    <div class="form-actions">
                        <button type="submit">${product ? "ویرایش محصول" : "ثبت محصول"}</button>
                    </div>

                </form>

            </div>

        </div>

    `);
    if (product) {

        editingProductId = product._id;

        document.getElementById("productName").value = product.name || "";
        document.getElementById("productPrice").value = product.price || "";
        document.getElementById("productStock").value = product.stock || 0;
        document.getElementById("productCategory").value = product.category || "";
        document.getElementById("productBrand").value = product.brand || "";
        document.getElementById("productDescription").value = product.description || "";
        document.getElementById("productShortDescription").value = product.shortDescription || "";

        if (product.image) {

            const previewImg = document.getElementById("productImagePreview");
            const placeholder = document.getElementById("uploadPlaceholder");

            previewImg.src = `${SERVER_URL}/${product.image}`;
            previewImg.classList.add("has-image");
            placeholder.style.display = "none";

        }

    }
    else {

        editingProductId = null;

    }
    document.getElementById("productForm").addEventListener("submit", submitProduct);

    const imageInput = document.getElementById("productImageFile");
    const imagePreview = document.getElementById("productImagePreview");
    const uploadPlaceholder = document.getElementById("uploadPlaceholder");

    imageInput.addEventListener("change", () => {

        if (imageInput.files && imageInput.files[0]) {

            imagePreview.src = URL.createObjectURL(imageInput.files[0]);
            imagePreview.classList.add("has-image");
            uploadPlaceholder.style.display = "none";

        }

    });

    document.querySelector(".close-modal").onclick = () => {

        document.querySelector(".modal-overlay").remove();

    }

    function escapeAttr(str) {
        return String(str).replace(/"/g, "&quot;");
    }

    const specsContainer = document.getElementById("specificationsContainer");

    function addSpecRow(label = "", value = "") {

        specsContainer.insertAdjacentHTML(

            "beforeend",

            `
        <div class="spec-row">

            <input
                type="text"
                class="spec-title"
                placeholder="عنوان مشخصه"
                value="${escapeAttr(label)}"
            >

            <input
                type="text"
                class="spec-value"
                placeholder="مقدار"
                value="${escapeAttr(value)}"
            >

            <button
                type="button"
                class="remove-spec"
            >
                ×
            </button>

        </div>
        `

        );

    }

    document
        .getElementById("addSpecification")
        .addEventListener("click", () => addSpecRow());

    const featuresContainer = document.getElementById("featuresContainer");

    function addFeatureRow(value = "") {

        featuresContainer.insertAdjacentHTML(

            "beforeend",

            `
        <div class="feature-row">

            <input
                type="text"
                class="feature-value"
                placeholder="مثلا: ضد حساسیت"
                value="${escapeAttr(value)}"
            >

            <button
                type="button"
                class="remove-feature"
            >
                ×
            </button>

        </div>
        `

        );

    }

    document
        .getElementById("addFeature")
        .addEventListener("click", () => addFeatureRow());

    if (product) {

        (product.specs || []).forEach(spec => addSpecRow(spec.label, spec.value));
        (product.features || []).forEach(feature => addFeatureRow(feature));

    }

}
document.addEventListener("click", (e) => {

    if (e.target.classList.contains("remove-spec")) {

        e.target.parentElement.remove();

    }

    if (e.target.classList.contains("remove-feature")) {

        e.target.parentElement.remove();

    }

});
async function submitProduct(e) {

    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
        showToast("error", "خطا", "ابتدا وارد حساب ادمین شوید.");
        return;
    }

    const submitBtn = document.querySelector('#productForm button[type="submit"]');
    setBtnLoading(submitBtn, true);

    try {
        await submitProductInner(token, submitBtn);
    } finally {
        setBtnLoading(submitBtn, false);
    }

}

async function submitProductInner(token, submitBtn) {

    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const shortDescription = document.getElementById("productShortDescription").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const stock = Number(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const brand = document.getElementById("productBrand").value.trim();
    let image = editingProductId
        ? document.getElementById("productImagePreview")?.getAttribute("src")
            ?.replace(`${SERVER_URL}/`, "")
        : "";

    const imageFile = document.getElementById("productImageFile");

    if (imageFile.files.length > 0) {

        const formData = new FormData();

        formData.append("image", imageFile.files[0]);

        const uploadRes = await fetch(
            `${API_BASE_URL}/upload`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }
        );

        if (!uploadRes.ok) {
            const err = await uploadRes.json();
            throw new Error(err.message || "خطا در آپلود تصویر");
        }

        const uploadData = await uploadRes.json();

        image = uploadData.image.replace("/", "");

    }

    const specifications = [];

    document.querySelectorAll(".spec-row").forEach(row => {

        const label = row.querySelector(".spec-title").value.trim();
        const value = row.querySelector(".spec-value").value.trim();

        if (label && value) {
            specifications.push({
                label,
                value
            });
        }

    });

    const features = [];

    document.querySelectorAll(".feature-row").forEach(row => {

        const value = row.querySelector(".feature-value").value.trim();

        if (value) {
            features.push(value);
        }

    });



    try {

        const url = editingProductId
            ? `${API_BASE_URL}/products/${editingProductId}`
            : `${API_BASE_URL}/products`;

        const method = editingProductId ? "PUT" : "POST";

        const res = await fetch(url, {

            method,

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({

                name,
                stock,
                description,
                shortDescription,
                price,
                image,
                brand,
                category,
                specs: specifications,
                features

            })

        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "خطا در ثبت محصول");
        }

        showToast(
            "success",
            editingProductId ? "ویرایش موفق" : "افزودن موفق",
            editingProductId
                ? "محصول با موفقیت ویرایش شد."
                : "محصول با موفقیت اضافه شد."
        );

        document.querySelector(".modal-overlay").remove();
        editingProductId = null;
        renderProducts();

    } catch (err) {

        console.error(err);

        showToast("error", "خطا", err.message);

    }

}
async function deleteProduct(id) {

    const confirmDelete = await showConfirmDialog(
        "آیا از حذف این محصول مطمئن هستید؟"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(
            `${API_BASE_URL}/products/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (!res.ok) {

            throw new Error(data.message);

        }

        showToast("success", "حذف موفق", "محصول با موفقیت حذف شد.");

        renderProducts();

    } catch (err) {

        console.error(err);

        showToast("error", "خطا", err.message);

    }

}