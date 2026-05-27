// ============================================================
// CUSTOM CURSOR
// ============================================================
(() => {
  const c = document.getElementById('cursor');
  let tx = 0, ty = 0, x = 0, y = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  function loop() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    c.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('[data-hover], a, button, input, .marquee')) {
      c.classList.add('is-large');
      c.classList.remove('is-text');
    } else if (e.target.closest('p, h1, h2, h3, em, span, dd, dt, li')) {
      c.classList.add('is-text');
      c.classList.remove('is-large');
    }
  });
  document.addEventListener('mouseout', () => {
    c.classList.remove('is-large', 'is-text');
  });
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      const sec = en.target.closest('section');
      if (sec) sec.classList.add('in');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.r-mask, .r-fade, .r-scale').forEach(el => io.observe(el));
document.querySelectorAll('section').forEach(el => io.observe(el));

// ============================================================
// HUD  —  chapter + progress
// ============================================================
(() => {
  const prog    = document.getElementById('hud-progress');
  const hudCh   = document.getElementById('hud-chapter');
  const labelEl = hudCh.querySelector('.label');
  const numEl   = hudCh.querySelector('.num');

  const sections = [...document.querySelectorAll('section[data-chapter]')];
  const chapterIO = new IntersectionObserver((entries) => {
    let best = null;
    entries.forEach(en => {
      if (en.isIntersecting) {
        if (!best || (en.boundingClientRect.top > best.boundingClientRect.top &&
            en.boundingClientRect.top < window.innerHeight * 0.5)) best = en;
        if (!best) best = en;
      }
    });
    if (best) {
      const ch = best.target.getAttribute('data-chapter') || '';
      const [num, ...rest] = ch.split('—');
      numEl.textContent = (num || '').trim();
      labelEl.textContent = rest.join('—').trim() || '';
    }
  }, { threshold: [0.3, 0.6] });
  sections.forEach(s => chapterIO.observe(s));

  function tick() {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    prog.style.setProperty('--p', `${Math.max(0, Math.min(1, p)) * 100}%`);
    requestAnimationFrame(tick);
  }
  tick();
})();

// ============================================================
// PARALLAX  —  on portrait and grid images
// ============================================================
(() => {
  const els = [
    ...document.querySelectorAll('.morty__hero img'),
    ...document.querySelectorAll('.negrita__slot img')
  ];

  function getStrength(el) {
    if (el.dataset.parallax) return parseFloat(el.dataset.parallax);
    if (el.closest('.morty__hero')) return 22;
    return 14;
  }

  let raf = null;
  function update() {
    const vh = window.innerHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = (center - vh / 2) / vh;
      const py = (-dist * getStrength(el)).toFixed(2);
      el.style.transform = `translate3d(0, ${py}px, 0)`;
    });
    raf = null;
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// ============================================================
// SPLIT TEXT  —  wrap words in <span class="word">
// ============================================================
(() => {
  document.querySelectorAll('[data-split]').forEach(root => {
    let i = 0;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text || !text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const s = document.createElement('span');
            s.className = 'word';
            s.style.setProperty('--i', i++);
            s.textContent = part;
            frag.appendChild(s);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList && node.classList.contains('word')) return;
        [...node.childNodes].forEach(walk);
      }
    };
    walk(root);
  });
})();

// ============================================================
// MENU OVERLAY
// ============================================================
(() => {
  const overlay = document.getElementById('menu');
  const openB   = document.getElementById('menu-open');
  const closeB  = document.getElementById('menu-close');
  const links   = overlay.querySelectorAll('[data-menu-link]');

  function open()  { overlay.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function close() { overlay.classList.remove('open'); document.body.style.overflow = ''; }

  openB.addEventListener('click', open);
  closeB.addEventListener('click', close);
  links.forEach(a => a.addEventListener('click', () => setTimeout(close, 200)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();

// ============================================================
// AUTO-ROLL  —  ambient chapter name flip
// ============================================================
(() => {
  const rolls = [...document.querySelectorAll('.roll.auto-roll')];
  if (!rolls.length) return;
  let i = 0;
  function tick() {
    const el = rolls[i % rolls.length];
    el.classList.add('is-rolling');
    setTimeout(() => el.classList.remove('is-rolling'), 1800);
    i++;
    setTimeout(tick, 2600 + Math.random() * 1500);
  }
  setTimeout(tick, 2000);
})();
