/* ============================================================
   FISHKAL — Hook Controller
   ------------------------------------------------------------
   Single SVG object — from the rod tip to the seabed.
   Updates SVG transforms using CSS properties for speed.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     DOM
     ---------------------------------------------------------- */

  const gHook     = document.getElementById('gHook');
  const hookBody  = document.getElementById('hookBody');
  const hookLine  = document.getElementById('hookLine');
  const gSonar    = document.getElementById('gSonar');
  const gHalo     = document.getElementById('gHalo');
  const gHud      = document.getElementById('gHud');
  const halo1     = document.getElementById('halo1');
  const halo2     = document.getElementById('halo2');

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */

  const hook = {
    x: 0,
    y: 0,
    s: 0,
    a: 0,
    tremor: 1.4,
    freq: 9
  };

  const lastRod = { x: 0, y: 0 };

  /* Cache for CSS transform to avoid re-layout */
  let lastTransform = '';
  let lastOpacity = -1;

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */

  function hookTarget() {
    return { x: window.W * 0.5, y: window.H * 0.515 };
  }

  /* ----------------------------------------------------------
     UPDATE
     ---------------------------------------------------------- */

  function updateHook(p, t) {
    const TL = window.TL;
    const cam = window.cam;
    const rodTip = window.rodTip;
    const W = window.W;
    const H = window.H;

    const tg = hookTarget();

    if (rodTip && rodTip.v) {
      lastRod.x = rodTip.x;
      lastRod.y = rodTip.y;
    }

    const rod = {
      x: lastRod.x || W * 0.62,
      y: lastRod.y || H * 0.42
    };

    const smallS = 0.30;

    let a, x, y, s;

    if (p < 0.335) {
      a = 0;
      x = rod.x;
      y = rod.y + 40 * smallS;
      s = smallS;
    } else if (p < TL.DESCENT[0]) {
      a = smoothstep(0.335, 0.375, p);
      x = rod.x;
      y = rod.y + 90 * smallS;
      s = smallS;
    } else {
      const d = easeInOut(smoothstep(TL.DESCENT[0], TL.HOOK[1], p));
      a = 1;
      s = lerp(smallS, 1, d);
      x = lerp(rod.x, tg.x, d);
      y = lerp(rod.y + 90 * smallS, tg.y, d);
    }

    if (p > 0.90) a *= 1 - smoothstep(0.90, 0.95, p);

    const tr = hook.tremor * (1 - smoothstep(0, 0.35, cam.above));
    const dx = Math.sin(t * hook.freq) * tr + Math.sin(t * hook.freq * 2.3) * tr * 0.35;
    const dy = Math.cos(t * hook.freq * 0.8) * tr * 0.4;

    hook.x = x + dx;
    hook.y = y + dy;
    hook.s = s;
    hook.a = a;

    if (Math.abs(a - lastOpacity) > 0.002) {
      gHook.setAttribute('opacity', a.toFixed(3));
      lastOpacity = a;
    }

    if (a <= 0.004) return;

    const sc = s * (Math.min(W, H) / 760) * 1.15;
    const tx = hook.x.toFixed(1);
    const ty = hook.y.toFixed(1);

    const transform = `translate(${tx}px,${ty}px) scale(${sc.toFixed(4)}) translate(-30px,-5px)`;
    if (transform !== lastTransform) {
      hookBody.style.transform = transform;
      hookBody.style.transformOrigin = '0 0';
      lastTransform = transform;
    }

    const topY = -30;
    const bend = Math.sin(t * 0.8) * W * 0.012;
    hookLine.setAttribute('d',
      `M ${(hook.x - bend * 0.4).toFixed(1)} ${topY} ` +
      `Q ${(hook.x + bend).toFixed(1)} ${((topY + hook.y) / 2).toFixed(1)} ` +
      `${hook.x.toFixed(1)} ${hook.y.toFixed(1)}`
    );
  }

  /* ----------------------------------------------------------
     HUD LAYOUT
     ---------------------------------------------------------- */

  function layoutHud() {
    const W = window.W;
    const H = window.H;
    const m = Math.round(Math.min(W, H) * 0.055);
    const L = Math.round(Math.min(W, H) * 0.045);

    const hudTL = document.getElementById('hudTL');
    const hudBR = document.getElementById('hudBR');
    const hudCenter = document.getElementById('hudCenter');

    if (hudTL) hudTL.setAttribute('d', `M ${m} ${m + L} L ${m} ${m} L ${m + L} ${m}`);
    if (hudBR) hudBR.setAttribute('d', `M ${W - m} ${H - m - L} L ${W - m} ${H - m} L ${W - m - L} ${H - m}`);
    if (hudCenter) hudCenter.setAttribute('d',
      `M ${W / 2 - 14} ${H * 0.515} L ${W / 2 - 5} ${H * 0.515} ` +
      `M ${W / 2 + 5} ${H * 0.515} L ${W / 2 + 14} ${H * 0.515}`
    );

    /* Set transform-origin once */
    if (gSonar) {
      gSonar.style.transformOrigin = '0 0';
      gSonar.style.willChange = 'transform, opacity';
    }
    if (gHalo) {
      gHalo.style.transformOrigin = '0 0';
      gHalo.style.willChange = 'transform, opacity';
    }
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.hook = hook;
  window.updateHook = updateHook;
  window.layoutHud = layoutHud;

  window.gSonar = gSonar;
  window.gHalo = gHalo;
  window.halo1 = halo1;
  window.halo2 = halo2;

})();
