import * as THREE from 'three';

/** Procedural hook: torus arc + cone point. Replaces a downloaded model (spec §10 philosophy). */
export function createHook(): THREE.Group {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.85, roughness: 0.3 });

  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 10, 24, Math.PI * 1.35), steel);
  arc.rotation.z = Math.PI * 0.65;
  group.add(arc);

  const point = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), steel);
  point.position.set(0.28, 0.22, 0);
  point.rotation.z = -Math.PI * 0.75;
  group.add(point);

  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 8, 16), steel);
  eye.position.y = 0.42;
  group.add(eye);

  return group;
}

/**
 * Line from surface/boat (x=0, depth=0) to the hook, rendered as a slightly
 * sagging quadratic curve. Updated per frame from engine state.
 */
export class FishingLine {
  readonly mesh: THREE.Line;
  private geometry: THREE.BufferGeometry;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(16 * 3), 3),
    );
    const material = new THREE.LineBasicMaterial({
      color: 0xeaf6f4,
      transparent: true,
      opacity: 0.55,
    });
    this.mesh = new THREE.Line(this.geometry, material);
    this.mesh.frustumCulled = false;
  }

  update(hookX: number, hookDepth: number, tensionRatio: number): void {
    const pos = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const N = pos.count;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      // Sag increases with slack; straightens with tension.
      const sag = (1 - tensionRatio) * 1.6 * Math.sin(Math.PI * t);
      const x = hookX * t + sag * (t > 0.05 && t < 0.95 ? 1 : 0.3);
      const y = -hookDepth * t;
      pos.setXYZ(i, x, y, 0);
    }
    pos.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }
}
