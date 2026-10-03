/* Fly3D module 07/25 — fly body: dark chitin w/ golden sheen, dopamine
   stripes, real shadows. Faces the candle wall like a trader. */
(function () {
  Fly3D.modules.push({
    name: 'fly_body',
    init(ctx) {
      const chitin = new THREE.MeshStandardMaterial({
        color: 0x241a10, metalness: 0.8, roughness: 0.3 });
      const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32),
        chitin);
      thorax.scale.set(1, 0.9, 1.1);
      thorax.castShadow = true;
      ctx.fly.add(thorax);

      const abdMat = new THREE.MeshStandardMaterial({
        color: 0x1b1408, metalness: 0.75, roughness: 0.32,
        emissive: 0x332200, emissiveIntensity: 0.4 });
      const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 32),
        abdMat);
      abdomen.position.set(0, -0.05, 0.85);
      abdomen.scale.set(0.85, 0.75, 1.35);
      abdomen.castShadow = true;
      ctx.fly.add(abdomen);

      // gold stripes that glow with dopamine
      const stripes = [];
      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 - i * 0.05,
          0.03, 10, 40), new THREE.MeshStandardMaterial({
          color: 0x6b5410, emissive: 0xffd700, emissiveIntensity: 0.25,
          metalness: 0.6, roughness: 0.4 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, -0.05, 0.62 + i * 0.24);
        ring.scale.set(0.85, 1, 0.8);
        ctx.fly.add(ring); stripes.push(ring);
      }

      // the fly watches the candle wall
      ctx.fly.rotation.y = 0.87;

      ctx.mods.fly_body = { thorax, abdomen, stripes };
    },
    update(dt, s, ctx) {
      const B = ctx.mods.fly_body;
      const k = 1 + Math.sin(performance.now() / 320) * 0.015;
      B.thorax.scale.set(k, 0.9 * k, 1.1 * k);
      const glow = 0.2 + Math.min(s.pam, 100) / 90;
      B.stripes.forEach((r, i) =>
        r.material.emissiveIntensity = glow * (1 - i * 0.15));
      B.abdomen.material.emissiveIntensity = 0.25 + Math.min(s.pam, 100) / 140;
    },
  });
})();
