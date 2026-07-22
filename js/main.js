/* =====================================================================
   main.js  —  interações da página (sem dependências)
   nav sticky + menu mobile, scroll reveal, tilt 3D, ano do rodapé,
   smooth-scroll com offset do header.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ano no rodapé ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav: sombra ao rolar ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- menu mobile ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  function closeMenu() {
    if (!toggle || !links) return;
    toggle.classList.remove('open');
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- tilt 3D (mouse) — só em telas com ponteiro fino ---------- */
  var finePointer = window.matchMedia('(pointer:fine)').matches;
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = 10; // graus
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          'perspective(900px) rotateY(' + (px * max) + 'deg) rotateX(' + (-py * max) + 'deg)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
      });
    });
  }

  /* ---------- marquee: garante loop sem gap em qualquer largura ----------
     Cada um dos 2 grupos precisa ser >= largura da tela. Se não for
     (telas ultrawide), duplica o conteúdo dos grupos até cobrir. */
  (function () {
    var track = document.getElementById('marqueeTrack');
    if (!track) return;
    var groups = track.querySelectorAll('.marquee__group');
    if (groups.length < 2) return;
    var need = function () { return track.parentElement.clientWidth; };
    function ensureWidth() {
      var guard = 0;
      while (groups[0].scrollWidth < need() && guard < 6) {
        for (var i = 0; i < groups.length; i++) groups[i].innerHTML += groups[i].innerHTML;
        guard++;
      }
    }
    ensureWidth();
    window.addEventListener('resize', ensureWidth, { passive: true });
  })();

  /* ---------- smooth scroll com offset do header ---------- */
  var headerH = 68;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - headerH + 2;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
})();
