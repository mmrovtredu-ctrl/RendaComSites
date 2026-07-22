/* =====================================================================
   animations.js  —  anime.js v4 (ESM)
   Implementa as animações enviadas: splitText (título), createLayout
   (grid do hero) e animate/stagger (títulos das seções).
   Tudo com fallback: se a CDN ou alguma API não carregar, a página
   continua 100% funcional (as versões CSS assumem o controle).
   ===================================================================== */

/* Script CLÁSSICO (não é module) para funcionar também ao abrir o
   arquivo direto no navegador (file://). O anime.js v4 é carregado por
   import() dinâmico de uma CDN — funciona em file:// e hospedado. */
(function () {
  'use strict';

  var CDN = 'https://cdn.jsdelivr.net/npm/animejs@4/+esm';
  var CDN_FALLBACK = 'https://esm.sh/animejs@4';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var A = null;
  function has(name) { return A && typeof A[name] === 'function'; }

  function loadAnime() {
    // import() dinâmico é permitido em script clássico
    return import(CDN)
      .catch(function () { return import(CDN_FALLBACK); })
      .then(function (mod) { A = mod; })
      .catch(function (e) {
        console.warn('[anime.js] não carregou, usando fallback CSS/JS.', e);
        A = null;
      });
  }

/* ---------------------------------------------------------------------
   1) TÍTULO DO HERO  —  splitText + animate (bounce dos caracteres)
   Base: snippet do usuário (splitText 'h2' + y bounce + rotate).
   Aqui roda UMA vez ao carregar para não distrair.
--------------------------------------------------------------------- */
function heroTitle() {
  const el = document.querySelector('[data-splittext]');
  if (!el) return;

  // fallback simples se não houver anime.js
  if (!A || reduceMotion) { el.classList.add('in'); return; }

  let chars = null;
  if (has('splitText')) {
    try {
      const res = A.splitText(el, { words: false, chars: true });
      chars = res.chars;
    } catch (_) { chars = null; }
  }
  // fallback: quebra manual em <span class="char">
  if (!chars) {
    const text = el.textContent;
    el.textContent = '';
    chars = [...text].map((c) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
      return s;
    });
  }

  if (has('animate')) {
    A.animate(chars, {
      y: [
        { to: ['-2.4rem', 0], ease: 'outExpo', duration: 600 },
        { to: 0, ease: 'outBounce', duration: 800, delay: 80 }
      ],
      rotate: { from: '-1turn', delay: 0 },
      opacity: { from: 0, duration: 300 },
      delay: has('stagger') ? A.stagger(45) : 45,
      ease: 'inOutCirc'
    });
  } else {
    el.classList.add('in');
  }
}

/* ---------------------------------------------------------------------
   2) GRID DO HERO  —  createLayout (bento morph em loop)
   Base: snippet do usuário (createLayout + root.dataset.grid).
   Fallback: alterna o atributo data-grid via setInterval (o CSS anima).
--------------------------------------------------------------------- */
function heroLayout() {
  const container = document.querySelector('.layout-container');
  if (!container || reduceMotion) return;

  // tenta usar a API oficial createLayout
  if (has('createLayout')) {
    try {
      const layout = A.createLayout('.layout-container');
      let i = 0;
      const run = () =>
        layout.update(
          ({ root }) => { root.dataset.grid = (++i % 4) + 1; },
          {
            duration: 1000,
            delay: has('stagger') ? A.stagger(150) : 150,
            onComplete: () => run()
          }
        );
      run();
      return;
    } catch (_) { /* cai no fallback abaixo */ }
  }

  // fallback: morphing por CSS (transition nas .cell)
  let i = 0;
  setInterval(() => {
    container.dataset.grid = (++i % 4) + 1;
  }, 2600);
}

/* ---------------------------------------------------------------------
   3) TÍTULOS DAS SEÇÕES  —  splitText + animate/stagger no scroll
   Base: snippet do usuário (animate x/autoplay + stagger).
--------------------------------------------------------------------- */
function sectionTitles() {
  const titles = document.querySelectorAll('[data-chars]');
  if (!titles.length) return;

  titles.forEach((el) => {
    if (!A || reduceMotion) { return; } // CSS/reveal cuida da aparição

    let chars = null;
    if (has('splitText')) {
      try { chars = A.splitText(el, { words: false, chars: true }).chars; }
      catch (_) { chars = null; }
    }
    if (!chars) {
      const text = el.textContent;
      el.textContent = '';
      chars = [...text].map((c) => {
        const s = document.createElement('span');
        s.className = 'char';
        s.style.display = 'inline-block';
        s.textContent = c === ' ' ? ' ' : c;
        el.appendChild(s);
        return s;
      });
    }
    // estado inicial
    chars.forEach((c) => { c.style.opacity = '0'; });

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        if (has('animate')) {
          A.animate(chars, {
            y: { from: '1.1rem', to: 0 },
            opacity: { from: 0, to: 1 },
            duration: 650,
            delay: has('stagger') ? A.stagger(24) : 24,
            ease: 'outExpo'
          });
        } else {
          chars.forEach((c) => (c.style.opacity = '1'));
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });
}

/* boot */
function boot() {
  loadAnime().then(function () {
    heroTitle();
    heroLayout();
    sectionTitles();
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
})();
