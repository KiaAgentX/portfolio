/* ============================================================
   FISHKAL — Hero (Above Water)
   ------------------------------------------------------------
   The photographic plate, brought to life:
     • Sea is redrawn slice by slice with travelling displacement
     • Sky and sea extended procedurally beyond the plate
     • Flag rebuilt on its own pole
     • Sun bloom, glitter, foam and bow spray
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     IMAGE LOADING
     ---------------------------------------------------------- */

  const HERO = new Image();
  HERO.decoding = 'async';
  HERO.fetchPriority = 'high';

  let heroReady = false;

  HERO.onload = () => { heroReady = true; };
  HERO.onerror = () => { heroReady = false; };

  /* Prefer AVIF if supported, fall back to WebP */
  const supportsAvif = (() => {
    try {
      const c = document.createElement('canvas');
      return c.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) { return false; }
  })();

  const config = window.FK || {};
  HERO.src = supportsAvif && config.heroAvif
    ? config.heroAvif
    : (config.heroWebp || '/assets/img/hero.webp');

  /* ----------------------------------------------------------
     TRANSFORM STATE
     ---------------------------------------------------------- */

  const heroT = { dx: 0, dy: 0, sc: 1 };

  function heroTransform(p, t) {
    const W = window.W;
    const H = window.H;
    const IW = window.IW;
    const IH = window.IH;
    const IMG = window.IMG;

    /* One slow push-in: wide on the skyline, tight on the vessel,
       then pulled back again for the closing frame.
       On tall screens the frame opens wider than the viewport and
       the sky above and sea below are continued procedurally. */
    const portrait = W / H < 1.1;
    const cover = Math.max(W / IW, H / IH);
    const sc0 = cover;
    const zEnd = portrait ? Math.max(1.5, (H / IH) / sc0 * 1.06) : 1.42;

    let zoom = lerp(1.0, zEnd, easeInOut(smoothstep(0, 0.50, p)));
    zoom *= 1 - 0.24 * smoothstep(0.82, 1, p);

    const sc = sc0 * zoom;
    const fu = lerp(portrait ? 0.365 : 0.500, 0.385, smoothstep(0, 0.50, p));
    const hzT = lerp(portrait ? 0.585 : 0.450, 0.615, smoothstep(0, 0.50, p));

    const reduced = window.isReduced();
    const heave = reduced
      ? 0
      : (Math.sin(t * 0.62) * H * 0.0046 + Math.sin(t * 0.97 + 1.1) * H * 0.0022);

    heroT.sc = sc;
    heroT.dx = clamp(W * 0.5 - fu * IW * sc, Math.min(0, W - IW * sc), 0);

    let dy = H * hzT - IMG.horizon * sc + heave;
    if (IH * sc >= H) dy = clamp(dy, H - IH * sc, 0);
    heroT.dy = dy;
  }

  const i2sx = x => heroT.dx + x * heroT.sc;
  const i2sy = y => heroT.dy + y * heroT.sc;

  /* ----------------------------------------------------------
     HULL PATH (used from below once submerged)
     ---------------------------------------------------------- */

  function boatHullPath(g) {
    g.beginPath();
    g.moveTo(-142, -30);
    g.lineTo(-148, 4);
    g.quadraticCurveTo(-60, 20, 70, 13);
    g.quadraticCurveTo(132, 8, 162, -48);
    g.lineTo(150, -50);
    g.quadraticCurveTo(110, -32, 40, -30);
    g.closePath();
  }

  /* ----------------------------------------------------------
     PLATE
     ---------------------------------------------------------- */

  function drawPlate(t) {
    const ctx = window.ctx;
    const HERO_ = HERO;
    const sc = heroT.sc;
    const dx = heroT.dx;
    const dy = heroT.dy;
    const W = window.W;
    const H = window.H;
    const IW = window.IW;
    const IH = window.IH;
    const IMG = window.IMG;

    const over = Math.max(14 * sc, 10);
    const top = dy;
    const bottom = dy + IH * sc;

    /* Continue the sky upward */
    if (top > 0.5) {
      const SKY = { x: 1150, y: 0, w: 414, h: 356 };
      const drift = (t * 7) % (W * 0.5);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, -1, W, top + 2);
      ctx.clip();
      ctx.translate(-drift, top);
      ctx.scale(1, -1);
      ctx.drawImage(HERO_, SKY.x, SKY.y, SKY.w, SKY.h, 0, 0, W * 1.5, top);
      ctx.restore();

      const g = ctx.createLinearGradient(0, -1, 0, top + 2);
      g.addColorStop(0,    'rgba(24,57,92,.94)');
      g.addColorStop(0.42, 'rgba(46,88,122,.62)');
      g.addColorStop(0.80, 'rgba(86,126,150,.20)');
      g.addColorStop(1,    'rgba(109,146,162,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, -1, W, top + 3);

      const wg = ctx.createLinearGradient(0, 0, W, 0);
      wg.addColorStop(0, 'rgba(58,96,130,.18)');
      wg.addColorStop(1, 'rgba(210,164,112,.16)');
      ctx.fillStyle = wg;
      ctx.fillRect(0, -1, W, top + 3);

      const merge = Math.min(top * 0.34, 72);
      const steps = 9;
      for (let i = 0; i < steps; i++) {
        const a = Math.pow((i + 1) / steps, 1.7) * 0.92;
        const sg = ctx.createLinearGradient(0, 0, W, 0);
        sg.addColorStop(0,   `rgba(75,127,151,${a})`);
        sg.addColorStop(0.5, `rgba(109,146,162,${a})`);
        sg.addColorStop(1,   `rgba(129,155,166,${a})`);
        ctx.fillStyle = sg;
        ctx.fillRect(0, top - merge + merge * i / steps, W, merge / steps + 1);
      }

      /* A living sky, so a tall portrait frame never falls dead above the
         plate: three drifting cloud veils and a few far birds — procedural. */
      if (top > 40) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, -1, W, top + 2); ctx.clip();
        const R3 = rng(6180);
        for (let i = 0; i < 3; i++) {
          const cy = top * (0.15 + 0.23 * i) + Math.sin(t * 0.05 + i) * 6;
          const cw = W * (0.45 + R3() * 0.6), ch = Math.max(9, top * 0.07);
          const cx = ((R3() * W + t * 4 * (i + 1)) % (W + cw * 2)) - cw;
          const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cw * 0.5);
          cg.addColorStop(0, 'rgba(226,236,244,.10)');
          cg.addColorStop(1, 'rgba(226,236,244,0)');
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.ellipse(cx, cy, cw * 0.5, ch, 0, 0, TAU); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(12,28,38,.5)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const vd = 6 + i * 2.2;
          const bx = ((i * 0.37 * W + t * vd) % (W + 80)) - 40;
          const by = top * 0.60 + Math.sin(t * 0.9 + i * 2.1) * 7 + i * 13;
          const flap = Math.sin(t * (3 + i) + i) * 2.4;
          ctx.beginPath();
          ctx.moveTo(bx - 6, by - flap);
          ctx.quadraticCurveTo(bx - 2, by - 2 - flap, bx, by);
          ctx.quadraticCurveTo(bx + 2, by - 2 - flap, bx + 6, by - flap);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    /* Sky, skyline and upper works */
    ctx.drawImage(
      HERO_,
      0, 0, IW, IMG.horizon,
      dx, dy, IW * sc, IMG.horizon * sc + 1
    );

    /* Water beside the hull: displaced, hull band untouched */
    const q = window.getQuality();
    const N1 = q >= 2 ? 30 : 12;
    const midH = IMG.hullBottom - IMG.horizon;

    for (let i = 0; i < N1; i++) {
      const v = i / N1;
      const sy = IMG.horizon + midH * v;
      const sh = midH / N1 + 1.2;
      const amp = lerp(0.4, 3.4, v * v) * sc;
      const off = (Math.sin(t * 1.5 + v * 11) + 0.55 * Math.sin(t * 2.6 + v * 19)) * amp;
      const yo = Math.sin(t * 1.1 + v * 8) * amp * 0.45;
      const dyy = dy + sy * sc;

      ctx.drawImage(HERO_, 0, sy, IMG.hullL, sh,
        dx + off - over, dyy + yo, IMG.hullL * sc + over, sh * sc + 1.5);

      ctx.drawImage(HERO_, IMG.hullL, sy, IMG.hullR - IMG.hullL, sh,
        dx + IMG.hullL * sc, dyy, (IMG.hullR - IMG.hullL) * sc, sh * sc + 1.5);

      ctx.drawImage(HERO_, IMG.hullR, sy, IW - IMG.hullR, sh,
        dx + IMG.hullR * sc + off, dyy + yo, (IW - IMG.hullR) * sc + over, sh * sc + 1.5);
    }

    /* Foreground swell */
    const N2 = q >= 2 ? 76 : 28;
    const fgH = IH - IMG.hullBottom;

    for (let i = 0; i < N2; i++) {
      const v = i / N2;
      const sy = IMG.hullBottom + fgH * v;
      const sh = fgH / N2 + 1.2;
      const ramp = smoothstep(0, 0.16, v);
      const amp = lerp(1, 15, v * v) * ramp * sc;
      const off = (
        Math.sin(t * 1.7 + v * 9) +
        0.6 * Math.sin(t * 2.9 + v * 17) +
        0.35 * fbm(v * 6 + t * 0.7, 2)
      ) * amp;
      const yo = Math.sin(t * 1.25 + v * 7) * amp * 0.5;

      ctx.drawImage(HERO_, 0, sy, IW, sh,
        dx + off - over, dy + sy * sc + yo, IW * sc + over * 2, sh * sc + 1.6);
    }

    /* Continue the sea toward the lens */
    if (bottom < H - 0.5) drawNearSea(t, bottom);
  }

  /* ----------------------------------------------------------
     NEAR SEA (below the plate)
     ---------------------------------------------------------- */

  function drawNearSea(t, top) {
    const ctx = window.ctx;
    const W = window.W;
    const H = window.H;
    const q = window.getQuality();
    const span = H - top;

    const g = ctx.createLinearGradient(0, top, 0, H);
    g.addColorStop(0,    'rgb(20,82,86)');
    g.addColorStop(0.45, 'rgb(13,63,71)');
    g.addColorStop(1,    'rgb(5,31,40)');
    ctx.fillStyle = g;
    ctx.fillRect(0, top - 1, W, span + 2);

    const rows = q >= 2 ? 30 : 12;

    for (let i = 0; i <= rows; i++) {
      const tr = i / rows;
      const y = top + span * Math.pow(tr, 1.35);
      const amp = lerp(2, 26, tr);
      const freq = lerp(0.030, 0.007, tr);
      const step = q >= 2 ? 8 : 18;

      ctx.beginPath();
      ctx.moveTo(-10, y + span * 0.06);
      for (let x = -10; x <= W + 10; x += step) {
        ctx.lineTo(x, y + waveAt(x, t + i * 0.23, amp, freq));
      }
      ctx.lineTo(W + 10, y + span * 0.06);
      ctx.closePath();
      ctx.fillStyle = `rgba(4,30,38,${0.05 + 0.05 * tr})`;
      ctx.fill();

      ctx.beginPath();
      for (let x = -10; x <= W + 10; x += step) {
        const yy = y + waveAt(x, t + i * 0.23, amp, freq);
        x === -10 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.lineWidth = lerp(1, 3, tr);
      ctx.strokeStyle = `rgba(${lerp(90, 206, tr) | 0},${lerp(170, 224, tr) | 0},${lerp(175, 206, tr) | 0},${lerp(0.06, 0.20, tr)})`;
      ctx.stroke();

      if (tr > 0.25 && q >= 2) {
        ctx.beginPath();
        for (let x = -10; x <= W + 10; x += 11) {
          const w1 = waveAt(x, t + i * 0.23, amp, freq);
          const w2 = waveAt(x + 11, t + i * 0.23, amp, freq);
          if (w2 - w1 > amp * 0.16) {
            ctx.moveTo(x, y + w1);
            ctx.lineTo(x + 10, y + w1 + (w2 - w1) * 0.55);
          }
        }
        ctx.strokeStyle = `rgba(238,250,246,${(tr - 0.25) * 0.34})`;
        ctx.lineWidth = lerp(1, 3.2, tr);
        ctx.stroke();
      }
    }

    const bl = ctx.createLinearGradient(0, top - span * 0.10, 0, top + span * 0.16);
    bl.addColorStop(0,   'rgba(20,82,86,0)');
    bl.addColorStop(0.5, 'rgba(20,82,86,.45)');
    bl.addColorStop(1,   'rgba(20,82,86,0)');
    ctx.fillStyle = bl;
    ctx.fillRect(0, top - span * 0.10, W, span * 0.26);
  }

  /* ----------------------------------------------------------
     LIGHT (sun, glitter, foam)
     ---------------------------------------------------------- */

  function drawLight(t) {
    const ctx = window.ctx;
    const W = window.W;
    const H = window.H;
    const q = window.getQuality();
    const IMG = window.IMG;

    const sx = i2sx(IMG.sunX);
    const sy = i2sy(IMG.sunY);
    const hz = i2sy(IMG.horizon);
    const base = Math.min(W, H);

    ctx.globalCompositeOperation = 'lighter';

    const pulse = 0.86 + 0.14 * Math.sin(t * 0.5) + 0.05 * Math.sin(t * 1.7);
    const rg = ctx.createRadialGradient(sx, sy, 0, sx, sy, base * 0.30);
    rg.addColorStop(0,   `rgba(255,226,166,${0.34 * pulse})`);
    rg.addColorStop(0.45,`rgba(255,196,120,${0.12 * pulse})`);
    rg.addColorStop(1,   'rgba(255,190,120,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(sx - base * 0.32, sy - base * 0.32, base * 0.64, base * 0.64);

    const R = rng(9931);
    const n = q >= 2 ? 150 : 55;
    for (let i = 0; i < n; i++) {
      const u = R(), v = R(), f = R();
      const y = hz + Math.pow(v, 1.9) * (H - hz);
      if (y < hz || y > H) continue;
      const dn = (y - hz) / (H - hz || 1);
      const spread = lerp(W * 0.03, W * 0.30, dn);
      const x = sx + (u - 0.5) * 2 * spread;
      if (x < 0 || x > W) continue;
      const a = Math.max(0, Math.sin(t * (1.6 + f * 3.2) + i * 2.3)) * lerp(0.16, 0.5, dn);
      const w = lerp(2, 15, dn);
      ctx.fillStyle = `rgba(255,${226 - 40 * f | 0},${170 - 50 * f | 0},${a})`;
      ctx.fillRect(x - w / 2, y, w, lerp(1, 2.4, dn));
    }

    const R2 = rng(1279);
    const m = q >= 2 ? 70 : 26;
    const fy = i2sy(IMG.hullBottom);
    for (let i = 0; i < m; i++) {
      const u = R2(), v = R2(), f = R2();
      const y = fy + v * (H - fy);
      if (y < 0 || y > H) continue;
      const a = Math.max(0, Math.sin(t * (2.2 + f * 3.4) + i * 1.7)) * 0.30 * smoothstep(fy, H, y);
      ctx.fillStyle = `rgba(244,252,248,${a})`;
      ctx.fillRect(u * W, y, lerp(2, 9, v), 1.4);
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ----------------------------------------------------------
     FLAG
     ---------------------------------------------------------- */

  function drawFlag(t) {
    const ctx = window.ctx;
    const IMG = window.IMG;
    const hx = IMG.flagX;
    const hy = IMG.flagY;
    const fw = IMG.flagW;
    const fh = IMG.flagH;
    const ang = IMG.flagAng;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const N = 34;

    function pt(u, v) {
      const amp = 13 * u * u + 3 * u;
      const w = Math.sin(t * 4.1 + u * 7.4) * amp +
                Math.sin(t * 2.5 + u * 4.1) * amp * 0.45;
      const h = fh * lerp(1, 0.78, u);
      return [
        hx + ca * fw * u + 0.08 * h * v + w * 0.18,
        hy + sa * fw * u + h * v + w * 0.92 + u * u * 9
      ];
    }

    function quad(u0, u1, v0, v1, fill) {
      const a = pt(u0, v0);
      const b = pt(u1, v0);
      const c = pt(u1, v1);
      const d = pt(u0, v1);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    const bands = [
      [0,     1/3, '#0d8a45'],
      [1/3,   2/3, '#f4f1e8'],
      [2/3,   1,   '#1c1c1c']
    ];

    for (const [v0, v1, col] of bands) {
      for (let i = 8; i < N; i++) quad(i / N, (i + 1.03) / N, v0, v1, col);
    }

    for (let i = 0; i < 9; i++) quad(i / N, (i + 1.03) / N, 0, 1, '#c8102e');

    for (let i = 0; i < N; i++) {
      const u0 = i / N;
      const uc = (i + 0.5) / N;
      const v = Math.sin(t * 4.1 + uc * 7.4);
      const a = Math.abs(v) * 0.22 * (uc * 0.85 + 0.15);
      quad(u0, (i + 1.03) / N, 0, 1,
        v > 0 ? `rgba(255,244,216,${a * 0.85})` : `rgba(0,0,0,${a})`);
    }

    for (let i = 0; i < N; i++) {
      const u0 = i / N;
      const uc = (i + 0.5) / N;
      quad(u0, (i + 1.03) / N, 0, 1,
        `rgba(255,${196 - 30 * uc | 0},${132 - 30 * uc | 0},${0.16 - 0.10 * uc})`);
    }
  }

  /* ----------------------------------------------------------
     SPRAY
     ---------------------------------------------------------- */

  const spray = [];

  function initSpray() {
    spray.length = 0;
    for (let i = 0; i < 80; i++) {
      spray.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, a: 0 });
    }
  }

  function emitSpray(x, y, n, power) {
    let made = 0;
    for (let i = 0; i < spray.length && made < n; i++) {
      const s = spray[i];
      if (s.on) continue;
      s.on = true;
      s.x = x;
      s.y = y;
      s.vx = (0.3 + Math.random() * 1.2) * power * window.W * 0.05;
      s.vy = -(0.5 + Math.random()) * power * window.H * 0.09;
      s.r = 1 + Math.random() * 2.8;
      s.a = 0.55 + Math.random() * 0.45;
      made++;
    }
  }

  function updateSpray(dt) {
    for (const s of spray) {
      if (!s.on) continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += window.H * 0.45 * dt;
      s.a -= dt * 1.3;
      if (s.a <= 0) s.on = false;
    }
  }

  function drawSpray() {
    const ctx = window.ctx;
    ctx.globalCompositeOperation = 'lighter';
    for (const s of spray) {
      if (!s.on) continue;
      ctx.fillStyle = `rgba(242,252,248,${s.a * 0.5})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ----------------------------------------------------------
     MASTER DRAW
     ---------------------------------------------------------- */

  function drawHero(t) {
    const ctx = window.ctx;
    const W = window.W;
    const H = window.H;
    const IMG = window.IMG;

    if (!heroReady) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0,    '#14344a');
      g.addColorStop(0.55, '#d9a45c');
      g.addColorStop(1,    '#0a2b33');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      return;
    }

    drawPlate(t);

    ctx.save();
    ctx.translate(heroT.dx, heroT.dy);
    ctx.scale(heroT.sc, heroT.sc);
    drawFlag(t);
    ctx.restore();

    drawLight(t);

    const reduced = window.isReduced();
    const q = window.getQuality();
    if (!reduced && q >= 2 && Math.random() < 0.5) {
      emitSpray(i2sx(IMG.bowX), i2sy(IMG.bowY), 2, 0.8);
    }

    drawSpray();
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.HERO = HERO;
  window.isHeroReady = () => heroReady;

  window.heroTransform = heroTransform;
  window.i2sx = i2sx;
  window.i2sy = i2sy;
  window.boatHullPath = boatHullPath;
  window.drawPlate = drawPlate;
  window.drawNearSea = drawNearSea;
  window.drawLight = drawLight;
  window.drawFlag = drawFlag;
  window.drawHero = drawHero;

  window.initSpray = initSpray;
  window.emitSpray = emitSpray;
  window.updateSpray = updateSpray;
  window.drawSpray = drawSpray;

  window.heroT = heroT;

})();
