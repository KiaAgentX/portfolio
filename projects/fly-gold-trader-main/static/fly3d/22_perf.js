/* Fly3D module 22/25 — FPS meter + automatic quality degradation */
(function () {
  Fly3D.modules.push({
    name: 'perf',
    init(ctx) {
      ctx.mods.perf = { frames: 0, t: performance.now(), slow: 0 };
    },
    update(dt, s, ctx) {
      const P = ctx.mods.perf;
      P.frames++;
      const now = performance.now();
      if (now - P.t >= 1000) {
        Fly3D.fps = Math.round(P.frames * 1000 / (now - P.t));
        P.frames = 0; P.t = now;
        if (Fly3D.fps < 26 && s.quality === 'high') {
          P.slow++;
          if (P.slow >= 3) {          // 3 slow seconds -> step down
            const next = s.quality === 'high' ? 'mid' : 'low';
            Fly3D.set({ quality: next });
            const m = ctx.modsByName['neuron_cloud'];
            if (m && m.setQuality) m.setQuality(next);
            P.slow = 0;
          }
        } else P.slow = 0;
      }
    },
  });
})();
