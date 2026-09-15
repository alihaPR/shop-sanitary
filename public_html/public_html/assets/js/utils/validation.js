// پاک کردن همه خطاها
function clearErrors(form) {

    form.querySelectorAll(".form-group").forEach(group => {

        group.classList.remove("error");
        group.classList.remove("success");

        const error = group.querySelector(".error-message");

        if (error) {
            error.textContent = "";
        }

    });

}

// نمایش خطا
function setError(input, message) {

    const group = input.closest(".form-group");

    const error = group.querySelector(".error-message");

    group.classList.remove("success");
    group.classList.add("error");

    error.textContent = message;

}

// موفق
function setSuccess(input) {

    const group = input.closest(".form-group");

    group.classList.remove("error");
    group.classList.add("success");

}