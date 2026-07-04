function renderLayout() {

    const header = document.getElementById("header");

    header.innerHTML = `

        <div class="header-left">

            <h2>پنل مدیریت فروشگاه NSG</h2>

        </div>

        <div class="header-right">

            <span id="admin-name">در حال بارگذاری...</span>

            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
                 class="admin-avatar">

        </div>

    `;

}

renderLayout();
async function loadAdminInfo() {

    try {

        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/auth/profile`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        if (!res.ok) return;

        const user = await res.json();

        document.getElementById("admin-name").textContent = user.name;

    } catch (err) {

        console.log(err);

    }

}

loadAdminInfo();