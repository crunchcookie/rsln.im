/* ============================================================
   SCRIPTS.JS — all pages
   ============================================================ */

/* ─── PAGE TRANSITION ────────────────────────────────────────
   Fade out → navigate → fade in on new page
   Anchor links (#) и mailto: пропускаем — только смена страниц
─────────────────────────────────────────────────────────────── */
(function () {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  /* Fade IN страницы при загрузке */
  /* overlay уже прозрачный (opacity:0), просто убеждаемся */
  overlay.classList.remove('visible');

  /* Перехватываем клики по ссылкам */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    /* Пропускаем: якоря, mail, tel, внешние ссылки (target="_blank"), js */
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      link.target === '_blank'
    ) return;

    /* Пропускаем внешние домены */
    if (href.startsWith('http') && !href.startsWith(location.origin)) return;

    e.preventDefault();
    overlay.classList.add('visible');

    setTimeout(function () {
      window.location.href = href;
    }, 450); /* Совпадает с transition duration */
  });
})();

/* ─── CURSOR ─────────────────────────────────────────────── */
(function () {
  const curO   = document.getElementById('cur-o');
  const curD   = document.getElementById('cur-d');
  const curLbl = document.getElementById('cur-lbl');
  if (!curO) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let ox = mx, oy = my;
  const lerp = (a, b, t) => (1 - t) * a + t * b;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    curD.style.left = mx + 'px'; curD.style.top = my + 'px';
    curLbl.style.left = mx + 'px'; curLbl.style.top = my + 'px';
  });

  (function raf() {
    ox = lerp(ox, mx, 0.11); oy = lerp(oy, my, 0.11);
    curO.style.left = ox + 'px'; curO.style.top = oy + 'px';
    requestAnimationFrame(raf);
  })();

  window._setCur = function (type) {
    document.body.classList.remove('c-link', 'c-view');
    if (type) document.body.classList.add(type);
  };

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => window._setCur('c-link'));
    el.addEventListener('mouseleave', () => window._setCur(''));
  });
})();

/* ─── SCROLL PROGRESS ────────────────────────────────────── */
(function () {
  const prog = document.getElementById('prog');
  if (!prog) return;
  window.addEventListener('scroll', () => {
    prog.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
  }, { passive: true });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.sr').forEach(el => obs.observe(el));
})();

/* ─── MOBILE NAV ─────────────────────────────────────────── */
(function () {
  const mobMenu   = document.getElementById('mob-menu');
  const navMenu   = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger');
  if (!hamburger) return;
  const hSpans = hamburger.querySelectorAll('span');

  hamburger.addEventListener('click', () => {
    const open = !mobMenu.classList.contains('open');
    mobMenu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    hSpans[0].style.transform = open ? 'rotate(45deg) translate(4px,4px)'   : '';
    hSpans[1].style.transform = open ? 'rotate(-45deg) translate(4px,-4px)' : '';
    hSpans.forEach(s => s.style.background = open ? '#111' : '');
  });

  document.querySelectorAll('#mob-menu .mob-link, #nav-menu a').forEach(a => {
    a.addEventListener('click', () => {
      mobMenu.classList.remove('open');
      if (navMenu) navMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
      hSpans.forEach(s => { s.style.transform = ''; s.style.background = ''; });
    });
  });
})();

/* ─── SMOOTH SCROLL (desktop only) ──────────────────────── */
(function () {
  if (window.innerWidth <= 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let current = window.scrollY;
  let target  = window.scrollY;
  let ticking = false;
  const EASE  = 0.092;

  window.addEventListener('wheel', e => {
    e.preventDefault();
    target += e.deltaY * 1.0;
    target  = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
    if (!ticking) { ticking = true; raf(); }
  }, { passive: false });

  let touchStart = 0;
  window.addEventListener('touchstart', e => { touchStart = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', e => {
    const delta = (touchStart - e.touches[0].clientY) * 1.6;
    touchStart  = e.touches[0].clientY;
    target += delta;
    target  = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
  }, { passive: true });

  function raf() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) { current = target; ticking = false; }
    window.scrollTo(0, current);
    if (ticking) requestAnimationFrame(raf);
  }

  /* Якорные ссылки — плавный скролл без перезагрузки */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      target = t.getBoundingClientRect().top + window.scrollY;
      target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
      if (!ticking) { ticking = true; raf(); }
    });
  });
})();

/* ─── HERO ENTRANCE (только index) ──────────────────────── */
if (document.querySelector('.h-word-inner')) {
  document.body.classList.add('loaded');
}

/* ─── VIEW-TRIGGER CURSOR (только index) ─────────────────── */
document.querySelectorAll('.view-trigger').forEach(el => {
  el.addEventListener('mouseenter', () => window._setCur && window._setCur('c-view'));
  el.addEventListener('mouseleave', () => window._setCur && window._setCur(''));
});

/* ─── HORIZONTAL PROJECTS SCROLL (только index) ─────────── */
(function () {
  const pinWrap = document.querySelector('.proj-pin-wrap');
  const track   = document.getElementById('proj-track');
  const counter = document.getElementById('proj-counter');
  const hint    = document.getElementById('proj-hint');
  const CARDS   = 4;

  if (!pinWrap || !track) return;

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'proj-dots';
  for (let i = 0; i < CARDS; i++) {
    const d = document.createElement('div');
    d.className = 'proj-dot' + (i === 0 ? ' active' : '');
    dotsWrap.appendChild(d);
  }
  document.querySelector('.proj-sticky').appendChild(dotsWrap);
  const dots = dotsWrap.querySelectorAll('.proj-dot');

  function update() {
    const rect     = pinWrap.getBoundingClientRect();
    const total    = pinWrap.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(Math.max(scrolled / total, 0), 1);

    const tx = -progress * (CARDS - 1) * 100;
    track.style.transform = 'translateX(' + tx + 'vw)';

    const idx = Math.min(Math.round(progress * (CARDS - 1)), CARDS - 1);
    counter.textContent = String(idx + 1).padStart(2, '0') + ' / 0' + CARDS;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));

    if (scrolled > 80) hint.classList.add('hide');
    else               hint.classList.remove('hide');
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ─── IMAGE FADE-IN (только страница проекта) ───────────── */
document.querySelectorAll('.proj-img-item img').forEach(img => {
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load',  () => img.classList.add('loaded'));
    img.addEventListener('error', () => img.classList.add('loaded'));
  }
});
