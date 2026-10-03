/* ============================================================
   FISHKAL — Main
   ------------------------------------------------------------
   Orchestrator: camera, render loop, events, boot.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CAMERA
     ---------------------------------------------------------- */

  const cam = {
    horizonY:   0,
    meniscusY:  0,
    depth:      0,
    sunX:       0,
    sunY:       0,
    hullX:      0,
    hullS:      1,
    above:      1
  };

  window.cam = cam;

  const rodTip = { x: 0, y: 0, v: false };
  window.rodTip = rodTip;

  function updateCamera(p, t) {
    const W = window.W;
    const H = window.H;
    const IMG = window.IMG;
    const TL = window.TL;

    window.heroTransform(p, t);

    cam.horizonY = window.i2sy(IMG.horizon);
    cam.sunX = clamp(window.i2sx(IMG.sunX), W * 0.14, W * 0.86);
    cam.sunY = window.i2sy(IMG.sunY);
    cam.hullX = window.i2sx(IMG.hullCx);
    cam.hullS = ((IMG.hullR - IMG.hullL) / 310) * window.heroT.sc;

    rodTip.x = window.i2sx(IMG.rodX);
    rodTip.y = window.i2sy(IMG.rodY);
    rodTip.v = true;

    if (p < TL.DESCENT[0]) {
      cam.meniscusY = H * 1.6;
    } else {
      const d = smoothstep(TL.DESCENT[0], TL.HOOK[0], p);
      cam.meniscusY = lerp(H * 1.35, -H * 0.28, easeInOut(d));
    }

    if (p > TL.ASCENT[0]) {
      const a = smoothstep(0.80, 0.925, p);
      if (a > 0) cam.meniscusY = lerp(-H * 0.28, H * 1.5, easeInOut(a));
    }

    cam.depth = p <= TL.LOCK
      ? smoothstep(0.50, 0.60, p)
      : 1 - smoothstep(0.655, 0.885, p);

    cam.above = clamp(cam.meniscusY / H, 0, 1);
  }

  /* ----------------------------------------------------------
     RENDER
     ---------------------------------------------------------- */

  function render(t) {
    const ctx = window.ctx;
    const W = window.W;
    const H = window.H;

    ctx.setTransform(window.DPR, 0, 0, window.DPR, 0, 0);
    ctx.fillStyle = '#02090d';
    ctx.fillRect(0, 0, W, H);

    ctx.save();

    /* Camera shake */
    if (window.getShake) {
      const s = window.getShake();
      if (s > 0) {
        ctx.translate((Math.random() - 0.5) * s * 2, (Math.random() - 0.5) * s * 2);
      }
    }

    const my = cam.meniscusY;

    /* Underwater layer */
    if (my < H + 30) {
      ctx.save();
      window.waterlinePath(my, t, false);
      ctx.clip();
      window.drawUnderwater(t);
      if (cam.depth > 0.02) window.drawParticles(t);
      if (window.Game && window.Game.fish && window.Game.fish.alpha > 0.004) {
        window.drawFish(window.Game.fish, t);
      }
      ctx.restore();
    }

    /* Above water layer */
    if (my > -30) {
      ctx.save();
      window.waterlinePath(my, t, true);
      ctx.clip();
      window.drawHero(t);
      ctx.restore();
    }

    window.drawMeniscus(t);
    ctx.restore();

    /* Grain */
    const q = window.getQuality();
    if (q >= 2) {
      const grain = window.getGrain();
      if (grain) {
        ctx.save();
        ctx.globalAlpha = 0.055;
        const reduced = window.isReduced();
        const ox = reduced ? 0 : -(Math.random() * 128 | 0);
        const oy = reduced ? 0 : -(Math.random() * 128 | 0);
        ctx.translate(ox, oy);
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, W + 130, H + 130);
        ctx.restore();
      }
    } else if (q === 1) {
      const grainLayer = window.getGrainLayer();
      if (grainLayer) {
        ctx.save();
        ctx.globalAlpha = 0.045;
        ctx.drawImage(
          grainLayer,
          -(Math.random() * 30 | 0),
          -(Math.random() * 30 | 0)
        );
        ctx.restore();
      }
    }

    /* Vignette */
    const vig = window.getVig();
    if (vig) ctx.drawImage(vig, 0, 0, W, H);
  }

  /* ----------------------------------------------------------
     LOOP
     ---------------------------------------------------------- */

  let last = 0;
  let frames = 0;
  let ft = 0;
  let slow = 0;
  let running = true;
  let rafId = 0;
  let T0 = 0;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!running) return;

    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    const t = now / 1000;

    if (!T0) T0 = now;

    window.readScroll();

    const rawP = window.rawP;
    const lambda = (rawP > 0.42 && rawP < 0.63) ? 2.3 : 5.0;
    const P = window.isReduced()
      ? rawP
      : window.damp(window.P, rawP, lambda, dt);
    window.P = P;

    /* Arm the game on the settled camera */
    if (window.isLocked() && P >= window.TL.LOCK - 0.003) {
      window.Game.arm(now);
    }

    updateCamera(P, t);
    window.updateHook(P, t);
    window.Game.update(now, dt, t);
    window.updateParticles(dt, t);
    window.updateSpray(dt);
    render(t);
    window.updateUI(P);

    /* Adaptive quality */
    frames++;
    ft += dt;
    if (ft >= 0.5) {
      const fps = frames / ft;
      const q = window.getQuality();

      if (fps < 48 && q > 1) {
        window.setQuality(1);
        window.setSize();
        window.initParticles();
        window.initSpray();
      } else if (fps < 32 && q > 0) {
        window.setQuality(0);
        window.setSize();
      } else if (fps > 58 && q < 2) {
        window.setQuality(2);
        window.setSize();
        window.initParticles();
        window.initSpray();
      }

      frames = 0;
      ft = 0;
    }
  }

  /* ----------------------------------------------------------
     EVENTS
     ---------------------------------------------------------- */

  let resizeT = 0;

  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      window.setSize();
      window.initParticles();
      window.initSpray();
    }, 120);
  }

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });
  window.addEventListener('scroll', window.readScroll, { passive: true });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    last = 0;

    if (!running && window.Audio_.ac && window.Audio_.on) {
      try { window.Audio_.ac.suspend(); } catch (e) {}
    } else if (window.Audio_.ac && window.Audio_.on) {
      try { window.Audio_.ac.resume(); } catch (e) {}
    }
  });

  /* Strike handler */
  function doStrike(e) {
    if (e) e.preventDefault();
    window.Audio_.init();
    window.Game.tap(performance.now());
    if (window.track) window.track('strike');
  }

  const strikeBtn = document.getElementById('strike');
  if (strikeBtn) {
    strikeBtn.addEventListener('pointerdown', doStrike);
    strikeBtn.addEventListener('click', e => e.preventDefault());
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && window.Game && window.Game.state === 'RESULT_SHOWN') {
      e.preventDefault();
      if (window.dismissResult) window.dismissResult('esc');
      return;
    }
    if ((e.key === ' ' || e.key === 'Enter') &&
        strikeBtn && strikeBtn.classList.contains('live')) {
      e.preventDefault();
      doStrike();
    }
  });

  /* Sound toggle */
  const soundBtn = document.getElementById('sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const on = window.Audio_.toggle();
      soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      soundBtn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    });
  }

  /* CTA restart */
  const cta = document.getElementById('cta');
  if (cta) {
    cta.addEventListener('click', () => {
      window.Audio_.signature();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.Game.reset();
        window.Game.cued = false;
        window.Game.armed = false;   /* re-arm on next settled camera */
        window.lockScroll();         /* re-engage the game lock */
        window.P = 0;
        window.rawP = 0;
      }, 700);
    });
  }

  /* Service worker */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (!window.FK || !window.FK.enableSW) return;
    if (location.protocol !== 'https:') return;

    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  /* ----------------------------------------------------------
     BOOT
     ---------------------------------------------------------- */

  function boot() {
    window.setSize();
    window.initParticles();
    window.initSpray();
    window.initResultDismiss();
    window.initDepthVeil();
    window.initBootScreen();
    window.initAmbient();
    window.initAnalytics();
    window.Game.reset();

    /* live countdown chip (tickCd is defined in i18n.js) */
    if (window.tickCd) {
      window.tickCd();
      setInterval(() => window.tickCd(), 30000);
    }

    try {
      if (localStorage.getItem('fk_sound') === '1') {
        /* Preference is stored; user must still click sound to unlock */
      }
    } catch (e) {}

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    window.readScroll();
    window.P = window.rawP;
    T0 = performance.now();
    updateCamera(window.P, 0);

    rafId = requestAnimationFrame(frame);

    registerSW();

    if (window.track) window.track('start');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
