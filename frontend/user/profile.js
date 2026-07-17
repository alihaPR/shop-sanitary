const token = localStorage.getItem("token");

if (!token) {
    location.href = "../login.html";
}

let currentUser = {};

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

        currentUser = user;

        document.getElementById("userName").textContent = user.name;
        document.getElementById("name").textContent = user.name;
        document.getElementById("email").textContent = user.email;
        document.getElementById("phone").textContent =
            user.phone || "ثبت نشده";
        document.getElementById("address").textContent =
            user.address || "ثبت نشده";

    } catch (err) {

        console.log(err);

    }

}

document.getElementById("logout").onclick = () => {

    localStorage.removeItem("token");

    location.href = "../login.html";

};

/* ===========================
      ویرایش اطلاعات
=========================== */

document.getElementById("editProfile").onclick = () => {

    document.getElementById("editModal").style.display = "flex";

    document.getElementById("editName").value =
        currentUser.name || "";

    document.getElementById("editPhone").value =
        currentUser.phone || "";

    document.getElementById("editAddress").value =
        currentUser.address || "";

};

document.getElementById("closeModal").onclick = () => {

    document.getElementById("editModal").style.display = "none";

};

document.getElementById("saveProfile").onclick = async () => {

    const body = {

        name: document.getElementById("editName").value,

        phone: document.getElementById("editPhone").value,

        address: document.getElementById("editAddress").value

    };

    try {

        const res = await fetch(
            "https://shop-sanitary-production.up.railway.app/api/users/profile",
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify(body)

            }
        );

        if (!res.ok) {

            throw new Error("خطا در ذخیره اطلاعات");

        }

        document.getElementById("editModal").style.display = "none";

        await loadProfile();

        alert("اطلاعات با موفقیت ذخیره شد.");

    } catch (err) {

        alert(err.message);

    }

};

/* ===========================
      تغییر رمز
=========================== */

document.getElementById("changePassword").onclick = () => {

    document.getElementById("passwordModal").style.display = "flex";

};

document.getElementById("closePassword").onclick = () => {

    document.getElementById("passwordModal").style.display = "none";

};

document.getElementById("savePassword").onclick = async () => {

    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {

        return alert("تکرار رمز عبور صحیح نیست.");

    }

    try {

        const res = await fetch(
            "https://shop-sanitary-production.up.railway.app/api/users/change-password",
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    currentPassword,

                    newPassword

                })

            }
        );

        const data = await res.json();

        if (!res.ok) {

            throw new Error(data.message);

        }

        alert("رمز عبور با موفقیت تغییر کرد.");

        document.getElementById("passwordModal").style.display = "none";

        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";

    } catch (err) {

        alert(err.message);

    }

};

loadProfile();