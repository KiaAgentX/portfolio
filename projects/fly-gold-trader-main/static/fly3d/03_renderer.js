/* Fly3D module 03/25 — renderer: ACES filmic tone mapping, sRGB, soft shadows
   (technique learned from the attached 3D-Island-Quest reference) */
(function () {
  Fly3D.modules.push({
    name: 'renderer',
    init(ctx) {
      if (typeof THREE === 'undefined') throw new Error('three.js missing');
      const canvas = document.getElementById('fly3dCanvas');
      if (!canvas) throw new Error('no #fly3dCanvas');
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true,
          alpha: false, powerPreference: 'high-performance' });
      } catch (e) { throw new Error('WebGL unavailable: ' + e.message); }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x07111f);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a1626, 0.02);

      ctx.renderer = renderer; ctx.scene = scene; ctx.canvas = canvas;
      ctx.fly = new THREE.Group();
      ctx.fly.position.set(0, 1.15, 0);
      scene.add(ctx.fly);

      ctx.resize = () => {
        const w = canvas.clientWidth || 300, h = canvas.clientHeight || 300;
        renderer.setSize(w, h, false);
        if (ctx.camera) {
          ctx.camera.aspect = w / h; ctx.camera.updateProjectionMatrix();
        }
      };
      window.addEventListener('resize', ctx.resize);
      ctx.resize();
    },
    update(dt, s, ctx) {
      ctx.renderer.render(ctx.scene, ctx.camera);
    },
  });
})();
