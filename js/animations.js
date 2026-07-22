/* =====================================================================
   animations.js  —  anime.js v4 (carregado por import dinâmico)
   Implementa as animações enviadas: splitText no título do hero e
   splitText + animate/stagger nos títulos das seções.

   Script CLÁSSICO (não é module) para funcionar também ao abrir o
   arquivo direto no navegador (file://).

   Princípio de segurança: os textos ficam SEMPRE visíveis por padrão.
   As animações são apenas um "plus". Se o anime.js não carregar (sem
   internet, CDN fora, etc.), nada quebra e nada some.
   ===================================================================== */
(function () {
  'use strict';

  var CDN = 'https://cdn.jsdelivr.net/npm/animejs@4/+esm';
  var CDN_FALLBACK = 'https://esm.sh/animejs@4';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var A = null;
  function has(name) { return A && typeof A[name] === 'function'; }

  function loadAnime() {
    return import(CDN)
      .catch(function () { return import(CDN_FALLBACK); })
      .then(function (mod) { A = mod; })
      .catch(function (e) {
        console.warn('[anime.js] não carregou — o site segue funcionando sem as animações extras.', e);
        A = null;
      });
  }

  /* quebra um elemento em <span class="char"> (fallback do splitText) */
  function splitToChars(el) {
    if (has('splitText')) {
      try { return A.splitText(el, { words: false, chars: true }).chars; }
      catch (_) { /* usa fallback manual */ }
    }
    var text = el.textContent;
    el.textContent = '';
    return Array.prototype.map.call(text, function (c) {
      var s = document.createElement('span');
      s.className = 'char';
      s.style.display = 'inline-block';
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
      return s;
    });
  }

  /* TÍTULOS DAS SEÇÕES — splitText + animate/stagger ao entrar na tela.
     (O título do hero tem entrada própria em CSS, sempre visível.) */
  function sectionTitles() {
    var titles = document.querySelectorAll('[data-chars]');
    if (!titles.length || !A || reduceMotion || !has('animate')) return;

    Array.prototype.forEach.call(titles, function (el) {
      var chars = splitToChars(el); // já visíveis; animate parte de opacity:0
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          A.animate(chars, {
            y: { from: '1.1rem', to: 0 },
            opacity: { from: 0, to: 1 },
            duration: 650,
            delay: has('stagger') ? A.stagger(24) : 24,
            ease: 'outExpo'
          });
        });
      }, { threshold: 0.25 });
      io.observe(el);
    });
  }

  /* boot */
  function boot() {
    loadAnime().then(function () {
      try { sectionTitles(); } catch (e) { console.warn(e); }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
