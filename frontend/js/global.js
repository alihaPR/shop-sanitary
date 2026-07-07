document.querySelectorAll(".footer-collapse").forEach(btn => {

    btn.addEventListener("click", () => {

        const col = btn.parentElement;

        col.classList.toggle("active");

    });

});