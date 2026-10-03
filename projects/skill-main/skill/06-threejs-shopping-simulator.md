# Skill: Three.js Shopping Simulator

**Source:** Fable Bazzar.html (Traditional Bazaar Simulator)

## Core Techniques

### 1. Procedural Canvas Textures
All textures generated via Canvas 2D — zero external images:
- Cobblestones: color + bump maps
- Wood planks: grain pattern
- Plaster walls: crack textures
- Striped awnings: repeating pattern
- Persian carpet: geometric patterns

### 2. Font-Aware Canvas Rendering
- Wait for web font load (Vazirmatn) before rendering text
- Use `document.fonts.ready` promise
- Render Persian text on canvas for signs/labels

### 3. Dynamic Lighting
- Directional sunlight with shadow frustum following player
- Texel-snapped shadows for stability
- Point lights for lanterns with flicker animation
- `ShaderMaterial` for lantern glow

### 4. Shopping Basket System
- Item pickup via raycaster click
- Basket HUD with itemized list
- Quantity management (add/remove)
- Total price calculation in Toman

### 5. 3D-Projected Tooltips
- Project 3D world coordinates to screen space
- Display item name/price on hover
- Crosshair changes on interactive objects

### 6. Dust Particle System
- `Points` with position updates
- Sinusoidal drift animation
- Performance-friendly pooling

### 7. Performance Optimization
- `mergeGeometries` from BufferGeometryUtils
- Deterministic seeded RNG
- Raycaster with parent-traversal for grouped meshes

## Application to Our Game
- Generate all textures procedurally (no external files)
- Implement shopping/inventory system
- Add dynamic lighting with flickering
- Use font-aware canvas for Persian UI elements
