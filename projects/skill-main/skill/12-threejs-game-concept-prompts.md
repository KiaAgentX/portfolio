# Skill: Three.js Game Concept Prompts

**Source:** Prompt 1.md (5 Three.js Scenes)

## Core Techniques

### 1. Single-File Architecture
Every prompt mandates self-contained `index.html`:
- Embedded CSS in `<style>` tags
- Embedded JS in `<script>` tags
- No external dependencies except Three.js CDN

### 2. Three-Panel Layout Pattern
```html
<div id="ui">
    <div id="title">Scene Title</div>
    <div id="controls"><!-- Sliders, buttons --></div>
    <div id="metrics"><!-- FPS, poly count --></div>
</div>
```

### 3. Procedural Texture Generation
All textures via Canvas 2D:
- Wet road: gradient + noise + reflections
- Neon grid: line patterns + glow
- Metal: brushed texture + scratches
- Wood: grain lines + knots

### 4. Real-Time Performance Metrics
```javascript
function updateMetrics() {
    fpsEl.textContent = `FPS: ${fps}`;
    polyEl.textContent = `Polygons: ${renderer.info.render.triangles}`;
    drawEl.textContent = `Draw Calls: ${renderer.info.render.calls}`;
}
```

### 5. Camera Preset System
```javascript
const presets = [
    { name: 'Wide', pos: [10, 5, 10], target: [0, 0, 0] },
    { name: 'Close', pos: [2, 1, 2], target: [0, 0.5, 0] },
    { name: 'Top', pos: [0, 15, 0], target: [0, 0, 0] },
];
function setCameraPreset(index) {
    camera.position.set(...presets[index].pos);
    controls.target.set(...presets[index].target);
}
```

### 6. The 5 Scene Types
| Scene | Technical Focus |
|-------|----------------|
| Cyberpunk Street | Bloom, emissive materials, fog |
| Knight Training | Hierarchical animation, spring physics |
| Mecha Hangar | Joint hierarchies, mechanical animation |
| Pirate Ship | Vertex-shader water, reflections |
| Aircraft Runway | Particle systems, terrain rendering |

## Application to Our Game
- Use single-file architecture for rapid prototyping
- Implement performance metrics HUD
- Add camera preset system for different views
- Generate procedural textures for all assets
