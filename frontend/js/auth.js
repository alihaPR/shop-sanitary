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

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    lastScreen = login;
    show(otp);
});

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    lastScreen = register;
    show(otp);
});

let backBtn = document.querySelector('.back-btn');

backBtn.addEventListener('click', function (e) {
    e.preventDefault();

    if (lastScreen) {
        show(lastScreen);
    }
});