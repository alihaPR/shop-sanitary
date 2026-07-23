new Swiper(".bannerSwiper", {

    loop: true,

    speed: 500,

    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },

    navigation: {
        nextEl: ".banner-next",
        prevEl: ".banner-prev",
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


// -==============================================================================================================-


new Swiper(".categorySwiper", {

    slidesPerView: "auto",

    spaceBetween: 18,

    speed: 500,

    grabCursor: true,

    navigation: {
        nextEl: ".category-next",
        prevEl: ".category-prev",
    },

    breakpoints: {

        0: {
            spaceBetween: 14,
        },

        768: {
            spaceBetween: 18,
        },

        1024: {
            spaceBetween: 28,
        }

    }

});

// 
new Swiper(".productsSwiper", {

    slidesPerView: 5,

    spaceBetween: 15,

    speed: 500,

    navigation: {
        nextEl: ".products-next",
        prevEl: ".products-prev",
    },

    breakpoints: {

        0: {
            slidesPerView: "auto",
            spaceBetween: 12,
        },

        480: {
            slidesPerView: "auto",
            spaceBetween: 12,
        },

        768: {
            slidesPerView: "auto",
            spaceBetween: 15,
        },

        1024: {
            slidesPerView: 5,
            spaceBetween: 15,
        }

    }

});
//================================================================================================================\
const homeProducts = [
{
    dbName: "پنبه ۱۰۰ گرمی",
    title: "پنبه 100 گرمی",
    text: "پنبه طبی خالص، مناسب مصارف پزشکی و آرایشی",
    imageClass: "image-1"
},
{
    dbName: "نوار بالدار مشبک",
    title: "نوار بهداشتی بالدار",
    text: "نرم، ضد حساسیت با محافظت کامل",
    imageClass: "image-2"
},
{
    dbName: "پنبه هیدروفیل ۲۰۰ گرمی",
    title: "پنبه هیدروفیل",
    text: "بسته بزرگ، صرفه‌جویی برای خانه",
    imageClass: "image-3"
},
{
    dbName: "پوشینه بزرگسال گلبهار سایز L",
    title: "پوشینه بزرگسال سایز L",
    text: "جذب بالا، راحت در استفاده روزانه",
    imageClass: "image-4"
},
{
    dbName: "پوشک نوزاد سایز کوچک",
    title: "پوشک بچه",
    text: "نرم و ایمن برای پوست حساس نوزاد",
    imageClass: "image-5"
}
];

async function loadHomeProducts() {

    const wrapper = document.getElementById("products-home");

    if (!wrapper) return;

    try {

        const res = await fetch(`${API_BASE_URL}/products`);

        const products = await res.json();

        wrapper.innerHTML = "";

        homeProducts.forEach((item) => {

            const product = products.find(p => p.name === item.dbName);

            if (!product) return;

            const finalPrice =
                product.discountPercent > 0
                    ? Math.round(product.price * (1 - product.discountPercent / 100))
                    : product.price;

            wrapper.innerHTML += `
        <div class="swiper-slide">

            <div class="products-cart">

                <div class="cart-products-img ${item.imageClass}">

                    <div class="cart-svg-products">
                        <!-- svg -->
                    </div>

                </div>

                <div class="cart-content">

                    <h3>${item.title}</h3>

                    <p>${item.text}</p>

                    <div class="cart-line"></div>

                    <div class="price">
                        <strong>${finalPrice.toLocaleString("fa-IR")}</strong>
                        تومان
                    </div>

                </div>

                <button onclick="window.location.href='cart.html?id=${product._id}'">
                    مشاهده محصول
                </button>

            </div>

        </div>
    `;

        });

        const swiper = document.querySelector(".productsSwiper").swiper;

        if (swiper) {

            swiper.update();

        }

    } catch (err) {

        console.error(err);

    }

}

document.addEventListener("DOMContentLoaded", loadHomeProducts);
