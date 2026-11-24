/* Small game layer: XP scroll bar, active nav, hidden coins, achievements, Konami code.
   Purely decorative — the page works and reads fine without it. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toasts = document.getElementById('toasts');
  var unlocked = {};

  function toast(icon, label, text) {
    if (!toasts) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="t-ico" aria-hidden="true">' + icon + '</span><div><small>' + label + '</small>' + text + '</div>';
    toasts.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 400); }, 3600);
  }
  function achieve(id, text) {
    if (unlocked[id]) return;
    unlocked[id] = true;
    toast('🏆', 'Achievement unlocked', text);
  }
  function pop(x, y, text) {
    if (reduce) return;
    var p = document.createElement('span');
    p.className = 'pop'; p.textContent = text;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(function () { p.remove(); }, 950);
  }
  function confetti() {
    if (reduce) return;
    var colors = ['#ffcc4d', '#ff5c8a', '#4cc9f0', '#5ee08a', '#9b7bff'];
    for (var i = 0; i < 60; i++) {
      var c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
      c.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(c);
      setTimeout(c.remove.bind(c), 3800);
    }
  }

  // XP bar = scroll progress; finishing the page unlocks an achievement
  var fill = document.getElementById('xp-fill');
  var ticking = false;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    if (pct > 98) achieve('reader', 'Speedrunner: read the whole CV');
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  // Highlight the current "level" in the nav
  var links = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('current', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  // Hidden dino eggs
  var coins = document.querySelectorAll('[data-coin]');
  var countEl = document.getElementById('coin-count');
  var totalEl = document.getElementById('coin-total');
  var got = 0;
  if (totalEl) totalEl.textContent = coins.length;
  coins.forEach(function (c) {
    c.addEventListener('click', function (ev) {
      if (c.classList.contains('got')) return;
      c.classList.add('got');
      got++;
      if (countEl) countEl.textContent = got;
      pop(ev.clientX, ev.clientY, '🦖 hatched!');
      if (got === coins.length) { achieve('eggs', 'Jurassic collector: hatched every dino egg'); confetti(); }
      else if (got === 1) toast('🥚', 'Secret found', 'A dino egg! ' + (coins.length - 1) + ' more hidden on this page.');
    });
  });

  // Photo: tap for 1-UP
  var photo = document.getElementById('photo-btn');
  var taps = 0;
  if (photo) photo.addEventListener('click', function (ev) {
    taps++;
    pop(ev.clientX, ev.clientY, '1-UP');
    if (taps === 5) achieve('oneup', 'Extra lives: you really like this player');
  });

  // Konami code
  var seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = k === seq[pos] ? pos + 1 : (k === seq[0] ? 1 : 0);
    if (pos === seq.length) {
      pos = 0;
      document.body.classList.toggle('cheat');
      achieve('konami', 'Cheat code: retro mode ' + (document.body.classList.contains('cheat') ? 'ON' : 'OFF'));
      unlocked.konami = false; // allow toggling back with a toast
      confetti();
    }
  });

  // Tap the header dino: it roars
  var dino = document.querySelector('.dino-inline');
  if (dino) dino.addEventListener('click', function (ev) { pop(ev.clientX, ev.clientY, 'RAWR!'); });

  // A hello for the devs who open DevTools
  try {
    console.log('%c PLAYER 1 READY ', 'background:#ffcc4d;color:#000;font:700 14px monospace;padding:4px 8px');
    console.log('Hi fellow dev 👋 Looking for a Unity game developer? lailaahmed18@outlook.com');
  } catch (e) {}
})();
