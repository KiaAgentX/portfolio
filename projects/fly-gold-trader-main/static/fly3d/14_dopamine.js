/* Fly3D module 14/25 — PAM11 dopamine glow (golden reward particles) */
(function () {
  Fly3D.modules.push({
    name: 'dopamine',
    init(ctx) {
      const em = Fly3D.makeEmitter(0xffd700, 400);
      ctx.scene.add(em.points);
      ctx.mods.dopamine = { em, acc: 0 };
    },
    update(dt, s, ctx) {
      const D = ctx.mods.dopamine;
      D.acc += dt * Math.min(s.pam, 100) / 6;   // emission ∝ PAM11 Hz
      const n = Math.floor(D.acc); D.acc -= n;
      if (n > 0) D.em.spawn(n, [0, 1.3, -0.5], 0.8, 1.4);
      D.em.tick(dt);
      D.em.points.material.opacity = 0.4 + Math.min(s.pam, 100) / 150;
    },
  });
})();
