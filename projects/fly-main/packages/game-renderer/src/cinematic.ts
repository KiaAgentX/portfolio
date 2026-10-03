/**
 * WebGL cinematic intro (spec §03, roadmap 4d) — "Dubai → boat → dive" mood
 * piece that plays over the hero section. Pure three.js, zero asset downloads:
 * boat from boxes (hull + cabin + mast), sun light, ~600 drifting particles
 * whose color shifts through the four depth zones into abyssal dark.
 * Swap point for the future HDRI + GLB boat (assets/README.md).
 */
import * as THREE from 'three';

export class CinematicIntro {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private boat = new THREE.Group();
  private particles: THREE.Points;
  private raf = 0;
  private disposed = false;
  private t = 0;
  private readonly clock = new THREE.Clock();

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);

    // Sky-to-ocean backdrop: brand navy sky, deep water below the camera path.
    this.scene.background = new THREE.Color('#0D3B66');
    this.scene.fog = new THREE.FogExp2('#0D3B66', 0.008);

    // Sun + ambient.
    const sun = new THREE.DirectionalLight('#FFE7C4', 2.2);
    sun.position.set(6, 10, 4);
    this.scene.add(sun, new THREE.AmbientLight('#7FB7D9', 0.55));

    // Water surface plane with a gentle shader-free shimmer (vertex waves).
    const surfaceGeo = new THREE.PlaneGeometry(400, 400, 40, 40);
    const surface = new THREE.Mesh(
      surfaceGeo,
      new THREE.MeshStandardMaterial({ color: '#14607F', transparent: true, opacity: 0.55, roughness: 0.25, metalness: 0.1 }),
    );
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0;
    this.scene.add(surface);
    this.surface = surface;

    // Procedural boat.
    const hullMat = new THREE.MeshStandardMaterial({ color: '#F4EFE6', roughness: 0.6 });
    const deckMat = new THREE.MeshStandardMaterial({ color: '#C9A66B', roughness: 0.7 });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 2.2), hullMat);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.6), deckMat);
    cabin.position.set(-1.2, 1.1, 0);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4), deckMat);
    mast.position.set(1.4, 2.4, 0);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.65),
      new THREE.MeshStandardMaterial({ color: '#10B6A8', side: THREE.DoubleSide }),
    );
    flag.position.set(1.95, 3.9, 0);
    this.boat.add(hull, cabin, mast, flag);
    this.boat.position.set(0, 0.55, 0);
    this.scene.add(this.boat);

    // Drifting particles (plankton/sediment) below the surface.
    const N = 600;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = -Math.random() * 120;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particles = new THREE.Points(
      pgeo,
      new THREE.PointsMaterial({ color: '#9FD8D0', size: 0.28, transparent: true, opacity: 0.65, sizeAttenuation: true }),
    );
    this.scene.add(this.particles);

    this.scene.add(new THREE.HemisphereLight('#8FD3E8', '#0B1B26', 0.4));

    this.resize();
    window.addEventListener('resize', this.resize);
    this.loop();
  }

  private surface: THREE.Mesh;

  private resize = (): void => {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.t += dt;

    // Camera: hover by the boat, then slowly descend into the deep (loops).
    const cycle = (this.t % 36) / 36; // 36s cinematic loop
    const descend = THREE.MathUtils.smoothstep(cycle, 0.12, 0.75);
    const depthY = -THREE.MathUtils.lerp(2, 110, descend);
    this.camera.position.set(9 - 6 * descend, depthY, 10 - 4 * descend);
    this.camera.lookAt(descend > 0.5 ? new THREE.Vector3(0, depthY - 14, -8) : this.boat.position);

    // Boat bobbing.
    this.boat.position.y = 0.55 + Math.sin(this.t * 1.1) * 0.22;
    this.boat.rotation.z = Math.sin(this.t * 0.9) * 0.045;
    this.boat.rotation.x = Math.cos(this.t * 0.7) * 0.03;

    // Gentle surface waves + particle drift.
    const pos = this.surface.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.12 + this.t * 1.4) * 0.35 + Math.cos(y * 0.1 + this.t) * 0.25);
    }
    pos.needsUpdate = true;

    const pp = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pp.count; i++) {
      let y = pp.getY(i) - dt * 0.7;
      if (y < -125) y = 0;
      pp.setY(i, y);
    }
    pp.needsUpdate = true;

    // Zone tint: turquoise shelf → blue → deep navy → abyss (§16).
    const zones = ['#14607F', '#1B7A8C', '#0B3550', '#04121F'];
    const idx = Math.min(3, Math.floor(descend * 4));
    const next = zones[Math.min(3, idx + 1)];
    const frac = THREE.MathUtils.clamp(descend * 4 - idx, 0, 1);
    const col = new THREE.Color(zones[idx]).lerp(new THREE.Color(next), frac);
    (this.scene.fog as THREE.FogExp2).color.copy(col);
    this.renderer.setClearColor(col, this.renderer.getClearAlpha());

    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
  }
}
