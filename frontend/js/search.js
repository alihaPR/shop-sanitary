document.addEventListener("DOMContentLoaded", function () {

  const inputs = document.querySelectorAll("#search-input")

  inputs.forEach(function (input) {

    // ساخت dropdown
    const dropdown = document.createElement("div")
    dropdown.id = "search-dropdown"
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      left: 0;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      z-index: 9999;
      max-height: 300px;
      overflow-y: auto;
      display: none;
    `

    // wrapper باید position:relative داشته باشه
    const wrapper = input.closest(".search-wraper")
    if (wrapper) {
      wrapper.style.position = "relative"
      wrapper.appendChild(dropdown)
    }

    // تایپ کردن
    input.addEventListener("input", function () {
      const query = this.value.trim().toLowerCase()

      if (!query) {
        dropdown.style.display = "none"
        return
      }

      // فیلتر محصولات — اگه products تعریف نشده بود skip کن
      if (typeof products === "undefined") return

      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      ).slice(0, 6)

      if (filtered.length === 0) {
        dropdown.innerHTML = `<div style="padding:14px 16px; font-size:13px; color:#aaa">محصولی یافت نشد</div>`
        dropdown.style.display = "block"
        return
      }

      dropdown.innerHTML = filtered.map(p => {
        const hasDiscount = p.discountPercent > 0
        const finalPrice = hasDiscount
          ? Math.round(p.price * (1 - p.discountPercent / 100))
          : p.price

        return `
          <div onclick="window.location.href='cart.html?id=${p.id}'" style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            cursor: pointer;
            border-bottom: 1px solid #f5f5f5;
            transition: background 0.15s;
          "
          onmouseover="this.style.background='#f9f9f9'"
          onmouseout="this.style.background='#fff'"
          >
            <img src="${p.image}" style="width:40px; height:40px; object-fit:contain; border-radius:6px; border:1px solid #eee">
            <div style="flex:1">
              <div style="font-size:13px; font-weight:600; color:#222; margin-bottom:3px">${p.name}</div>
              <div style="font-size:11px; color:#888">${p.brand}</div>
            </div>
            <div style="font-size:13px; font-weight:700; color:#2377f5; white-space:nowrap">
              ${finalPrice.toLocaleString("fa-IR")} تومان
            </div>
          </div>
        `
      }).join("")

      // لینک مشاهده همه
      dropdown.innerHTML += `
        <div onclick="window.location.href='products.html?search=${encodeURIComponent(query)}'" style="
          padding: 10px 16px;
          font-size:12px;
          color: #2377f5;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
        "
        onmouseover="this.style.background='#f0f5ff'"
        onmouseout="this.style.background='#fff'"
        >
          مشاهده همه نتایج «${input.value.trim()}»
        </div>
      `

      dropdown.style.display = "block"
    })

    // Enter — برو به صفحه محصولات
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const query = this.value.trim()
        if (query) {
          dropdown.style.display = "none"
          window.location.href = `products.html?search=${encodeURIComponent(query)}`
        }
      }
      if (e.key === "Escape") {
        dropdown.style.display = "none"
      }
    })

    // بستن dropdown با کلیک بیرون
    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none"
      }
    })

    // اگه الان توی products.html هستیم، مقدار search رو از URL بخون
    const params = new URLSearchParams(window.location.search)
    const searchParam = params.get("search")
    if (searchParam) {
      input.value = searchParam
    }

  })

})