# Skill: Canvas 2D Noir Detective Game Engine

**Source:** 1.html (Shadow Secrets / رازهای سایه)

## Core Techniques

### 1. Custom 2D Lightmap System
- Use offscreen canvas (`lctx`) with `globalCompositeOperation='multiply'`
- Draw light cones, point lights, flicker lights onto offscreen canvas
- Multiply-blend the lightmap onto the main scene for realistic 2D lighting
- Support multiple light types: flicker, TV glow, neon, static

### 2. Occluder-Based Shadows
- Define occluder geometry (`s.occ`) as line segments
- Cast rays from light source to occluder endpoints
- Fill shadow polygons behind occluders
- Dynamic flashlight cone with shadow blocking

### 3. Pixel Art Sprite System
- Build sprites from character arrays (pixel-by-pixel)
- Use `sprite()` function for procedural pixel art generation
- Parallax background layers (sky, far buildings)

### 4. Procedural Audio (Web Audio API)
- Atmospheric drone: multiple oscillators with detune
- Wind noise: white noise → bandpass filter → LFO modulation
- Bell/chime: sine oscillators with exponential decay
- Footstep: noise burst → bandpass → envelope
- Cat sounds: frequency modulation synthesis

### 5. Snow Particle System
- Canvas 2D particle array with position, velocity, size
- Wind effect via horizontal velocity offset
- Star twinkling with sin-based alpha modulation

### 6. Persian RTL UI
- Glassmorphism panels: `backdrop-filter: blur(10px)`
- Typewriter text effect in dialogue
- Inventory slots with tooltips
- Toast notification system

## Application to Our Game
- Add lightmap system to mansion interior for realistic lighting
- Use occluder shadows for flashlight gameplay
- Add particle systems (dust, rain, snow)
- Implement procedural audio for atmosphere
