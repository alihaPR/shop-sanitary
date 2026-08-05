document.addEventListener("DOMContentLoaded", () => {

    const items = document.querySelectorAll(".faq-item");

    // اطمینان از اینکه هیچ آیتمی باز نباشه
    items.forEach(item => item.classList.remove("active"));

    document.querySelectorAll(".faq-question").forEach(btn => {

        btn.addEventListener("click", () => {

            const item = btn.parentElement;

            // اگر همین آیتم باز بود، ببندش
            if (item.classList.contains("active")) {

                item.classList.remove("active");
                return;

            }

            // بقیه رو ببند
            items.forEach(i => i.classList.remove("active"));

            // این یکی رو باز کن
            item.classList.add("active");

        });

    });

});