/* ============================================================
   TAANAH · site.js — comportamiento compartido
   ============================================================ */
(function () {
  'use strict';

  /* Silencia el ruido benigno de ResizeObserver que emite el widget Cloudbeds */
  window.addEventListener('error', function (e) {
    if (e && e.message && e.message.indexOf('ResizeObserver loop') !== -1) {
      e.stopImmediatePropagation();
    }
  });

  var CLOUDBEDS = 'https://us2.cloudbeds.com/reservation/H9bd0L';
  var RESERVAS = 'reservas.html';
  var TKEY = 'taanah_tweaks_v1';

  /* ---- Header + barra de grupo en scroll ---- */
  var header = document.querySelector('.site-header');
  var groupBar = document.querySelector('.group-bar');
  function onScroll() {
    var down = window.scrollY > 40;
    if (header) header.classList.toggle('scrolled', down);
    if (groupBar) groupBar.classList.toggle('hide', down);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (Math.min(i % 4, 3) * 0.07) + 's';
    io.observe(el);
  });

  /* ---- Booking → Cloudbeds ---- */
  function isoToday(offset) {
    var d = new Date(); d.setDate(d.getDate() + (offset || 0));
    return d.toISOString().slice(0, 10);
  }
  var ci = document.getElementById('bk-checkin');
  var co = document.getElementById('bk-checkout');
  if (ci && co) {
    ci.min = isoToday(0); ci.value = isoToday(2);
    co.min = isoToday(1); co.value = isoToday(4);
    ci.addEventListener('change', function () {
      var next = new Date(ci.value); next.setDate(next.getDate() + 1);
      co.min = next.toISOString().slice(0, 10);
      if (co.value <= ci.value) co.value = co.min;
    });
  }
  document.querySelectorAll('[data-book]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      window.location.href = RESERVAS;
    });
  });
  document.querySelectorAll('[data-cloudbeds]').forEach(function (a) {
    a.setAttribute('href', RESERVAS);
  });

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('mobile-open');
    });
  }

  /* ---- Galerías de fotos + lightbox ---- */
  (function () {
    var gals = document.querySelectorAll('[data-gallery]');
    if (!gals.length) return;

    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Galería de fotos');
    lb.innerHTML =
      '<button class="lb-close" type="button" aria-label="Cerrar">✕</button>' +
      '<div class="lb-stage">' +
        '<button class="lb-prev" type="button" aria-label="Anterior">‹</button>' +
        '<img alt="" />' +
        '<button class="lb-next" type="button" aria-label="Siguiente">›</button>' +
      '</div>' +
      '<div class="lb-meta"><span class="lb-cap"></span><span class="lb-num"></span></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('.lb-stage img');
    var lbCap = lb.querySelector('.lb-cap');
    var lbNum = lb.querySelector('.lb-num');
    var items = [];
    var idx = 0;

    function render() {
      var it = items[idx];
      if (!it) return;
      lbImg.src = it.src;
      lbImg.alt = it.alt;
      lbCap.textContent = it.alt;
      lbNum.textContent = (idx + 1) + ' / ' + items.length;
    }
    function open(list, i) {
      items = list; idx = i || 0;
      render();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    function step(d) { idx = (idx + d + items.length) % items.length; render(); }

    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    gals.forEach(function (g) {
      var imgs = [].slice.call(g.querySelectorAll('img'));
      var list = imgs.map(function (im) { return { src: im.getAttribute('src'), alt: im.getAttribute('alt') || '' }; });
      imgs.forEach(function (im, i) {
        var hit = im.closest('button') || im.closest('.ph') || im.closest('.media') || im;
        if (hit.dataset.lbBound) return;
        hit.dataset.lbBound = '1';
        hit.addEventListener('click', function (e) {
          e.preventDefault();
          open(list, i);
        });
      });
      var count = g.querySelector('.gal-count');
      if (count && !count.dataset.lbBound) {
        count.dataset.lbBound = '1';
        count.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); open(list, 0); });
      }
    });
  })();

  /* ---- Tweaks: aplicar estado (todas las páginas) ---- */
  var ACCENTS = {
    bronce: { c: '#8F7A4E', ink: '#FBF8F1' },
    verde:  { c: '#6B7636', ink: '#FBF8F1' },
    cobre:  { c: '#AE5E3C', ink: '#FBF3EC' },
    salvia: { c: '#6F7C6B', ink: '#F4F6F1' },
    oro:    { c: '#A98748', ink: '#2A2118' }
  };
  var FONTS = {
    cormorant: "'Cormorant Garamond', Georgia, serif",
    marcellus: "'Marcellus', 'Cormorant Garamond', serif",
    manrope: "'Manrope', system-ui, sans-serif"
  };
  function readTweaks() {
    try { return JSON.parse(localStorage.getItem(TKEY)) || {}; } catch (e) { return {}; }
  }
  window.TaanahTweaks = { read: readTweaks, key: TKEY, accents: ACCENTS, fonts: FONTS };
  function applyTweaks(t) {
    var root = document.documentElement;
    var a = ACCENTS[t.accent] || ACCENTS.verde;
    root.style.setProperty('--accent', a.c);
    root.style.setProperty('--accent-ink', a.ink);
    if (t.headingFont && FONTS[t.headingFont]) root.style.setProperty('--ff-display', FONTS[t.headingFont]);
    // headline
    var hl = document.querySelector('[data-headline]');
    if (hl && t.headline) hl.innerHTML = t.headline;
    // hero variant
    var hero = document.querySelector('.home-hero');
    if (hero) hero.classList.toggle('editorial', t.heroStyle === 'editorial');
    // booking visibility
    var bw = document.querySelector('.booking-wrap');
    if (bw) bw.style.display = (t.showBooking === false) ? 'none' : '';
  }
  window.TaanahApplyTweaks = applyTweaks;
  applyTweaks(readTweaks());
})();
