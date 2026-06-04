let $ = document

let filterprice = $.getElementById('filter-price')
let bodyprice = $.querySelector('.price-body')
let Flagp = true

filterprice.addEventListener('click', function () {
    if (Flagp) {
        bodyprice.style.display = 'block'
        Flagp = false
    } else {
        bodyprice.style.display = 'none'
        Flagp = true
    }
})

let filterbrand = $.getElementById('filter-brand')
let bodybrand = $.querySelector('.brand-body')
let Flagb = true

filterbrand.addEventListener('click', function () {
    if (Flagb) {
        bodybrand.style.display = 'block'
        Flagb = false
    } else {
        bodybrand.style.display = 'none'
        Flagb = true
    }
})