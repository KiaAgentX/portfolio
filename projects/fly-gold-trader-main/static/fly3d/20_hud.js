/* Fly3D module 20/25 — DOM HUD overlay (neural telemetry) */
(function () {
  Fly3D.modules.push({
    name: 'hud',
    init() {
      const hud = document.getElementById('fly3dHud');
      if (!hud) return;
      hud.innerHTML =
        '<div class="h3d-row"><span>PAM11</span><b id="h3dPam">0</b></div>' +
        '<div class="h3d-row"><span>PPL101</span><b id="h3dPpl">0</b></div>' +
        '<div class="h3d-row"><span>KC</span><b id="h3dKc">0</b></div>' +
        '<div class="h3d-row"><span>SPIKES</span><b id="h3dSpk">0</b></div>' +
        '<div class="h3d-row"><span>SCORE</span><b id="h3dScore">0</b></div>' +
        '<div class="h3d-row"><span>FPS</span><b id="h3dFps">--</b></div>' +
        '<div class="h3d-tag" id="h3dTag">25 MODULES · WEBGL</div>';
    },
    update(dt, s) {
      const g = id => document.getElementById(id);
      if (!g('h3dPam')) return;
      g('h3dPam').textContent = (s.pam || 0).toFixed(1);
      g('h3dPpl').textContent = (s.ppl || 0).toFixed(1);
      g('h3dKc').textContent = (s.kc || 0).toFixed(1);
      g('h3dSpk').textContent = s.spikes || 0;
      const sc = g('h3dScore');
      sc.textContent = (s.score || 0).toFixed(3);
      sc.style.color = s.score > 0.05 ? '#3fb950' : s.score < -0.05 ? '#f85149' : '#d29922';
      g('h3dFps').textContent = Fly3D.fps || '--';
    },
  });
})();
