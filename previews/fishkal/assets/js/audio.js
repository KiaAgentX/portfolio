/* ============================================================
   FISHKAL — Audio
   ------------------------------------------------------------
   Fully synthesised. No files, no autoplay, never blocks the UX.
   ============================================================ */

(function () {
  'use strict';

  const Audio_ = {
    ac: null,
    master: null,
    ambGain: null,
    on: false,
    ready: false,

    /* ------------------------------------------------------
       INIT — creates the AudioContext and ambient bed
       ------------------------------------------------------ */
    init() {
      if (this.ac) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;

        this.ac = new AC();
        this.master = this.ac.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.ac.destination);
        this.ready = true;

        this.ambient();
      } catch (e) {
        this.ready = false;
      }
    },

    /* ------------------------------------------------------
       AMBIENT — filtered noise bed
       ------------------------------------------------------ */
    ambient() {
      try {
        const ac = this.ac;
        const len = ac.sampleRate * 4;
        const buf = ac.createBuffer(1, len, ac.sampleRate);
        const d = buf.getChannelData(0);

        let last = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.2;
        }

        const src = ac.createBufferSource();
        src.buffer = buf;
        src.loop = true;

        const f = ac.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 520;
        f.Q.value = 0.6;

        const lfo = ac.createOscillator();
        lfo.frequency.value = 0.06;

        const lg = ac.createGain();
        lg.gain.value = 220;

        lfo.connect(lg);
        lg.connect(f.frequency);

        this.ambGain = ac.createGain();
        this.ambGain.gain.value = 0.5;

        src.connect(f);
        f.connect(this.ambGain);
        this.ambGain.connect(this.master);
        src.start();
        lfo.start();
      } catch (e) {}
    },

    /* ------------------------------------------------------
       TOGGLE — must be called from a user gesture
       ------------------------------------------------------ */
    toggle() {
      this.init();
      if (!this.ready) return false;

      this.on = !this.on;

      try {
        if (this.ac.state === 'suspended') this.ac.resume();
        this.master.gain.cancelScheduledValues(this.ac.currentTime);
        this.master.gain.setTargetAtTime(this.on ? 0.36 : 0, this.ac.currentTime, 0.4);
      } catch (e) {}

      try { localStorage.setItem('fk_sound', this.on ? '1' : '0'); } catch (e) {}

      return this.on;
    },

    /* ------------------------------------------------------
       TONE — simple oscillator with envelope
       ------------------------------------------------------ */
    tone(freq, dur, type, vol, slide) {
      if (!this.on || !this.ready) return;
      try {
        const ac = this.ac;
        const t = ac.currentTime;

        const o = ac.createOscillator();
        const g = ac.createGain();

        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol || 0.14, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        o.connect(g);
        g.connect(this.master);

        o.start(t);
        o.stop(t + dur + 0.05);
      } catch (e) {}
    },

    /* ------------------------------------------------------
       NOISE — filtered burst
       ------------------------------------------------------ */
    noise(dur, freq, q, vol) {
      if (!this.on || !this.ready) return;
      try {
        const ac = this.ac;
        const t = ac.currentTime;
        const len = Math.ceil(ac.sampleRate * dur);
        const b = ac.createBuffer(1, len, ac.sampleRate);
        const d = b.getChannelData(0);

        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        }

        const s = ac.createBufferSource();
        s.buffer = b;

        const f = ac.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = freq;
        f.Q.value = q || 1;

        const g = ac.createGain();
        g.gain.value = vol || 0.2;

        s.connect(f);
        f.connect(g);
        g.connect(this.master);
        s.start(t);
      } catch (e) {}
    },

    /* ------------------------------------------------------
       SFX PRESETS
       ------------------------------------------------------ */
    splash() {
      this.noise(0.55, 900, 0.7, 0.26);
      this.noise(0.9, 240, 0.9, 0.16);
    },

    tick() {
      this.tone(1180, 0.06, 'sine', 0.10);
    },

    strike() {
      this.tone(660, 0.09, 'triangle', 0.09);
    },

    catchGood() {
      [587.33, 880, 1174.66].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.7, 'sine', 0.11), i * 110);
      });
      this.noise(0.4, 600, 0.8, 0.2);
    },

    escape() {
      this.tone(320, 0.5, 'sine', 0.07, 180);
      this.noise(0.7, 300, 0.6, 0.1);
    },

    signature() {
      [293.66, 440, 587.33, 880].forEach((f, i) => {
        setTimeout(() => this.tone(f, 1.9, 'sine', 0.055), i * 160);
      });
    }
  };

  /* ------------------------------------------------------
     EXPORT
     ------------------------------------------------------ */
  window.Audio_ = Audio_;

})();
