/* Fly3D module 24/25 — socket.io bridge: server telemetry -> state */
(function () {
  Fly3D.modules.push({
    name: 'socket',
    init() {
      const sock = (typeof io !== 'undefined') ? io() : null;
      if (!sock) return;
      sock.on('update', d => {
        const f = d.fly_brain || {};
        Fly3D.set({
          pam: f.pam11 || 0, ppl: f.ppl101 || 0, kc: f.kc || 0,
          score: f.score || 0, spikes: f.spikes || 0,
          label: f.label || '--', conf: f.confidence || 0,
          status: f.status || 'live', price: d.price || 0,
          running: true, mode: d.mode || 'paper',
          candles: d.m1 || null,
        });
      });
      sock.on('disconnect', () => Fly3D.set({ running: false }));
      // restore last state so the room is alive immediately
      fetch('/api/state').then(r => r.json()).then(s => {
        const la = s.last_analysis;
        if (la && la.fly_brain) {
          const f = la.fly_brain;
          Fly3D.set({ pam: f.pam11 || 0, ppl: f.ppl101 || 0, kc: f.kc || 0,
            score: f.score || 0, spikes: f.spikes || 0,
            label: f.label || '--', candles: la.m1 || null });
        }
      }).catch(() => {});
    },
    update() {},
  });
})();
