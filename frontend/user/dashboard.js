const token = localStorage.getItem("token");

async function loadDashboard() {

    try {

        const res = await fetch(
            "https://shop-sanitary-production.up.railway.app/api/users/dashboard",
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

document.getElementById("returned").innerText =
    data.returned || 0;

        document.getElementById("spent").innerText =
            data.totalSpent.toLocaleString() + " تومان";

        if (data.lastOrder) {

            document.getElementById("lastOrderBox").innerHTML = `

                <p><b>کد سفارش:</b> ${data.lastOrder._id.slice(-8)}</p>

                <p><b>وضعیت:</b> ${data.lastOrder.status}</p>

                <p><b>مبلغ:</b> ${data.lastOrder.totalPrice.toLocaleString()} تومان</p>

                <p><b>تاریخ:</b> ${new Date(data.lastOrder.createdAt).toLocaleDateString("fa-IR")}</p>

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