new Swiper(".bannerSwiper",{

    loop:true,

    speed:500,

    autoplay:{
        delay:5000,
        disableOnInteraction:false,
    },

    navigation:{
        nextEl:".banner-next",
        prevEl:".banner-prev",
    }

});


// استوری ها 
const slider = document.querySelector(".story-scroll");
const prevBtn = document.querySelector(".story-prev");
const nextBtn = document.querySelector(".story-next");

let isDown = false;
let startX;
let scrollStart;

function updateButtons() {
    const max = slider.scrollWidth - slider.clientWidth;

    // چون RTL هست
    const current = Math.abs(slider.scrollLeft);

    prevBtn.classList.toggle("show", current > 5);
    nextBtn.classList.toggle("hide", current >= max - 5);
}

// ===== دکمه ها =====

nextBtn.addEventListener("click", () => {
    slider.scrollBy({
        left: -100,
        behavior: "smooth"
    });
});

prevBtn.addEventListener("click", () => {
    slider.scrollBy({
        left: 100,
        behavior: "smooth"
    });
});

// ===== Drag =====

slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("dragging");

    startX = e.pageX;
    scrollStart = slider.scrollLeft;
});

window.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("dragging");
});

window.addEventListener("mousemove", (e) => {

    if (!isDown) return;

    e.preventDefault();

    const walk = e.pageX - startX;

    slider.scrollLeft = scrollStart - walk;

});

// ===== Touch =====

let touchX = 0;

slider.addEventListener("touchstart", (e) => {

    touchX = e.touches[0].clientX;
    scrollStart = slider.scrollLeft;

});

slider.addEventListener("touchmove", (e) => {

    const walk = e.touches[0].clientX - touchX;

    slider.scrollLeft = scrollStart - walk;

});

// ===== وضعیت دکمه ها =====

slider.addEventListener("scroll", updateButtons);

window.addEventListener("load", updateButtons);

window.addEventListener("resize", updateButtons);