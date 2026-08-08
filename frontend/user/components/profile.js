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

/* هر فیلد پروفایل تایپ اینپوت و پلیس‌هولدر مخصوص خودش رو داره.
   آدرس چون متن بلندی می‌تونه باشه با تکس‌اریا ویرایش میشه */
const fieldConfig = {
    name: { label: "ویرایش نام", type: "text", placeholder: "مثلاً: علی رضایی" },
    email: { label: "ویرایش ایمیل", type: "email", placeholder: "example@email.com" },
    phone: { label: "ویرایش شماره موبایل", type: "tel", placeholder: "مثلاً: 09123456789" },
    address: { label: "ویرایش آدرس", placeholder: "آدرس کامل پستی خود را بنویسید" }
};

/* آیکون کنار اینپوت‌ها: وقتی خالیه "+" نشون میده، وقتی مقدار داره تیک سبز میشه */
function updateInputIcon(hasValue) {
    const icon = document.getElementById("editInputIcon");
    if (!icon) return;
    icon.querySelector(".icon-plus").style.display = hasValue ? "none" : "block";
    icon.querySelector(".icon-check").style.display = hasValue ? "block" : "none";
}

/* دکمه‌های ویرایش و "تغییر رمز عبور" هر بار که تمپلیت پروفایل دوباره
   ساخته میشه از نو ساخته میشن، پس باید هر بار دوباره بایند بشن */
function bindEditButtons() {

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {

            editingField = btn.dataset.field;
            document.getElementById("editModal").style.display = "flex";

            const config = fieldConfig[editingField];
            document.getElementById("modalTitle").textContent = config.label;

            const inputWrap = document.getElementById("editInputWrap");
            const input = document.getElementById("editInput");
            const textarea = document.getElementById("editTextarea");

            if (editingField === "address") {
                inputWrap.style.display = "none";
                textarea.style.display = "block";
                textarea.placeholder = config.placeholder;
                textarea.value = currentUser.address || "";
            } else {
                textarea.style.display = "none";
                inputWrap.style.display = "block";
                input.type = config.type;
                input.placeholder = config.placeholder;
                input.value = currentUser[editingField] || "";
                updateInputIcon(!!input.value);
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

document.getElementById("editInput").addEventListener("input", (e) => {
    updateInputIcon(!!e.target.value);
});

document.getElementById("saveProfile").onclick = async () => {

    const body = {};
    body[editingField] = editingField === "address"
        ? document.getElementById("editTextarea").value
        : document.getElementById("editInput").value;

    const saveBtn = document.getElementById("saveProfile");
    setBtnLoading(saveBtn, true);

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
        showAppToast("اطلاعات با موفقیت ذخیره شد.", "success");

    } catch (err) {
        showAppToast(err.message, "error");
    } finally {
        setBtnLoading(saveBtn, false);
    }
};

/* =========================================================
   مودال تغییر رمز عبور
========================================================= */

document.getElementById("closePassword").onclick = () => {
    document.getElementById("passwordModal").style.display = "none";
    resetPasswordForm();
};

const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const confirmPasswordHint = document.getElementById("confirmPasswordHint");

const ruleIconPaths = {
    invalid: "M6 18 18 6M6 6l12 12",
    valid: "M5 13l4 4L19 7"
};

function toggleRule(id, valid) {
    const item = document.getElementById(id);
    item.classList.toggle("valid", valid);
    const path = item.querySelector(".rule-icon path");
    if (path) path.setAttribute("d", valid ? ruleIconPaths.valid : ruleIconPaths.invalid);
}

newPasswordInput.addEventListener("input", () => {
    const password = newPasswordInput.value;
    toggleRule("ruleLength", password.length >= 8);
    toggleRule("ruleUpper", /[A-Z]/.test(password));
    toggleRule("ruleLower", /[a-z]/.test(password));
    toggleRule("ruleNumber", /[0-9]/.test(password));
});

/* اخطار زنده اگه تکرار رمز عبور با رمز جدید یکی نباشه */
function checkConfirmPassword() {

    const newPass = newPasswordInput.value;
    const confirmPass = confirmPasswordInput.value;

    if (confirmPass.length === 0) {
        confirmPasswordHint.textContent = "رمز عبور جدید را دوباره وارد کنید";
        confirmPasswordHint.classList.remove("error", "success");
        return;
    }

    if (confirmPass === newPass) {
        confirmPasswordHint.textContent = "رمز عبور با تکرار آن مطابقت دارد";
        confirmPasswordHint.classList.remove("error");
        confirmPasswordHint.classList.add("success");
    } else {
        confirmPasswordHint.textContent = "رمز عبور با تکرار آن مطابقت ندارد";
        confirmPasswordHint.classList.remove("success");
        confirmPasswordHint.classList.add("error");
    }
}

newPasswordInput.addEventListener("input", checkConfirmPassword);
confirmPasswordInput.addEventListener("input", checkConfirmPassword);

/* برگردوندن مودال رمز عبور به حالت اولیه بعد از بستن یا ذخیره موفق */
function resetPasswordForm() {
    document.getElementById("currentPassword").value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    ["ruleLength", "ruleUpper", "ruleLower", "ruleNumber"].forEach(id => toggleRule(id, false));
    confirmPasswordHint.textContent = "رمز عبور جدید را دوباره وارد کنید";
    confirmPasswordHint.classList.remove("error", "success");
}

document.getElementById("savePassword").onclick = async () => {

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        return showAppToast("تکرار رمز عبور صحیح نیست.", "error");
    }

    const strongPassword =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword);

    if (!strongPassword) {
        return showAppToast("رمز عبور باید حداقل ۸ کاراکتر، شامل حرف بزرگ، حرف کوچک و عدد باشد.", "error");
    }

    const passwordBtn = document.getElementById("savePassword");
    setBtnLoading(passwordBtn, true);

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

        showAppToast("رمز عبور با موفقیت تغییر کرد.", "success");
        document.getElementById("passwordModal").style.display = "none";
        resetPasswordForm();

    } catch (err) {
        showAppToast(err.message, "error");
    } finally {
        setBtnLoading(passwordBtn, false);
    }
};

/* دکمه چشم برای نمایش/مخفی کردن هر کدوم از سه فیلد رمز عبور */
function bindPasswordToggle(toggleId, inputId) {

    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;

    toggle.addEventListener("click", () => {
        const willShow = input.type === "password";
        input.type = willShow ? "text" : "password";
        toggle.querySelector(".eye-open").style.display = willShow ? "none" : "block";
        toggle.querySelector(".eye-closed").style.display = willShow ? "block" : "none";
    });
}

bindPasswordToggle("toggleCurrentPassword", "currentPassword");
bindPasswordToggle("toggleNewPassword", "newPassword");
bindPasswordToggle("toggleConfirmPassword", "confirmPassword");
