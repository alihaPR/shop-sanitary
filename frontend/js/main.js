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