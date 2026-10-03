/* Fly3D module 19/25 — eye/brain glow sprites (cheap bloom) */
(function () {
  Fly3D.modules.push({
    name: 'glow',
    init(ctx) {
      const mk = (color, size) => {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 64;
        const g = cv.getContext('2d');
        const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
        gr.addColorStop(0, 'rgba(255,255,255,1)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(cv), color, transparent: true,
          blending: THREE.AdditiveBlending, depthWrite: false }));
        sp.scale.set(size, size, 1);
        return sp;
      };
      const gL = mk(0xff4444, 0.7), gR = mk(0xff4444, 0.7),
            gB = mk(0xffd700, 1.6);
      gL.position.set(-0.24, 1.35, -0.82);
      gR.position.set(0.24, 1.35, -0.82);
      gB.position.set(0, 1.5, 0);
      ctx.scene.add(gL, gR, gB);
      ctx.mods.glow = { gL, gR, gB };
    },
    update(dt, s, ctx) {
      const G = ctx.mods.glow, t = Fly3D.theme();
      const ec = s.score > 0.05 ? t.bull : s.score < -0.05 ? t.bear : 0xaa6622;
      G.gL.material.color.setHex(ec); G.gR.material.color.setHex(ec);
      const pulse = 0.22 + Math.min(s.pam + s.ppl, 120) / 300;
      G.gL.material.opacity = G.gR.material.opacity = pulse;
      G.gB.material.opacity = 0.14 + Math.min(s.kc, 200) / 600;
    },
  });
})();
