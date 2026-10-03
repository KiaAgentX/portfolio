/* Fly3D module 06/25 — room shell: shader sky dome w/ stars, gradient floor,
   ambient dust, neon cage (sky technique learned from ref Game.html) */
(function () {
  const SKY_VERT = [
    'varying vec3 vDir;',
    'void main(){ vDir = normalize(position);',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'
  ].join('\n');
  const SKY_FRAG = [
    'uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGold; uniform float uTime;',
    'varying vec3 vDir;',
    'float hash(vec3 p){ p = fract(p*0.3183099 + vec3(0.1,0.2,0.3)); p*=17.0;',
    '  return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }',
    'void main(){',
    '  vec3 d = normalize(vDir);',
    '  float h = clamp(d.y, -1.0, 1.0);',
    '  vec3 col = mix(uHorizon, uZenith, pow(clamp(h,0.0,1.0), 0.55));',
    '  col = mix(col*0.35, col, smoothstep(-0.25, 0.05, h));',          // dim below horizon
    '  col += uGold * exp(-abs(h)*9.0) * 0.22;',                        // golden horizon band
    '  vec3 cell = floor(d*160.0);',
    '  float star = step(0.9975, hash(cell)) * smoothstep(0.02,0.25,h);',
    '  star *= 0.6 + 0.4*sin(uTime*2.0 + hash(cell+7.0)*40.0);',        // twinkle
    '  col += vec3(0.9,0.95,1.0) * star * 0.8;',
    '  gl_FragColor = vec4(col, 1.0); }'
  ].join('\n');

  function glowLabel(text, color, size) {
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 256;
    const g = cv.getContext('2d');
    g.font = '800 ' + (size || 110) + 'px Vazirmatn, Segoe UI, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = color; g.shadowBlur = 42;
    g.fillStyle = color;
    g.fillText(text, 512, 128);
    g.shadowBlur = 12; g.fillText(text, 512, 128);
    const tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false }));
    return sp;
  }

  function floorTexture() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 512;
    const g = cv.getContext('2d');
    const gr = g.createRadialGradient(256, 256, 30, 256, 256, 256);
    gr.addColorStop(0, '#16233a');
    gr.addColorStop(0.55, '#0b1524');
    gr.addColorStop(1, '#04080f');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    // faint concentric rings
    g.strokeStyle = 'rgba(92,225,255,0.07)';
    for (let r = 60; r < 260; r += 48) { g.beginPath(); g.arc(256, 256, r, 0, 7); g.stroke(); }
    const t = new THREE.CanvasTexture(cv);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  Fly3D.modules.push({
    name: 'room',
    init(ctx) {
      const t = Fly3D.theme();
      // ---- sky dome ----
      const sky = new THREE.Mesh(new THREE.SphereGeometry(70, 48, 24),
        new THREE.ShaderMaterial({
          uniforms: {
            uZenith: { value: new THREE.Color(0x07111f) },
            uHorizon: { value: new THREE.Color(0x1d3a5f) },
            uGold: { value: new THREE.Color(0xffd700) },
            uTime: { value: 0 },
          },
          vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
          side: THREE.BackSide, depthWrite: false, fog: false }));
      sky.renderOrder = -10;
      ctx.scene.add(sky);

      // ---- floor ----
      const floor = new THREE.Mesh(new THREE.CircleGeometry(13, 64),
        new THREE.MeshStandardMaterial({ map: floorTexture(),
          roughness: 0.55, metalness: 0.35 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      ctx.scene.add(floor);

      const grid = new THREE.GridHelper(20, 40, t.neon, 0x16283c);
      grid.material.transparent = true; grid.material.opacity = 0.22;
      grid.position.y = 0.01;
      ctx.scene.add(grid);

      // ---- neon cage + glowing pedestal ring ----
      const cage = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(15, 7.5, 15)),
        new THREE.LineBasicMaterial({ color: t.neon, transparent: true,
          opacity: 0.45 }));
      cage.position.y = 3.75; ctx.scene.add(cage);

      const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 2.1, 0.28, 48),
        new THREE.MeshStandardMaterial({ color: 0x101826, metalness: 0.7,
          roughness: 0.35 }));
      ped.position.y = 0.14; ped.receiveShadow = true; ctx.scene.add(ped);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.035, 12, 64),
        new THREE.MeshStandardMaterial({ color: t.neon, emissive: t.neon,
          emissiveIntensity: 1.4, roughness: 0.3 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.28;
      ctx.scene.add(ring);

      // ---- titles ----
      const title = glowLabel('FLY BRAIN ROOM', '#ffd700');
      title.scale.set(8, 2, 1); title.position.set(0, 6.6, -7);
      ctx.scene.add(title);
      const sub = glowLabel('166,700 NEURONS · MALE-CNS v1.0', '#5ce1ff', 64);
      sub.scale.set(8, 2, 1); sub.position.set(0, 5.6, -7);
      ctx.scene.add(sub);

      // ---- ambient dust ----
      const N = 350, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 14;
        pos[i * 3 + 1] = Math.random() * 6;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
      const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute(
        'position', new THREE.BufferAttribute(pos, 3)),
        new THREE.PointsMaterial({ color: 0x9cc9ff, size: 0.035,
          transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending,
          depthWrite: false }));
      ctx.scene.add(dust);

      ctx.mods.room = { grid, cage, sky, dust, ring };
    },
    update(dt, s, ctx) {
      const R = ctx.mods.room;
      R.sky.material.uniforms.uTime.value += dt;
      R.dust.rotation.y += dt * 0.01;
      R.grid.material.opacity = 0.16 + Math.min(s.kc, 200) / 700;
      R.ring.material.emissiveIntensity = 1 + Math.min(s.pam, 100) / 60;
    },
  });
})();
