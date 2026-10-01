/* ==========================================================================
   Colégio Acadêmico SSA — Interações
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    toggle.classList.toggle('is-open', open);
    if (header) header.classList.toggle('menu-open', open);
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var willOpen = mobileMenu.hidden;
      setMenu(willOpen);
    });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Counter animation ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var format = el.getAttribute('data-format');
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    if (format === 'year' || prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }

    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statEls = document.querySelectorAll('.stat-value');
  if ('IntersectionObserver' in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { statIO.observe(el); });
  } else {
    statEls.forEach(animateCount);
  }

  /* ---------- Vídeo institucional — autoplay (sempre) ---------- */
  var featureVideo = document.querySelector('.video-feature-player');

  if (featureVideo) {
    featureVideo.muted = true;
    featureVideo.defaultMuted = true;
    featureVideo.setAttribute('muted', '');
    featureVideo.setAttribute('playsinline', '');

    var attemptPlay = function () {
      if (!featureVideo) return;
      featureVideo.muted = true;
      try {
        var p = featureVideo.play();
        if (p && typeof p.catch === 'function') {
          p.catch(function () {});
        }
      } catch (e) {}
    };

    attemptPlay();

    ['loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough'].forEach(function (evt) {
      featureVideo.addEventListener(evt, attemptPlay);
    });

    ['click', 'touchstart', 'scroll', 'keydown'].forEach(function (evt) {
      window.addEventListener(evt, attemptPlay, { passive: true });
    });
  }

  /* ---------- Smooth scroll offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = 76;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
