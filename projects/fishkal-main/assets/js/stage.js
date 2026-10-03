/* ============================================================
   FISHKAL — Stage
   ------------------------------------------------------------
   Canvas sizing, DPR, scroll engine, vignette & grain caches.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     DOM
     ---------------------------------------------------------- */

  const stage   = document.getElementById('stage');
  const cv      = document.getElementById('world');
  const ctx     = cv.getContext('2d', { alpha: false });
  const ov      = document.getElementById('ov');
  const spacer  = document.getElementById('spacer');

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */

  let W = 0;
  let H = 0;
  let DPR = 1;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Quality levels:
       2 = full (all particles, all bands, all subdivisions)
       1 = reduced (half particles, fewer bands)
       0 = minimum (no particles, no grain, minimal layers) */
  let quality = reduced ? 1 : 2;

  const SCREENS = (window.FK && window.FK.screens) || 13;

  /* Scroll state */
  let locked    = true;
  let rawP      = 0;
  let P         = 0;
  let lastScrollY = 0;

  /* Caches */
  let vig       = null;
  let grainTile = null;
  let grainLayer = null;

  /* ----------------------------------------------------------
     SIZING
     ---------------------------------------------------------- */

  function setSize() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));

    const cap = quality >= 2 ? 2.25 : 1.35;
    DPR = Math.min(window.devicePixelRatio || 1, cap);

    cv.width  = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    ov.setAttribute('width',  W);
    ov.setAttribute('height', H);

    layoutScroll();
    buildVignette();
    buildGrain();

    if (window.layoutHud) window.layoutHud();
  }

  /* ----------------------------------------------------------
     SCROLL ENGINE
     ------------------------------------------------------------
     The game lock is enforced by shortening the scroll spacer,
     so the browser itself cannot scroll past — reliable in
     iOS Safari, Android Chrome and Telegram WebView.
     ---------------------------------------------------------- */

  function layoutScroll() {
    const range = H * (SCREENS - 1);
    const h = H + (locked ? (window.TL ? window.TL.LOCK * range : 0.6 * range) : range);
    spacer.style.height = h + 'px';
  }

  function readScroll() {
    const range = H * (SCREENS - 1);
    rawP = clamp(window.scrollY / range, 0, 1);
  }

  function unlockScroll() {
    if (!locked) return;
    locked = false;
    layoutScroll();
    const cont = document.getElementById('continue');
    if (cont) {
      cont.style.opacity = '1';
      setTimeout(() => { cont.style.opacity = '0'; }, 5200);
    }
  }

  /* Re-engage the game lock (used when the experience restarts) */
  function lockScroll() {
    locked = true;
    layoutScroll();
  }

  /* ----------------------------------------------------------
     VIGNETTE CACHE
     ---------------------------------------------------------- */

  function buildVignette() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;

    const g = c.getContext('2d');
    const rg = g.createRadialGradient(
      W * 0.5, H * 0.48, Math.min(W, H) * 0.22,
      W * 0.5, H * 0.5,  Math.max(W, H) * 0.78
    );
    rg.addColorStop(0,    'rgba(2,9,13,0)');
    rg.addColorStop(0.62, 'rgba(2,9,13,.22)');
    rg.addColorStop(1,    'rgba(2,9,13,.78)');
    g.fillStyle = rg;
    g.fillRect(0, 0, W, H);

    vig = c;
  }

  /* ----------------------------------------------------------
     GRAIN
     ------------------------------------------------------------
     Two layers:
       grainTile  — a repeating pattern (used when quality = 2)
       grainLayer — a full-screen single draw (used when quality = 1)
     ---------------------------------------------------------- */

  function buildGrain() {
    /* Small tile */
    const s = 128;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const g = c.getContext('2d');
    const img = g.createImageData(s, s);
    for (let i = 0; i < s * s; i++) {
      const v = Math.random() * 255 | 0;
      img.data[i * 4]     = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = Math.random() * 26 | 0;
    }
    g.putImageData(img, 0, 0);
    grainTile = ctx.createPattern(c, 'repeat');

    /* Full-screen layer for lower-quality mode */
    const lc = document.createElement('canvas');
    lc.width = W + 130;
    lc.height = H + 130;
    const lg = lc.getContext('2d');
    const limg = lg.createImageData(lc.width, lc.height);
    for (let i = 0; i < limg.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      limg.data[i]     = v;
      limg.data[i + 1] = v;
      limg.data[i + 2] = v;
      limg.data[i + 3] = Math.random() * 26 | 0;
    }
    lg.putImageData(limg, 0, 0);
    grainLayer = lc;
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.stage = stage;
  window.cv    = cv;
  window.ctx   = ctx;
  window.ov    = ov;

  window.getW  = () => W;
  window.getH  = () => H;
  window.getDPR = () => DPR;
  window.getQuality = () => quality;
  window.setQuality = q => { quality = q; };

  window.isReduced = () => reduced;
  window.isLocked  = () => locked;
  window.unlockScroll = unlockScroll;
  window.lockScroll   = lockScroll;

  window.readScroll = readScroll;
  window.layoutScroll = layoutScroll;
  window.setSize = setSize;

  window.getVig = () => vig;
  window.getGrain = () => grainTile;
  window.getGrainLayer = () => grainLayer;
  window.rebuildCaches = () => { buildVignette(); buildGrain(); };

  /* ----------------------------------------------------------
     SCROLL STATE GETTERS/SETTERS
     ---------------------------------------------------------- */

  Object.defineProperty(window, 'W', { get: () => W });
  Object.defineProperty(window, 'H', { get: () => H });
  Object.defineProperty(window, 'DPR', { get: () => DPR });
  Object.defineProperty(window, 'rawP', {
    get: () => rawP,
    set: v => { rawP = clamp(v, 0, 1); }
  });
  Object.defineProperty(window, 'P', {
    get: () => P,
    set: v => { P = clamp(v, 0, 1); }
  });

})();
