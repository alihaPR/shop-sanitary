new Swiper(".bannerSwiper", {

    loop: true,

    speed: 500,

    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },

    pagination: {
        el: ".banner-pagination",
        clickable: true,
    }

});


// -==============================================================================================================-

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
// نکته مهم: به‌جای اسم محصول (که با حذف/تغییر نام محصول به‌هم می‌خورد)
// از _id ثابت خود محصول در دیتابیس استفاده می‌کنیم.
// آیدی هر محصول رو از /api/products یا پنل ادمین (data-id دکمه ویرایش) بگیر
// و به‌جای مقادیر نمونه‌ی زیر جایگزین کن.
const homeProducts = [
{
    dbId: "6a70476b3065cdfb206869af", // پنبه ۱۰۰ گرمی
    title: "پنبه 100 گرمی",
    text: "پنبه طبی خالص، مناسب مصارف پزشکی و آرایشی",
    imageClass: "image-1"
},
{
    dbId: "6a7037fe3065cdfb206864c1", // نوار بالدار مشبک
    title: "نوار بهداشتی بالدار",
    text: "نرم، ضد حساسیت با محافظت کامل",
    imageClass: "image-2"
},
{
    dbId: "6a7038e73065cdfb2068656b", // پنبه هیدروفیل
    title: "پنبه هیدروفیل",
    text: "بسته بزرگ، صرفه‌جویی برای خانه",
    imageClass: "image-3"
},
{
    dbId: "6a7035fd3065cdfb20686432", // پوشینه بزرگسال گلبهار سایز L
    title: "پوشینه بزرگسال سایز L",
    text: "جذب بالا، راحت در استفاده روزانه",
    imageClass: "image-4"
},
{
    dbId: "6a68cb0732b78529b2ca086d", // پوشک نوزاد سایز کوچک
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

            const product = products.find(p => p._id === item.dbId);

            if (!product) return;

            const finalPrice =
                product.discountPercent > 0
                    ? Math.round(product.price * (1 - product.discountPercent / 100))
                    : product.price;

            wrapper.innerHTML += `
        <div class="swiper-slide">

            <div class="products-cart">

                <div class="cart-img-wrap">

                    <div class="cart-products-img ${item.imageClass}">

                        <div class="cart-svg-products">
                            <!-- svg -->
                        </div>

                    </div>


                </div>

                <div class="cart-content">

                    <h3>${item.title}</h3>



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