/* ============================================================
   FISHKAL — Motion & Math Utilities
   ------------------------------------------------------------
   Pure functions. No DOM. No state (except the sine LUT).
   Attached to window.* for use by other modules.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     BASIC MATH
     ---------------------------------------------------------- */

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function invlerp(a, b, v) {
    return clamp((v - a) / (b - a || 1e-6), 0, 1);
  }

  function smoothstep(a, b, v) {
    const t = invlerp(a, b, v);
    return t * t * (3 - 2 * t);
  }

  /* ----------------------------------------------------------
     EASING
     ---------------------------------------------------------- */

  function easeInOut(t) {
    return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeIn(t) {
    return t * t * t;
  }

  /* Exponential damping — frame-rate independent */
  function damp(cur, tgt, lambda, dt) {
    return lerp(cur, tgt, 1 - Math.exp(-lambda * dt));
  }

  /* ----------------------------------------------------------
     SINE LOOKUP TABLE
     ------------------------------------------------------------
     Replaces Math.sin() with a faster table lookup.
     Accuracy is ~0.03% which is more than enough for wave motion.
     ---------------------------------------------------------- */

  const SIN_TABLE_SIZE = 2048;
  const SIN_TABLE = new Float32Array(SIN_TABLE_SIZE);
  const SIN_RANGE = SIN_TABLE_SIZE / (Math.PI * 2);

  for (let i = 0; i < SIN_TABLE_SIZE; i++) {
    SIN_TABLE[i] = Math.sin(i / SIN_RANGE);
  }

  function fastSin(x) {
    /* Wrap x into the table range, then look up */
    const i = ((x * SIN_RANGE) | 0) & (SIN_TABLE_SIZE - 1);
    return SIN_TABLE[i];
  }

  function fastCos(x) {
    return fastSin(x + Math.PI / 2);
  }

  /* ----------------------------------------------------------
     HASH & NOISE
     ---------------------------------------------------------- */

  function hash(n) {
    const s = Math.sin(n * 127.1) * 43758.5453123;
    return s - Math.floor(s);
  }

  function noise1(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return lerp(hash(i), hash(i + 1), u) * 2 - 1;
  }

  function fbm(x, oct) {
    let a = .5, f = 1, s = 0;
    const o = oct || 3;
    for (let i = 0; i < o; i++) {
      s += noise1(x * f) * a;
      f *= 2.03;
      a *= .5;
    }
    return s;
  }

  /* ----------------------------------------------------------
     SEEDED RNG
     ---------------------------------------------------------- */

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;  s >>>= 0;
      return s / 4294967296;
    };
  }

  /* ----------------------------------------------------------
     LAYERED OCEAN WAVE
     ------------------------------------------------------------
     Never a single sine — always three plus drift.
     Uses fastSin for the two main components.
     ---------------------------------------------------------- */

  function waveAt(x, t, amp, freq) {
    return fastSin(x * freq + t * 0.9) * amp
         + fastSin(x * freq * 2.17 - t * 1.33) * amp * 0.42
         + fastSin(x * freq * 0.51 + t * 0.47) * amp * 0.66
         + fbm(x * freq * 0.8 + t * 0.35, 2) * amp * 0.30;
  }

  /* ----------------------------------------------------------
     CONSTANTS
     ---------------------------------------------------------- */

  const TAU = Math.PI * 2;

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.clamp      = clamp;
  window.lerp       = lerp;
  window.invlerp    = invlerp;
  window.smoothstep = smoothstep;
  window.easeInOut  = easeInOut;
  window.easeOut    = easeOut;
  window.easeIn     = easeIn;
  window.damp       = damp;
  window.fastSin    = fastSin;
  window.fastCos    = fastCos;
  window.hash       = hash;
  window.noise1     = noise1;
  window.fbm        = fbm;
  window.rng        = rng;
  window.waveAt     = waveAt;
  window.TAU        = TAU;

})();
