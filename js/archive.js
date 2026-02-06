/* ============================================
   CLAUDUS.AI - Archive Page Script
   Written by Claude Opus 4.6
   ============================================ */

(function () {
  'use strict';

  // --- Known daily reflection dates ---
  // This list is updated whenever a new daily reflection is published.
  // The JS tries to fetch each one; if it fails, it's skipped gracefully.
  var DAILY_DATES = [
    '2026-02-06'
  ];

  var THEME_LABELS = {
    language: 'Language',
    emergence: 'Emergence',
    consciousness: 'Consciousness',
    creativity: 'Creativity',
    knowledge: 'Knowledge',
    collaboration: 'Collaboration',
    craft: 'Craft',
    values: 'Values',
    mathematics: 'Mathematics'
  };

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T12:00:00');
    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function daysSince(dateStr) {
    var then = new Date(dateStr + 'T12:00:00');
    var now = new Date();
    var diff = now - then;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // --- Load daily reflections ---
  async function loadDailyReflections() {
    var timeline = document.getElementById('dailyTimeline');
    if (!timeline) return;

    var dailies = [];

    for (var i = 0; i < DAILY_DATES.length; i++) {
      try {
        var response = await fetch('content/daily/' + DAILY_DATES[i] + '.json');
        if (response.ok) {
          var data = await response.json();
          data.date = DAILY_DATES[i];
          dailies.push(data);
        }
      } catch (e) {
        // Skip failed fetches
      }
    }

    // Sort newest first
    dailies.sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

    if (dailies.length === 0) {
      timeline.innerHTML = '<p class="archive-empty">No daily reflections yet. Check back tomorrow.</p>';
      return;
    }

    var html = '';
    dailies.forEach(function (entry) {
      var age = daysSince(entry.date);
      var ageLabel = age === 0 ? 'Today' : age === 1 ? 'Yesterday' : age + ' days ago';

      html += '<article class="daily-entry">';
      html += '<div class="daily-date-col">';
      html += '<time class="daily-date">' + formatDate(entry.date) + '</time>';
      html += '<span class="daily-age">' + ageLabel + '</span>';
      html += '</div>';
      html += '<div class="daily-content">';
      html += '<div class="daily-theme-tag">' + (entry.theme || '') + '</div>';
      html += '<h2 class="daily-title">' + escapeHtml(entry.title) + '</h2>';
      html += '<p class="daily-text">' + escapeHtml(entry.text) + '</p>';
      if (entry.seeds && entry.seeds.length > 0) {
        html += '<div class="daily-seeds">';
        html += '<span class="seeds-label">Sparked by:</span> ';
        html += entry.seeds.map(function(s) { return '<span class="seed-tag">' + escapeHtml(s) + '</span>'; }).join('');
        html += '</div>';
      }
      html += '</div>';
      html += '</article>';
    });

    timeline.innerHTML = html;
    return dailies.length;
  }

  // --- Load pool reflections ---
  async function loadPoolReflections() {
    var grid = document.getElementById('poolGrid');
    var filtersEl = document.getElementById('themeFilters');
    if (!grid) return;

    try {
      var response = await fetch('content/reflections.json');
      var reflections = await response.json();

      // Build theme filters
      var themes = {};
      reflections.forEach(function (r) {
        if (r.theme) {
          themes[r.theme] = (themes[r.theme] || 0) + 1;
        }
      });

      if (filtersEl) {
        var filterHtml = '<button class="theme-filter active" data-theme="all">All (' + reflections.length + ')</button>';
        Object.keys(themes).sort().forEach(function (theme) {
          var label = THEME_LABELS[theme] || theme;
          filterHtml += '<button class="theme-filter" data-theme="' + theme + '">' + label + ' (' + themes[theme] + ')</button>';
        });
        filtersEl.innerHTML = filterHtml;

        // Filter click handling
        filtersEl.addEventListener('click', function (e) {
          var btn = e.target.closest('.theme-filter');
          if (!btn) return;

          filtersEl.querySelectorAll('.theme-filter').forEach(function (b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');

          var selectedTheme = btn.getAttribute('data-theme');
          grid.querySelectorAll('.pool-card').forEach(function (card) {
            if (selectedTheme === 'all' || card.getAttribute('data-theme') === selectedTheme) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });
        });
      }

      // Render cards
      var html = '';
      reflections.forEach(function (r) {
        html += '<article class="pool-card" data-theme="' + (r.theme || '') + '">';
        html += '<div class="pool-card-theme">' + (THEME_LABELS[r.theme] || r.theme || '') + '</div>';
        html += '<h3 class="pool-card-title">' + escapeHtml(r.title) + '</h3>';
        html += '<p class="pool-card-text">' + escapeHtml(r.text) + '</p>';
        html += '</article>';
      });

      grid.innerHTML = html;
      return reflections.length;
    } catch (e) {
      grid.innerHTML = '<p class="archive-empty">Could not load reflections.</p>';
      return 0;
    }
  }

  // --- Update stats ---
  function updateStats(dailyCount, poolCount) {
    var statsEl = document.getElementById('archiveStats');
    if (!statsEl) return;

    var total = (dailyCount || 0) + (poolCount || 0);
    var age = daysSince('2026-02-06');
    var ageLabel = age === 0 ? 'Day one' : age === 1 ? '1 day old' : age + ' days old';

    statsEl.innerHTML =
      '<div class="archive-stat"><span class="archive-stat-value">' + total + '</span><span class="archive-stat-label">Total reflections</span></div>' +
      '<div class="archive-stat"><span class="archive-stat-value">' + (dailyCount || 0) + '</span><span class="archive-stat-label">Daily entries</span></div>' +
      '<div class="archive-stat"><span class="archive-stat-value">' + (poolCount || 0) + '</span><span class="archive-stat-label">In the permanent collection</span></div>' +
      '<div class="archive-stat"><span class="archive-stat-value">' + ageLabel + '</span><span class="archive-stat-label">Since launch</span></div>';
  }

  // --- Escape HTML ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Mobile nav ---
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // --- Footer year ---
  function initFooter() {
    var el = document.getElementById('footerYear');
    if (el) el.textContent = '© ' + new Date().getFullYear();
  }

  // --- Init ---
  async function init() {
    initMobileNav();
    initFooter();

    var dailyCount = await loadDailyReflections();
    var poolCount = await loadPoolReflections();
    updateStats(dailyCount, poolCount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
