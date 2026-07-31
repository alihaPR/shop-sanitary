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


async function loadOrders() {

    try {

const res = await fetch(
    "http://localhost:5000/api/orders/myorders",
    {
        headers:{
            Authorization:`Bearer ${token}`
        }
    }
);

        const orders = await res.json();
        

        const container = document.getElementById("ordersContainer");

        if(orders.length===0){

            container.innerHTML=`
                <h3 style="text-align:center">
                    هنوز سفارشی ثبت نکرده‌اید.
                </h3>
            `;

            return;

        }

        container.innerHTML = orders.map(order=>`

            <div class="order-card">

                <div class="order-info">

                    <div class="order-id">

                        سفارش #${order._id.slice(-8)}

                    </div>

                    <div class="order-date">

                        ${new Date(order.createdAt).toLocaleDateString("fa-IR")}

                    </div>

                    <div class="order-price">

                        ${order.totalPrice.toLocaleString()} تومان

                    </div>

                    <span class="order-status ${order.status}">

                        ${translateStatus(order.status)}

                    </span>

                </div>

                <button
                    class="view-order"
                    onclick="openOrder('${order._id}')"
                >

                    مشاهده

                </button>

            </div>

        `).join("");

    } catch(err){

        console.log(err);

    }

}

function translateStatus(status){

    switch(status){

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

function openOrder(id){

    localStorage.setItem("selectedOrder",id);

    location.href="order-details.html";

}

document.getElementById("logout").onclick=()=>{

    localStorage.removeItem("token");

    location.href="../login.html";

}
loadUser();
loadOrders();