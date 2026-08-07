document.addEventListener("DOMContentLoaded", function () {

  const HISTORY_KEY = "search-history"
  const MAX_HISTORY = 8

  function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
  }

  function saveToHistory(query) {
    let history = getHistory()
    history = history.filter(h => h !== query)
    history.unshift(query)
    history = history.slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }

  const inputs = document.querySelectorAll("#search-input")

  inputs.forEach(function (input) {

    const wrapper = input.closest(".search-wraper")
    if (!wrapper) return

    wrapper.style.position = "relative"

    // ── کادر dropdown ──
    const dropdown = document.createElement("div")
    dropdown.style.cssText = `
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      left: 0;
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      z-index: 9999;
      max-height: 380px;
      overflow-y: auto;
      display: none;
      padding: 6px 0;
    `
    wrapper.appendChild(dropdown)

    function closeDropdown() {
      dropdown.style.display = "none"
    }

    // ── تاریخچه ──
    function showHistory() {
      const history = getHistory()
      if (history.length === 0) {
        dropdown.innerHTML = `<div style="padding:16px; text-align:center; color:#bbb; font-size:13px">جستجویی ثبت نشده</div>`
        dropdown.style.display = "block"
        return
      }
      dropdown.innerHTML = `
        <div style="padding:8px 14px 5px; font-size:11px; color:#aaa; font-weight:600; border-bottom:1px solid #f5f5f5; margin-bottom:2px">جستجوهای اخیر</div>
        ${history.map(h => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; cursor:pointer; transition:background 0.15s"
            onmouseover="this.style.background='#f9f9f9'"
            onmouseout="this.style.background='#fff'"
          >
            <div style="display:flex; align-items:center; gap:10px; flex:1"
              onclick="document.getElementById('search-input').value='${h}'; document.getElementById('search-input').dispatchEvent(new Event('input'))"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style="font-size:13px; color:#333">${h}</span>
            </div>
            <button onclick="(function(q,e){e.stopPropagation();let a=JSON.parse(localStorage.getItem('search-history')||'[]');a=a.filter(x=>x!==q);localStorage.setItem('search-history',JSON.stringify(a));document.getElementById('search-input').dispatchEvent(new Event('focus'))})('${h}',event)"
              style="background:none; border:none; cursor:pointer; color:#ccc; font-size:18px; line-height:1; padding:0 2px">×</button>
          </div>
        `).join("")}
      `
      dropdown.style.display = "block"
    }

    // ── نتایج سرچ ──
    async function showResults(query) {

      try {

        const res = await fetch(
          `http://localhost:5000/api/products?search=${encodeURIComponent(query)}`
        );

        const filtered = await res.json();


        if (filtered.length === 0) {

          dropdown.innerHTML =
            `<div style="padding:16px;text-align:center;color:#bbb;font-size:13px">
                    نتیجه‌ای یافت نشد
                </div>`;

          dropdown.style.display = "block";

          return;

        }

        const categoryNames = {
          "پوشک-کودک": "پوشک کودک",
          "پوشک-بزرگسال": "پوشک بزرگسال",
          "نوار-بهداشتی": "نوار بهداشتی",
          "پنبه": "پنبه",
          "دستمال-مرطوب": "دستمال مرطوب"
        };

        dropdown.innerHTML = `
        <div style="padding:8px 14px 5px;font-size:11px;color:#aaa;font-weight:600;border-bottom:1px solid #f5f5f5;margin-bottom:2px">
            نتایج جستجو
        </div>

        ${filtered.slice(0, 6).map(p => `

        <div onclick="window.location.href='cart.html?id=${p._id}'"
            style="display:flex;align-items:center;gap:12px;padding:9px 14px;cursor:pointer">

    <img src="${p.image ? `http://localhost:5000/${p.image.replace(/^\/?/, "")}` : ""}"
         style="width:40px;height:40px;object-fit:contain">

            <div>

                <div>${p.name}</div>

                <div style="font-size:12px;color:#0183FF">

                    ${categoryNames[p.category] || ""}

                </div>

            </div>

        </div>

        `).join("")}

        <div onclick="saveAndGo('${query}')"
            style="padding:10px;text-align:center;color:#0183FF;cursor:pointer">

            مشاهده همه نتایج

        </div>
        `;

        dropdown.style.display = "block";

      } catch (err) {

        console.log(err);

      }

    }

    window.saveAndGo = function (query) {
      saveToHistory(query)
      closeDropdown()
      window.location.href = `products.html?search=${encodeURIComponent(query)}`
    }

    // ── رویدادها ──
    input.addEventListener("focus", function () {
      if (!this.value.trim()) showHistory()
      else showResults(this.value.trim())
    })

    input.addEventListener("input", function () {
      const query = this.value.trim()
      if (!query) showHistory()
      else showResults(query)
    })

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const query = this.value.trim()
        if (query) {
          saveToHistory(query)
          closeDropdown()
          window.location.href = `products.html?search=${encodeURIComponent(query)}`
        }
      }
      if (e.key === "Escape") closeDropdown()
    })

    document.addEventListener("click", function (e) {
      if (!wrapper.contains(e.target)) closeDropdown()
    })

    // مقدار search از URL
    const params = new URLSearchParams(window.location.search)
    const searchParam = params.get("search")
    if (searchParam) input.value = searchParam

  })


  // ── پاپ‌آپ سرچ موبایل ──
  const searchBtn = document.querySelector(".search-btn")
  const mSearchOverlay = document.querySelector(".mobile-search-overlay")
  const mSearchPopup = document.querySelector(".mobile-search-popup")
  const mSearchClose = document.querySelector(".mobile-search-close")

  if (searchBtn && mSearchOverlay && mSearchPopup) {

    searchBtn.addEventListener("click", function (e) {
      e.preventDefault()
      mSearchOverlay.classList.add("active")
      mSearchPopup.classList.add("active")
      const popupInput = mSearchPopup.querySelector("#search-input")
      if (popupInput) popupInput.focus()
    })

    function closeMobileSearch() {
      mSearchOverlay.classList.remove("active")
      mSearchPopup.classList.remove("active")
    }

    if (mSearchClose) mSearchClose.addEventListener("click", closeMobileSearch)
    mSearchOverlay.addEventListener("click", closeMobileSearch)

  }

})
  

