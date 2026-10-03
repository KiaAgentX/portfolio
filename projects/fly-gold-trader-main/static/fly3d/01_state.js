/* Fly3D module 01/25 — state store (pub/sub) */
(function () {
  const listeners = [];
  const state = {
    pam: 0, ppl: 0, kc: 0, score: 0, spikes: 0, label: '--', conf: 0,
    price: 0, running: false, status: 'loading', mode: 'paper',
    candles: null,           // {closes,highs,lows,opens}
    quality: 'high', autoRotate: true, theme: 0,
  };
  window.Fly3D = window.Fly3D || { modules: [], state };
  Fly3D.state = state;
  Fly3D.onChange = fn => listeners.push(fn);
  Fly3D.set = patch => {
    Object.assign(state, patch);
    listeners.forEach(fn => { try { fn(state); } catch (e) {} });
  };
  Fly3D.modules.push({ name: 'state', init() {}, update() {} });
})();
