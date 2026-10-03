# FISHKAL Assets

Spec §103 — no fake assets. Everything currently "ships" procedurally in code
(see `packages/game-renderer/src`). Production-quality replacements are tracked
below as **ASSET_REQUIRED** and must be resolved before launch.

## Current (Phase 1 — procedural, no downloads)

**Phase 2 update:** `packages/game-renderer/src/glb-fish.ts` now loads any
`/public/models/fish/<speciesId>.glb` automatically (normalized, rarity-tinted) and
falls back to the procedural mesh when a file is missing. Drop more GLBs into
`apps/website/public/models/fish/` to replace procedural fish one by one.

| Asset | Implemented in | Technique |
|---|---|---|
| Ocean surface + waves + foam | `packages/game-renderer/src/ocean.ts` | Custom GLSL vertex/fragment shader |
| Underwater fog + particles + light shafts | `packages/game-renderer/src/ocean.ts` | FogExp2 + Points + additive planes |
| Fishing hook | `packages/game-renderer/src/hooks.ts` | Torus + cone geometry |
| Fishing line | `packages/game-renderer/src/hooks.ts` | Sagging polyline (tension-aware) |
| Fish (all species) | `packages/game-renderer/src/fish.ts` | Icosahedron + cone, rarity colors, tail animation |
| Dubai skyline (web) | `apps/website/src/components/Experience.tsx` | SVG silhouette (Burj Khalifa motif) |
| Fishkal boat (web) | `apps/website/src/components/Experience.tsx` | SVG silhouette |
| Fishkal logo | — | **ASSET_REQUIRED** (SVG, brand navy/turquoise) |

## ASSET_REQUIRED (before production launch)

| Target path | Description | Suggested source (license) | Priority |
|---|---|---|---|
| `assets/3d/boat/fishkal_boat.glb` | Low-poly dhow fishing boat, brand colors | Quaternius / Kenney (CC0) → Blender pass | HIGH |
| `assets/3d/fish/*.glb` | 10 species from `@fishkal/config` incl. hammour, shark, legendary grouper | Quaternius fish pack (CC0) + custom hammour | HIGH |
| ✅ DONE: `apps/website/public/models/fish/grouper.glb` | Pipeline proof — Khronos BarramundiFish (CC0, 2.4MB) served as `grouper`; loader auto-uses it with rarity tint | Khronos glTF-Sample-Models (CC0) | — |
| `assets/3d/environment/coral_*.glb` | Coral/rocks/kelp kit, instanced | Quaternius / Poly Haven (CC0) | MEDIUM |
| `assets/3d/dubai/skyline_blockout.glb` | Distant skyline for WebGL scene | Custom blockout | MEDIUM |
| `assets/textures/water_normal.ktx2` | Animated water normal detail | Poly Haven (CC0) → KTX2 | MEDIUM |
| `assets/textures/sunset_sea_1k.hdr` | Environment lighting HDRI | Poly Haven (CC0) | MEDIUM |
| `assets/audio/ocean_surface.ogg` | Surface ambience loop | freesound (CC0) | HIGH |
| `assets/audio/underwater.ogg` | Deep ambience loop | freesound (CC0) | HIGH |
| `assets/audio/catch.ogg`, `splash.ogg`, `danger.ogg`, `reward.ogg`, `ui_click.ogg` | SFX set | freesound (CC0) | HIGH |
| `assets/ui/logo.svg`, `fish_cards/*.png` | Brand logo + fish card art | Commissioned (brand) | HIGH |
| `assets/ui/rewards/*.svg` | Reward/badge icons | Commissioned | LOW |

Rules (spec §12, §103): GLB + Draco + KTX2, LOD for hero assets, no unoptimized
downloads, every third-party asset gets its license recorded here.
