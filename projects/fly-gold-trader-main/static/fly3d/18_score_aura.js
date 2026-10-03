/* Fly3D module 18/25 — dopaminergic aura (score halo around the fly) */
(function () {
  function haloTexture() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  }
  Fly3D.modules.push({
    name: 'score_aura',
    init(ctx) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: haloTexture(), transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending }));
      sp.position.set(0, 1.2, 0);
      ctx.scene.add(sp);
      ctx.mods.score_aura = { sp };
    },
    update(dt, s, ctx) {
      const t = Fly3D.theme();
      const a = ctx.mods.score_aura.sp;
      const mag = Math.min(Math.abs(s.score), 1);
      a.material.color.setHex(s.score > 0.05 ? t.bull :
        s.score < -0.05 ? t.bear : t.neon);
      a.material.opacity = 0.15 + mag * 0.5;
      const sc = 3 + mag * 2.5 + Math.sin(performance.now() / 400) * 0.15;
      a.scale.set(sc, sc, 1);
    },
  });
})();
