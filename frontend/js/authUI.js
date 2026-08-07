document.addEventListener("DOMContentLoaded", () => {

    const loginLink = document.getElementById("loginLink");
    const token = localStorage.getItem("token");

    // ---------------------------------------------------------------
    // دکمه سرچ در نوار پایین موبایل: با کلیک، فوکوس میره روی سرچ بالا
    // ---------------------------------------------------------------
    const bottomSearchBtn = document.querySelector(".bottom-nav .search-btn");
    const mobileSearchInput = document.querySelector(".mobile-header #search-input");

    if (bottomSearchBtn && mobileSearchInput) {

        bottomSearchBtn.addEventListener("click", (e) => {
            e.preventDefault();

            mobileSearchInput.scrollIntoView({ behavior: "smooth", block: "start" });
            mobileSearchInput.focus();
        });

    }

    if (!loginLink) return;

    // اگر کاربر لاگین نکرده، همون دکمه ورود نمایش داده بشه
    if (!token) return;

    // اگر لاگین کرده بود، آیکون آدمک نمایش داده بشه
    loginLink.innerHTML = `
    
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.889 12.6188H11.921C14.849 12.6188 17.23 10.2378 17.23 7.30976C17.23 4.38176 14.849 1.99976 11.921 1.99976C8.99202 1.99976 6.61002 4.38176 6.61002 7.30676C6.60002 10.2268 8.96702 12.6098 11.889 12.6188ZM8.03802 7.30976C8.03802 5.16876 9.78002 3.42776 11.921 3.42776C14.061 3.42776 15.802 5.16876 15.802 7.30976C15.802 9.44976 14.061 11.1918 11.921 11.1918H11.892C9.76002 11.1838 8.03102 9.44376 8.03802 7.30976Z" fill="#fff"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M4 18.1731C4 21.8701 9.962 21.8701 11.921 21.8701C15.32 21.8701 19.84 21.4891 19.84 18.1931C19.84 14.4961 13.88 14.4961 11.921 14.4961C8.521 14.4961 4 14.8771 4 18.1731ZM5.5 18.1731C5.5 16.7281 7.66 15.9961 11.921 15.9961C16.181 15.9961 18.34 16.7351 18.34 18.1931C18.34 19.6381 16.181 20.3701 11.921 20.3701C7.66 20.3701 5.5 19.6311 5.5 18.1731Z" fill="#fff"/>
</svg>

                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4.46967 7.96967C4.73594 7.7034 5.1526 7.6792 5.44621 7.89705L5.53033 7.96967L12 14.439L18.4697 7.96967C18.7359 7.7034 19.1526 7.6792 19.4462 7.89705L19.5303 7.96967C19.7966 8.23594 19.8208 8.6526 19.6029 8.94621L19.5303 9.03033L12.5303 16.0303C12.2641 16.2966 11.8474 16.3208 11.5538 16.1029L11.4697 16.0303L4.46967 9.03033C4.17678 8.73744 4.17678 8.26256 4.46967 7.96967Z" />
                                </svg>

    `;

    loginLink.classList.add("user-btn");
    loginLink.removeAttribute("href");

    const user = JSON.parse(localStorage.getItem("user"));

    const adminMenuItem = document.getElementById("adminMenuItem");

    if (user && user.role === "admin") {
        adminMenuItem.style.display = "flex";
    }

    const userDropdownName = document.getElementById("userDropdownName");

    if (userDropdownName && user) {
        const displayName =
            user.name ||
            user.fullName ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.username ||
            "کاربر";

        userDropdownName.textContent = displayName;
    }

    const userDropdown = document.getElementById("userDropdown");

    // موقعیت اصلی پنل کاربری، برای برگردوندنش بعد از استفاده در حالت موبایل
    let userDropdownHome = null;

    function closeUserDropdown() {

        userDropdown.style.display = "none";
        userDropdown.classList.remove("user-dropdown--mobile");

        if (userDropdownHome) {
            userDropdownHome.parent.insertBefore(userDropdown, userDropdownHome.next);
            userDropdownHome = null;
        }

    }

    loginLink.addEventListener("click", (e) => {
        e.preventDefault();

        if (userDropdown.style.display === "block") {
            closeUserDropdown();
        } else {
            userDropdown.style.display = "block";
        }
    });

    // ---------------------------------------------------------------
    // آیکون حساب کاربری در نوار پایین موبایل (وقتی لاگین کرده باشه)
    // ---------------------------------------------------------------
    const bottomNavAuth = document.getElementById("bottomNavAuth");

    if (bottomNavAuth) {

        bottomNavAuth.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.889 12.6188H11.921C14.849 12.6188 17.23 10.2378 17.23 7.30976C17.23 4.38176 14.849 1.99976 11.921 1.99976C8.99202 1.99976 6.61002 4.38176 6.61002 7.30676C6.60002 10.2268 8.96702 12.6098 11.889 12.6188ZM8.03802 7.30976C8.03802 5.16876 9.78002 3.42776 11.921 3.42776C14.061 3.42776 15.802 5.16876 15.802 7.30976C15.802 9.44976 14.061 11.1918 11.921 11.1918H11.892C9.76002 11.1838 8.03102 9.44376 8.03802 7.30976Z" fill="black"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 18.1731C4 21.8701 9.962 21.8701 11.921 21.8701C15.32 21.8701 19.84 21.4891 19.84 18.1931C19.84 14.4961 13.88 14.4961 11.921 14.4961C8.521 14.4961 4 14.8771 4 18.1731ZM5.5 18.1731C5.5 16.7281 7.66 15.9961 11.921 15.9961C16.181 15.9961 18.34 16.7351 18.34 18.1931C18.34 19.6381 16.181 20.3701 11.921 20.3701C7.66 20.3701 5.5 19.6311 5.5 18.1731Z" fill="black"/>
            </svg>
        `;

        bottomNavAuth.removeAttribute("href");

        bottomNavAuth.addEventListener("click", (e) => {
            e.preventDefault();

            const isOpenAsMobile =
                userDropdown.style.display === "block" &&
                userDropdown.classList.contains("user-dropdown--mobile");

            if (isOpenAsMobile) {
                closeUserDropdown();
                return;
            }

            // پنل رو موقتاً به انتهای body منتقل می‌کنیم تا از زیر
            // هدر دسکتاپ (که در موبایل display:none داره) بیاد بیرون
            if (!userDropdownHome) {
                userDropdownHome = {
                    parent: userDropdown.parentNode,
                    next: userDropdown.nextSibling
                };
                document.body.appendChild(userDropdown);
            }

            userDropdown.classList.add("user-dropdown--mobile");
            userDropdown.style.display = "block";
        });

    }

    document.addEventListener("click", (e) => {

        const clickedTrigger =
            loginLink.contains(e.target) ||
            (bottomNavAuth && bottomNavAuth.contains(e.target));

        if (!clickedTrigger && !userDropdown.contains(e.target)) {
            closeUserDropdown();
        }

    });
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/frontend/index.html";

        });

    }

});