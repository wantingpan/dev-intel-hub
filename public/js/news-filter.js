// 新聞分類篩選（獨立檔案，符合 CSP 的 script-src 'self'）
// News category filter (a separate file so CSP can stay at script-src 'self')
(function () {
  document.querySelectorAll('[data-news-list]').forEach(function (list) {
    var panel = list.closest('section');
    if (!panel) return;
    var tabs = panel.querySelectorAll('.tab');
    var empty = panel.querySelector('[data-empty]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var cat = tab.getAttribute('data-cat') || '';
        tabs.forEach(function (x) { x.setAttribute('aria-pressed', String(x === tab)); });
        var shown = 0;
        list.querySelectorAll('.item').forEach(function (item) {
          var match = !cat || item.getAttribute('data-cat') === cat;
          item.hidden = !match;
          if (match) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  });
  // 從名詞小教室連過來時，自動展開對應的新聞 / Open the linked story when arriving from the glossary
  function openFromHash() {
    var id = location.hash.slice(1);
    if (!/^news-[\w-]+$/.test(id)) return;
    var item = document.getElementById(id);
    var d = item && item.querySelector('details');
    if (d) { d.open = true; item.scrollIntoView(); }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();
