/* ظاهر یکسان برای همه‌ی select ها در پنل ادمین (مثل منوی «همه سفارش‌ها») */
(function () {
  "use strict";
  if (window.__cselInit) return;
  window.__cselInit = true;

  var CHEVRON = '<svg class="csel-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var st = document.createElement("style");
  st.textContent = [
    ".csel{position:relative;display:block;width:100%}",
    ".csel--sm{display:inline-block;width:auto;min-width:150px}",
    ".csel-native{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;left:0;bottom:0;margin:0!important;padding:0!important;border:0!important}",
    ".csel-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:42px;padding:0 12px;",
    "border:1px solid var(--border,#e5e7eb);border-radius:8px;background:var(--surface-2,var(--surface,#fff));color:var(--text,#111827);",
    "font:inherit;font-size:13px;text-align:right;cursor:pointer;user-select:none;transition:border-color .15s}",
    ".csel--sm .csel-btn{min-height:36px;border-radius:10px}",
    ".csel-btn:focus-visible,.csel.open .csel-btn{outline:0;border-color:var(--accent,#5B5FEF)}",
    ".csel-btn:disabled{opacity:.55;cursor:not-allowed}",
    ".csel-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".csel-chevron{flex:none;transition:transform .2s}",
    ".csel.open .csel-chevron{transform:rotate(180deg)}",
    ".csel-menu{position:fixed;z-index:10050;box-sizing:border-box;max-height:260px;overflow-y:auto;direction:rtl;",
    "display:flex;flex-direction:column;gap:2px;padding:6px;background:var(--surface,#fff);",
    "border:1px solid var(--border,#e5e7eb);border-radius:10px;box-shadow:0 10px 30px rgba(16,24,40,.14)}",
    ".csel-menu button{background:transparent;border:none;text-align:right;padding:9px 10px;border-radius:6px;",
    "font:inherit;font-size:13px;color:var(--text,#111827);cursor:pointer;white-space:nowrap}",
    ".csel-menu button:hover,.csel-menu button:focus-visible{background:var(--hover,#f1f2f5);outline:0}",
    ".csel-menu button.active{background:var(--accent-soft,#EEEFFE);color:var(--accent,#5B5FEF);font-weight:600}",
    ".csel-menu button:disabled{opacity:.45;cursor:not-allowed}"
  ].join("\n");
  document.head.appendChild(st);

  var current = null; // { sel, wrap, btn, menu }

  function close() {
    if (!current) return;
    current.wrap.classList.remove("open");
    current.btn.setAttribute("aria-expanded", "false");
    if (current.menu.parentNode) current.menu.parentNode.removeChild(current.menu);
    current = null;
  }

  function choose(sel, index) {
    sel.selectedIndex = index;
    if (sel._cselSync) sel._cselSync();
    sel.dispatchEvent(new Event("input", { bubbles: true }));
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    close();
  }

  function open(sel, wrap, btn) {
    close();
    var menu = document.createElement("div");
    menu.className = "csel-menu";
    menu.setAttribute("role", "listbox");
    Array.prototype.forEach.call(sel.options, function (o, i) {
      if (o.hidden) return;
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "option");
      b.textContent = o.textContent.trim();
      if (o.disabled) b.disabled = true;
      if (i === sel.selectedIndex) { b.className = "active"; b.setAttribute("aria-selected", "true"); }
      b.addEventListener("click", function (e) { e.stopPropagation(); choose(sel, i); });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);

    var r = btn.getBoundingClientRect();
    menu.style.width = r.width + "px";
    menu.style.left = r.left + "px";
    var h = menu.offsetHeight;
    var top = r.bottom + 6;
    if (top + h > window.innerHeight - 8 && r.top > h + 14) top = r.top - h - 6;
    menu.style.top = top + "px";

    wrap.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    current = { sel: sel, wrap: wrap, btn: btn, menu: menu };

    var act = menu.querySelector(".active") || menu.querySelector("button:not(:disabled)");
    if (act) act.focus({ preventScroll: true });
  }

  function enhance(sel) {
    if (sel.dataset.cselDone || sel.multiple || sel.size > 1 || sel.hasAttribute("data-native")) return;
    sel.dataset.cselDone = "1";

    var wrap = document.createElement("div");
    wrap.className = "csel" + (sel.classList.contains("dsc-select") ? " csel--sm" : "");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "csel-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<span class="csel-label"></span>' + CHEVRON;
    var label = btn.firstChild;

    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(btn);
    wrap.appendChild(sel);
    sel.classList.add("csel-native");
    sel.tabIndex = -1;
    sel.setAttribute("aria-hidden", "true");

    function sync() {
      var o = sel.options[sel.selectedIndex];
      label.textContent = o ? o.textContent.trim() : "";
      btn.disabled = sel.disabled;
    }
    sel._cselSync = sync;
    sync();

    // اگر کد دیگری مقدار select را با sel.value = ... عوض کرد، متن دکمه هم به‌روز شود
    var desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    Object.defineProperty(sel, "value", {
      configurable: true,
      get: function () { return desc.get.call(sel); },
      set: function (v) { desc.set.call(sel, v); sync(); }
    });
    sel.addEventListener("change", sync);
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ["selected", "disabled"] });

    btn.addEventListener("click", function () {
      if (current && current.sel === sel) close(); else open(sel, wrap, btn);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(sel, wrap, btn); }
    });
  }

  function scan(root) {
    if (root.tagName === "SELECT") enhance(root);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll("select"), enhance);
  }

  document.addEventListener("mousedown", function (e) {
    if (current && !current.menu.contains(e.target) && !current.btn.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!current) return;
    if (e.key === "Escape") { var b = current.btn; close(); b.focus(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      var items = Array.prototype.filter.call(current.menu.querySelectorAll("button"), function (x) { return !x.disabled; });
      var i = items.indexOf(document.activeElement);
      i = e.key === "ArrowDown" ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
      if (items[i]) items[i].focus();
    }
  });
  window.addEventListener("resize", close);
  window.addEventListener("scroll", function (e) {
    if (current && !current.menu.contains(e.target)) close();
  }, true);

  function start() {
    scan(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); });
      });
      if (current && !document.body.contains(current.sel)) close();
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
