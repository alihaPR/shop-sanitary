new Swiper(".bannerSwiper",{

    loop:true,

    speed:500,

    autoplay:{
        delay:5280,
        disableOnInteraction:false,
    },

    navigation:{
        nextEl:".banner-next",
        prevEl:".banner-prev",
    }

});