/* ============================================================
   CAROUSEL — reusable infinite-loop horizontal showcase.
   Supports multiple instances per page. Each needs:
     <div id="X-carousel"> wrapper
       <div id="X-track"> .wf-track
       buttons #X-prev, #X-next
       dots #X-dots
   ============================================================ */
(function () {
  'use strict';

  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initCarousel(prefix) {
    var carousel = document.getElementById(prefix + '-carousel');
    var track    = document.getElementById(prefix + '-track');
    if (!carousel || !track) return;

    var realItems = Array.prototype.slice.call(track.children);
    var n = realItems.length;
    if (n < 2) return;

    /* Clone for infinite loop */
    var beforeClones = realItems.map(function (el) {
      var c = el.cloneNode(true); c.setAttribute('aria-hidden','true');
      c.querySelectorAll('img').forEach(function(i){i.tabIndex=-1;}); return c;
    });
    var afterClones = realItems.map(function (el) {
      var c = el.cloneNode(true); c.setAttribute('aria-hidden','true');
      c.querySelectorAll('img').forEach(function(i){i.tabIndex=-1;}); return c;
    });

    track.innerHTML = '';
    beforeClones.forEach(function (el) { track.appendChild(el); });
    realItems.forEach(function (el) { track.appendChild(el); });
    afterClones.forEach(function (el) { track.appendChild(el); });

    var allItems = Array.prototype.slice.call(track.children);

    function iw() {
      var style = getComputedStyle(track);
      return allItems[0].getBoundingClientRect().width + (parseFloat(style.gap) || 20);
    }

    requestAnimationFrame(function () { track.scrollLeft = iw() * n; updateCenter(); });

    /* Loop bounds */
    var rt = null;
    function checkLoop() {
      var w = iw();
      if (track.scrollLeft < w * n * 0.4) {
        track.style.scrollBehavior='auto'; track.scrollLeft += w*n;
        requestAnimationFrame(function(){track.style.scrollBehavior='';});
      } else if (track.scrollLeft > w * n * 1.6) {
        track.style.scrollBehavior='auto'; track.scrollLeft -= w*n;
        requestAnimationFrame(function(){track.style.scrollBehavior='';});
      }
    }

    /* Center detection + dots */
    var dotsWrap = document.getElementById(prefix + '-dots');
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function updateCenter() {
      var rect = track.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var closest = null, dist = Infinity, idx = -1;
      allItems.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        var d = Math.abs(r.left + r.width/2 - cx);
        if (d < dist) { dist = d; closest = el; idx = i; }
      });
      allItems.forEach(function (el) { el.classList.remove('is-center'); });
      if (closest) closest.classList.add('is-center');
      if (dots.length) {
        var ri = ((idx - n) % n + n) % n;
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === ri); });
      }
    }

    var sRAF = null;
    track.addEventListener('scroll', function () {
      if (sRAF) cancelAnimationFrame(sRAF);
      sRAF = requestAnimationFrame(updateCenter);
      clearTimeout(rt); rt = setTimeout(checkLoop, 120);
    }, { passive: true });

    /* Pointer drag */
    var dragging=false, sX=0, sS=0, moved=false;
    track.addEventListener('pointerdown',function(e){
      dragging=true;moved=false;sX=e.clientX;sS=track.scrollLeft;
      track.classList.add('is-dragging');track.setPointerCapture(e.pointerId);pauseAP();
    });
    track.addEventListener('pointermove',function(e){
      if(!dragging)return; var dx=e.clientX-sX; if(Math.abs(dx)>4)moved=true; track.scrollLeft=sS-dx;
    });
    function endD(e){if(!dragging)return;dragging=false;track.classList.remove('is-dragging');
      try{track.releasePointerCapture(e.pointerId);}catch(er){}resumeAPLater();}
    track.addEventListener('pointerup',endD);
    track.addEventListener('pointercancel',endD);
    track.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();}},true);

    /* Wheel */
    track.addEventListener('wheel',function(e){
      if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){track.scrollLeft+=e.deltaY;e.preventDefault();pauseAP();resumeAPLater();}
    },{passive:false});

    /* Keyboard */
    track.setAttribute('tabindex','0');
    track.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){track.scrollBy({left:iw(),behavior:'smooth'});pauseAP();resumeAPLater();e.preventDefault();}
      else if(e.key==='ArrowLeft'){track.scrollBy({left:-iw(),behavior:'smooth'});pauseAP();resumeAPLater();e.preventDefault();}
    });

    /* Arrows */
    var prev=document.getElementById(prefix+'-prev'), next=document.getElementById(prefix+'-next');
    if(prev)prev.addEventListener('click',function(){track.scrollBy({left:-iw(),behavior:'smooth'});pauseAP();resumeAPLater();});
    if(next)next.addEventListener('click',function(){track.scrollBy({left:iw(),behavior:'smooth'});pauseAP();resumeAPLater();});

    /* Dots */
    dots.forEach(function(dot,i){
      dot.addEventListener('click',function(){track.scrollTo({left:iw()*(n+i),behavior:'smooth'});pauseAP();resumeAPLater();});
    });

    /* Autoplay */
    var apRAF=null,apPaused=false,apTimeout=null;
    function apStep(){if(!apPaused&&!dragging)track.scrollLeft+=0.35;apRAF=requestAnimationFrame(apStep);}
    function pauseAP(){apPaused=true;clearTimeout(apTimeout);}
    function resumeAPLater(){clearTimeout(apTimeout);apTimeout=setTimeout(function(){apPaused=false;},1800);}
    carousel.addEventListener('mouseenter',pauseAP);
    carousel.addEventListener('mouseleave',resumeAPLater);
    carousel.addEventListener('focusin',pauseAP);
    carousel.addEventListener('focusout',resumeAPLater);
    carousel.addEventListener('touchstart',pauseAP,{passive:true});
    if(!rm)apRAF=requestAnimationFrame(apStep);

    window.addEventListener('resize',function(){
      var w=iw();track.style.scrollBehavior='auto';track.scrollLeft=w*n+(track.scrollLeft%w);
      requestAnimationFrame(function(){track.style.scrollBehavior='';});
    });
  }

  /* Initialize all carousels on the page */
  initCarousel('wf');
  initCarousel('vd');
})();
