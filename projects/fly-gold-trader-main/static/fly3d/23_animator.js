/* Fly3D module 23/25 — rAF scheduler dispatching update() to all modules */
(function () {
  Fly3D.modules.push({
    name: 'animator',
    init(ctx) {
      ctx.start = () => {
        let last = performance.now();
        const loop = now => {
          const dt = Math.min((now - last) / 1000, 0.1);
          last = now;
          for (const m of Fly3D.modules) {
            if (m.update) { try { m.update(dt, Fly3D.state, ctx); } catch (e) {} }
          }
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      };
    },
    update() {},
  });
})();
