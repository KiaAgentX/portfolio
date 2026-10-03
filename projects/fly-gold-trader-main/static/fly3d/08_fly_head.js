/* Fly3D module 08/25 — head with glossy compound eyes (score-reactive) */
(function () {
  Fly3D.modules.push({
    name: 'fly_head',
    init(ctx) {
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x191512, roughness: 0.42,
          metalness: 0.7 }));
      head.position.set(0, 0.15, -0.62);
      head.castShadow = true;
      ctx.fly.add(head);

      // faceted-eye look: flat shading + high gloss
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x661111,
        roughness: 0.12, metalness: 0.85, emissive: 0x440000,
        emissiveIntensity: 0.9, flatShading: true });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10),
        eyeMat);
      eyeL.position.set(-0.25, 0.2, -0.84);
      const eyeR = eyeL.clone(); eyeR.material = eyeMat.clone();
      eyeR.position.x = 0.25;
      ctx.fly.add(eyeL, eyeR);

      const antMat = new THREE.MeshStandardMaterial({ color: 0x0c0a08,
        roughness: 0.6 });
      [-1, 1].forEach(side => {
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03,
          0.35, 6), antMat);
        ant.position.set(side * 0.12, 0.42, -0.95);
        ant.rotation.x = -0.7; ant.rotation.z = side * 0.3;
        ctx.fly.add(ant);
      });
      // proboscis
      const pro = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12),
        antMat);
      pro.position.set(0, -0.02, -0.98);
      ctx.fly.add(pro);

      ctx.mods.fly_head = { eyeL, eyeR };
    },
    update(dt, s, ctx) {
      const t = Fly3D.theme();
      const good = s.score > 0.05, bad = s.score < -0.05;
      const col = good ? t.bull : bad ? t.bear : 0x995522;
      const em = good ? 0x005511 : bad ? 0x550000 : 0x332200;
      [ctx.mods.fly_head.eyeL, ctx.mods.fly_head.eyeR].forEach(e => {
        e.material.color.setHex(col);
        e.material.emissive.setHex(em);
        e.material.emissiveIntensity =
          0.7 + Math.min(s.pam + s.ppl, 120) / 70;
      });
    },
  });
})();
