// 名詞說明泡泡的定位：開啟時放在按鈕旁，並限制在視窗內（獨立檔案，符合 CSP）
// Positions info-icon popovers next to their button and keeps them inside the viewport (a separate file to satisfy CSP)
(function () {
  if (window.__infotipLoaded) return; // 同一頁有多個圖示時只綁一次 / bind once even with several icons
  window.__infotipLoaded = true;

  var GAP = 6;
  var MARGIN = 8;

  function place(pop) {
    var btn = document.querySelector('[popovertarget="' + pop.id + '"]');
    if (!btn) return;
    var b = btn.getBoundingClientRect();
    var w = pop.offsetWidth;
    var h = pop.offsetHeight;
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var left = Math.max(MARGIN, Math.min(b.left, vw - w - MARGIN));
    var top = b.bottom + GAP;
    // 下方放不下就改放上方 / flip above when there's no room below
    if (top + h > vh - MARGIN && b.top - GAP - h >= MARGIN) top = b.top - GAP - h;
    pop.style.left = left + 'px';
    pop.style.top = Math.max(MARGIN, top) + 'px';
  }

  document.addEventListener('toggle', function (e) {
    var pop = e.target;
    if (!(pop instanceof HTMLElement) || !pop.classList.contains('tip')) return;
    if (e.newState === 'open') place(pop);
  }, true);

  // 在泡泡裡按「對照」展開後，內容變長，重新定位 / re-place after "show the other language" grows the popover
  document.addEventListener('click', function (e) {
    var btn = e.target instanceof Element ? e.target.closest('[data-alt-toggle]') : null;
    var pop = btn && btn.closest('.tip');
    if (pop) setTimeout(function () { place(pop); }, 0);
  });

  // 捲動或縮放時直接關閉，避免泡泡和按鈕分開 / close on scroll or resize so a popover never drifts from its button
  function closeAll() {
    document.querySelectorAll('.tip:popover-open').forEach(function (p) { p.hidePopover(); });
  }
  window.addEventListener('resize', closeAll);
  window.addEventListener('scroll', closeAll, { passive: true });
})();
