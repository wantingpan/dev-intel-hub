// 技術動態的分類頁籤：只顯示選到的分類（獨立檔案，符合 CSP 的 script-src 'self'）
// Dev feeds category tabs: show only the chosen group (a separate file so CSP can stay at script-src 'self')
(function () {
  var bar = document.querySelector('[data-feed-tabs]');
  if (!bar) return;
  var tabs = bar.querySelectorAll('.tab');
  var groups = document.querySelectorAll('section.group[data-group]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var g = tab.getAttribute('data-group') || '';
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', String(x === tab)); });
      groups.forEach(function (sec) { sec.hidden = !!g && sec.getAttribute('data-group') !== g; });
    });
  });
})();
