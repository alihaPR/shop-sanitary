// =====================================================
// animate.js — custom stagger scroll animation
// توی همه صفحات قبل از </body> اضافه کن:
// <script src="./js/animate.js"></script>
//
// روی هر المان data-anim بذار:
// data-anim="fade-up"    از پایین
// data-anim="fade-down"  از بالا
// data-anim="fade-left"  از چپ
// data-anim="fade-right" از راست
// data-anim="zoom"       بزرگ شدن
// data-anim="fade"       فقط محو
//
// تاخیر دستی:
// data-delay="300"  (میلی‌ثانیه)
//
// مثال:
// <div data-anim="fade-up" data-delay="100">...</div>
// =====================================================

document.addEventListener("DOMContentLoaded", function () {



  const elements = document.querySelectorAll('[data-anim]')

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting)

    visible.forEach((entry, i) => {
      const el = entry.target
      const customDelay = el.dataset.delay ? parseInt(el.dataset.delay) : 0
      const staggerDelay = i * 80

      setTimeout(() => {
        el.classList.add('is-visible')
        observer.unobserve(el)
      }, customDelay + staggerDelay)
    })

  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  })

  elements.forEach(el => observer.observe(el))

})