# Skill: Three.js Survival Game Mechanics

**Source:** Fable + Opus Jazire.html (3D Island Quest Extended)

## Core Techniques

### 1. Renderer Configuration
```javascript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

### 2. PointerLockControls First-Person
- `PointerLockControls` for FPS camera
- WASD movement + jump + sprint
- Raycaster for interaction (7.5 range)

### 3. Day/Night Cycle
- Animate directional light position/color
- Sky dome color transitions
- Hemisphere light color changes
- Fog color matching sky

### 4. Combat System
- Sword: swing animation with hitbox
- Shield: block with damage reduction
- Bow: draw mechanic, arrow physics, trajectory
- Enemy AI: spawn system, patrol, attack

### 5. Crafting System
- Resource gathering (wood from trees)
- Build pieces: walls, doors, roofs
- Hotbar with equipment slots
- Inventory management

### 6. Post-Processing
- `EffectComposer` + `UnrealBloomPass`
- Bloom toggle for performance
- Adaptive pixel ratio (1.5 touch, 2 desktop)

### 7. Procedural World
- Terrain with heightmap texture
- Procedural water with vertex animation
- Sky dome with gradient
- Grass instancing with custom shader

## Application to Our Game
- Add day/night cycle to mansion map
- Implement combat system (sword, bow)
- Add crafting/building mechanics
- Use bloom post-processing for atmosphere
