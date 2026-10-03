/* ============================================================
   FISHKAL — Game
   ------------------------------------------------------------
   One skill: timing. No score, no counters, no failure language.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CAMERA SHAKE
     ---------------------------------------------------------- */

  let shakeAmt = 0;
  let shakeUntil = 0;

  function shake(a, ms) {
    if (window.isReduced()) return;
    shakeAmt = a;
    shakeUntil = performance.now() + ms;
  }

  function getShake() {
    if (performance.now() >= shakeUntil) return 0;
    return shakeAmt;
  }

  /* ----------------------------------------------------------
     GAME STATE MACHINE
     ---------------------------------------------------------- */

  const Game = {
    state: 'IDLE',
    armed: false,
    sp: null,
    fish: null,

    tLock: 0,
    tCast: 0,
    tApp: 0,
    tAppEnd: 0,
    tWinEnd: 0,
    tGrace: 0,
    tEnd: 0,
    tFreeze: 0,

    kind: null,
    perfect: false,
    cued: false,
    anim: 0,

    /* ------------------------------------------------------
       RESET
       ------------------------------------------------------ */
    reset() {
      this.state = 'IDLE';
      this.armed = false;
      this.sp = null;
      this.fish = null;
      this.kind = null;
      this.perfect = false;
      this.anim = 0;

      const h = window.hook;
      if (h) {
        h.tremor = 1.4;
        h.freq = 9;
      }

      const gSonar = window.gSonar;
      const gHalo = window.gHalo;
      if (gSonar) gSonar.setAttribute('opacity', '0');
      if (gHalo) gHalo.setAttribute('opacity', '0');

      const ui = window.ui;
      if (ui) {
        if (ui.result) ui.result.classList.remove('on');
        if (ui.cue) ui.cue.style.opacity = '0';
      }

      const strikeBtn = document.getElementById('strike');
      if (strikeBtn) {
        strikeBtn.classList.remove('live');
        strikeBtn.disabled = true;
      }
    },

    /* ------------------------------------------------------
       SPECIES PICK
       ------------------------------------------------------ */
    pick() {
      const total = window.SPECIES.reduce((sum, s) => sum + s.weight, 0);
      let r = Math.random() * total;
      let acc = 0;
      for (const s of window.SPECIES) {
        acc += s.weight;
        if (r <= acc) return s;
      }
      return window.SPECIES[0];
    },

    /* ------------------------------------------------------
       ARM — trigger when camera has settled
       ------------------------------------------------------ */
    arm(now) {
      if (this.armed) return;
      this.armed = true;
      this.tLock = now;
      this.state = 'IDLE';
    },

    /* ------------------------------------------------------
       CAST
       ------------------------------------------------------ */
    cast(now) {
      this.state = 'CAST';
      this.tCast = now;

      const h = window.hook;
      if (h && window.spawnBubbles) {
        window.spawnBubbles(h.x, h.y, 18, 1.4);
      }
      window.Audio_.splash();
      shake(2, 300);
    },

    /* ------------------------------------------------------
       APPROACH
       ------------------------------------------------------ */
    approach(now) {
      this.state = 'APPROACH';
      const sp = this.pick();
      this.sp = sp;

      const W = window.W;
      const H = window.H;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const base = (Math.min(W, H) / 640) * sp.scale;

      this.tApp = now;
      this.tAppEnd = now + sp.approach;

      this.fish = {
        sp,
        dir,
        baseScale: base,
        scale: 0.06,
        alpha: 0,
        rot: 0,
        x: dir > 0 ? -W * 0.30 : W * 1.30,
        y: H * 0.80,
        sx: dir > 0 ? -W * 0.30 : W * 1.30,
        sy: H * 0.80,
        phase: Math.random() * TAU,
        beat: sp.type === 'B' ? 7.6 : 4.7
      };

      const strikeBtn = document.getElementById('strike');
      if (strikeBtn) {
        strikeBtn.classList.add('live');
        strikeBtn.disabled = false;
        try { strikeBtn.focus({ preventScroll: true }); } catch (e) {}
      }

      const ui = window.ui;
      if (ui && ui.cue && !this.cued) {
        this.cued = true;
        ui.cue.style.opacity = '1';
      }

      const gSonar = window.gSonar;
      if (gSonar) gSonar.setAttribute('opacity', '1');
    },

    /* ------------------------------------------------------
       OPEN WINDOW
       ------------------------------------------------------ */
    openWindow(now) {
      this.state = 'STRIKE_WINDOW';
      this.tWinEnd = now + window.GAME.strikeWindow;
      this.tGrace = this.tWinEnd + window.GAME.grace;

      const gHalo = window.gHalo;
      if (gHalo) gHalo.setAttribute('opacity', '1');

      window.Audio_.strike();
    },

    /* ------------------------------------------------------
       TAP
       ------------------------------------------------------ */
    tap(now) {
      if (this.state === 'APPROACH') {
        /* Early taps are never punished — the hook just twitches */
        const h = window.hook;
        if (h) h.tremor = Math.min(h.tremor + 4, 16);
        window.Audio_.tick();
        return;
      }

      if (this.state !== 'STRIKE_WINDOW') return;

      const centre = this.tWinEnd - window.GAME.strikeWindow / 2;
      this.perfect = Math.abs(now - centre) <= window.GAME.perfect;
      this.land(now);
    },

    /* ------------------------------------------------------
       LAND — catch!
       ------------------------------------------------------ */
    land(now) {
      this.state = 'CATCH';
      this.kind = 'CATCH';
      this.tFreeze = now + window.GAME.freezeMs;
      this.tEnd = now + 1150;

      const gHalo = window.gHalo;
      const gSonar = window.gSonar;
      if (gHalo) gHalo.setAttribute('opacity', '0');
      if (gSonar) gSonar.setAttribute('opacity', '0');

      const strikeBtn = document.getElementById('strike');
      if (strikeBtn) {
        strikeBtn.classList.remove('live');
        strikeBtn.disabled = true;
      }

      const h = window.hook;
      if (h) window.spawnBubbles(h.x, h.y, 22, 1.8);

      window.Audio_.catchGood();
      shake(3, 180);

      if (window.track) {
        window.track('catch', { species: this.sp ? this.sp.id : '', perfect: this.perfect });
      }
    },

    /* ------------------------------------------------------
       LOSE — escaped
       ------------------------------------------------------ */
    lose(now) {
      this.state = 'ESCAPED';
      this.kind = 'ESCAPED';
      this.tEnd = now + 1500;

      if (this.fish) this.fish.dir *= -1;

      const gHalo = window.gHalo;
      const gSonar = window.gSonar;
      if (gHalo) gHalo.setAttribute('opacity', '0');
      if (gSonar) gSonar.setAttribute('opacity', '0');

      const strikeBtn = document.getElementById('strike');
      if (strikeBtn) {
        strikeBtn.classList.remove('live');
        strikeBtn.disabled = true;
      }

      const h = window.hook;
      if (h) window.spawnBubbles(h.x, h.y, 8, 0.7);

      window.Audio_.escape();

      if (window.track) window.track('escape');
    },

    /* ------------------------------------------------------
       SHOW RESULT CARD
       ------------------------------------------------------ */
    show() {
      this.state = 'RESULT_SHOWN';
      this.tEnd = performance.now() + 2100;

      const ui = window.ui;
      if (ui && ui.cue) ui.cue.style.opacity = '0';
      if (!ui || !ui.result) return;

      const r = ui.result;
      const T = window.T;

      if (this.kind === 'CATCH') {
        r.querySelector('.kicker').textContent = T(this.perfect ? 'Clean strike' : 'Landed');
        r.querySelector('.name').textContent = T(this.sp.id);
        r.querySelector('.latin').textContent = this.sp.latin;
        r.querySelector('.line').textContent = T(this.sp.line);
      } else {
        r.querySelector('.kicker').textContent = T('The line went slack');
        r.querySelector('.name').textContent = T('Still out there');
        r.querySelector('.latin').textContent = '';
        r.querySelector('.line').textContent = T('A fish is still on its way.');
      }

      r.classList.add('on');
      window.Audio_.signature();
    },

    /* ------------------------------------------------------
       UPDATE — called every frame
       ------------------------------------------------------ */
    update(now, dt, t) {
      if (!this.armed) return;

      const W = window.W;
      const H = window.H;
      const G = window.GAME;
      const h = window.hook;

      switch (this.state) {

        case 'IDLE':
          if (h) h.tremor = damp(h.tremor, 1.4, 4, dt);
          if (now - this.tLock > G.settleMs) this.cast(now);
          break;

        case 'CAST':
          if (h) h.tremor = damp(h.tremor, 2.2, 3, dt);
          if (now - this.tCast > G.castMs) this.approach(now);
          break;

        case 'APPROACH': {
          const f = this.fish;
          const sp = this.sp;
          const q = clamp((now - this.tApp) / sp.approach, 0, 1);
          const e = easeInOut(q);
          const tx = h.x - f.dir * W * 0.13;
          const ty = h.y + H * 0.02;

          f.x = lerp(f.sx, tx, e) + Math.sin(now * 0.0013 + f.phase) * W * 0.014 * (1 - e * 0.6);
          f.y = lerp(f.sy, ty, e) + Math.sin(now * 0.0009 + f.phase * 1.7) * H * 0.016;
          f.scale = lerp(0.06, 1, Math.pow(e, 0.82));
          f.alpha = smoothstep(0, 0.14, q);
          f.rot = Math.sin(now * 0.0011 + f.phase) * 0.05;

          const pre = clamp((now - (this.tAppEnd - 1500)) / 1500, 0, 1);
          h.tremor = lerp(0.6, 8, e) + pre * 7;
          h.freq = lerp(8, 17, pre);
          f.beat = (sp.type === 'B' ? 7.6 : 4.7) + pre * 4;

          if (window.getQuality() >= 2 && Math.random() < 0.04) {
            window.spawnBubbles(f.x, f.y, 1, 0.4);
          }

          if (now >= this.tAppEnd) this.openWindow(now);
          break;
        }

        case 'STRIKE_WINDOW': {
          const f = this.fish;
          const w = clamp((now - (this.tWinEnd - G.strikeWindow)) / G.strikeWindow, 0, 1.2);
          const tx = h.x - f.dir * W * 0.13;
          const ex = h.x - f.dir * W * 0.018;

          f.x = lerp(tx, ex, easeIn(clamp(w, 0, 1)));
          f.scale = lerp(1, 1.1, clamp(w, 0, 1));

          h.tremor = 13;
          h.freq = 21;
          this.anim = w;

          if (now > this.tGrace) this.lose(now);
          break;
        }

        case 'CATCH': {
          const f = this.fish;

          if (now < this.tFreeze) {
            h.tremor = 2;
            break;
          }

          const k = clamp((now - this.tFreeze) / 900, 0, 1);
          f.x = lerp(f.x, h.x - f.dir * W * 0.01, 0.12);
          f.y = lerp(f.y, h.y - H * 0.05 * k, 0.10);
          f.rot = lerp(f.rot, -f.dir * 0.5, 0.06);
          f.alpha = 1 - smoothstep(0.55, 1, k);
          h.tremor = damp(h.tremor, 1.6, 3, dt);

          if (now > this.tEnd) this.show();
          break;
        }

        case 'ESCAPED': {
          const f = this.fish;
          const k = clamp((now - (this.tEnd - 1500)) / 1500, 0, 1);

          f.x += f.dir * W * 0.35 * dt;
          f.y -= H * 0.04 * dt;
          f.scale = lerp(1, 0.35, k);
          f.alpha = 1 - smoothstep(0.45, 1, k);
          f.rot = lerp(f.rot, 0, 0.05);
          h.tremor = damp(h.tremor, 1.2, 3, dt);

          if (now > this.tEnd) this.show();
          break;
        }

        case 'RESULT_SHOWN':
          if (h) h.tremor = damp(h.tremor, 1.2, 3, dt);
          if (now > this.tEnd) {
            this.state = 'UNLOCK';
            window.unlockScroll();
          }
          break;

        case 'UNLOCK':
          if (h) h.tremor = damp(h.tremor, 1.2, 3, dt);
          break;
      }

      /* Sonar update */
      if (this.state === 'APPROACH') {
        const gSonar = window.gSonar;
        if (gSonar) {
          const transform = `translate(${h.x.toFixed(1)}px,${h.y.toFixed(1)}px)`;
          gSonar.style.transform = transform;

          const base = Math.min(W, H);
          const pulse = (t * 0.45) % 1;
          const r1 = base * 0.06 * (0.6 + pulse * 0.9) / 52;
          const r2 = base * 0.11 * (0.6 + pulse * 0.8) / 92;
          const r3 = base * 0.17 * (0.6 + pulse * 0.7) / 140;

          gSonar.children[0].style.transform = `scale(${r1.toFixed(3)})`;
          gSonar.children[1].style.transform = `scale(${r2.toFixed(3)})`;
          gSonar.children[2].style.transform = `scale(${r3.toFixed(3)})`;
          gSonar.children[0].style.transformOrigin = '0 0';
          gSonar.children[1].style.transformOrigin = '0 0';
          gSonar.children[2].style.transformOrigin = '0 0';

          gSonar.setAttribute('opacity', (0.28 + 0.24 * Math.sin(t * 2.4)).toFixed(3));
        }
      }

      /* Halo update */
      if (this.state === 'STRIKE_WINDOW') {
        const gHalo = window.gHalo;
        const halo1 = window.halo1;
        const halo2 = window.halo2;

        if (gHalo && halo1 && halo2) {
          const transform = `translate(${h.x.toFixed(1)}px,${h.y.toFixed(1)}px)`;
          gHalo.style.transform = transform;

          const base = Math.min(W, H) * 0.055;
          const k = clamp(this.anim, 0, 1);

          halo1.setAttribute('r', (base * (0.7 + k * 1.5)).toFixed(1));
          halo2.setAttribute('r', (base * (0.7 + k * 0.9)).toFixed(1));

          gHalo.setAttribute('opacity', (0.9 * (1 - k * 0.55)).toFixed(3));
        }
      }
    }
  };

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.Game = Game;
  window.shake = shake;
  window.getShake = getShake;

})();
