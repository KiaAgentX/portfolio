/* Fly3D module 09/25 — realistic membranous wings: vein texture, proper
   scale, ghost pair for motion blur. Flap speed ∝ KC Hz. */
(function () {
  function wingTexture() {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 128;
    const g = cv.getContext('2d');
    g.clearRect(0, 0, 256, 128);
    // membrane
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, 'rgba(190,225,255,0.55)');
    gr.addColorStop(0.6, 'rgba(160,205,245,0.28)');
    gr.addColorStop(1, 'rgba(140,190,235,0.12)');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(4, 64);
    g.quadraticCurveTo(90, 8, 236, 40);
    g.quadraticCurveTo(252, 62, 232, 84);
    g.quadraticCurveTo(110, 122, 4, 78);
    g.closePath(); g.fill();
    // veins
    g.strokeStyle = 'rgba(90,130,170,0.8)'; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      g.beginPath(); g.moveTo(6, 66);
      g.quadraticCurveTo(110, 20 + i * 22, 240, 42 + i * 12);
      g.stroke();
    }
    g.strokeStyle = 'rgba(120,160,200,0.9)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(4, 70); g.quadraticCurveTo(120, 55, 244, 60);
    g.stroke();
    const tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }
  function wingShape() {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.quadraticCurveTo(0.9, 0.5, 2.0, 0.22);
    sh.quadraticCurveTo(2.35, 0.04, 2.05, -0.22);
    sh.quadraticCurveTo(1.0, -0.46, 0, -0.1);
    return sh;
  }
  Fly3D.modules.push({
    name: 'fly_wings',
    init(ctx) {
      const geo = new THREE.ShapeGeometry(wingShape(), 16);
      const mk = (opacity, ghost) => new THREE.MeshStandardMaterial({
        map: wingTexture(), transparent: true, opacity,
        side: THREE.DoubleSide, roughness: 0.15, metalness: 0.05,
        depthWrite: false, color: ghost ? 0x88bbff : 0xffffff,
        emissive: 0x112233, emissiveIntensity: 0.2 });
      const S = 0.52;                       // << real fly proportions
      const wR = new THREE.Mesh(geo, mk(0.75, false));
      wR.scale.set(S, S, S); wR.position.set(0.16, 0.4, 0.05);
      wR.castShadow = false;
      const wL = new THREE.Mesh(geo, mk(0.75, false));
      wL.scale.set(-S, S, S); wL.position.set(-0.16, 0.4, 0.05);
      // ghost pair = cheap motion blur
      const gR = new THREE.Mesh(geo, mk(0.2, true));
      gR.scale.set(S, S, S); gR.position.copy(wR.position);
      const gL = new THREE.Mesh(geo, mk(0.2, true));
      gL.scale.set(-S, S, S); gL.position.copy(wL.position);
      ctx.fly.add(wR, wL, gR, gL);
      ctx.mods.fly_wings = { wL, wR, gL, gR, phase: 0 };
    },
    update(dt, s, ctx) {
      const W = ctx.mods.fly_wings;
      W.phase += dt * (7 + Math.min(s.kc, 200) / 5);
      const a = Math.sin(W.phase) * (0.4 + Math.min(s.kc, 200) / 450);
      const a2 = Math.sin(W.phase - 0.55) * (0.4 + Math.min(s.kc, 200) / 450);
      W.wR.rotation.z = -0.18 - a;  W.wL.rotation.z = 0.18 + a;
      W.gR.rotation.z = -0.18 - a2; W.gL.rotation.z = 0.18 + a2;
      const sweep = 0.3 + Math.sin(W.phase * 0.5) * 0.1;
      W.wR.rotation.y = sweep;  W.wL.rotation.y = -sweep;
      W.gR.rotation.y = sweep;  W.gL.rotation.y = -sweep;
    },
  });
})();
