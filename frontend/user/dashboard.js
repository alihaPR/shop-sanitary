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

        document.getElementById("userName").innerText = data.userName;

        // اگر عکس کاربر فعلاً نداری
        document.getElementById("userAvatar").src = "../img/user.png";


        document.getElementById("orderCount").innerText =
            data.orderCount;

        document.getElementById("pending").innerText =
            data.pending;

        document.getElementById("processing").innerText =
            data.processing;

        document.getElementById("shipped").innerText =
            data.shipped;

        document.getElementById("delivered").innerText =
            data.delivered;

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
