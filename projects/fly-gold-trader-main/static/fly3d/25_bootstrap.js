/* Fly3D module 25/25 — ordered bootstrap + graceful 2D fallback */
(function () {
  Fly3D.boot = function () {
    const ctx = { mods: {}, modsByName: {} };
    try {
      for (const m of Fly3D.modules) {
        if (m.init) m.init(ctx);
        ctx.modsByName[m.name] = m;
      }
      ctx.renderer.setClearColor(Fly3D.theme().bg);
      ctx.start();
      Fly3D.ok = true;
      console.info('[Fly3D] ' + Fly3D.modules.length + ' modules online');
    } catch (e) {
      console.warn('[Fly3D] falling back to 2D room:', e.message);
      Fly3D.ok = false;
      const vp = document.getElementById('fly3dViewport');
      const flat = document.getElementById('flyCanvas2d');
      if (vp && flat) { vp.classList.add('flat'); flat.style.display = 'block'; }
      if (window.__fly2d) window.__fly2d();   // dashboard 2D renderer
    }
  };
  Fly3D.modules.push({ name: 'bootstrap', init() {}, update() {} });
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', Fly3D.boot);
  else Fly3D.boot();
})();
