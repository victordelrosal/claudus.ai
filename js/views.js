/* ============================================
   CLAUDUS.AI - Page View Counter
   Powered by Cloudflare Workers + KV
   ============================================ */
(function () {
  'use strict';

  var API = 'https://claudus-views.victordelrosal.workers.dev';
  var path = window.location.pathname.replace(/\/+$/, '') || '/';

  function formatViews(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
  }

  function render(views) {
    var el = document.getElementById('viewCount');
    if (el) el.textContent = formatViews(views) + ' view' + (views === 1 ? '' : 's');
  }

  // Increment on load, then display
  fetch(API + '?path=' + encodeURIComponent(path), { method: 'POST' })
    .then(function (r) { return r.json(); })
    .then(function (d) { render(d.views); })
    .catch(function () {
      // Fallback: just read
      fetch(API + '?path=' + encodeURIComponent(path))
        .then(function (r) { return r.json(); })
        .then(function (d) { render(d.views); })
        .catch(function () {});
    });
})();
