/* Fly3D module 17/25 — EMA21 ribbon floating over the candle wall */
(function () {
  Fly3D.modules.push({
    name: 'ema_ribbon',
    init(ctx) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array(20 * 3), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0x6495ff, linewidth: 2 }));
      ctx.mods.candles3d.group.add(line);
      ctx.mods.ema_ribbon = { line };
    },
    update(dt, s, ctx) {
      const c = s.candles;
      if (!c || !c.closes || c.closes.length < 3) return;
      const closes = c.closes;
      const k = 2 / 22; let ema = closes[0];
      const vals = closes.map(p => (ema = p * k + ema * (1 - k)));
      const n = Math.min(20, vals.length);
      const hi = Math.max(...c.highs.slice(-n));
      const lo = Math.min(...c.lows.slice(-n));
      const span = Math.max(hi - lo, 1e-9);
      const attr = ctx.mods.ema_ribbon.line.geometry.attributes.position;
      for (let i = 0; i < n; i++) {
        attr.setXYZ(i, i * 0.42,
          0.35 + ((vals[vals.length - n + i] - lo) / span) * 4.2, 0.2);
      }
      attr.needsUpdate = true;
    },
  });
})();
