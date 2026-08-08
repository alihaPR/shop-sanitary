// =====================================================================
// UI Core: انیمیشن AOS + Toast عمومی + لودینگ دکمه‌ها
// این فایل مستقل است، به منطق/ظاهر فعلی سایت دست نمی‌زند.
// =====================================================================

// ===================== AOS =====================
window.addEventListener('load', () => {
  if (window.AOS) {
    AOS.init({ once: true, duration: 800, offset: 60, easing: 'ease-out-cubic' });
  }
});
window.addEventListener('resize', () => {
  if (window.AOS) AOS.refresh();
});

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
