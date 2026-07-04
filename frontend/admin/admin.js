async function checkAdminAccess() {

    const token = localStorage.getItem("token");

    if (!token) {

        window.location.href = "../login.html";
        return;

    }

    try {

        const res = await fetch(`${API_BASE_URL}/auth/profile`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        if (!res.ok) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "../login.html";
            return;

        }

        const user = await res.json();

        if (user.role !== "admin") {

            alert("شما دسترسی به پنل مدیریت ندارید.");

            window.location.href = "../index.html";

            return;

        }

    } catch (err) {

        console.error(err);

        window.location.href = "../login.html";

    }

}

checkAdminAccess();