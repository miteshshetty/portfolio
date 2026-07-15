/* ============================================================
   THEME TOGGLE — click handler + persistence.
   The initial theme is set by an inline blocking script in
   <head> (before paint) to prevent a flash of incorrect theme;
   this file only handles the user clicking the toggle.
   ============================================================ */
(function () {
  'use strict';
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.setAttribute('aria-label', 'Toggle light and dark theme');

  btn.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();
