/**
 * GLB fish pipeline (roadmap 2.3 + 2.6).
 * Loads production GLB models when present in /public/models/fish/<speciesId>.glb,
 * tints them by rarity, and falls back to the procedural mesh when a model is
 * missing — the game must never break on a missing asset (spec §103, §89).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { FishSpeciesDef } from '@fishkal/shared';
import { FishMeshFactory, RARITY_COLORS } from './fish.js';

export interface FishModelResult {
  group: THREE.Group;
  /** True when a real GLB was used; false = procedural fallback. */
  fromGlb: boolean;
}

export class GlbFishFactory {
  private loader = new GLTFLoader();
  private fallback = new FishMeshFactory();
  private cache = new Map<string, THREE.Group>();

  /** Kick off a prefetch; failures are silently tolerated. */
  prefetch(speciesIds: string[], baseUrls: string[]): void {
    for (const id of speciesIds) void this.loadTemplate(id, baseUrls);
  }

  async create(species: FishSpeciesDef, baseUrls: string[]): Promise<FishModelResult> {
    const template = await this.loadTemplate(species.id, baseUrls);
    if (!template) {
      return { group: this.fallback.create(species), fromGlb: false };
    }
    const group = template.clone(true);
    this.applyRarityTint(group, species);
    group.scale.multiplyScalar(species.size);
    return { group, fromGlb: true };
  }

  /** Synchronous path used by the hot render loop: cache hit → GLB, miss → fallback. */
  createSync(species: FishSpeciesDef): FishModelResult {
    const template = this.cache.get(species.id);
    if (!template) return { group: this.fallback.create(species), fromGlb: false };
    const group = template.clone(true);
    this.applyRarityTint(group, species);
    group.scale.multiplyScalar(species.size);
    return { group, fromGlb: true };
  }

  isGlbAvailable(speciesId: string): boolean {
    return this.cache.has(speciesId);
  }

  private applyRarityTint(root: THREE.Object3D, species: FishSpeciesDef): void {
    // Tint materials toward the rarity color so rarity stays readable on GLBs.
    const tint = new THREE.Color(RARITY_COLORS[species.rarity]);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (std.color) std.color.lerp(tint, species.rarity === 'LEGENDARY' ? 0.55 : 0.3);
        if (species.rarity === 'LEGENDARY' || species.rarity === 'EPIC') {
          std.emissive = new THREE.Color(RARITY_COLORS[species.rarity]);
          std.emissiveIntensity = 0.3;
        }
      }
    });
  }

  private loadTemplate(speciesId: string, baseUrls: string[]): Promise<THREE.Group | null> {
    const cached = this.cache.get(speciesId);
    if (cached) return Promise.resolve(cached);
    const inflight = this.inflight.get(speciesId);
    if (inflight) return inflight;

    const attempt = async (): Promise<THREE.Group | null> => {
      for (const base of baseUrls) {
        const url = `${base.replace(/\/$/, '')}/fish/${speciesId}.glb`;
        try {
          const gltf = await this.loader.loadAsync(url);
          const scene = gltf.scene;
          // Normalize: center + fit to ~1 unit length for consistent scaling.
          const box = new THREE.Box3().setFromObject(scene);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);
          if (size.length() > 0) scene.scale.multiplyScalar(1 / Math.max(size.x, size.y, size.z));
          scene.position.sub(center.multiplyScalar(scene.scale.x));
          this.cache.set(speciesId, scene);
          return scene;
        } catch {
          // Try next base; missing file is expected until assets land (ASSET_REQUIRED).
        }
      }
      return null;
    };
    const p = attempt().then((g) => {
      this.inflight.delete(speciesId);
      return g;
    });
    this.inflight.set(speciesId, p);
    return p;
  }

  private inflight = new Map<string, Promise<THREE.Group | null>>();
}
