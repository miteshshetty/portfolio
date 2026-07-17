(function () {
  'use strict';
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.setAttribute('aria-label', 'Toggle light and dark theme');

  function applyLogoTheme(theme) {
    var logo = document.getElementById('rbl-hero-logo');
    if (logo) {
      logo.src = theme === 'light' ? 'images/rbl-logo-dark.png' : 'images/rbl-logo-white.png';
    }
  }

  // Apply on load
  applyLogoTheme(document.documentElement.getAttribute('data-theme') || 'dark');

  btn.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    applyLogoTheme(next);
  });
})();
