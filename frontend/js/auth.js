let $ = document;

let login = $.querySelector('.login-phone');
let register = $.querySelector('.register-form');
let otp = $.querySelector('.login-otp');

let switchsignup = $.querySelector('.switch-signup');
let switchlogin = $.querySelector('.switch-login');

let loginForm = login;
let registerForm = register;

function show(screen) {
    login.classList.remove("active");
    register.classList.remove("active");
    otp.classList.remove("active");

    screen.classList.add("active");
}

let lastScreen = null;

switchsignup.addEventListener('click', function (e) {
    e.preventDefault();
    show(register);
});

switchlogin.addEventListener('click', function (e) {
    e.preventDefault();
    show(login);
});

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const phone = loginForm.querySelector('input[name="phone"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));

            alert("ورود با موفقیت انجام شد");

            window.location.href = "index.html";
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("خطا در اتصال به سرور");
    }
});

registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = registerForm.querySelector('input[name="fullname"]').value.trim();
    const phone = registerForm.querySelector('input[name="phone"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value;
    const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;
    if (!/^09\d{9}$/.test(phone)) {

        return alert("شماره موبایل معتبر نیست.");

    }

    if (password !== confirmPassword) {

        return alert("تکرار رمز عبور صحیح نیست.");

    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({

                name,
                phone,
                password

            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("ثبت نام با موفقیت انجام شد");
            console.log(data);
        } else {
            alert(data.message);
        }
        console.log(data);

    } catch (err) {
        alert("خطا در اتصال به سرور");
        console.error(err);
    }
});

let backBtn = document.querySelector('.back-btn');

backBtn.addEventListener('click', function (e) {
    e.preventDefault();

    if (lastScreen) {
        show(lastScreen);
    }
});