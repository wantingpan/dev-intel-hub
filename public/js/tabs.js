// 頁籤切換：只顯示選到的面板（獨立檔案，符合 CSP）。網址帶有 #kev、#ghsa、#patch-list 時，自動切到對應的頁籤。
// Tab switching: show only the selected panel (a separate file for CSP). A URL hash like #kev, #ghsa or #patch-list opens the matching tab.
(function () {
  var ID = { kev: 'kev', ghsa: 'ghsa', 'patch-list': 'patch' };
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = root.querySelectorAll('[data-tab]');
    var panels = root.querySelectorAll('[data-tab-panel]');
    function show(name) {
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.getAttribute('data-tab') === name)); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-tab-panel') !== name; });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { show(t.getAttribute('data-tab')); });
    });
    function fromHash() {
      var name = ID[location.hash.slice(1)];
      if (!name) return false;
      show(name);
      var el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView();
      return true;
    }
    if (!fromHash()) show('kev');
    window.addEventListener('hashchange', fromHash);
  });
})();
