const token = localStorage.getItem("token");
async function loadUser() {

    const res = await fetch(
        "http://localhost:5000/api/users/profile",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const user = await res.json();

    document.getElementById("userName").textContent = user.name;
}

function createOrderCard(order) {

    return `
    <div class="order-wrapper">
        <div class="order-card">

            <div class="order-info">

                <div class="order-status__wraper">
                    <div class="order-status__cercel ${order.status}"></div>

                    <span class="order-status">
                        ${translateStatus(order.status)}
                    </span>
                </div>

                <div class="order-dtail">

                    <div class="order-date">
                        ${new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </div>

                    <div class="order-price">
                        ${order.totalPrice.toLocaleString()} تومان
                    </div>

                </div>

                <div class="order-products-images">

                    ${order.items.map(item => `
                        <img
                            src="http://localhost:5000/${item.image}"
                            alt="${item.name}"
                            class="order-product-image"
                        >
                    `).join("")}

                </div>

            </div>

            <div class="order-a">
                <a class="view-order" onclick="openOrder('${order._id}')">
                    <p>مشاهده</p>
                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3589 3.72481C13.5808 3.9467 13.601 4.29391 13.4194 4.53859L13.3589 4.60869L7.96782 10.0001L13.3589 15.3915C13.5808 15.6134 13.601 15.9606 13.4194 16.2053L13.3589 16.2754C13.137 16.4972 12.7898 16.5174 12.5451 16.3359L12.4751 16.2754L6.64172 10.442C6.41983 10.2201 6.39966 9.87291 6.5812 9.62824L6.64172 9.55814L12.4751 3.72481C12.7191 3.48073 13.1149 3.48073 13.3589 3.72481Z" fill="black"/>
                    </svg>

                </a>
            </div>

        </div>
    </div>
    `;

}
async function loadOrders() {

    try {

        const res = await fetch(
            "http://localhost:5000/api/orders/myorders",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const orders = await res.json();
        ;

        const container = document.getElementById("ordersContainer");

        if (orders.length === 0) {

            container.innerHTML = `
                <h3 style="text-align:center">
                    هنوز سفارشی ثبت نکرده‌اید.
                </h3>
            `;

            return;

        }
        const currentOrders = orders.filter(order =>
            ["pending", "processing", "shipped"].includes(order.status)
        ).length;

        const deliveredOrders = orders.filter(order =>
            order.status === "delivered"
        ).length;

        const cancelledOrders = orders.filter(order =>
            order.status === "cancelled"
        ).length;

        const allOrders = orders.length;
        document.getElementById("currentOrdersCount").textContent = currentOrders;

        document.getElementById("deliveredOrdersCount").textContent = deliveredOrders;

        document.getElementById("cancelledOrdersCount").textContent = cancelledOrders;

        document.getElementById("allOrdersCount").textContent = allOrders;

        container.innerHTML = orders.map(createOrderCard).join("");

        function renderOrders(list) {
            container.innerHTML = list.map(createOrderCard).join("");
        }

        renderOrders(orders);

        document.querySelectorAll(".filter-btn").forEach(btn => {

            btn.addEventListener("click", () => {

                document.querySelectorAll(".filter-btn")
                    .forEach(b => b.classList.remove("active"));

                btn.classList.add("active");

                switch (btn.dataset.status) {
                    case "all":
                        renderOrders(orders);
                        break;
                    case "current":
                        renderOrders(
                            orders.filter(o =>
                                ["pending", "processing", "shipped"].includes(o.status)
                            )
                        );
                        break;
                        const allOrders = orders.length;

                        document.getElementById("allOrdersCount").textContent = allOrders;
                    case "delivered":
                        renderOrders(
                            orders.filter(o => o.status === "delivered")
                        );
                        break;

                    case "cancelled":
                        renderOrders(
                            orders.filter(o => o.status === "cancelled")
                        );
                        break;

                    default:
                        renderOrders(orders);

                }

            });

        });


    } catch (err) {

        console.log(err);

    }

}
// console.log(order.items);

function translateStatus(status) {

    switch (status) {

        case "pending":
            return "در انتظار";

        case "processing":
            return "درحال پردازش";

        case "shipped":
            return "ارسال شده";

        case "delivered":
            return "تحویل شده";

        case "cancelled":
            return "لغو شده";
        default:
            return status;

    }

}

function openOrder(id) {

    localStorage.setItem("selectedOrder", id);

    location.href = "order-details.html";

}

document.getElementById("logout").onclick = () => {

    localStorage.removeItem("token");

    location.href = "../login.html";

}
loadUser();
loadOrders();