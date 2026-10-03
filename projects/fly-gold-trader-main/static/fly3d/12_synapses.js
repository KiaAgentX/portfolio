/* Fly3D module 12/25 — synapse firings (line bursts ∝ spikes) */
(function () {
  const MAX = 240;
  Fly3D.modules.push({
    name: 'synapses',
    init(ctx) {
      const pos = new Float32Array(MAX * 6);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({
        color: Fly3D.theme().neon, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, depthWrite: false }));
      ctx.fly.add(lines);
      ctx.mods.synapses = { lines, ttl: new Float32Array(MAX), pos };
    },
    update(dt, s, ctx) {
      const S = ctx.mods.synapses;
      const want = Math.min(MAX, Math.floor((s.spikes || 0) / 8));
      for (let i = 0; i < MAX; i++) {
        S.ttl[i] -= dt;
        if (S.ttl[i] <= 0 && i < want) {
          // random synapse inside the cloud
          const a = () => [(Math.random() - 0.5) * 2.6,
            0.25 + (Math.random() - 0.5) * 1.6,
            -0.2 + (Math.random() - 0.5) * 3.6];
          const p = a(), q = a();
          S.pos.set([...p, ...q], i * 6);
          S.ttl[i] = 0.25 + Math.random() * 0.4;
        } else if (S.ttl[i] <= 0) {
          S.pos.fill(0, i * 6, i * 6 + 6);
        }
      }
      S.lines.geometry.attributes.position.needsUpdate = true;
    },
  });
})();
