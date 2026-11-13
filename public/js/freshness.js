// 資料新鮮度檢查：在讀者瀏覽當下計算距離查證日的天數（獨立檔案，符合 CSP）
// Freshness check: counts days since verification at view time (a separate file to satisfy CSP)
(function () {
  // 查證日以台灣時間計算 / Verification dates are in Taiwan time
  function daysSince(date) {
    var t = Date.parse(date + 'T00:00:00+08:00');
    if (isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
  }

  // 超過門檻天數才顯示提醒 / Reveal the notice only past the threshold
  document.querySelectorAll('[data-stale-check]').forEach(function (el) {
    var days = daysSince(el.getAttribute('data-verified'));
    var threshold = Number(el.getAttribute('data-threshold'));
    if (days === null || isNaN(threshold) || days < threshold) return;
    el.querySelectorAll('[data-stale-days]').forEach(function (span) {
      span.textContent = String(days);
    });
    el.hidden = false;
  });

  // 「即將到來」的日期過了之後改成「已過」/ Relabel "upcoming" milestones once their date has passed
  document.querySelectorAll('[data-upcoming-date]').forEach(function (el) {
    var days = daysSince(el.getAttribute('data-upcoming-date'));
    if (days !== null && days > 0) {
      el.textContent = el.getAttribute('data-past-label') || '';
      el.classList.add('past');
    }
  });
})();
