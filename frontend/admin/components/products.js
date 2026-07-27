let editingProductId = null;
async function renderProducts() {

    const token = localStorage.getItem("token");

    const res = await fetch(
        "https://shop-sanitary-production.up.railway.app/api/products"
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

                            <img src="https://shop-sanitary-production.up.railway.app/${product.image}" class="table-image">

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

            <div class="product-modal">

                <div class="modal-header">

                    <h2>افزودن محصول</h2>

                    <button class="close-modal">✕</button>

                </div>

                <form id="productForm">

                    <input id="productName" type="text" placeholder="نام محصول">

                    <input id="productPrice" type="number" placeholder="قیمت">

                    <input id="productStock" type="number" placeholder="موجودی">

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

                    <input id="productBrand" type="text" placeholder="برند">

                    <input id="productImageFile" type="file" accept="image/*">

                    <textarea id="productDescription" placeholder="توضیحات"></textarea>
                    
                    <hr>

                     <h3>مشخصات کالا</h3>

                     <div id="specificationsContainer">

                     </div>

                     <button
                         type="button"
                         id="addSpecification"
                         class="add-specification"
                     >

                     + افزودن مشخصه

                     </button>

                     <hr >

                    <button type="submit">

                        ثبت محصول

                    </button>

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

    }
    else {

        editingProductId = null;

    }
    document.getElementById("productForm").addEventListener("submit", submitProduct);

    document.querySelector(".close-modal").onclick = () => {

        document.querySelector(".modal-overlay").remove();

    }
    const specsContainer = document.getElementById("specificationsContainer");

    document
        .getElementById("addSpecification")
        .addEventListener("click", () => {

            specsContainer.insertAdjacentHTML(

                "beforeend",

                `
        <div class="spec-row">

            <input
                type="text"
                class="spec-title"
                placeholder="عنوان مشخصه"
            >

            <input
                type="text"
                class="spec-value"
                placeholder="مقدار"
            >

            <button
                type="button"
                class="remove-spec"
            >
                حذف
            </button>

        </div>
        `

            );

        });

}
document.addEventListener("click", (e) => {

    if (e.target.classList.contains("remove-spec")) {

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
    const price = Number(document.getElementById("productPrice").value);
    const stock = Number(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const brand = document.getElementById("productBrand").value.trim();
    let image = "";

    const imageFile = document.getElementById("productImageFile");

    if (imageFile.files.length > 0) {

        const formData = new FormData();

        formData.append("image", imageFile.files[0]);

        const uploadRes = await fetch(
            "https://shop-sanitary-production.up.railway.app/api/upload",
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

        image = uploadData.image;

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



    try {

        const url = editingProductId
            ? `https://shop-sanitary-production.up.railway.app/api/products/${editingProductId}`
            : "https://shop-sanitary-production.up.railway.app/api/products";

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
                price,
                image,
                brand,
                category,
                specs: specifications,
                features: []

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
            `https://shop-sanitary-production.up.railway.app/api/products/${id}`,
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
