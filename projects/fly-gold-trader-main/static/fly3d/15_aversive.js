/* Fly3D module 15/25 — PPL101 aversive cloud (magenta punishment) */
(function () {
  Fly3D.modules.push({
    name: 'aversive',
    init(ctx) {
      const em = Fly3D.makeEmitter(0xc026d3, 300);
      ctx.scene.add(em.points);
      ctx.mods.aversive = { em, acc: 0 };
    },
    update(dt, s, ctx) {
      const A = ctx.mods.aversive;
      A.acc += dt * Math.min(s.ppl, 80) / 6;
      const n = Math.floor(A.acc); A.acc -= n;
      if (n > 0) A.em.spawn(n, [0, 0.9, 0.6], 0.9, -0.6); // sinks downward
      A.em.tick(dt);
      A.em.points.material.opacity = 0.35 + Math.min(s.ppl, 80) / 130;
    },
  });
})();
