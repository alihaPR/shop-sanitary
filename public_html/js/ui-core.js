// =====================================================================
// UI Core: انیمیشن AOS + Toast عمومی + لودینگ دکمه‌ها
// این فایل مستقل است، به منطق/ظاهر فعلی سایت دست نمی‌زند.
// =====================================================================

// ===================== Toast عمومی =====================
(function () {

  const ICONS = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"/></svg>'
  };

  window.showAppToast = function (message, type = 'info', duration = 3800) {

    if (!message) return;

    const existing = document.getElementById('app-toast-generic');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'app-toast-generic';
    toast.className = `app-toast type-${ICONS[type] ? type : 'info'}`;
    toast.innerHTML = `
      <div class="app-toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="app-toast-body">
        <p class="app-toast-title">${message}</p>
      </div>
      <button type="button" class="app-toast-close" aria-label="بستن">✕</button>
    `;

    document.body.appendChild(toast);

    const remove = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.app-toast-close').addEventListener('click', remove);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(remove, duration);
  };

})();

// ===================== لودینگ دکمه‌ها =====================
window.setBtnLoading = function (btn, isLoading) {
  if (!btn) return;
  if (isLoading) {
    if (btn.dataset.loadingActive === '1') return;
    btn.dataset.loadingActive = '1';
    btn.disabled = true;
    btn.classList.add('btn-loading');
  } else {
    btn.dataset.loadingActive = '';
    btn.disabled = false;
    btn.classList.remove('btn-loading');
  }
};

// ===================== Toast تأیید (بله / انصراف) =====================
(function () {

  var STYLE_ID = 'app-confirm-toast-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent =
      '.app-confirm-toast{position:fixed;left:50%;bottom:-160px;transform:translateX(-50%);z-index:100000;' +
      'direction:rtl;background:#fff;border:1px solid #e0e0e0;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.14);' +
      'padding:14px 16px;display:flex;align-items:center;gap:16px;min-width:300px;max-width:calc(100vw - 24px);' +
      'font-family:inherit;transition:bottom .4s cubic-bezier(.34,1.56,.64,1)}' +
      '.app-confirm-toast.show{bottom:24px}' +
      '.app-confirm-toast__msg{font-size:14px;font-weight:600;color:#222;flex:1}' +
      '.app-confirm-toast__actions{display:flex;align-items:center;gap:8px}' +
      '.app-confirm-toast__btn{font-family:inherit;font-size:13px;font-weight:600;padding:7px 14px;border-radius:8px;' +
      'cursor:pointer;white-space:nowrap;border:1px solid transparent;transition:background .2s}' +
      '.app-confirm-toast__btn--yes{background:#d64545;color:#fff}' +
      '.app-confirm-toast__btn--yes:hover{background:#b93636}' +
      '.app-confirm-toast__btn--no{background:#fff;color:#444;border-color:#d8d8d8}' +
      '.app-confirm-toast__btn--no:hover{background:#f4f4f4}' +
      '@media (max-width:600px){.app-confirm-toast{flex-direction:column;align-items:stretch;gap:12px;min-width:0;width:calc(100vw - 24px)}' +
      '.app-confirm-toast__actions{justify-content:flex-end}.app-confirm-toast.show{bottom:84px}}';
    document.head.appendChild(st);
  }

  window.showConfirmToast = function (message, onConfirm, opts) {

    opts = opts || {};
    injectStyle();

    var existing = document.getElementById('app-confirm-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'app-confirm-toast';
    toast.className = 'app-confirm-toast';
    toast.setAttribute('role', 'alertdialog');
    toast.innerHTML =
      '<div class="app-confirm-toast__msg"></div>' +
      '<div class="app-confirm-toast__actions">' +
      '<button type="button" class="app-confirm-toast__btn app-confirm-toast__btn--yes"></button>' +
      '<button type="button" class="app-confirm-toast__btn app-confirm-toast__btn--no"></button>' +
      '</div>';

    toast.querySelector('.app-confirm-toast__msg').textContent = message;
    toast.querySelector('.app-confirm-toast__btn--yes').textContent = opts.confirmText || 'بله';
    toast.querySelector('.app-confirm-toast__btn--no').textContent = opts.cancelText || 'انصراف';

    document.body.appendChild(toast);

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey);
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    toast.querySelector('.app-confirm-toast__btn--no').addEventListener('click', close);
    toast.querySelector('.app-confirm-toast__btn--yes').addEventListener('click', function () {
      close();
      if (typeof onConfirm === 'function') onConfirm();
    });
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(function () { toast.classList.add('show'); });
  };

})();
