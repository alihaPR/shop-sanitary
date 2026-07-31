const token = localStorage.getItem("token");

async function loadDashboard() {

    try {

        const res = await fetch(
            "http://localhost:5000/api/users/dashboard",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        console.log(data);
        console.log(data.lastOrder.items[0]);
        console.log("Data:", data);


        document.getElementById("userName").innerText = data.userName;



        const currentOrders =
            data.pending +
            data.processing +
            data.shipped;

        document.getElementById("currentOrders").innerText =
            currentOrders;

        document.getElementById("delivered").innerText =
            data.delivered;


        document.getElementById("spent").innerText =
            data.totalSpent.toLocaleString() + " تومان";

        if (data.lastOrder) {
            const statusMap = {
                pending: { text: "در انتظار بررسی", color: "#f59e0b" },
                processing: { text: "در حال پردازش", color: "#3b82f6" },
                shipped: { text: "ارسال شده", color: "#8b5cf6" },
                delivered: { text: "تحویل شده", color: "#22c55e" },
                cancelled: { text: "لغو شده", color: "#ef4444" }
            };

            const status = statusMap[data.lastOrder.status] || {
                text: data.lastOrder.status,
                color: "#f8f4f4"
            };

            document.getElementById("lastOrderBox").innerHTML = `

<div class="last-order-card">

    <div class="order-row">
        <span>کد سفارش</span>
        <strong>#${data.lastOrder._id.slice(-8)}</strong>
    </div>

    <div class="order-row">
        <span>وضعیت</span>
        <span class="status-badge" id="status-badge-text"  style="background:${status.color}">
            ${status.text}
        </span>
    </div>

    <div class="order-row">
        <span>مبلغ</span>
        <strong>${data.lastOrder.totalPrice.toLocaleString()} تومان</strong>
    </div>

    <div class="order-row">
        <span>تاریخ</span>
        <strong>${new Date(data.lastOrder.createdAt).toLocaleDateString("fa-IR")}</strong>
    </div>

</div>

`;

        }

    } catch (err) {

        console.log(err);

    }

}

loadDashboard();

document.getElementById("logout").onclick = () => {

    localStorage.removeItem("token");

    location.href = "../login.html";

};