/* ============================================================
   BEFORE/AFTER SLIDER — draggable comparison
   Pointer Events unify mouse, touch and pen in one code path.
   Keyboard: ArrowLeft/ArrowRight/Home/End when handle is focused.
   ============================================================ */
(function () {
  'use strict';

  var frame  = document.getElementById('ba-slider-frame');
  var handle = document.getElementById('ba-handle');
  var after  = document.getElementById('ba-img-after');
  var hint   = document.getElementById('ba-hint');
  if (!frame || !handle || !after) return;

  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dragging = false;
  var hasInteracted = false;

  function setPosition(pct) {
    pct = Math.max(0, Math.min(100, pct));
    after.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function pctFromClientX(clientX) {
    var rect = frame.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function markInteracted() {
    if (hasInteracted) return;
    hasInteracted = true;
    if (hint) hint.classList.add('is-hidden');
  }

  /* ── Pointer drag (mouse, touch, pen — one code path) ── */
  frame.addEventListener('pointerdown', function (e) {
    dragging = true;
    frame.classList.add('is-dragging');
    frame.setPointerCapture(e.pointerId);
    setPosition(pctFromClientX(e.clientX));
    markInteracted();
  });

  frame.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    setPosition(pctFromClientX(e.clientX));
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    frame.classList.remove('is-dragging');
    try { frame.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  frame.addEventListener('pointerup', endDrag);
  frame.addEventListener('pointercancel', endDrag);

  /* ── Keyboard ── */
  handle.addEventListener('keydown', function (e) {
    var current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    var step = 5;
    if (e.key === 'ArrowLeft')  { setPosition(current - step); markInteracted(); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { setPosition(current + step); markInteracted(); e.preventDefault(); }
    else if (e.key === 'Home') { setPosition(0); markInteracted(); e.preventDefault(); }
    else if (e.key === 'End')  { setPosition(100); markInteracted(); e.preventDefault(); }
  });

  /* ── Click anywhere on the frame to jump ── */
  frame.addEventListener('click', function (e) {
    if (dragging) return;
    setPosition(pctFromClientX(e.clientX));
    markInteracted();
  });

  setPosition(50);

  /* Auto-hide the "drag to compare" hint after a while even without interaction,
     so it doesn't linger as visual noise for someone just scrolling past. */
  if (!rm) {
    setTimeout(function () { if (hint) hint.classList.add('is-hidden'); }, 5000);
  }
})();
