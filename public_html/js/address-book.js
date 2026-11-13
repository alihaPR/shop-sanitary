/* =====================================================================
   دفترچه آدرس نرم‌سنتر (مشترک بین چک‌اوت و پنل کاربری)
   - ارتباط با API:  /api/addresses
   - پنجره‌ی انتخاب/افزودن/ویرایش/حذف آدرس (موبایل: Bottom Sheet، دسکتاپ: Modal)
   استفاده:
     NCAddressBook.init({ apiBase, token })
     NCAddressBook.openSheet({ view: 'list'|'form'|'confirm', pick, selectedId,
                               address, onSelect(addr), onChange(list) })
===================================================================== */
(function () {
  'use strict';

  var cfg = { apiBase: '', token: '' };
  var cache = [];

  // ---------------------------------------------------------------- helpers
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fa(s) {
    return String(s == null ? '' : s).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.charAt(d); });
  }

  function toEn(s) {
    return String(s == null ? '' : s)
      .replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
  }

  function toast(msg, type) {
    if (typeof window.showAppToast === 'function') window.showAppToast(esc(msg), type || 'info');
    else alert(msg);
  }

  function loading(btn, on) {
    if (!btn) return;
    if (typeof window.setBtnLoading === 'function') window.setBtnLoading(btn, on);
    else btn.disabled = !!on;
  }

  var ICON = {
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    edit: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    trash: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };

  // ---------------------------------------------------------------- API
  function init(o) {
    o = o || {};
    cfg.apiBase = o.apiBase || cfg.apiBase;
    cfg.token = o.token || localStorage.getItem('token') || '';
  }

  async function api(path, method, body) {
    var opts = { method: method || 'GET', headers: { Authorization: 'Bearer ' + cfg.token } };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    var res;
    try {
      res = await fetch(cfg.apiBase + '/addresses' + path, opts);
    } catch (e) {
      var ne = new Error('خطا در ارتباط با سرور.');
      ne.status = 0;
      throw ne;
    }
    var data = null;
    try { data = await res.json(); } catch (e) { /* ignore */ }
    if (!res.ok) {
      var err = new Error((data && data.message) || 'خطای ناشناخته.');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function list() {
    var d = await api('');
    cache = Array.isArray(d) ? d : [];
    return cache;
  }

  // ---------------------------------------------------------------- نمایش
  function fullText(a) {
    var t = [a.province, a.city, a.neighborhood, a.address].filter(Boolean).join('، ');
    if (a.plaque) t += '، پلاک ' + fa(a.plaque);
    if (a.unit) t += '، واحد ' + fa(a.unit);
    return t;
  }

  // opts: { pick, selected, actions }
  function cardHTML(a, opts) {
    opts = opts || {};
    var sel = !!opts.selected;
    var acts = '';
    if (opts.actions) {
      acts =
        '<div class="ab-card__acts">' +
        (a.isDefault ? '' : '<button type="button" class="ab-txtbtn" data-ab="default" data-id="' + esc(a._id) + '">تعیین به‌عنوان پیش‌فرض</button>') +
        '<span class="ab-card__icons">' +
        '<button type="button" class="ab-iconbtn" data-ab="edit" data-id="' + esc(a._id) + '" aria-label="ویرایش آدرس" title="ویرایش">' + ICON.edit + '</button>' +
        '<button type="button" class="ab-iconbtn ab-iconbtn--danger" data-ab="delete" data-id="' + esc(a._id) + '" aria-label="حذف آدرس" title="حذف">' + ICON.trash + '</button>' +
        '</span></div>';
    }

    return (
      '<div class="ab-card' + (sel ? ' is-selected' : '') + (opts.pick ? ' is-pickable' : '') + '" data-id="' + esc(a._id) + '"' +
      (opts.pick ? ' role="radio" aria-checked="' + sel + '" tabindex="0" data-ab="pick"' : '') + '>' +
      '<div class="ab-card__row">' +
      '<span class="ab-card__pin">' + ICON.pin + '</span>' +
      '<div class="ab-card__main">' +
      '<div class="ab-card__top"><strong>' + esc(a.recipientName) + '</strong>' +
      (a.isDefault ? '<span class="ab-badge">پیش‌فرض</span>' : '') + '</div>' +
      '<p class="ab-card__addr">' + esc(fullText(a)) + '</p>' +
      '<p class="ab-card__meta"><span>کد پستی: ' + esc(fa(a.postalCode)) + '</span>' +
      '<span>موبایل گیرنده: ' + esc(fa(a.recipientPhone)) + '</span></p>' +
      '</div>' +
      (opts.pick ? '<span class="ab-check" aria-hidden="true"></span>' : '') +
      '</div>' + acts + '</div>'
    );
  }

  // ---------------------------------------------------------------- پنجره
  var cur = null; // { overlay, opts, lastFocus }

  function closeSheet() {
    if (!cur) return;
    closeDD();
    var c = cur;
    cur = null;
    c.overlay.classList.remove('is-open');
    document.body.classList.remove('ab-lock');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { c.overlay.remove(); }, 260);
    if (c.lastFocus && typeof c.lastFocus.focus === 'function') {
      try { c.lastFocus.focus(); } catch (e) { /* ignore */ }
    }
  }

  function onKey(e) {
    if (!cur) return;
    if (e.key === 'Escape') closeSheet();
  }

  function setView(title, bodyHTML, footHTML, backTo) {
    closeDD();
    var o = cur.overlay;
    o.querySelector('.ab-sheet__title').textContent = title;
    o.querySelector('.ab-sheet__body').innerHTML = bodyHTML;
    var foot = o.querySelector('.ab-sheet__foot');
    foot.innerHTML = footHTML || '';
    foot.style.display = footHTML ? '' : 'none';
    o.querySelector('.ab-sheet__body').scrollTop = 0;
    var back = o.querySelector('.ab-back');
    back.hidden = !backTo;
    back.dataset.to = backTo || '';
  }

  function notifyChange() {
    if (cur && typeof cur.opts.onChange === 'function') cur.opts.onChange(cache.slice());
  }

  async function showList() {
    setView('انتخاب آدرس',
      '<div class="ab-skel"></div><div class="ab-skel"></div>', '', '');

    try {
      await list();
    } catch (e) {
      if (!cur) return;
      setView('انتخاب آدرس',
        '<div class="ab-empty"><p>' + esc(e.message) + '</p><button type="button" class="ab-btn ab-btn--ghost" data-ab="retry">تلاش دوباره</button></div>', '', '');
      return;
    }
    if (!cur) return;

    var pick = !!cur.opts.pick;
    var selId = cur.opts.selectedId;
    var foot = '<button type="button" class="ab-btn ab-btn--primary" data-ab="add">' + ICON.plus + '<span>افزودن آدرس جدید</span></button>';

    if (!cache.length) {
      setView(pick ? 'انتخاب آدرس' : 'آدرس‌های من',
        '<div class="ab-empty"><div class="ab-empty__ico">' + ICON.pin + '</div><p>هنوز آدرسی ثبت نکرده‌اید.</p><small>برای ثبت سفارش، یک آدرس اضافه کنید.</small></div>',
        foot, '');
      return;
    }

    var html = '<h4 class="ab-sub">آدرس‌های من</h4><div class="ab-list" ' + (pick ? 'role="radiogroup"' : '') + '>' +
      cache.map(function (a) { return cardHTML(a, { pick: pick, selected: pick && a._id === selId, actions: true }); }).join('') +
      '</div>';
    setView(pick ? 'انتخاب آدرس' : 'آدرس‌های من', html, foot, '');
  }

  function provinceOptions(sel) {
    var P = (typeof IRAN_PROVINCES !== 'undefined') ? IRAN_PROVINCES : null;
    var names = P ? Object.keys(P) : [];
    if (sel && names.indexOf(sel) === -1) names.unshift(sel);
    return '<option value="">انتخاب استان</option>' +
      names.map(function (n) { return '<option value="' + esc(n) + '"' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('');
  }

  function cityOptions(prov, sel) {
    var P = (typeof IRAN_PROVINCES !== 'undefined') ? IRAN_PROVINCES : null;
    var names = (P && prov && P[prov]) ? P[prov].slice() : [];
    if (sel && names.indexOf(sel) === -1) names.unshift(sel);
    return '<option value="">انتخاب شهر</option>' +
      names.map(function (n) { return '<option value="' + esc(n) + '"' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('');
  }

  // ---------------------------------------------------------------- لیست کشویی سفارشی (فقط ظاهر select؛ مقدار و رویدادها همان select است)
  var openDD = null;

  var CHEVRON = '<svg class="ab-dd__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  function closeDD() {
    if (!openDD) return;
    var d = openDD;
    openDD = null;
    d.pop.remove();
    d.btn.classList.remove('is-open');
    d.btn.setAttribute('aria-expanded', 'false');
    window.removeEventListener('keydown', ddKey, true);
    window.removeEventListener('resize', closeDD);
    d.overlay.removeEventListener('click', ddOutside, true);
    if (d.scroller) d.scroller.removeEventListener('scroll', closeDD);
  }

  function ddOutside(e) {
    if (!openDD) return;
    if (openDD.pop.contains(e.target) || openDD.btn.contains(e.target)) return;
    var backdrop = e.target === openDD.overlay;
    closeDD();
    if (backdrop) e.stopImmediatePropagation(); // کلیک روی پس‌زمینه فقط لیست را ببندد، نه کل پنجره
  }

  function ddKey(e) {
    if (!openDD) return;
    var opts = Array.prototype.slice.call(openDD.pop.querySelectorAll('.ab-dd__opt'));
    var i = opts.indexOf(document.activeElement);

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      var b = openDD.btn;
      closeDD();
      b.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      (opts[i + 1] || opts[0]).focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (opts[i - 1] || opts[opts.length - 1]).focus();
    } else if (e.key === 'Tab') {
      closeDD();
    } else if (e.key.length === 1) {
      for (var k = 0; k < opts.length; k++) {
        if (opts[k].textContent.trim().charAt(0) === e.key) { opts[k].focus(); break; }
      }
    }
  }

  function enhanceSelect(sel, emptyText) {
    var wrap = document.createElement('div');
    wrap.className = 'ab-dd';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('ab-dd__native');
    sel.tabIndex = -1;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ab-dd__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="ab-dd__val"></span>' + CHEVRON;
    wrap.appendChild(btn);

    var val = btn.querySelector('.ab-dd__val');

    function realOptions() {
      return Array.prototype.slice.call(sel.options).filter(function (o) { return o.value !== ''; });
    }

    function refresh() {
      var o = sel.options[sel.selectedIndex];
      var has = !!o && o.value !== '';
      var empty = realOptions().length === 0;
      val.textContent = (empty && emptyText) ? emptyText : (o ? o.text : '');
      btn.classList.toggle('is-placeholder', !has);
      btn.disabled = empty;
    }

    function open() {
      closeDD();

      var pop = document.createElement('div');
      pop.className = 'ab-dd__pop';
      pop.setAttribute('role', 'listbox');
      pop.innerHTML = realOptions().map(function (o) {
        var on = o.value === sel.value;
        return '<button type="button" role="option" class="ab-dd__opt' + (on ? ' is-on' : '') + '" data-v="' + esc(o.value) + '" aria-selected="' + on + '">' +
          '<span>' + esc(o.text) + '</span>' + (on ? CHECK : '') + '</button>';
      }).join('');

      cur.overlay.appendChild(pop);

      var r = btn.getBoundingClientRect();
      var vh = window.innerHeight;
      var below = vh - r.bottom - 14;
      var above = r.top - 14;
      var up = pop.scrollHeight > below && above > below;
      var room = Math.max(120, Math.min(260, up ? above : below));

      pop.style.width = r.width + 'px';
      pop.style.left = r.left + 'px';
      pop.style.maxHeight = room + 'px';
      if (up) pop.style.bottom = (vh - r.top + 6) + 'px';
      else pop.style.top = (r.bottom + 6) + 'px';

      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');

      var scroller = cur.overlay.querySelector('.ab-sheet__body');
      openDD = { pop: pop, btn: btn, overlay: cur.overlay, scroller: scroller };

      pop.addEventListener('click', function (e) {
        var it = e.target.closest('.ab-dd__opt');
        if (!it) return;
        sel.value = it.dataset.v;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        refresh();
        closeDD();
        btn.focus();
      });

      window.addEventListener('keydown', ddKey, true);
      window.addEventListener('resize', closeDD);
      cur.overlay.addEventListener('click', ddOutside, true);
      if (scroller) scroller.addEventListener('scroll', closeDD);

      var on = pop.querySelector('.is-on') || pop.querySelector('.ab-dd__opt');
      if (on) {
        pop.scrollTop = Math.max(0, on.offsetTop - 80);
        try { on.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
    }

    btn.addEventListener('click', function () {
      if (openDD && openDD.btn === btn) closeDD(); else open();
    });

    // کلیک روی label یا فوکوس برنامه‌ای (مثلاً خطای اعتبارسنجی) به دکمه برسد
    sel.addEventListener('focus', function () { btn.focus(); });

    refresh();
    return { refresh: refresh };
  }

  function field(id, label, input, required, hint) {
    return '<div class="ab-field" data-f="' + id + '"><label for="abf-' + id + '">' + label + (required ? ' <i>*</i>' : '') + '</label>' +
      input + (hint ? '<small class="ab-hint">' + hint + '</small>' : '') + '<span class="ab-err" aria-live="polite"></span></div>';
  }

  function showForm(addr) {
    var a = addr || {};
    var editing = !!a._id;
    var onlyOne = !editing && cache.length === 0;
    var isDef = !!a.isDefault || onlyOne;
    var backTo = (cur.from === 'list') ? 'list' : '';

    var html =
      '<form class="ab-form" id="abForm" novalidate autocomplete="off">' +
      '<div class="ab-row2">' +
      field('recipientName', 'نام و نام خانوادگی گیرنده', '<input id="abf-recipientName" type="text" maxlength="100" value="' + esc(a.recipientName || '') + '">', true) +
      field('recipientPhone', 'شماره موبایل گیرنده', '<input id="abf-recipientPhone" type="tel" inputmode="tel" dir="ltr" maxlength="14" placeholder="09123456789" value="' + esc(a.recipientPhone || '') + '">', true) +
      '</div>' +
      '<div class="ab-row2">' +
      field('province', 'استان', '<select id="abf-province">' + provinceOptions(a.province) + '</select>', true) +
      field('city', 'شهر', '<select id="abf-city">' + cityOptions(a.province, a.city) + '</select>', true) +
      '</div>' +
      field('neighborhood', 'محله', '<input id="abf-neighborhood" type="text" maxlength="100" value="' + esc(a.neighborhood || '') + '" placeholder="اختیاری">', false) +
      field('address', 'آدرس دقیق', '<textarea id="abf-address" rows="3" maxlength="500" placeholder="خیابان، کوچه و سایر جزئیات">' + esc(a.address || '') + '</textarea>', true) +
      '<div class="ab-row3">' +
      field('plaque', 'پلاک', '<input id="abf-plaque" type="text" maxlength="20" inputmode="numeric" value="' + esc(a.plaque || '') + '">', true) +
      field('unit', 'واحد', '<input id="abf-unit" type="text" maxlength="20" inputmode="numeric" value="' + esc(a.unit || '') + '" placeholder="اختیاری">', false) +
      field('postalCode', 'کد پستی', '<input id="abf-postalCode" type="text" maxlength="10" inputmode="numeric" dir="ltr" value="' + esc(a.postalCode || '') + '" placeholder="۱۰ رقمی">', true) +
      '</div>' +
      '<label class="ab-chk"><input type="checkbox" id="abf-isDefault"' + (isDef ? ' checked' : '') + (isDef && (editing || onlyOne) ? ' disabled' : '') + '><span>ثبت به‌عنوان آدرس پیش‌فرض</span></label>' +
      '<p class="ab-form-error" id="abFormError" hidden></p>' +
      '</form>';

    var foot = '<button type="submit" form="abForm" class="ab-btn ab-btn--primary" id="abSave"><span>' + (editing ? 'ذخیره تغییرات' : 'ثبت آدرس') + '</span></button>';

    setView(editing ? 'ویرایش آدرس' : 'افزودن آدرس جدید', html, foot, backTo);
    cur.editing = editing ? a : null;

    var o = cur.overlay;
    var prov = o.querySelector('#abf-province');
    var city = o.querySelector('#abf-city');
    prov.addEventListener('change', function () { city.innerHTML = cityOptions(prov.value, ''); });

    enhanceSelect(prov);
    var cityDD = enhanceSelect(city, 'ابتدا استان را انتخاب کنید');
    prov.addEventListener('change', function () { cityDD.refresh(); });

    o.querySelector('#abForm').addEventListener('submit', submitForm);
    o.querySelectorAll('.ab-form input, .ab-form select, .ab-form textarea').forEach(function (el) {
      el.addEventListener('input', function () { clearErr(el); });
      el.addEventListener('change', function () { clearErr(el); });
    });

    var first = o.querySelector('#abf-recipientName');
    if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 280);
  }

  function setErr(id, msg) {
    var box = cur.overlay.querySelector('[data-f="' + id + '"]');
    if (!box) return;
    box.classList.add('has-error');
    box.querySelector('.ab-err').textContent = msg;
  }

  function clearErr(el) {
    var box = el.closest('.ab-field');
    if (!box) return;
    box.classList.remove('has-error');
    box.querySelector('.ab-err').textContent = '';
    var g = cur && cur.overlay.querySelector('#abFormError');
    if (g) g.hidden = true;
  }

  function readForm() {
    var $ = function (id) { return cur.overlay.querySelector('#abf-' + id); };
    var phone = toEn($('recipientPhone').value).replace(/[\s\-()]/g, '').replace(/^(\+98|0098|98)/, '0');
    if (/^9\d{9}$/.test(phone)) phone = '0' + phone;
    return {
      recipientName: $('recipientName').value.trim(),
      recipientPhone: phone,
      province: $('province').value.trim(),
      city: $('city').value.trim(),
      neighborhood: $('neighborhood').value.trim(),
      address: $('address').value.trim(),
      plaque: toEn($('plaque').value.trim()),
      unit: toEn($('unit').value.trim()),
      postalCode: toEn($('postalCode').value.trim()).replace(/\s/g, ''),
      isDefault: $('isDefault').checked || $('isDefault').disabled
    };
  }

  function validate(d) {
    var errs = [];
    if (d.recipientName.length < 3) errs.push(['recipientName', 'نام و نام خانوادگی گیرنده را وارد کنید.']);
    if (!/^09\d{9}$/.test(d.recipientPhone)) errs.push(['recipientPhone', 'شماره موبایل معتبر نیست (مثال: 09123456789).']);
    if (!d.province) errs.push(['province', 'استان را انتخاب کنید.']);
    if (!d.city) errs.push(['city', 'شهر را انتخاب کنید.']);
    if (d.address.length < 10) errs.push(['address', 'آدرس را کامل وارد کنید.']);
    if (!d.plaque) errs.push(['plaque', 'پلاک را وارد کنید.']);
    if (!/^\d{10}$/.test(d.postalCode)) errs.push(['postalCode', 'کد پستی باید ۱۰ رقم باشد.']);
    return errs;
  }

  async function submitForm(e) {
    e.preventDefault();
    var o = cur.overlay;
    var btn = o.querySelector('#abSave');
    var d = readForm();
    var errs = validate(d);

    o.querySelectorAll('.ab-field').forEach(function (b) { b.classList.remove('has-error'); b.querySelector('.ab-err').textContent = ''; });

    if (errs.length) {
      errs.forEach(function (x) { setErr(x[0], x[1]); });
      var f = o.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (f) f.focus();
      return;
    }

    var editing = cur.editing;
    loading(btn, true);
    try {
      var saved = editing ? await api('/' + encodeURIComponent(editing._id), 'PUT', d) : await api('', 'POST', d);
      await list();
      toast(editing ? 'آدرس ویرایش شد.' : 'آدرس جدید ثبت شد.', 'success');
      notifyChange();

      var opts = cur.opts;
      if (!editing && opts.pick && typeof opts.onSelect === 'function') {
        opts.onSelect(saved);
        closeSheet();
      } else if (cur.from === 'list') {
        cur.from = '';
        showList();
      } else {
        closeSheet();
      }
    } catch (err) {
      var g = o.querySelector('#abFormError');
      if (g) { g.textContent = err.message; g.hidden = false; }
      toast(err.message, 'error');
    } finally {
      loading(btn, false);
    }
  }

  function showConfirm(addr) {
    var backTo = (cur.from === 'list') ? 'list' : '';
    setView('حذف آدرس',
      '<div class="ab-confirm"><div class="ab-confirm__ico">' + ICON.trash + '</div>' +
      '<p>آیا از حذف این آدرس مطمئن هستید؟</p>' +
      '<div class="ab-confirm__card">' + cardHTML(addr, {}) + '</div>' +
      '<small>سفارش‌های قبلی شما تغییری نمی‌کنند.</small></div>',
      '<div class="ab-foot2"><button type="button" class="ab-btn ab-btn--ghost" data-ab="cancel-del">انصراف</button>' +
      '<button type="button" class="ab-btn ab-btn--danger" data-ab="do-del" data-id="' + esc(addr._id) + '">بله، حذف شود</button></div>',
      backTo);
    cur.pendingDelete = addr;
  }

  async function doDelete(btn) {
    var addr = cur.pendingDelete;
    if (!addr) return;
    loading(btn, true);
    try {
      await api('/' + encodeURIComponent(addr._id), 'DELETE');
      await list();
      toast('آدرس حذف شد.', 'success');
      if (typeof cur.opts.onDeleted === 'function') cur.opts.onDeleted(addr);
      notifyChange();
      if (cur.from === 'list') { cur.from = ''; showList(); } else closeSheet();
    } catch (err) {
      toast(err.message, 'error');
      loading(btn, false);
    }
  }

  async function makeDefault(id, btn) {
    loading(btn, true);
    try {
      await api('/' + encodeURIComponent(id) + '/default', 'PUT');
      await list();
      toast('آدرس پیش‌فرض تغییر کرد.', 'success');
      notifyChange();
      if (cur) showList();
    } catch (err) {
      toast(err.message, 'error');
      loading(btn, false);
    }
  }

  function findById(id) {
    for (var i = 0; i < cache.length; i++) if (cache[i]._id === id) return cache[i];
    return null;
  }

  function onClick(e) {
    var t = e.target;
    if (t === cur.overlay) { closeSheet(); return; }
    var el = t.closest('[data-ab]');
    if (!el || !cur.overlay.contains(el)) return;
    var act = el.dataset.ab;

    if (act === 'close') return closeSheet();
    if (act === 'retry') return showList();

    if (act === 'back') {
      cur.from = '';
      return showList();
    }

    if (act === 'add') { cur.from = 'list'; return showForm(null); }

    if (act === 'edit') {
      var a = findById(el.dataset.id);
      if (a) { cur.from = 'list'; return showForm(a); } // دکمه‌ی ویرایش فقط داخل لیست وجود دارد
      return;
    }

    if (act === 'delete') {
      var d = findById(el.dataset.id);
      if (d) { cur.from = 'list'; return showConfirm(d); } // دکمه‌ی حذف فقط داخل لیست وجود دارد
      return;
    }

    if (act === 'cancel-del') {
      if (cur.from === 'list') { cur.from = ''; return showList(); }
      return closeSheet();
    }

    if (act === 'do-del') return doDelete(el);
    if (act === 'default') return makeDefault(el.dataset.id, el);

    if (act === 'pick') {
      if (t.closest('.ab-card__acts')) return; // دکمه‌های ویرایش/حذف
      var p = findById(el.dataset.id);
      if (p && typeof cur.opts.onSelect === 'function') {
        cur.opts.onSelect(p);
        closeSheet();
      }
    }
  }

  function onKeyCard(e) {
    if (!cur) return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.ab-card.is-pickable')) {
      e.preventDefault();
      e.target.click();
    }
  }

  function openSheet(opts) {
    opts = opts || {};
    closeSheet();

    var overlay = document.createElement('div');
    overlay.className = 'ab-overlay';
    overlay.innerHTML =
      '<div class="ab-sheet" role="dialog" aria-modal="true" aria-labelledby="abTitle">' +
      '<div class="ab-sheet__grab" aria-hidden="true"></div>' +
      '<header class="ab-sheet__head">' +
      '<button type="button" class="ab-back" data-ab="back" aria-label="بازگشت" hidden>' + ICON.back + '</button>' +
      '<h3 class="ab-sheet__title" id="abTitle"></h3>' +
      '<button type="button" class="ab-x" data-ab="close" aria-label="بستن">' + ICON.close + '</button>' +
      '</header>' +
      '<div class="ab-sheet__body"></div>' +
      '<footer class="ab-sheet__foot"></footer>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.classList.add('ab-lock');

    cur = { overlay: overlay, opts: opts, lastFocus: document.activeElement, from: '', view: opts.view || 'list' };

    overlay.addEventListener('click', onClick);
    overlay.addEventListener('keydown', onKeyCard);
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(function () { overlay.classList.add('is-open'); });

    if (opts.view === 'form') {
      // اگر از لیست باز نشده، بعد از ذخیره فقط بسته می‌شود
      var go = function () { if (cur) showForm(opts.address || null); };
      list().then(go, go);
    } else if (opts.view === 'confirm' && opts.address) {
      list().then(function () { if (cur) showConfirm(opts.address); }, function () { if (cur) showConfirm(opts.address); });
    } else {
      showList();
    }
  }

  window.NCAddressBook = {
    init: init,
    list: list,
    api: api,
    openSheet: openSheet,
    closeSheet: closeSheet,
    cardHTML: cardHTML,
    fullText: fullText,
    makeDefault: function (id) { return api('/' + encodeURIComponent(id) + '/default', 'PUT'); },
    get cache() { return cache; },
    esc: esc,
    fa: fa,
    toast: toast,
    icons: ICON
  };
})();