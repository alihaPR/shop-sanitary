function renderSidebar() {

    const sidebar = document.getElementById("sidebar");

    sidebar.innerHTML = `

        <div class="sidebar-logo">
            <h2>NSG</h2>
        </div>

        <nav class="sidebar-menu">

            <button class="menu-item active" data-page="dashboard">

                <span class="menu-icon">
                    <!-- SVG داشبورد -->
                </span>

                <span>داشبورد</span>

            </button>

            <button class="menu-item" data-page="products">

                <span class="menu-icon">
                    <!-- SVG محصولات -->
                </span>

                <span>محصولات</span>

            </button>

            <button class="menu-item" data-page="orders">

                <span class="menu-icon">
                    <!-- SVG سفارش‌ها -->
                </span>

                <span>سفارش‌ها</span>

            </button>

            <button class="menu-item" data-page="users">

                <span class="menu-icon">
                    <!-- SVG کاربران -->
                </span>

                <span>کاربران</span>

            </button>

            <button class="menu-item" data-page="settings">

                <span class="menu-icon">
                    <!-- SVG تنظیمات -->
                </span>

                <span>تنظیمات</span>

            </button>

        </nav>

        <button class="logout-btn" id="logoutBtn">

            <span class="menu-icon">
                <!-- SVG خروج -->
            </span>

            <span>خروج</span>

        </button>

    `;

}

renderSidebar();

const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(btn => btn.classList.remove("active"));

        item.classList.add("active");

        const page = item.dataset.page;

        switch (page) {

            case "dashboard":
                renderDashboard();
                break;

            case "products":
                renderProducts();
                break;

            case "orders":
                renderOrders();
                break;

            case "users":
                renderUsers();
                break;

            case "settings":
                renderSettings();
                break;

        }

    });

});

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "../login.html";

});