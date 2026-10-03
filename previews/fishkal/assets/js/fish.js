/* ============================================================
   FISHKAL — Fish Rendering
   ------------------------------------------------------------
   Two base body shapes (A and B), two extended (C and D),
   species differ by silhouette, scale, tint and pattern.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     BODY PATHS
     ---------------------------------------------------------- */

  function fishBody(g, type) {
    g.beginPath();

    if (type === 'A') {
      g.moveTo(102, 0);
      g.bezierCurveTo(82, -42, 16, -58, -44, -36);
      g.bezierCurveTo(-72, -27, -90, -16, -104, -9);
      g.lineTo(-104, 9);
      g.bezierCurveTo(-90, 16, -72, 27, -44, 36);
      g.bezierCurveTo(16, 54, 82, 40, 102, 0);
    } else if (type === 'C') {
      g.moveTo(96, 0);
      g.bezierCurveTo(80, -52, 10, -70, -40, -52);
      g.bezierCurveTo(-78, -38, -96, -16, -104, -8);
      g.lineTo(-104, 8);
      g.bezierCurveTo(-96, 16, -78, 38, -40, 52);
      g.bezierCurveTo(10, 70, 80, 52, 96, 0);
    } else if (type === 'D') {
      g.moveTo(118, 0);
      g.bezierCurveTo(96, -30, 26, -42, -46, -30);
      g.bezierCurveTo(-76, -24, -94, -14, -104, -8);
      g.lineTo(-104, 8);
      g.bezierCurveTo(-94, 14, -76, 24, -46, 30);
      g.bezierCurveTo(26, 42, 96, 30, 118, 0);
    } else {
      /* type B */
      g.moveTo(134, 0);
      g.bezierCurveTo(104, -20, 34, -31, -40, -21);
      g.bezierCurveTo(-72, -17, -92, -12, -104, -7);
      g.lineTo(-104, 7);
      g.bezierCurveTo(-92, 12, -72, 17, -40, 21);
      g.bezierCurveTo(34, 31, 104, 20, 134, 0);
    }

    g.closePath();
  }

  function fishTail(g, type) {
    g.beginPath();

    if (type === 'A') {
      g.moveTo(-100, -10);
      g.lineTo(-152, -40);
      g.quadraticCurveTo(-140, 0, -152, 40);
      g.lineTo(-100, 10);
    } else if (type === 'C') {
      g.moveTo(-98, -10);
      g.quadraticCurveTo(-152, -36, -146, 0);
      g.quadraticCurveTo(-152, 36, -98, 10);
    } else if (type === 'D') {
      g.moveTo(-100, -8);
      g.lineTo(-166, -54);
      g.quadraticCurveTo(-124, -6, -166, 54);
      g.lineTo(-100, 8);
    } else {
      g.moveTo(-100, -8);
      g.lineTo(-158, -46);
      g.quadraticCurveTo(-118, 0, -158, 46);
      g.lineTo(-100, 8);
    }

    g.closePath();
  }

  /* ----------------------------------------------------------
     FISH DRAWING
     ---------------------------------------------------------- */

  function drawFish(f, t) {
    const ctx = window.ctx;
    const sp = f.sp;
    const s = f.scale * f.baseScale;
    if (s <= 0.001) return;

    ctx.save();
    ctx.globalAlpha = f.alpha;
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.scale(s * f.dir, s);

    const sway = Math.sin(t * f.beat + f.phase);
    ctx.rotate(sway * 0.045);

    /* Tail hinged at the peduncle */
    ctx.save();
    ctx.translate(-100, 0);
    ctx.rotate(Math.sin(t * f.beat + f.phase - 0.7) * 0.34);
    ctx.translate(100, 0);
    fishTail(ctx, sp.type);
    ctx.fillStyle = 'rgba(5,22,28,.82)';
    ctx.fill();
    ctx.restore();

    /* Pectoral fin */
    ctx.save();
    ctx.translate(34, 14);
    ctx.rotate(0.5 + sway * 0.22);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, 20, -44, 10);
    ctx.quadraticCurveTo(-24, 4, 0, 0);
    ctx.fillStyle = 'rgba(6,26,32,.7)';
    ctx.fill();
    ctx.restore();

    /* Body */
    fishBody(ctx, sp.type);
    const lg = ctx.createLinearGradient(0, -58, 0, 54);
    lg.addColorStop(0,    sp.tint);
    lg.addColorStop(0.30, '#0a2630');
    lg.addColorStop(1,    '#03131a');
    ctx.fillStyle = lg;
    ctx.fill();

    /* Detail inside clip */
    ctx.save();
    ctx.clip();

    const rg = ctx.createLinearGradient(0, -60, 0, -8);
    rg.addColorStop(0, 'rgba(255,214,158,.40)');
    rg.addColorStop(1, 'rgba(255,214,158,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(-170, -60, 340, 60);

    if (sp.pat === 'bars') {
      ctx.fillStyle = 'rgba(4,18,24,.5)';
      for (let i = 0; i < 5; i++) {
        const x = -64 + i * 34;
        ctx.beginPath();
        ctx.ellipse(x, 0, 7, Math.max(10, 44 - Math.abs(x) / 3), 0, 0, TAU);
        ctx.fill();
      }
    }

    if (sp.pat === 'spots') {
      ctx.fillStyle = 'rgba(214,178,120,.35)';
      for (let i = 0; i < 14; i++) {
        const x = -80 + ((i * 53) % 160);
        const y = -30 + ((i * 29) % 60);
        ctx.beginPath();
        ctx.arc(x, y, 2.4 + (i % 3), 0, TAU);
        ctx.fill();
      }
    }

    if (sp.pat === 'stripe') {
      ctx.fillStyle = 'rgba(220,190,140,.28)';
      ctx.fillRect(-104, -6, 210, 10);
    }

    if (sp.pat === 'fork') {
      ctx.strokeStyle = 'rgba(210,160,110,.30)';
      ctx.lineWidth = 2 / s;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-20 + i * 26, -40 + i * 6);
        ctx.quadraticCurveTo(10 + i * 26, 0, -20 + i * 26, 40 - i * 6);
        ctx.stroke();
      }
    }

    ctx.restore();

    /* Rim */
    fishBody(ctx, sp.type);
    ctx.strokeStyle = 'rgba(255,222,176,.30)';
    ctx.lineWidth = 1.6 / s;
    ctx.stroke();

    /* Eye */
    if (s > 0.42) {
      ctx.beginPath();
      ctx.arc(74, -11, 5.5, 0, TAU);
      ctx.fillStyle = 'rgba(3,12,16,.95)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(75.6, -12.6, 1.8, 0, TAU);
      ctx.fillStyle = 'rgba(255,226,180,.85)';
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* ----------------------------------------------------------
     AMBIENT SCHOOL
     ------------------------------------------------------------ */

  const HUES = [
    'rgba(126,178,178,',
    'rgba(158,186,164,',
    'rgba(142,164,196,',
    'rgba(196,178,140,'
  ];

  const SCHOOL = Array.from({ length: 28 }, (_, i) => ({
    x: Math.random(),
    y: 0.5 + Math.random() * 0.45,
    s: 0.6 + Math.random() * 1.1,
    v: (0.018 + Math.random() * 0.05) * (Math.random() < 0.5 ? 1 : -1),
    h: HUES[i % 4],
    ph: Math.random() * 6.28,
    dy: Math.random() * 0.06
  }));

  /* Bioluminescent plankton — the deep answers with its own light */
  const GLOWS = Array.from({ length: 36 }, () => ({
    x: Math.random(),
    y: 0.30 + Math.random() * 0.68,
    v: 0.004 + Math.random() * 0.012,
    r: 1.0 + Math.random() * 2.2,
    sp: 0.4 + Math.random() * 1.2,
    ph: Math.random() * 6.28
  }));

  function drawSchoolFish(g, x, y, s, dir, hue, a, t, ph) {
    g.save();
    g.translate(x, y);
    g.scale(dir * s, s);
    g.globalAlpha = a;

    g.fillStyle = hue + '0.55)';

    g.beginPath();
    g.moveTo(14, 0);
    g.quadraticCurveTo(5, -6.5, -5, -4.5);
    g.quadraticCurveTo(-10, -2.5, -12, 0);
    g.quadraticCurveTo(-10, 2.5, -5, 4.5);
    g.quadraticCurveTo(5, 6.5, 14, 0);
    g.fill();

    g.save();
    g.translate(-11, 0);
    g.rotate(Math.sin(t * 4 + ph) * 0.35);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-7, -5.5);
    g.quadraticCurveTo(-4.5, 0, -7, 5.5);
    g.closePath();
    g.fill();
    g.restore();

    g.beginPath();
    g.moveTo(3, -4);
    g.quadraticCurveTo(-1, -9.5, -6, -4.5);
    g.closePath();
    g.fill();

    g.beginPath();
    g.moveTo(2, 4);
    g.quadraticCurveTo(-1, 7.5, -5, 4.5);
    g.closePath();
    g.fill();

    g.beginPath();
    g.arc(9, -1.2, 1.15, 0, 7);
    g.fillStyle = 'rgba(3,12,16,.9)';
    g.fill();

    g.beginPath();
    g.arc(9.4, -1.6, 0.4, 0, 7);
    g.fillStyle = 'rgba(230,240,240,.8)';
    g.fill();

    g.restore();
  }

  /* ----------------------------------------------------------
     AMBIENT CANVAS LOOP
     ---------------------------------------------------------- */

  let ambCanvas = null;
  let ambCtx = null;
  let AW = 0;
  let AH = 0;

  function initAmbient() {
    ambCanvas = document.createElement('canvas');
    ambCanvas.id = 'amb';
    document.body.appendChild(ambCanvas);
    ambCtx = ambCanvas.getContext('2d');
    ambSize();
    window.addEventListener('resize', ambSize, { passive: true });
    requestAnimationFrame(ambLoop);
  }

  function ambSize() {
    const d = Math.min(2, window.devicePixelRatio || 1);
    AW = ambCanvas.width = window.innerWidth * d;
    AH = ambCanvas.height = window.innerHeight * d;
  }

  function ambLoop() {
    requestAnimationFrame(ambLoop);

    const c = window.cam;
    if (!c) return;
    const d = c.depth;
    const a = Math.max(0, Math.min(1, (d - 0.3) * 2));

    if (a <= 0.01) {
      ambCtx.clearRect(0, 0, AW, AH);
      return;
    }

    const t = performance.now() / 1000;
    ambCtx.clearRect(0, 0, AW, AH);

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    for (const f of SCHOOL) {
      f.x += f.v * 0.016;
      if (f.x > 1.15) f.x = -0.15;
      if (f.x < -0.15) f.x = 1.15;
      const y = (f.y + Math.sin(t * 0.5 + f.ph) * f.dy) * AH;
      drawSchoolFish(
        ambCtx,
        f.x * AW,
        y,
        f.s * dpr * 3.2,
        f.v > 0 ? 1 : -1,
        f.h,
        a * (0.35 + f.s * 0.3),
        t,
        f.ph
      );
    }

    /* Bioluminescence below mid-depth */
    if (d > 0.5) {
      ambCtx.globalCompositeOperation = 'lighter';
      const ga = Math.min(1, (d - 0.5) * 2.4);
      for (const gd of GLOWS) {
        gd.y -= gd.v * 0.016;
        if (gd.y < -0.02) { gd.y = 1.02; gd.x = Math.random(); }
        const fl = Math.max(0, Math.sin(t * gd.sp + gd.ph));
        const a2 = ga * fl * 0.5;
        if (a2 < 0.02) continue;
        ambCtx.fillStyle = `rgba(124,240,220,${a2.toFixed(3)})`;
        ambCtx.beginPath();
        ambCtx.arc(gd.x * AW, gd.y * AH, gd.r * (0.6 + fl) * dpr, 0, 6.2832);
        ambCtx.fill();
      }
      ambCtx.globalCompositeOperation = 'source-over';
    }
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.fishBody = fishBody;
  window.fishTail = fishTail;
  window.drawFish = drawFish;
  window.initAmbient = initAmbient;

})();
