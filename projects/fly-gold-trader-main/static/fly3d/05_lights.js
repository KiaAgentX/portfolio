/* Fly3D module 05/25 — cinematic lighting rig
   (hemisphere sky/ground + shadow-casting warm key, ref: Island Quest) */
(function () {
  Fly3D.modules.push({
    name: 'lights',
    init(ctx) {
      ctx.scene.add(new THREE.HemisphereLight(0x9cc9ff, 0x2a2118, 0.65));
      ctx.scene.add(new THREE.AmbientLight(0xdfe9ff, 0.12));

      const key = new THREE.DirectionalLight(0xfff4e3, 1.5);
      key.position.set(5, 9, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const sc = key.shadow.camera;
      sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8;
      sc.near = 1; sc.far = 30;
      key.shadow.bias = -0.0006; key.shadow.radius = 3;
      ctx.scene.add(key);

      const gold = new THREE.PointLight(0xffd700, 1.0, 22, 2);
      gold.position.set(0, 3.6, 0.5); ctx.scene.add(gold);
      const rim = new THREE.PointLight(0x5ce1ff, 0.8, 20, 2);
      rim.position.set(-5, 2.2, -4); ctx.scene.add(rim);
      ctx.mods.lights = { gold, rim, key };
    },
    update(dt, s, ctx) {
      const L = ctx.mods.lights;
      L.gold.intensity = 0.6 + Math.min(s.pam, 100) / 50;
      L.rim.intensity = 0.4 + Math.min(s.ppl, 60) / 45;
      L.gold.color.setHex(s.score >= 0 ? 0xffd700 : 0xff5544);
    },
  });
})();
