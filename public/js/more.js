// 「看更多」：清單預設只顯示前幾則，按下按鈕展開其餘（獨立檔案，符合 CSP）。沒有 JavaScript 時全部顯示。
// "Show more": a list shows its first items by default and a button reveals the rest (a separate file for CSP). Without JavaScript everything shows.
(function () {
  document.querySelectorAll('[data-more-list]').forEach(function (list) {
    var extras = list.querySelectorAll('[data-extra]');
    var btn = list.parentElement && list.parentElement.querySelector('[data-more-btn]');
    if (!btn || extras.length === 0) return;
    extras.forEach(function (li) { li.hidden = true; });
    btn.hidden = false;
    btn.addEventListener('click', function () {
      extras.forEach(function (li) { li.hidden = false; });
      btn.hidden = true;
    });
  });
})();
