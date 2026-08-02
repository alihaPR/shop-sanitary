/* =====================================================================
   کامپوننت پروفایل (اطلاعات حساب)
   مودال‌های ویرایش و تغییر رمز تو index.html همیشه تو صفحه هستن،
   بایندینگ دکمه‌های ثابتشون (بستن، ذخیره و...) همینجا و فقط یک‌بار انجام میشه.
   دکمه‌های edit-btn چون هر بار تو تمپلیت این کامپوننت دوباره ساخته میشن،
   داخل init() هر بار دوباره بایند میشن.
===================================================================== */

window.Views = window.Views || {};

let currentUser = {};
let editingField = "";

window.Views.profile = {

    template: `
        <div class="profile-card">

            <div class="profile-header">
                <h2 id="profileTitle">اطلاعات شخصی</h2>
            </div>

            <div class="profile-info">

                <div class="info-item">
                    <div class="info-wraper">
                        <span>نام و نام خانوادگی</span>
                        <strong id="name" class="info-text-p"></strong>
                    </div>
                    <button class="edit-btn" data-field="name">
                        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6413 16.4548H10.1742C9.86215 16.4548 9.60889 16.2028 9.60889 15.8923C9.60889 15.5818 9.86215 15.3298 10.1742 15.3298H15.6413C15.9534 15.3298 16.2066 15.5818 16.2066 15.8923C16.2066 16.2028 15.9534 16.4548 15.6413 16.4548Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.88233 3.76273L2.7856 12.594C2.6567 12.7545 2.60921 12.9615 2.6567 13.1602L3.17002 15.324L5.46072 15.2955C5.67856 15.2932 5.87982 15.1965 6.01323 15.0315C8.43811 12.0127 13.061 6.25723 13.1921 6.08848C13.3157 5.88898 13.364 5.60698 13.2992 5.33548C13.2328 5.05723 13.0587 4.82098 12.8077 4.67023C12.7542 4.63348 11.4841 3.65248 11.4449 3.62173C10.967 3.24073 10.2698 3.30673 9.88233 3.76273ZM2.72379 16.455C2.46223 16.455 2.23459 16.2765 2.17354 16.0222L1.5562 13.419C1.42881 12.8797 1.55545 12.3232 1.90293 11.8912L9.00344 3.05473C9.00645 3.05173 9.00871 3.04798 9.01173 3.04498C9.79037 2.11873 11.1984 1.98223 12.1482 2.74048C12.1858 2.76973 13.4469 3.74473 13.4469 3.74473C13.9052 4.01623 14.2632 4.50148 14.3989 5.07598C14.5338 5.64448 14.4358 6.23098 14.1215 6.72673C14.0982 6.76348 14.0778 6.79498 6.8959 15.735C6.54992 16.164 6.03133 16.4137 5.47429 16.4205L2.73133 16.455H2.72379Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2287 8.76377C12.1081 8.76377 11.9875 8.72552 11.8842 8.64752L7.77464 5.50652C7.5274 5.31752 7.48067 4.96502 7.67062 4.71752C7.86132 4.47152 8.21559 4.42577 8.46358 4.61477L12.5739 7.75502C12.8211 7.94402 12.8679 8.29727 12.6772 8.54402C12.5663 8.68802 12.3983 8.76377 12.2287 8.76377Z" fill="black" />
                        </svg>
                    </button>
                </div>

                <div class="info-item">
                    <div class="info-wraper">
                        <span>ایمیل</span>
                        <strong id="email" class="info-text-p"></strong>
                    </div>
                    <button class="edit-btn" data-field="email">
                        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6413 16.4548H10.1742C9.86215 16.4548 9.60889 16.2028 9.60889 15.8923C9.60889 15.5818 9.86215 15.3298 10.1742 15.3298H15.6413C15.9534 15.3298 16.2066 15.5818 16.2066 15.8923C16.2066 16.2028 15.9534 16.4548 15.6413 16.4548Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.88233 3.76273L2.7856 12.594C2.6567 12.7545 2.60921 12.9615 2.6567 13.1602L3.17002 15.324L5.46072 15.2955C5.67856 15.2932 5.87982 15.1965 6.01323 15.0315C8.43811 12.0127 13.061 6.25723 13.1921 6.08848C13.3157 5.88898 13.364 5.60698 13.2992 5.33548C13.2328 5.05723 13.0587 4.82098 12.8077 4.67023C12.7542 4.63348 11.4841 3.65248 11.4449 3.62173C10.967 3.24073 10.2698 3.30673 9.88233 3.76273ZM2.72379 16.455C2.46223 16.455 2.23459 16.2765 2.17354 16.0222L1.5562 13.419C1.42881 12.8797 1.55545 12.3232 1.90293 11.8912L9.00344 3.05473C9.00645 3.05173 9.00871 3.04798 9.01173 3.04498C9.79037 2.11873 11.1984 1.98223 12.1482 2.74048C12.1858 2.76973 13.4469 3.74473 13.4469 3.74473C13.9052 4.01623 14.2632 4.50148 14.3989 5.07598C14.5338 5.64448 14.4358 6.23098 14.1215 6.72673C14.0982 6.76348 14.0778 6.79498 6.8959 15.735C6.54992 16.164 6.03133 16.4137 5.47429 16.4205L2.73133 16.455H2.72379Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2287 8.76377C12.1081 8.76377 11.9875 8.72552 11.8842 8.64752L7.77464 5.50652C7.5274 5.31752 7.48067 4.96502 7.67062 4.71752C7.86132 4.47152 8.21559 4.42577 8.46358 4.61477L12.5739 7.75502C12.8211 7.94402 12.8679 8.29727 12.6772 8.54402C12.5663 8.68802 12.3983 8.76377 12.2287 8.76377Z" fill="black" />
                        </svg>
                    </button>
                </div>

                <div class="info-item">
                    <div class="info-wraper">
                        <span>شماره موبایل</span>
                        <strong id="phone" class="info-text-p"></strong>
                    </div>
                    <button class="edit-btn" data-field="phone">
                        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6413 16.4548H10.1742C9.86215 16.4548 9.60889 16.2028 9.60889 15.8923C9.60889 15.5818 9.86215 15.3298 10.1742 15.3298H15.6413C15.9534 15.3298 16.2066 15.5818 16.2066 15.8923C16.2066 16.2028 15.9534 16.4548 15.6413 16.4548Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.88233 3.76273L2.7856 12.594C2.6567 12.7545 2.60921 12.9615 2.6567 13.1602L3.17002 15.324L5.46072 15.2955C5.67856 15.2932 5.87982 15.1965 6.01323 15.0315C8.43811 12.0127 13.061 6.25723 13.1921 6.08848C13.3157 5.88898 13.364 5.60698 13.2992 5.33548C13.2328 5.05723 13.0587 4.82098 12.8077 4.67023C12.7542 4.63348 11.4841 3.65248 11.4449 3.62173C10.967 3.24073 10.2698 3.30673 9.88233 3.76273ZM2.72379 16.455C2.46223 16.455 2.23459 16.2765 2.17354 16.0222L1.5562 13.419C1.42881 12.8797 1.55545 12.3232 1.90293 11.8912L9.00344 3.05473C9.00645 3.05173 9.00871 3.04798 9.01173 3.04498C9.79037 2.11873 11.1984 1.98223 12.1482 2.74048C12.1858 2.76973 13.4469 3.74473 13.4469 3.74473C13.9052 4.01623 14.2632 4.50148 14.3989 5.07598C14.5338 5.64448 14.4358 6.23098 14.1215 6.72673C14.0982 6.76348 14.0778 6.79498 6.8959 15.735C6.54992 16.164 6.03133 16.4137 5.47429 16.4205L2.73133 16.455H2.72379Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2287 8.76377C12.1081 8.76377 11.9875 8.72552 11.8842 8.64752L7.77464 5.50652C7.5274 5.31752 7.48067 4.96502 7.67062 4.71752C7.86132 4.47152 8.21559 4.42577 8.46358 4.61477L12.5739 7.75502C12.8211 7.94402 12.8679 8.29727 12.6772 8.54402C12.5663 8.68802 12.3983 8.76377 12.2287 8.76377Z" fill="black" />
                        </svg>
                    </button>
                </div>

                <div class="info-item">
                    <div class="info-wraper">
                        <span>آدرس</span>
                        <strong id="address" class="info-text-p"></strong>
                    </div>
                    <button class="edit-btn" data-field="address">
                        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6413 16.4548H10.1742C9.86215 16.4548 9.60889 16.2028 9.60889 15.8923C9.60889 15.5818 9.86215 15.3298 10.1742 15.3298H15.6413C15.9534 15.3298 16.2066 15.5818 16.2066 15.8923C16.2066 16.2028 15.9534 16.4548 15.6413 16.4548Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.88233 3.76273L2.7856 12.594C2.6567 12.7545 2.60921 12.9615 2.6567 13.1602L3.17002 15.324L5.46072 15.2955C5.67856 15.2932 5.87982 15.1965 6.01323 15.0315C8.43811 12.0127 13.061 6.25723 13.1921 6.08848C13.3157 5.88898 13.364 5.60698 13.2992 5.33548C13.2328 5.05723 13.0587 4.82098 12.8077 4.67023C12.7542 4.63348 11.4841 3.65248 11.4449 3.62173C10.967 3.24073 10.2698 3.30673 9.88233 3.76273ZM2.72379 16.455C2.46223 16.455 2.23459 16.2765 2.17354 16.0222L1.5562 13.419C1.42881 12.8797 1.55545 12.3232 1.90293 11.8912L9.00344 3.05473C9.00645 3.05173 9.00871 3.04798 9.01173 3.04498C9.79037 2.11873 11.1984 1.98223 12.1482 2.74048C12.1858 2.76973 13.4469 3.74473 13.4469 3.74473C13.9052 4.01623 14.2632 4.50148 14.3989 5.07598C14.5338 5.64448 14.4358 6.23098 14.1215 6.72673C14.0982 6.76348 14.0778 6.79498 6.8959 15.735C6.54992 16.164 6.03133 16.4137 5.47429 16.4205L2.73133 16.455H2.72379Z" fill="black" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2287 8.76377C12.1081 8.76377 11.9875 8.72552 11.8842 8.64752L7.77464 5.50652C7.5274 5.31752 7.48067 4.96502 7.67062 4.71752C7.86132 4.47152 8.21559 4.42577 8.46358 4.61477L12.5739 7.75502C12.8211 7.94402 12.8679 8.29727 12.6772 8.54402C12.5663 8.68802 12.3983 8.76377 12.2287 8.76377Z" fill="black" />
                        </svg>
                    </button>
                </div>

            </div>

            <hr class="profile-divider">

            <div class="security-section">
                <h3>امنیت حساب</h3>
                <p>برای افزایش امنیت حساب، رمز عبور خود را به‌صورت دوره‌ای تغییر دهید.</p>
                <button id="changePassword">تغییر رمز عبور</button>
            </div>

        </div>
    `,

    init: async function () {
        await loadProfile();
        bindEditButtons();
    }
};

/* =========================================================
   گرفتن اطلاعات پروفایل از سرور
========================================================= */

async function loadProfile() {

    try {

        const res = await fetch(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const user = await res.json();
        currentUser = user;

        document.getElementById("name").textContent = user.name;
        document.getElementById("email").textContent = user.email;
        document.getElementById("phone").textContent = user.phone || "ثبت نشده";
        document.getElementById("address").textContent = user.address || "ثبت نشده";

    } catch (err) {
        console.log(err);
    }
}

/* دکمه‌های ویرایش و "تغییر رمز عبور" هر بار که تمپلیت پروفایل دوباره
   ساخته میشه از نو ساخته میشن، پس باید هر بار دوباره بایند بشن */
function bindEditButtons() {

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {

            editingField = btn.dataset.field;
            document.getElementById("editModal").style.display = "flex";

            const input = document.getElementById("editInput");
            const title = document.getElementById("modalTitle");

            if (editingField === "name") {
                title.textContent = "ویرایش نام";
                input.value = currentUser.name || "";
            }
            if (editingField === "email") {
                title.textContent = "ویرایش ایمیل";
                input.value = currentUser.email || "";
            }
            if (editingField === "phone") {
                title.textContent = "ویرایش شماره موبایل";
                input.value = currentUser.phone || "";
            }
            if (editingField === "address") {
                title.textContent = "ویرایش آدرس";
                input.value = currentUser.address || "";
            }
        };
    });

    document.getElementById("changePassword").onclick = () => {
        document.getElementById("passwordModal").style.display = "flex";
    };
}

/* =========================================================
   مودال ویرایش اطلاعات - این المان‌ها همیشه تو صفحه هستن،
   پس بایندینگشون فقط یک‌بار (وقتی این فایل لود میشه) کافیه
========================================================= */

document.getElementById("closeModal").onclick = () => {
    document.getElementById("editModal").style.display = "none";
};

document.getElementById("saveProfile").onclick = async () => {

    const body = {};
    body[editingField] = document.getElementById("editInput").value;

    try {

        const res = await fetch(`${API_BASE}/users/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("خطا در ذخیره اطلاعات");

        document.getElementById("editModal").style.display = "none";
        await loadProfile();
        alert("اطلاعات با موفقیت ذخیره شد.");

    } catch (err) {
        alert(err.message);
    }
};

/* =========================================================
   مودال تغییر رمز عبور
========================================================= */

document.getElementById("closePassword").onclick = () => {
    document.getElementById("passwordModal").style.display = "none";
};

const newPasswordInput = document.getElementById("newPassword");

function toggleRule(id, valid) {
    const item = document.getElementById(id);
    if (valid) {
        item.classList.add("valid");
        item.innerHTML = "✅ " + item.textContent.slice(2);
    } else {
        item.classList.remove("valid");
        item.innerHTML = "❌ " + item.textContent.slice(2);
    }
}

newPasswordInput.addEventListener("input", () => {
    const password = newPasswordInput.value;
    toggleRule("ruleLength", password.length >= 8);
    toggleRule("ruleUpper", /[A-Z]/.test(password));
    toggleRule("ruleLower", /[a-z]/.test(password));
    toggleRule("ruleNumber", /[0-9]/.test(password));
});

document.getElementById("savePassword").onclick = async () => {

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        return alert("تکرار رمز عبور صحیح نیست.");
    }

    const strongPassword =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword);

    if (!strongPassword) {
        return alert("رمز عبور باید حداقل ۸ کاراکتر، شامل حرف بزرگ، حرف کوچک و عدد باشد.");
    }

    try {

        const res = await fetch(`${API_BASE}/users/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("رمز عبور با موفقیت تغییر کرد.");
        document.getElementById("passwordModal").style.display = "none";
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";

    } catch (err) {
        alert(err.message);
    }
};

const toggleCurrentPassword = document.getElementById("toggleCurrentPassword");

toggleCurrentPassword.addEventListener("click", () => {
    const input = document.getElementById("currentPassword");
    if (input.type === "password") {
        input.type = "text";
        toggleCurrentPassword.classList.remove("fa-eye");
        toggleCurrentPassword.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        toggleCurrentPassword.classList.remove("fa-eye-slash");
        toggleCurrentPassword.classList.add("fa-eye");
    }
});
