/* ============================================================
   RBL BANK UPI CASE STUDY — main.js
   Scroll animations · Progress bar · Nav · Interactions
   ============================================================ */

(function () {
  'use strict';

  /* ── Progress Bar ─────────────────────────────────────── */
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ── Nav Scroll ───────────────────────────────────────── */
  const nav = document.querySelector('nav');
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  /* ── Hamburger ────────────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      const bars = hamburger.querySelectorAll('span');
      const isOpen = navLinks.classList.contains('open');
      if (bars.length >= 3) {
        bars[0].style.transform = isOpen ? 'translateY(6.5px) rotate(45deg)' : '';
        bars[1].style.opacity   = isOpen ? '0' : '';
        bars[2].style.transform = isOpen ? 'translateY(-6.5px) rotate(-45deg)' : '';
      }
    });
    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(function (s) {
          s.style.transform = '';
          s.style.opacity   = '';
        });
      });
    });
  }

  /* ── Fade-up Intersection Observer ───────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );
  fadeEls.forEach(function (el) { observer.observe(el); });

  /* ── Lazy Image Loading ───────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imgObserver.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
    lazyImgs.forEach(function (img) { imgObserver.observe(img); });
  }

  /* ── Smooth anchor scroll with offset ────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── Scroll event ─────────────────────────────────────── */
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgress();
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── Initial call ─────────────────────────────────────── */
  updateProgress();
  updateNav();

  /* ── Image lightbox (simple) ──────────────────────────── */
  const screenImgs = document.querySelectorAll('.screen-frame img, .img-hover img');
  screenImgs.forEach(function (img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function () {
      const overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);',
        'display:flex;align-items:center;justify-content:center;cursor:zoom-out;',
        'padding:24px;'
      ].join('');
      const clone = img.cloneNode();
      clone.style.cssText = [
        'max-width:90vw;max-height:90vh;width:auto;height:auto;',
        'border-radius:8px;box-shadow:0 32px 80px rgba(0,0,0,0.8);',
        'object-fit:contain;cursor:default;'
      ].join('');
      overlay.appendChild(clone);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      overlay.addEventListener('click', function () {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
      });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
          }
          document.removeEventListener('keydown', esc);
        }
      });
    });
  });

})();
