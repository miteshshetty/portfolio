/* ============================================================
   SECTION NAV — behavior
   Sticky-after-hero · IntersectionObserver scrollspy · URL hash
   Smooth scroll · Progress indicator · Mobile toggle · a11y
   ============================================================ */
(function () {
  'use strict';

  var nav      = document.getElementById('section-nav');
  var toggle   = document.getElementById('section-nav-toggle');
  var progress = document.getElementById('section-nav-progress');
  var hero     = document.getElementById('top');
  if (!nav) return;

  var links    = Array.prototype.slice.call(nav.querySelectorAll('.section-nav-link'));
  var sections = links
    .map(function (l) { return document.getElementById(l.getAttribute('data-section')); })
    .filter(Boolean);
  // Progress tracks the case-study body only — hero has its own top progress bar
  var progressSections = sections.filter(function (s) { return s.id !== 'top'; });

  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Reveal nav once the hero has scrolled past ── */
  if (hero && 'IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        nav.classList.toggle('is-visible', past);
        if (toggle) toggle.classList.toggle('is-visible', past);
        if (!past) closeMobile();
      });
    }, { threshold: 0, rootMargin: '-56px 0px 0px 0px' });
    heroObserver.observe(hero);
  } else {
    nav.classList.add('is-visible');
    if (toggle) toggle.classList.add('is-visible');
  }

  /* ── Scrollspy — mark the section crossing the reading line as active ── */
  function setActive(id) {
    links.forEach(function (l) {
      var match = l.getAttribute('data-section') === id;
      l.classList.toggle('is-active', match);
      if (match) {
        l.setAttribute('aria-current', 'true');
        // Auto-scroll active item into view within the nav's own scroll container
        var list = l.closest('.section-nav-list');
        if (list) {
          var lt = l.offsetTop, lb = lt + l.offsetHeight;
          var st = list.scrollTop, sb = st + list.clientHeight;
          if (lt < st) list.scrollTop = lt - 8;
          else if (lb > sb) list.scrollTop = lb - list.clientHeight + 8;
        }
      } else {
        l.removeAttribute('aria-current');
      }
    });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── Progress indicator — fraction scrolled through the case study body ── */
  function updateProgress() {
    if (!progress || !progressSections.length) return;
    var first = progressSections[0], last = progressSections[progressSections.length - 1];
    var start = first.offsetTop;
    var end   = last.offsetTop + last.offsetHeight;
    var y     = window.scrollY + window.innerHeight * 0.5;
    var pct   = ((y - start) / (end - start)) * 100;
    pct = Math.max(0, Math.min(100, pct));
    progress.style.height = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  /* ── Smooth scroll on click (respects reduced motion) ── */
  links.forEach(function (l) {
    l.addEventListener('click', function (e) {
      var id = l.getAttribute('data-section');
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'start' });
      setActive(id);
      closeMobile();
      target.focus({ preventScroll: true });
    });
  });

  /* ── Mobile toggle ── */
  function openMobile() {
    nav.classList.add('is-mobile-open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobile() {
    nav.classList.remove('is-mobile-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.contains('is-mobile-open');
      if (open) closeMobile(); else openMobile();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-mobile-open')) {
        closeMobile();
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-mobile-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeMobile();
    });
  }
})();
