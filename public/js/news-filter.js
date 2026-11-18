// 新聞分類篩選與「再顯示 10 則」（獨立檔案，符合 CSP 的 script-src 'self'）
// News category filter and "show 10 more" (a separate file so CSP can stay at script-src 'self')
(function () {
  var STEP = 10;
  document.querySelectorAll('[data-news-list]').forEach(function (list) {
    var panel = list.closest('section');
    if (!panel) return;
    var tabs = panel.querySelectorAll('.tab');
    var empty = panel.querySelector('[data-empty]');
    var moreBtn = panel.querySelector('[data-news-more]');
    var items = list.querySelectorAll('.item');
    var cat = '';
    var limit = STEP;

    // 先依分類篩選，再只顯示前 limit 則 / filter by category first, then show only the first `limit`
    function apply() {
      var matched = 0;
      items.forEach(function (item) {
        var match = !cat || item.getAttribute('data-cat') === cat;
        if (!match) { item.hidden = true; return; }
        matched++;
        item.hidden = matched > limit;
      });
      if (empty) empty.hidden = matched > 0;
      if (moreBtn) moreBtn.hidden = matched <= limit;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        cat = tab.getAttribute('data-cat') || '';
        limit = STEP;
        tabs.forEach(function (x) { x.setAttribute('aria-pressed', String(x === tab)); });
        apply();
      });
    });
    if (moreBtn) moreBtn.addEventListener('click', function () { limit += STEP; apply(); });

    // 從名詞小教室連過來時，自動展開對應的新聞；若它排在 10 則之後，先多顯示出來
    // Open the linked story when arriving from the glossary; reveal it first if it sits past the first 10
    function openFromHash() {
      var id = location.hash.slice(1);
      if (!/^news-[\w-]+$/.test(id)) return;
      var item = document.getElementById(id);
      if (!item) return;
      if (item.hidden) {
        cat = '';
        limit = items.length;
        tabs.forEach(function (x) { x.setAttribute('aria-pressed', String(!x.getAttribute('data-cat'))); });
        apply();
      }
      var d = item.querySelector('details');
      if (d) { d.open = true; item.scrollIntoView(); }
    }

    apply();
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  });
})();
