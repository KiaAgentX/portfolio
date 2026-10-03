/* Fly3D module 04/25 — orbit camera rig (drag rotate, wheel zoom) */
(function () {
  Fly3D.modules.push({
    name: 'camera',
    init(ctx) {
      const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
      ctx.camera = cam;
      const rig = { yaw: 0.6, pitch: 0.35, dist: 9, tYaw: 0.6,
                    tPitch: 0.35, tDist: 9 };
      ctx.rig = rig;
      const el = ctx.canvas;
      let dragging = false, px = 0, py = 0;
      el.addEventListener('pointerdown', e => { dragging = true; px = e.clientX; py = e.clientY; });
      window.addEventListener('pointerup', () => dragging = false);
      window.addEventListener('pointermove', e => {
        if (!dragging) return;
        rig.tYaw -= (e.clientX - px) * 0.005;
        rig.tPitch = Math.max(-0.2, Math.min(1.2,
          rig.tPitch + (e.clientY - py) * 0.004));
        px = e.clientX; py = e.clientY;
      });
      el.addEventListener('wheel', e => {
        e.preventDefault();
        rig.tDist = Math.max(4, Math.min(18, rig.tDist + e.deltaY * 0.01));
      }, { passive: false });
      ctx.resize();
    },
    update(dt, s, ctx) {
      const r = ctx.rig;
      if (s.autoRotate && !document.querySelector('#fly3dCanvas:active'))
        r.tYaw += dt * 0.12;
      r.yaw += (r.tYaw - r.yaw) * 0.08;
      r.pitch += (r.tPitch - r.pitch) * 0.08;
      r.dist += (r.tDist - r.dist) * 0.1;
      const c = ctx.camera;
      c.position.set(
        Math.sin(r.yaw) * Math.cos(r.pitch) * r.dist,
        1.4 + Math.sin(r.pitch) * r.dist * 0.7,
        Math.cos(r.yaw) * Math.cos(r.pitch) * r.dist);
      c.lookAt(0, 1.1, 0);
    },
  });
})();
