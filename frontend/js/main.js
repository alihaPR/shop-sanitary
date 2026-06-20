new Swiper(".bannerSwiper",{

    loop:true,

    speed:800,

    autoplay:{
        delay:4000,
        disableOnInteraction:false,
    },

    navigation:{
        nextEl:".banner-next",
        prevEl:".banner-prev",
    }

});