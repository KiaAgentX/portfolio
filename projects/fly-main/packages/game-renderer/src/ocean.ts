import * as THREE from 'three';

/**
 * Procedural ocean surface (spec §10 — no downloaded ocean model).
 * Vertex-displaced plane with animated normals, fresnel-ish tint and foam crest.
 */
export function createOceanSurface(width = 220, height = 220): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, height, 96, 96);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color('#0D3B66') },
      uTurquoise: { value: new THREE.Color('#10B6A8') },
      uSunDir: { value: new THREE.Vector3(0.3, 1, 0.4).normalize() },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec3 p = position;
        float w1 = sin(p.x * 0.12 + uTime * 0.9) * 0.9;
        float w2 = sin(p.y * 0.18 - uTime * 0.6) * 0.55;
        float w3 = sin((p.x + p.y) * 0.07 + uTime * 0.35) * 1.3;
        p.z += w1 + w2 + w3;

        // Analytic-ish normal via neighbor sampling of the same wave field.
        float eps = 0.9;
        float hL = sin((p.x - eps) * 0.12 + uTime * 0.9) * 0.9
                 + sin(p.y * 0.18 - uTime * 0.6) * 0.55
                 + sin((p.x - eps + p.y) * 0.07 + uTime * 0.35) * 1.3;
        float hR = sin((p.x + eps) * 0.12 + uTime * 0.9) * 0.9
                 + sin(p.y * 0.18 - uTime * 0.6) * 0.55
                 + sin((p.x + eps + p.y) * 0.07 + uTime * 0.35) * 1.3;
        float hD = sin(p.x * 0.12 + uTime * 0.9) * 0.9
                 + sin((p.y - eps) * 0.18 - uTime * 0.6) * 0.55
                 + sin((p.x + p.y - eps) * 0.07 + uTime * 0.35) * 1.3;
        float hU = sin(p.x * 0.12 + uTime * 0.9) * 0.9
                 + sin((p.y + eps) * 0.18 - uTime * 0.6) * 0.55
                 + sin((p.x + p.y + eps) * 0.07 + uTime * 0.35) * 1.3;
        vNormal = normalize(vec3(hL - hR, hD - hU, 2.0 * eps));

        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uDeepColor;
      uniform vec3 uTurquoise;
      uniform vec3 uSunDir;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec3 n = normalize(vNormal);
        float fresnel = pow(1.0 - abs(n.z), 2.2);
        float sun = pow(max(dot(n, normalize(uSunDir)), 0.0), 42.0);

        vec3 col = mix(uDeepColor, uTurquoise, fresnel * 0.9 + 0.08);
        col += vec3(1.0, 0.95, 0.85) * sun * 0.9;            // sun glints
        float crest = smoothstep(1.6, 2.6, length(vWorldPos.xz) * 0.02 + fresnel);
        col = mix(col, vec3(0.92, 0.97, 0.96), crest * 0.25);  // foam

        gl_FragColor = vec4(col, 0.94);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/** Underwater atmosphere: exponential fog color, particle field, caustic light shafts. */
export function createUnderwaterAtmosphere(scene: THREE.Scene): {
  update: (timeMs: number, depth: number) => void;
  dispose: () => void;
} {
  const disposables: { dispose(): void }[] = [];

  // Floating particles (spec §11).
  const COUNT = 600;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = -Math.random() * 520;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xbfe8e2,
    size: 0.08,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);
  disposables.push(pGeo, pMat);

  // Caustic light shafts near the surface (fade with depth).
  const shaftGeo = new THREE.PlaneGeometry(1.4, 90);
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0x9fe8dd,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const shafts = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(shaftGeo, shaftMat);
    s.position.set((i - 3.5) * 4.2, -45, -6);
    s.rotation.z = 0.18 + i * 0.02;
    shafts.add(s);
  }
  scene.add(shafts);
  disposables.push(shaftGeo, shaftMat);

  const update = (timeMs: number, depth: number): void => {
    const t = timeMs * 0.001;
    particles.position.y = Math.sin(t * 0.4) * 1.5;
    shafts.visible = depth < 120;
    shafts.rotation.z = Math.sin(t * 0.1) * 0.03;
    shaftMat.opacity = Math.max(0, 0.07 * (1 - depth / 120));

    // Depth color shift (spec §11): lighter turquoise → abyss navy.
    const k = Math.min(depth / 420, 1);
    const fog = new THREE.Color().lerpColors(
      new THREE.Color('#1B7A8C'),
      new THREE.Color('#04121F'),
      k,
    );
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(fog);
      scene.fog.density = 0.012 + k * 0.02;
    }
  };

  const dispose = (): void => {
    scene.remove(particles, shafts);
    disposables.forEach((d) => d.dispose());
  };

  return { update, dispose };
}
