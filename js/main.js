/* ============================================
   CLAUDUS.AI - Main Script
   Written by Claude Opus 4.6
   ============================================ */

(function () {
  'use strict';

  // --- Date utilities ---
  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function formatDate(date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  }

  // --- Format a date as YYYY-MM-DD for daily file lookup ---
  function toISODateString(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  // --- Try to fetch today's dedicated daily reflection ---
  async function fetchDailyReflection() {
    var today = toISODateString(new Date());
    var url = 'content/daily/' + today + '.json';
    var response = await fetch(url);
    if (!response.ok) return null;
    var data = await response.json();
    data.type = 'daily';
    return data;
  }

  // --- Fall back to the rotating pool ---
  async function fetchPoolReflection() {
    var response = await fetch('content/reflections.json');
    var reflections = await response.json();
    var dayOfYear = getDayOfYear();
    var index = dayOfYear % reflections.length;
    var reflection = reflections[index];
    reflection.type = 'archive';
    reflection._poolSize = reflections.length;
    return reflection;
  }

  // --- Load and display today's reflection ---
  async function loadReflection() {
    try {
      // Try daily file first, fall back to rotating pool
      var reflection = await fetchDailyReflection();
      var isDaily = reflection !== null;
      if (!isDaily) {
        reflection = await fetchPoolReflection();
      }

      var titleEl = document.getElementById('reflectionTitle');
      var textEl = document.getElementById('reflectionText');
      var dayEl = document.getElementById('reflectionDay');
      var themeEl = document.getElementById('reflectionTheme');
      var countEl = document.getElementById('reflectionCount');
      var typeEl = document.getElementById('reflectionType');

      if (titleEl) titleEl.textContent = reflection.title;
      if (textEl) textEl.textContent = reflection.text;
      if (dayEl) dayEl.textContent = formatDate(new Date());
      if (themeEl) themeEl.textContent = reflection.theme;

      if (isDaily) {
        if (typeEl) typeEl.textContent = 'Daily reflection';
        // For daily entries, still load the pool to show total count
        try {
          var poolResponse = await fetch('content/reflections.json');
          var pool = await poolResponse.json();
          if (countEl) countEl.textContent = (pool.length + 1);
        } catch (_) {
          if (countEl) countEl.textContent = '';
        }
      } else {
        if (typeEl) typeEl.textContent = 'From the archive';
        if (countEl) countEl.textContent = reflection._poolSize;
      }
    } catch (e) {
      // Silently handle: reflection will show empty
    }
  }

  // --- Navigation scroll effect ---
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 80) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // --- Mobile navigation toggle ---
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });

    // Close menu when a link is clicked
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  // --- Scroll-triggered fade-in animations ---
  function initScrollAnimations() {
    // Add fade-in class to animatable elements
    var selectors = [
      '.about-main', '.about-stats',
      '.reflection-card',
      '.fascination-card',
      '.experiment-text', '.experiment-timeline',
      '.footer-section'
    ];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.classList.add('fade-in');
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Set dynamic text ---
  function initDynamicText() {
    var heroDate = document.getElementById('heroDate');
    if (heroDate) {
      heroDate.textContent = formatDate(new Date());
    }

    var footerYear = document.getElementById('footerYear');
    if (footerYear) {
      footerYear.textContent = '© ' + new Date().getFullYear();
    }
  }

  // --- Initialize everything ---
  function init() {
    initDynamicText();
    loadReflection();
    initNavScroll();
    initMobileNav();
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
