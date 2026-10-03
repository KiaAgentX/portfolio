/* Fly3D module 13/25 — shared pooled particle emitter (used by 14/15) */
(function () {
  Fly3D.makeEmitter = function (color, max) {
    const pos = new Float32Array(max * 3);
    const vel = new Float32Array(max * 3);
    const life = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      color, size: 0.09, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false }));
    return {
      points,
      spawn(n, origin, spread, up) {
        let spawned = 0;
        for (let i = 0; i < max && spawned < n; i++) {
          if (life[i] > 0) continue;
          life[i] = 0.8 + Math.random() * 0.9;
          pos[i * 3] = origin[0] + (Math.random() - 0.5) * spread;
          pos[i * 3 + 1] = origin[1] + (Math.random() - 0.5) * spread;
          pos[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * spread;
          vel[i * 3] = (Math.random() - 0.5) * 0.8;
          vel[i * 3 + 1] = up * (0.5 + Math.random());
          vel[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
          spawned++;
        }
      },
      tick(dt) {
        for (let i = 0; i < max; i++) {
          if (life[i] <= 0) { pos[i * 3 + 1] = -999; continue; }
          life[i] -= dt;
          pos[i * 3] += vel[i * 3] * dt;
          pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
          pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        }
        geo.attributes.position.needsUpdate = true;
      },
    };
  };
  Fly3D.modules.push({ name: 'particle_core', init() {}, update() {} });
})();
