async function renderOrders() {

    const token = localStorage.getItem("token");

    const res = await fetch(
        "https://shop-sanitary-production.up.railway.app/api/orders",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    const orders = await res.json();

    document.getElementById("main-content").innerHTML = `

        <div class="products-header">

            <h2>مدیریت سفارش‌ها</h2>

        </div>

        <table class="products-table">

            <thead>

                <tr>

                    <th>شماره سفارش</th>

                    <th>مشتری</th>

                    <th>مبلغ</th>

                    <th>وضعیت</th>

                    <th>تاریخ</th>

                    <th>عملیات</th>

                </tr>

            </thead>

            <tbody>

                ${orders.map(order => `

                    <tr>

                        <td>#${order._id.slice(-6)}</td>

                        <td>${order.user?.name || "-"}</td>

                        <td>${order.totalPrice.toLocaleString()} تومان</td>

                        <td>

                        <span class="status-badge ${order.status}">

                        ${order.status === "pending"
            ? "در انتظار"

            : order.status === "processing"
                ? "در حال پردازش"

                : order.status === "shipped"
                    ? "ارسال شده"

                    : order.status === "delivered"
                        ? "تحویل شده"

                        : "لغو شده"
        }

                        </span>

                        </td>

                        <td>${new Date(order.createdAt).toLocaleDateString("fa-IR")}</td>

                        <td>

                            <button
                                class="view-order-btn"
                                data-id="${order._id}"
                            >
                                مشاهده
                            </button>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

    `;
    document.querySelectorAll(".view-order-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const id = btn.dataset.id;

            openOrderModal(id);

        });

    });

}




async function openOrderModal(id) {

    const token = localStorage.getItem("token");

    const res = await fetch(
        `https://shop-sanitary-production.up.railway.app/api/orders/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const order = await res.json();

    if (!res.ok) {
        alert(order.message || "خطا در دریافت جزئیات سفارش");
        console.error("Order fetch error:", order);
        return;
    }

    if (!order || !order._id) {
        alert("پاسخ نامعتبر از سرور دریافت شد");
        console.error("Invalid order response:", order);
        return;
    }


    document.body.insertAdjacentHTML(
        "beforeend",

        `

        <div class="modal-overlay order-modal-overlay">

            <div class="product-modal order-modal">


                <div class="modal-header">

                    <h2>
                        سفارش #${order._id.slice(-6)}
                    </h2>


                    <button class="close-order-modal">
                        ✕
                    </button>

                </div>



                <div class="order-modal-body">

                <div class="order-info">

                    <p>
                    👤 مشتری:
                    ${order.user?.name || "-"}
                    </p>


                    <p>
                    📧 ایمیل:
                    ${order.user?.email || "-"}
                    </p>


                    <p>
                    📱 تلفن گیرنده:
                    ${order.shippingAddress?.phone || "-"}
                    </p>


                    <p>
                    🏙️ شهر:
                    ${order.shippingAddress?.city || "-"}
                    </p>


                    <p>
                    📍 آدرس:
                    ${order.shippingAddress?.address || "-"}
                    </p>


                    <p>
                    📮 کدپستی:
                    ${order.shippingAddress?.postalCode || "-"}
                    </p>


                    <p>
                    💰 مبلغ:
                    ${order.totalPrice.toLocaleString()}
                    تومان
                    </p>



                   <div class="status-box">

    <label>
        وضعیت سفارش
    </label>


    <select id="orderStatus">

        <option value="pending"
        ${order.status === "pending" ? "selected" : ""}>
            در انتظار
        </option>


        <option value="processing"
        ${order.status === "processing" ? "selected" : ""}>
            در حال پردازش
        </option>


        <option value="shipped"
        ${order.status === "shipped" ? "selected" : ""}>
            ارسال شده
        </option>


        <option value="delivered"
        ${order.status === "delivered" ? "selected" : ""}>
            تحویل شده
        </option>


        <option value="cancelled"
        ${order.status === "cancelled" ? "selected" : ""}>
            لغو شده
        </option>


    </select>


    <button  class="save-status-btn"  data-id="${order._id}" >
        ذخیره وضعیت
    </button>


</div>


                </div>



                <hr>



                <h3>
                محصولات
                </h3>


                <div class="order-products">

                    ${order.items.map(item => `

                        <div class="order-product-item">

<div class="order-product-item">

    <div>
    <img
                src="../${item.product?.image || ""}"
                class="table-image"
                style="width:60px;height:60px;border-radius:8px;object-fit:cover;"
      >

        <strong>

                ${item.product?.name || item.name || "محصول"}

        </strong>

        <br>

        <small>

            تعداد:
            ${item.quantity ?? item.qty ?? item.count ?? 1}

        </small>

    </div>

    <div>

        ${(item.price || 0).toLocaleString()} تومان

    </div>

</div>

                        </div>


                        `).join("")
        }


                </div>
                <div class="order-total">

                <span>جمع کل سفارش</span>

                <span>

                ${order.totalPrice.toLocaleString()} تومان

                </span>

                </div>

                </div>



            </div>

        </div>


        `
    );



    document
        .querySelector(".close-order-modal")
        .onclick = () => {

            document
                .querySelector(".order-modal-overlay")
                .remove();

        };

    document
        .querySelector(".save-status-btn")
        .addEventListener("click", () => {

            const id =
                document
                    .querySelector(".save-status-btn")
                    .dataset.id;


            const status =
                document
                    .getElementById("orderStatus")
                    .value;


            updateOrderStatus(id, status);

        });

}

async function updateOrderStatus(id, status) {

    const token = localStorage.getItem("token");


    const res = await fetch(

        `https://shop-sanitary-production.up.railway.app/api/orders/${id}/status`,

        {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },


            body: JSON.stringify({

                status

            })

        }

    );


    const data = await res.json();


    if (!res.ok) {

        alert(data.message || "خطا در تغییر وضعیت");

        return;

    }


    alert("✅ وضعیت سفارش تغییر کرد");


    document
        .querySelector(".order-modal-overlay")
        .remove();


    renderOrders();


}