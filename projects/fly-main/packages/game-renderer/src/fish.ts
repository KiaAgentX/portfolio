import * as THREE from 'three';
import type { FishSpeciesDef, Rarity } from '@fishkal/shared';

/** Rarity → visual treatment (spec §14). Legendary gets gold + emissive pulse. */
export const RARITY_COLORS: Record<Rarity, number> = {
  COMMON: 0x9fb4c4,
  UNCOMMON: 0x4fb286,
  RARE: 0x3e8ed0,
  EPIC: 0x9b5de5,
  LEGENDARY: 0xe8b84b,
};

/**
 * Procedural low-poly fish: stretched icosahedron body + tail fin.
 * Zero downloads; species differ by scale, color, and tail rate (spec §103 allows
 * tracked procedural placeholders until production GLBs replace them — ASSET_REQUIRED).
 */
export class FishMeshFactory {
  private bodyGeo = new THREE.IcosahedronGeometry(0.5, 1);
  private tailGeo = new THREE.ConeGeometry(0.28, 0.55, 4);

  create(species: FishSpeciesDef): THREE.Group {
    const color = RARITY_COLORS[species.rarity];
    const emissive = species.rarity === 'LEGENDARY' || species.rarity === 'EPIC';
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.15,
      emissive: emissive ? color : 0x000000,
      emissiveIntensity: emissive ? 0.35 : 0,
    });

    const group = new THREE.Group();

    const body = new THREE.Mesh(this.bodyGeo, material);
    body.scale.set(1.5, 0.75, 0.45);
    group.add(body);

    const tail = new THREE.Mesh(this.tailGeo, material);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -0.85;
    group.add(tail);
    group.userData.tail = tail;

    if (species.danger) {
      // Dorsal fin to read as "shark/danger" silhouette.
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 4), material);
      fin.position.set(0.1, 0.45, 0);
      group.add(fin);
    }

    const s = species.size;
    group.scale.setScalar(s);
    return group;
  }

  animateTail(group: THREE.Group, timeMs: number, speed: number): void {
    const tail = group.userData.tail as THREE.Mesh | undefined;
    if (tail) {
      tail.rotation.y = Math.sin(timeMs * 0.012 * speed) * 0.5;
    }
  }

  dispose(): void {
    this.bodyGeo.dispose();
    this.tailGeo.dispose();
  }
}
