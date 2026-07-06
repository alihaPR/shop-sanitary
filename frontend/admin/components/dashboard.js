async function renderDashboard() {

    const token = localStorage.getItem("token");

    const res = await fetch("https://shop-sanitary-production.up.railway.app/api/admin/stats",{

        headers:{
            Authorization:`Bearer ${token}`
        }

    });

    const data = await res.json();

    document.getElementById("main-content").innerHTML=`

        <h2 class="dashboard-title">
            داشبورد مدیریت
        </h2>

        <div class="dashboard-cards">

            <div class="dashboard-card">

                <div class="card-info">

                    <span>محصولات</span>

                    <h2>${data.productCount}</h2>

                </div>

                <div class="card-icon"></div>

            </div>

            <div class="dashboard-card">

                <div class="card-info">

                    <span>کاربران</span>

                    <h2>${data.userCount}</h2>

                </div>

                <div class="card-icon"></div>

            </div>

            <div class="dashboard-card">

                <div class="card-info">

                    <span>سفارش‌ها</span>

                    <h2>${data.orderCount}</h2>

                </div>

                <div class="card-icon"></div>

            </div>

        </div>

    `;

}