let editingProductId = null;
async function renderProducts() {

    const token = localStorage.getItem("token");

    const res = await fetch(
        "http://localhost:5000/api/products"
    );
    const products = await res.json();

    document.getElementById("main-content").innerHTML = `

<div class="products-header">

    <h2>مدیریت محصولات</h2>

    <div class="products-actions">

        <input
            type="text"
            id="productSearch"
            placeholder="جستجوی محصول..."
        >

        <button class="add-product-btn">
            + افزودن محصول
        </button>

    </div>

</div>

        <table class="products-table">

            <thead>

                <tr>

                    <th>تصویر</th>

                    <th>نام</th>

                    <th>قیمت</th>

                    <th>موجودی</th>

                    <th>دسته بندی</th>

                    <th>عملیات</th>

                </tr>

            </thead>

            <tbody>

                ${products.map(product => `

                    <tr>

                        <td>

<img src="http://localhost:5000/${product.image}" class="table-image">
                        </td>

                        <td>${product.name}</td>

                        <td>${product.price.toLocaleString()} تومان</td>

                        <td>${product.stock}</td>

                        <td>${product.category}</td>

                        <td>

                        <button class="edit-btn"  data-id="${product._id}">
                         ویرایش
                        </button>

                            <button class="delete-btn" data-id="${product._id}">
                                حذف
                            </button>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

    `;
    const searchInput = document.getElementById("productSearch");

    searchInput.addEventListener("input", () => {

        const keyword = searchInput.value.toLowerCase();

        document.querySelectorAll(".products-table tbody tr").forEach(row => {

            const text = row.innerText.toLowerCase();

            row.style.display = text.includes(keyword)
                ? ""
                : "none";

        });

    });
    document.querySelector(".add-product-btn").addEventListener("click", openProductModal);

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const id = btn.dataset.id;

            const product = products.find(p => p._id === id);

            openProductModal(product);

        });

    });

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            deleteProduct(btn.dataset.id);

        });

    });

}
function openProductModal(product = null) {

    document.body.insertAdjacentHTML("beforeend", `

        <div class="modal-overlay">

            <div class="product-modal product-modal--redesign">

                <div class="modal-header">

                    <h2>افزودن محصول</h2>

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
                        <button type="submit">ثبت محصول</button>
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

            previewImg.src = `http://localhost:5000/${product.image}`;
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
        alert("ابتدا وارد حساب ادمین شوید.");
        return;
    }

    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const shortDescription = document.getElementById("productShortDescription").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const stock = Number(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const brand = document.getElementById("productBrand").value.trim();
    let image = editingProductId
        ? document.querySelector(".table-image")?.getAttribute("src")
            ?.replace("http://localhost:5000/", "")
        : "";

    const imageFile = document.getElementById("productImageFile");

    if (imageFile.files.length > 0) {

        const formData = new FormData();

        formData.append("image", imageFile.files[0]);

        const uploadRes = await fetch(
            "http://localhost:5000/api/upload",
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
            ? `http://localhost:5000/api/products/${editingProductId}`
            : "http://localhost:5000/api/products";

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

        alert(
            editingProductId
                ? "✅ محصول با موفقیت ویرایش شد."
                : "✅ محصول با موفقیت اضافه شد."
        );

        document.querySelector(".modal-overlay").remove();
        editingProductId = null;
        renderProducts();

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}
async function deleteProduct(id) {

    const confirmDelete = confirm(
        "آیا از حذف این محصول مطمئن هستید؟"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {

        const res = await fetch(
            `http://localhost:5000/api/products/${id}`,
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

        alert("✅ محصول با موفقیت حذف شد.");

        renderProducts();

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}
