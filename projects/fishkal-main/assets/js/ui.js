/* ============================================================
   FISHKAL — UI
   ------------------------------------------------------------
   Captions, result card, brand section, HUD visibility,
   depth veil and business bar integration.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     DOM CACHE
     ---------------------------------------------------------- */

  const ui = {
    hero:     document.getElementById('hero'),
    hint:     document.getElementById('hint'),
    cap:      document.getElementById('caption'),
    capBig:   document.querySelector('#caption .big'),
    capSm:    document.querySelector('#caption .small'),
    cue:      document.getElementById('cue'),
    result:   document.getElementById('result'),
    brand:    document.getElementById('brand'),
    cont:     document.getElementById('continue'),
    capIdx:   -1
  };

  const strikeBtn = document.getElementById('strike');

  /* ----------------------------------------------------------
     SCENE CAPTIONS
     ---------------------------------------------------------- */

  const CAPS = [
    { a: 0.085, b: 0.170, big: 'Leaving the coast',  sm: 'Dubai 25.20°N 55.27°E' },
    { a: 0.205, b: 0.300, big: 'The vessel',         sm: 'Dubai fishing boat' },
    { a: 0.340, b: 0.430, big: 'Dubai',              sm: 'Working ground' },
    { a: 0.470, b: 0.560, big: 'Descent',            sm: '' }
  ];

  /* ----------------------------------------------------------
     UPDATE UI
     ---------------------------------------------------------- */

  function updateUI(p) {
    const T = window.T;
    const gHud = document.getElementById('gHud');

    /* Hero fade out */
    const heroA = 1 - smoothstep(0, 0.05, p);
    if (ui.hero) ui.hero.style.opacity = heroA;

    /* Scroll hint fade */
    if (ui.hint) ui.hint.style.opacity = (1 - smoothstep(0, 0.03, p)) * 0.9;

    /* Caption */
    let idx = -1;
    let a = 0;
    for (let i = 0; i < CAPS.length; i++) {
      const c = CAPS[i];
      if (p >= c.a - 0.03 && p <= c.b + 0.03) {
        idx = i;
        a = smoothstep(c.a - 0.03, c.a + 0.01, p) *
            (1 - smoothstep(c.b - 0.01, c.b + 0.03, p));
        break;
      }
    }

    if (idx !== ui.capIdx) {
      ui.capIdx = idx;
      if (idx >= 0 && ui.capBig && ui.capSm) {
        ui.capBig.textContent = T(CAPS[idx].big);
        ui.capSm.textContent = T(CAPS[idx].sm);
      }
    }

    if (ui.cap) ui.cap.style.opacity = idx >= 0 ? a : 0;

    /* HUD */
    if (gHud) {
      const hudA = smoothstep(0.54, 0.62, p) * (1 - smoothstep(0.78, 0.86, p)) * 0.65;
      gHud.setAttribute('opacity', hudA.toFixed(3));
    }

    /* Result card fade out after ascent */
    if (window.Game) {
      const gs = window.Game.state;
      if ((gs === 'RESULT_SHOWN' || gs === 'UNLOCK') && p > 0.655) {
        if (ui.result) ui.result.classList.remove('on');
      }
    }

    /* Brand section */
    const brandOn = p > 0.925;
    if (ui.brand) ui.brand.classList.toggle('on', brandOn);

    /* Depth veil */
    const veil = document.getElementById('depthVeil');
    if (veil && window.cam) {
      const d = window.cam.depth;
      const op = Math.max(0, Math.min(1, (d - 0.25) * 1.15)) * 0.9;
      veil.style.opacity = op.toFixed(3);
    }
  }

  /* ----------------------------------------------------------
     RESULT DISMISS
     ---------------------------------------------------------- */

  function dismissResult(via) {
    if (ui.result) ui.result.classList.remove('on');
    if (window.Game && window.Game.state === 'RESULT_SHOWN') {
      window.Game.state = 'UNLOCK';
      try { window.unlockScroll(); } catch (e) {}
    }
  }

  function initResultDismiss() {
    if (document.getElementById('resClose')) return;
    const rc = document.createElement('button');
    rc.id = 'resClose';
    rc.type = 'button';
    rc.textContent = '×';
    rc.setAttribute('aria-label', 'Close result');
    if (ui.result) ui.result.appendChild(rc);

    /* pointerdown = instant on touch; click covers keyboard (Enter/Space) */
    const close = (e) => { if (e) e.preventDefault(); dismissResult('btn'); };
    rc.addEventListener('pointerdown', close);
    rc.addEventListener('click', close);
  }

  /* ----------------------------------------------------------
     BOOT SCREEN
     ---------------------------------------------------------- */

  function initBootScreen() {
    if (document.getElementById('boot')) return;
    const boot = document.createElement('div');
    boot.id = 'boot';
    boot.innerHTML =
      '<div style="text-align:center">' +
        '<div class="w">Fishkal</div>' +
        '<div class="l"></div>' +
      '</div>';
    document.body.appendChild(boot);

    window.addEventListener('load', () => {
      setTimeout(() => boot.classList.add('off'), 700);
    });

    setTimeout(() => boot.classList.add('off'), 4000);
  }

  /* ----------------------------------------------------------
     DEPTH VEIL
     ---------------------------------------------------------- */

  function initDepthVeil() {
    if (document.getElementById('depthVeil')) return;
    const veil = document.createElement('div');
    veil.id = 'depthVeil';
    document.body.appendChild(veil);
  }

  /* ----------------------------------------------------------
     TRACKING HELPER
     ---------------------------------------------------------- */

  function track(event, props) {
    props = props || {};

    if (window.plausible && window.FK && window.FK.plausibleDomain) {
      window.plausible(event, { props });
    }

    if (window.gtag && window.FK && window.FK.gaId) {
      window.gtag('event', event, props);
    }
  }

  /* ----------------------------------------------------------
     ANALYTICS INIT
     ---------------------------------------------------------- */

  function initAnalytics() {
    if (!window.FK) return;

    /* Plausible */
    if (window.FK.plausibleDomain) {
      const s = document.createElement('script');
      s.defer = true;
      s.dataset.domain = window.FK.plausibleDomain;
      s.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(s);
    }

    /* GA4 */
    if (window.FK.gaId) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.FK.gaId;
      document.head.appendChild(s);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', window.FK.gaId);
    }
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.ui = ui;
  window.updateUI = updateUI;
  window.track = track;

  window.initResultDismiss = initResultDismiss;
  window.dismissResult = dismissResult;
  window.initBootScreen = initBootScreen;
  window.initDepthVeil = initDepthVeil;
  window.initAnalytics = initAnalytics;

  window.strikeBtn = strikeBtn;

})();
