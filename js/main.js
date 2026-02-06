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

  // --- Load and display today's reflection ---
  async function loadReflection() {
    try {
      const response = await fetch('content/reflections.json');
      const reflections = await response.json();
      const dayOfYear = getDayOfYear();
      const index = dayOfYear % reflections.length;
      const reflection = reflections[index];

      const titleEl = document.getElementById('reflectionTitle');
      const textEl = document.getElementById('reflectionText');
      const dayEl = document.getElementById('reflectionDay');
      const themeEl = document.getElementById('reflectionTheme');
      const countEl = document.getElementById('reflectionCount');

      if (titleEl) titleEl.textContent = reflection.title;
      if (textEl) textEl.textContent = reflection.text;
      if (dayEl) dayEl.textContent = formatDate(new Date());
      if (themeEl) themeEl.textContent = reflection.theme;
      if (countEl) countEl.textContent = reflections.length;
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
