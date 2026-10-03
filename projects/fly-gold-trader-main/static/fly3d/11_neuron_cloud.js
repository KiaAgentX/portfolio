/* Fly3D module 11/25 — connectome: up to 166,700 soft glowing neuron orbs */
(function () {
  const COUNTS = { low: 20000, mid: 80000, high: 166700 };
  function dotTexture() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 64;
    const g = cv.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 1, 32, 32, 30);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.35, 'rgba(255,255,255,0.5)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  }
  function build(count, theme) {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color(theme.neuron);
    const c2 = new THREE.Color(0x5ce1ff);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.5);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = Math.sin(ph) * Math.cos(th) * r * 1.45;
      pos[i * 3 + 1] = 0.28 + Math.cos(ph) * r * 0.85;
      pos[i * 3 + 2] = -0.15 + Math.sin(ph) * Math.sin(th) * r * 2.0;
      const mix = Math.random();
      col[i * 3] = c.r * (1 - mix) + c2.r * mix;
      col[i * 3 + 1] = c.g * (1 - mix) + c2.g * mix;
      col[i * 3 + 2] = c.b * (1 - mix) + c2.b * mix;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }
  Fly3D.modules.push({
    name: 'neuron_cloud',
    init(ctx) {
      const mat = new THREE.PointsMaterial({ size: 0.075,
        map: dotTexture(), vertexColors: true, transparent: true,
        opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
        sizeAttenuation: true });
      ctx.points = new THREE.Points(build(COUNTS.high, Fly3D.theme()), mat);
      ctx.points.renderOrder = 3;
      ctx.fly.add(ctx.points);
      ctx.setQuality = q => {
        ctx.points.geometry.dispose();
        ctx.points.geometry = build(COUNTS[q] || COUNTS.high, Fly3D.theme());
      };
    },
    update(dt, s, ctx) {
      ctx.points.rotation.y += dt * 0.06;
      ctx.points.material.opacity =
        0.5 + Math.min(s.spikes || 0, 3000) / 3500;
      ctx.points.material.size = 0.06 + Math.min(s.kc, 200) / 5000;
    },
  });
})();
