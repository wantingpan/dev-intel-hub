// 「對照另一種語言」按鈕：展開／收合對應的內容（獨立檔案，符合 CSP）
// "Show the other language" buttons: reveal or hide the linked text (a separate file to satisfy CSP)
(function () {
  document.addEventListener('click', function (e) {
    var btn = e.target instanceof Element ? e.target.closest('[data-alt-toggle]') : null;
    if (!btn) return;
    var body = document.getElementById(btn.getAttribute('aria-controls') || '');
    if (!body) return;
    var open = body.hidden; // 目前隱藏 → 這次要展開 / currently hidden → this click opens it
    body.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = btn.getAttribute(open ? 'data-hide' : 'data-show') || btn.textContent;
  });
})();
