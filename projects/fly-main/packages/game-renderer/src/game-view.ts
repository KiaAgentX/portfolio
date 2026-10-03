import * as THREE from 'three';
import { FishkalEngine } from '@fishkal/game-core';
import type { GameConfig } from '@fishkal/config';
import type { PlayerLoadout, RunSnapshot } from '@fishkal/game-core';
import { FishMeshFactory, RARITY_COLORS } from './fish.js';
import { GlbFishFactory } from './glb-fish.js';
import { createHook, FishingLine } from './hooks.js';
import { createOceanSurface, createUnderwaterAtmosphere } from './ocean.js';
import { Sfx } from './sfx.js';
import type { SfxName } from './sfx.js';

export interface GameViewOptions {
  container: HTMLElement;
  config: GameConfig;
  loadout?: PlayerLoadout;
  seed?: number;
  onStateChange?: (state: string) => void;
  onEvent?: (kind: string, data?: Record<string, unknown>) => void;
  onResults?: (stats: { score: number; catches: number; maxCombo: number; maxDepth: number; elapsedMs: number; provisionalCredits: number }) => void;
}

/** Performance profile (spec §89) — can be switched at runtime. */
export type PerfMode = 'AUTO' | 'HIGH' | 'BALANCED' | 'LOW';

const PERF_SETTINGS: Record<PerfMode, { particles: number; pixelRatioCap: number }> = {
  AUTO: { particles: 600, pixelRatioCap: 2 },
  HIGH: { particles: 900, pixelRatioCap: 2 },
  BALANCED: { particles: 400, pixelRatioCap: 1.5 },
  LOW: { particles: 150, pixelRatioCap: 1 },
};

/** Renders the Deep Catch game around the engine; UI (HUD/menus) stays in React. */
export class GameView {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private engine: FishkalEngine;
  private factory = new FishMeshFactory();
  private line: FishingLine;
  private hookGroup: THREE.Group;
  private atmosphere: ReturnType<typeof createUnderwaterAtmosphere>;
  private fishViews = new Map<number, { group: THREE.Group; speciesId: string; fromGlb: boolean }>();
  private raf = 0;
  private lastTime = 0;
  private acc = 0;
  private running = false;
  private container: HTMLElement;
  private perfMode: PerfMode = 'AUTO';
  /** Procedural SFX (roadmap 2.4) — swap with CC0 samples later via Sfx. */
  readonly sfx = new Sfx();
  /** GLB fish pipeline (roadmap 2.3/2.6) — falls back to procedural per species. */
  readonly glbFish = new GlbFishFactory();

  constructor(private options: GameViewOptions) {
    const container = options.container;
    this.container = container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(58, container.clientWidth / container.clientHeight, 0.1, 600);

    this.scene.fog = new THREE.FogExp2(0x1b7a8c, 0.014);
    this.scene.background = new THREE.Color(0x0d3b66);

    // Lighting: dim sun + caustic fill.
    this.scene.add(new THREE.HemisphereLight(0xbfe8e2, 0x072540, 0.9));
    const sun = new THREE.DirectionalLight(0xfff3d6, 1.1);
    sun.position.set(6, 40, 8);
    this.scene.add(sun);

    const ocean = createOceanSurface();
    ocean.position.y = 0;
    this.scene.add(ocean);

    this.atmosphere = createUnderwaterAtmosphere(this.scene);

    this.hookGroup = createHook();
    this.scene.add(this.hookGroup);
    this.line = new FishingLine();
    this.scene.add(this.line.mesh);

    this.engine = new FishkalEngine({
      config: options.config,
      loadout: options.loadout,
      seed: options.seed,
      onStateChange: (s) => options.onStateChange?.(s),
      onEvent: (e) => {
        this.playEventSfx(e.kind);
        options.onEvent?.(e.kind, e.data);
      },
    });

    window.addEventListener('resize', this.onResize);
    this.bindInput();

    // Prefetch production fish GLBs if present (no-op when assets not yet added).
    const modelBase = (import.meta as unknown as { env?: Record<string, string> }).env?.PUBLIC_URL ?? '';
    this.glbFish.prefetch(
      options.config.fish.map((f) => f.id),
      [`${modelBase}/models`, '/models'],
    );
  }

  /** Map engine events to sounds; unknown kinds stay silent. */
  /** Hot-replace the player's upgrade loadout (applies on the next run). */
  applyLoadout(loadout: PlayerLoadout): void {
    this.engine.setLoadout(loadout);
  }

  private playEventSfx(kind: string): void {
    const map: Record<string, SfxName> = {
      CATCH: 'catch',
      ESCAPE: 'escape',
      LINE_BREAK: 'line_break',
      SHARK_HIT: 'danger',
      DEPTH_ZONE: 'depth_zone',
    };
    const name = map[kind];
    if (name) this.sfx.play(name);
  }

  private onResize = (): void => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  // ---- Public API ------------------------------------------------------------

  startGame(): void {
    this.sfx.resume(); // user gesture — unlock audio
    this.engine.start();
    this.running = true;
    this.lastTime = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
    this.sfx.play('splash');
  }

  setPerfMode(mode: PerfMode): void {
    this.perfMode = mode;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, PERF_SETTINGS[mode].pixelRatioCap));
  }

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.unbindInput();
    this.atmosphere.dispose();
    this.factory.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  getEngine(): FishkalEngine {
    return this.engine;
  }

  // ---- Internals -------------------------------------------------------------

  private tick = (now: number): void => {
    this.raf = requestAnimationFrame(this.tick);
    const frameMs = Math.min(now - this.lastTime, 100);
    this.lastTime = now;
    if (!this.running) return;

    // Fixed-timestep accumulation (spec §27: simulation separate from rendering).
    this.acc += frameMs / 1000;
    const DT = 1 / 60;
    while (this.acc >= DT) {
      this.engine.update(DT);
      this.acc -= DT;
    }

    this.syncScene();
    this.atmosphere.update(now, this.engine.getHook().depth);
    this.renderer.render(this.scene, this.camera);

    if (this.engine.getState() === 'RESULTS' && this.options.onResults) {
      this.running = false;
      const stats = this.engine.getStats();
      this.options.onResults(stats);
    }
  };

  private syncScene(): void {
    const snap = this.engine.getSnapshot();
    this.syncFish(snap);
    this.syncHook(snap);
    this.syncCamera(snap.hook.depth);
  }

  private syncFish(snap: RunSnapshot): void {
    const seen = new Set<number>();
    for (const f of snap.fish) {
      seen.add(f.entityId);
      let view = this.fishViews.get(f.entityId);
      if (!view) {
        const species = this.options.config.fish.find((s) => s.id === f.speciesId);
        if (!species) continue;
        // GLB when cached (2.6), procedural fallback otherwise — never break.
        const model = this.glbFish.createSync(species);
        const group = model.group;
        this.scene.add(group);
        view = { group, speciesId: f.speciesId, fromGlb: model.fromGlb };
        this.fishViews.set(f.entityId, view);
        group.position.set(f.x, -f.depth, -6);
      }
      view.group.position.x = f.x;
      view.group.position.y = -f.depth;
      view.group.rotation.y = f.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (view.fromGlb === false) this.factory.animateTail(view.group, performance.now(), 1.2);
    }
    for (const [id, view] of this.fishViews) {
      if (!seen.has(id)) {
        this.scene.remove(view.group);
        this.fishViews.delete(id);
        // Geometry/materials are shared per factory; nothing else to dispose here.
      }
    }
  }

  private syncHook(snap: RunSnapshot): void {
    const h = snap.hook;
    this.hookGroup.position.set(h.x, -h.depth, 0);
    this.line.update(h.x, h.depth, h.tensionRatio);
  }

  private syncCamera(depth: number): void {
    // Camera trails the hook: slight lead above and behind, smooth damped.
    const targetY = -depth + 4.5;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
    this.camera.position.z = 14;
    this.camera.lookAt(this.hookGroup.position.x * 0.35, targetY - 1.2, -4);
  }

  // ---- Input (spec §16: touch drag / mouse / keys) ---------------------------

  private inputActive = false;
  private inputStartX = 0;
  private inputLastX = 0;

  private bindInput(): void {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    el.style.touchAction = 'none';
  }

  private unbindInput(): void {
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.sfx.resume(); // first interaction unlocks audio
    this.inputActive = true;
    this.inputStartX = e.clientX;
    this.inputLastX = e.clientX;
    // Hold = reel (§18 pump-and-reel). Only consumed during a fight.
    this.engine.reel();
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.inputActive) return;
    const dx = e.clientX - this.inputLastX;
    this.inputLastX = e.clientX;
    const norm = Math.max(-1, Math.min(1, dx * 0.12));
    this.engine.setInput(norm);
  };

  private onPointerUp = (): void => {
    this.inputActive = false;
    this.engine.setInput(0);
    this.engine.stopReel();
  };

  private keys = new Set<string>();

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key);
    this.applyKeys();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key);
    this.applyKeys();
  };

  private applyKeys(): void {
    let dir = 0;
    if (this.keys.has('a') || this.keys.has('ArrowLeft')) dir -= 1;
    if (this.keys.has('d') || this.keys.has('ArrowRight')) dir += 1;
    if (dir !== 0) this.engine.setInput(dir);
    else if (!this.inputActive) this.engine.setInput(0);
    // Space = reel (hold during a fight to win the stamina reel-off).
    if (this.keys.has(' ')) this.engine.reel();
    else if (!this.inputActive) this.engine.stopReel();
  }
}
