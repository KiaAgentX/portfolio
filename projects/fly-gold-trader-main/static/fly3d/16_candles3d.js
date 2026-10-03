/* Fly3D module 16/25 — live 3D candlestick wall the fly watches */
(function () {
  const N = 20;
  Fly3D.modules.push({
    name: 'candles3d',
    init(ctx) {
      const group = new THREE.Group();
      group.position.set(-6.5, 0, -5.5);
      group.rotation.y = 0.7;
      ctx.scene.add(group);
      const items = [];
      const bull = new THREE.MeshStandardMaterial({ color: 0x1d5c33,
        emissive: 0x3fb950, emissiveIntensity: 1.1, roughness: 0.3 });
      const bear = new THREE.MeshStandardMaterial({ color: 0x6d1d1d,
        emissive: 0xf85149, emissiveIntensity: 1.1, roughness: 0.3 });
      const wick = new THREE.LineBasicMaterial({ color: 0x8b949e });
      for (let i = 0; i < N; i++) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1, 0.28),
          bull.clone());
        const wgeo = new THREE.BufferGeometry().setFromPoints(
          [new THREE.Vector3(), new THREE.Vector3()]);
        const wl = new THREE.Line(wgeo, wick);
        group.add(body, wl);
        items.push({ body, wl });
      }
      ctx.mods.candles3d = { group, items };
    },
    update(dt, s, ctx) {
      const c = s.candles;
      const C = ctx.mods.candles3d;
      if (!c || !c.closes || c.closes.length < 2) return;
      const n = Math.min(N, c.closes.length);
      const hi = Math.max(...c.highs.slice(-n));
      const lo = Math.min(...c.lows.slice(-n));
      const span = Math.max(hi - lo, 1e-9);
      const y = v => 0.3 + ((v - lo) / span) * 4.2;
      for (let i = 0; i < N; i++) {
        const it = C.items[i], j = c.closes.length - n + i;
        if (i >= n || j < 0) { it.body.visible = false; it.wl.visible = false; continue; }
        it.body.visible = true; it.wl.visible = true;
        const o = c.opens[j], cl = c.closes[j];
        const top = y(Math.max(o, cl)), bot = y(Math.min(o, cl));
        it.body.position.set(i * 0.42, (top + bot) / 2, 0);
        it.body.scale.y = Math.max(top - bot, 0.05);
        it.body.material.color.setHex(cl >= o ? 0x1d5c33 : 0x6d1d1d);
        it.body.material.emissive.setHex(cl >= o ? 0x3fb950 : 0xf85149);
        const p = it.wl.geometry.attributes.position;
        p.setXYZ(0, i * 0.42, y(c.highs[j]), 0);
        p.setXYZ(1, i * 0.42, y(c.lows[j]), 0);
        p.needsUpdate = true;
      }
    },
  });
})();
