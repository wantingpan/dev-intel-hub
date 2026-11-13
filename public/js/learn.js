// 從其他頁面連到某個名詞時，自動展開那張卡片 / Open a term's card when arriving via its link
(function () {
  function openFromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!/^[a-z0-9-]+$/.test(id)) return;
    var el = document.getElementById(id);
    var d = el && el.classList.contains('term') ? el.querySelector('details') : null;
    if (d) { d.open = true; el.scrollIntoView(); }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();
