const token = localStorage.getItem("token");

if (!token) {

    location.href = "../login.html";

}

async function loadProfile() {

    try {

        const res = await fetch(
            "https://shop-sanitary-production.up.railway.app/api/users/profile",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const user = await res.json();

        console.log(user);

        document.getElementById("userName").textContent = user.name;

        document.getElementById("name").textContent = user.name;

        document.getElementById("email").textContent = user.email;

        document.getElementById("phone").textContent =
            user.phone || "ثبت نشده";

        document.getElementById("address").textContent =
            user.address || "ثبت نشده";

    } catch (err) {

        console.log(err);

        alert("خطا در دریافت اطلاعات کاربر");

    }

}

document.getElementById("logout").onclick = () => {

    localStorage.removeItem("token");

    location.href = "../login.html";

};

document.getElementById("editProfile").onclick = () => {

    alert("مرحله بعدی: ویرایش پروفایل");

};

loadProfile();