const token = localStorage.getItem("token");

const orderId = localStorage.getItem("selectedOrder");
async function loadUser() {

    const res = await fetch(
        "https://shop-sanitary-production.up.railway.app/api/users/profile",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const user = await res.json();

    document.getElementById("userName").textContent = user.name;
}

console.log("Order ID:", orderId);
async function loadOrderDetails() {

    try {

        const res = await fetch(

            `https://shop-sanitary-production.up.railway.app/api/orders/${orderId}`,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        const order = await res.json();

        console.log(order);
        console.log(order.items);
        console.log(order.items[0]);

        document.getElementById("orderDetails").innerHTML = `

            <div class="order-details-card">

                <h2>

                    سفارش #${order._id.slice(-8)}

                </h2>

                <br>

<p>

    <b>وضعیت:</b>

    <span class="status ${order.status}">

        ${translateStatus(order.status)}

    </span>

</p>

                <br>

                <p>

                    <b>تاریخ:</b>

                    ${new Date(order.createdAt).toLocaleDateString("fa-IR")}

                </p>

                <br>

                <p>

                    <b>مبلغ کل:</b>

                    ${order.totalPrice.toLocaleString()} تومان

                </p>

                <div class="order-products">

                  ${order.items.map(item => `

                        <div class="product-row">

 <img src="../${item.product.image}">

<div>

    <h4>${item.product.name}</h4>

    <p>
        تعداد :
        ${item.qty || 1}
    </p>

    <p>
        قیمت :
        ${item.price.toLocaleString()} تومان
    </p>

</div>

                            </div>

                        </div>

                    `).join("")}

                </div>

            </div>

        `;

    } catch (err) {

        console.log(err);

    }

}

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

        default:
            return status;

    }

}

document.getElementById("logout").onclick = () => {

    localStorage.removeItem("token");

    location.href = "../login.html";

};

loadUser();
loadOrderDetails();