/* ============================================================
   FISHKAL — Underwater
   ------------------------------------------------------------
   Gradient background, light shafts, caustics, hull-from-below,
   seabed, waterline (meniscus), and particle systems.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CAMERA REFERENCE
     ---------------------------------------------------------- */

  /* cam is owned by main.js but exposed on window */
  function cam() { return window.cam; }

  /* ----------------------------------------------------------
     UNDERWATER SCENE
     ---------------------------------------------------------- */

  function drawUnderwater(t) {
    const ctx = window.ctx;
    const W = window.W;
    const H = window.H;
    const q = window.getQuality();
    const c = cam();

    const d = c.depth;
    const top = Math.max(c.meniscusY, -H * 0.3);

    const g = ctx.createLinearGradient(0, top, 0, H);
    g.addColorStop(0,    `rgb(${lerp(26, 7, d) | 0},${lerp(140, 72, d) | 0},${lerp(146, 88, d) | 0})`);
    g.addColorStop(0.28, `rgb(${lerp(12, 4, d) | 0},${lerp(92, 42, d) | 0},${lerp(112, 60, d) | 0})`);
    g.addColorStop(0.68, `rgb(${lerp(6, 2, d) | 0},${lerp(52, 18, d) | 0},${lerp(70, 30, d) | 0})`);
    g.addColorStop(1,    `rgb(${lerp(3, 1, d) | 0},${lerp(24, 7, d) | 0},${lerp(28, 13, d) | 0})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* Light shafts */
    ctx.globalCompositeOperation = 'lighter';
    const shafts = q >= 2 ? 7 : 4;
    const originX = c.sunX;
    const originY = Math.min(c.meniscusY, H * 0.02) - H * 0.25;

    for (let i = 0; i < shafts; i++) {
      const ph = i * 1.7;
      const sway = Math.sin(t * 0.28 + ph) * W * 0.045 + fbm(t * 0.16 + ph, 2) * W * 0.02;
      const x0 = originX + (i - (shafts - 1) / 2) * W * 0.10 + sway;
      const wTop = W * 0.018;
      const wBot = W * (0.10 + 0.03 * Math.sin(t * 0.2 + ph));

      const lg = ctx.createLinearGradient(0, originY, 0, H * 1.02);
      const a = (0.085 - i * 0.006) * lerp(1, 0.10, d);
      lg.addColorStop(0,    `rgba(190,255,238,${a})`);
      lg.addColorStop(0.45, `rgba(140,226,214,${a * 0.55})`);
      lg.addColorStop(1,    'rgba(120,200,190,0)');

      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(x0 - wTop, originY);
      ctx.lineTo(x0 + wTop, originY);
      ctx.lineTo(x0 + wBot, H * 1.02);
      ctx.lineTo(x0 - wBot, H * 1.02);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    /* Caustics near the surface */
    if (c.meniscusY > -H * 0.2 && c.meniscusY < H * 1.1) {
      const my = c.meniscusY;
      ctx.globalCompositeOperation = 'lighter';
      const bands = q >= 2 ? 9 : 5;
      for (let i = 0; i < bands; i++) {
        const y = my + i * H * 0.030 + Math.sin(t * 0.8 + i) * 2;
        if (y < -20 || y > H + 20) continue;
        const a = (0.16 - i * 0.017) * lerp(1, 0.15, d);
        if (a <= 0) continue;
        ctx.strokeStyle = `rgba(210,255,240,${a})`;
        ctx.lineWidth = lerp(2.4, 0.8, i / bands);
        ctx.beginPath();
        for (let x = -10; x <= W + 10; x += 10) {
          const yy = y + waveAt(x, t * 1.2 + i * 0.6, 6 + i, 0.028);
          x === -10 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      /* Hull from below */
      if (c.depth < 0.55) {
        ctx.save();
        ctx.globalAlpha = (1 - smoothstep(0.15, 0.55, c.depth)) * 0.75;
        ctx.translate(c.hullX, my - H * 0.02);
        const s = c.hullS;
        ctx.scale(s, s * 0.62);
        window.boatHullPath(ctx);
        ctx.fillStyle = '#04161c';
        ctx.fill();
        ctx.strokeStyle = 'rgba(150,220,210,.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    /* Seabed */
    const sb = smoothstep(0.55, 0.92, d);
    if (sb > 0) {
      ctx.save();
      ctx.globalAlpha = sb;
      const by = H * 0.94;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, by);
      for (let x = 0; x <= W; x += 18) {
        ctx.lineTo(x, by - Math.abs(fbm(x * 0.006 + 3.2, 3)) * H * 0.055);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      const lg = ctx.createLinearGradient(0, by - H * 0.06, 0, H);
      lg.addColorStop(0, '#06222b');
      lg.addColorStop(1, '#020c12');
      ctx.fillStyle = lg;
      ctx.fill();

      const R = rng(4412);
      for (let i = 0; i < 9; i++) {
        const x = R() * W;
        const r = W * (0.02 + R() * 0.05);
        ctx.beginPath();
        ctx.ellipse(x, by + r * 0.2, r, r * 0.5, 0, Math.PI, 0);
        ctx.fillStyle = '#041a22';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ----------------------------------------------------------
     WATERLINE (MENISCUS)
     ---------------------------------------------------------- */

  function waterlinePath(y, t, toTop) {
    const ctx = window.ctx;
    const W = window.W;
    const H = window.H;

    ctx.beginPath();
    const amp = lerp(3, 22, clamp(1 - Math.abs(y - H * 0.5) / (H * 0.6), 0, 1));
    ctx.moveTo(-20, y + waveAt(-20, t, amp, 0.018));
    for (let x = -20; x <= W + 20; x += 10) {
      ctx.lineTo(x, y + waveAt(x, t, amp, 0.018));
    }
    if (toTop) {
      ctx.lineTo(W + 20, -40);
      ctx.lineTo(-20, -40);
    } else {
      ctx.lineTo(W + 20, H + 40);
      ctx.lineTo(-20, H + 40);
    }
    ctx.closePath();
  }

  function drawMeniscus(t) {
    const ctx = window.ctx;
    const W = window.W;
    const H = window.H;
    const c = cam();
    const y = c.meniscusY;
    if (y < -30 || y > H + 30) return;

    ctx.save();

    const amp = lerp(3, 22, clamp(1 - Math.abs(y - H * 0.5) / (H * 0.6), 0, 1));

    const lg = ctx.createLinearGradient(0, y - H * 0.02, 0, y + H * 0.05);
    lg.addColorStop(0,    'rgba(255,232,196,.30)');
    lg.addColorStop(0.28, 'rgba(180,240,230,.22)');
    lg.addColorStop(1,    'rgba(180,240,230,0)');
    ctx.fillStyle = lg;
    waterlinePath(y, t, false);
    ctx.fill();

    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 8) {
      const yy = y + waveAt(x, t, amp, 0.018);
      x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.strokeStyle = 'rgba(255,240,214,.62)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.restore();
  }

  /* ----------------------------------------------------------
     PARTICLES (pooled)
     ---------------------------------------------------------- */

  const snow = [];
  const bub = [];

  function initParticles() {
    snow.length = 0;
    bub.length = 0;

    const W = window.W;
    const H = window.H;
    const q = window.getQuality();

    const n = q >= 2 ? 130 : 60;
    const R = rng(555);

    for (let i = 0; i < n; i++) {
      snow.push({
        x: R() * W,
        y: R() * H,
        z: 0.25 + R() * 0.9,
        s: 0.6 + R() * 1.9,
        p: R() * TAU,
        v: 2 + R() * 9
      });
    }

    for (let i = 0; i < 48; i++) {
      bub.push({ on: false, x: 0, y: 0, r: 0, v: 0, p: 0, a: 0 });
    }
  }

  function spawnBubbles(x, y, count, power) {
    let made = 0;
    for (let i = 0; i < bub.length && made < count; i++) {
      const b = bub[i];
      if (b.on) continue;
      b.on = true;
      b.x = x + (Math.random() - 0.5) * 26 * power;
      b.y = y + (Math.random() - 0.5) * 18;
      b.r = 1.4 + Math.random() * 4.6 * power;
      b.v = 16 + Math.random() * 52 * power;
      b.p = Math.random() * TAU;
      b.a = 1;
      made++;
    }
  }

  function updateParticles(dt, t) {
    const H = window.H;
    const W = window.W;

    for (const s of snow) {
      s.y -= s.v * s.z * dt * 0.35;
      if (s.y < -6) {
        s.y = H + 6;
        s.x = Math.random() * W;
      }
    }

    for (const b of bub) {
      if (!b.on) continue;
      b.y -= b.v * dt;
      b.a -= dt * 0.5;
      if (b.a <= 0 || b.y < -20) b.on = false;
    }
  }

  function drawParticles(t) {
    const ctx = window.ctx;

    ctx.globalCompositeOperation = 'lighter';

    for (const s of snow) {
      const x = s.x + Math.sin(t * 0.5 + s.p) * 8 * s.z;
      ctx.fillStyle = `rgba(200,240,232,${0.05 + s.z * 0.13})`;
      ctx.fillRect(x, s.y, s.s * s.z, s.s * s.z);
    }

    for (const b of bub) {
      if (!b.on) continue;
      const x = b.x + Math.sin(t * 3 + b.p) * 5;
      ctx.beginPath();
      ctx.arc(x, b.y, b.r, 0, TAU);
      ctx.strokeStyle = `rgba(210,248,242,${0.42 * b.a})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = `rgba(190,240,236,${0.10 * b.a})`;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.drawUnderwater = drawUnderwater;
  window.waterlinePath = waterlinePath;
  window.drawMeniscus = drawMeniscus;
  window.initParticles = initParticles;
  window.spawnBubbles = spawnBubbles;
  window.updateParticles = updateParticles;
  window.drawParticles = drawParticles;

  window.snow = snow;
  window.bub = bub;

})();
