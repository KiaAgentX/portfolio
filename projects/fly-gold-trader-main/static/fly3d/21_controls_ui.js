/* Fly3D module 21/25 — viewport control deck (quality/rotate/theme) */
(function () {
  Fly3D.modules.push({
    name: 'controls_ui',
    init(ctx) {
      const bar = document.getElementById('fly3dControls');
      if (!bar) return;
      bar.innerHTML =
        '<button data-q="low">LOW</button>' +
        '<button data-q="mid">MID</button>' +
        '<button data-q="high" class="on">HIGH·166k</button>' +
        '<button data-r="1" class="on">ROTATE</button>' +
        '<button data-t="1">THEME</button>';
      bar.addEventListener('click', e => {
        const b = e.target;
        if (b.dataset.q) {
          Fly3D.set({ quality: b.dataset.q });
          const m = ctx.modsByName['neuron_cloud'];
          if (m && m.setQuality) m.setQuality(b.dataset.q);
          bar.querySelectorAll('[data-q]').forEach(x =>
            x.classList.toggle('on', x === b));
        }
        if (b.dataset.r) {
          Fly3D.set({ autoRotate: !Fly3D.state.autoRotate });
          b.classList.toggle('on', Fly3D.state.autoRotate);
        }
        if (b.dataset.t) {
          Fly3D.set({ theme: (Fly3D.state.theme + 1) % Fly3D.themes.length });
          const t = Fly3D.theme();
          ctx.scene.fog.color.setHex(t.bg);
          ctx.renderer.setClearColor(t.bg);
        }
      });
    },
    update() {},
  });
})();
