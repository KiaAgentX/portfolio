/* Fly3D module 10/25 — six articulated legs with idle sway */
(function () {
  Fly3D.modules.push({
    name: 'fly_legs',
    init(ctx) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c,
        roughness: 0.7 });
      const legs = [];
      for (let i = 0; i < 6; i++) {
        const side = i < 3 ? -1 : 1, k = i % 3;
        const leg = new THREE.Group();
        const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02,
          0.7, 6), mat);
        upper.position.y = -0.3; upper.rotation.z = side * 0.9;
        const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.012,
          0.75, 6), mat);
        lower.position.set(side * 0.55, -0.62, 0);
        lower.rotation.z = side * -0.5;
        leg.add(upper, lower);
        leg.position.set(side * 0.3, 0, -0.35 + k * 0.4);
        ctx.fly.add(leg); legs.push(leg);
      }
      ctx.mods.fly_legs = { legs };
    },
    update(dt, s, ctx) {
      const t = performance.now() / 500;
      ctx.mods.fly_legs.legs.forEach((leg, i) => {
        leg.rotation.y = Math.sin(t + i * 1.1) * 0.08;
      });
      // hovering figure-8 while watching the chart + confidence lift
      ctx.fly.position.y = 1.15 + Math.sin(t * 0.9) * 0.06 +
        Math.min(s.conf, 1) * 0.12;
      ctx.fly.position.x = Math.sin(t * 0.23) * 0.3;
      ctx.fly.position.z = Math.cos(t * 0.17) * 0.22;
      ctx.fly.rotation.z = Math.sin(t * 0.4) * 0.04;   // idle banking
    },
  });
})();
