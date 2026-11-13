// 根網址依瀏覽器語言導向（獨立檔案，符合 CSP）
// Root URL language redirect (a separate file to satisfy CSP)
(function () {
  var base = location.pathname.replace(/\/(index\.html)?$/, '');
  var prefs = navigator.languages || [navigator.language || ''];
  var useZh = prefs.some(function (l) { return /^zh/i.test(l); });
  location.replace(base + (useZh ? '/zh-TW/' : '/en/'));
})();
