# Skill: GLSL Shader Effects

**Source:** Fable Panjare.html (Rain on Window)

## Core Techniques

### 1. Full-Screen Quad Shader
```javascript
const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader: `uniform float uTime; uniform vec2 uResolution; varying vec2 vUv; ...`
    })
);
```

### 2. Rain Droplet Physics in GLSL
```glsl
// Static beads
float bead = smoothstep(0.02, 0.0, length(uv - beadPos) - beadRadius);

// Growing drips
float drip = smoothstep(0.015, 0.0, length(uv - dripPos) - dripRadius);
drip *= smoothstep(0.0, 1.0, dripSize);

// Trails with refraction
vec2 trailUV = uv + normal.xy * refractionStrength;
```

### 3. Hash Functions for Procedural Noise
```glsl
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i), hash(i + vec2(1, 0)), f.x),
        mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x),
        f.y
    );
}
```

### 4. Condensation Blur
- Mip-map bias for soft blur
- Distance-based blur intensity
- Interior reflection layer

### 5. Offscreen Canvas World Painting
- Paint entire scene once to 2048x1024 canvas
- Use as texture in shader
- "Paint once, sample in shader" approach
- Achieves cinematic realism at 60fps

### 6. Multi-Layer Droplet System
- 2 moving layers + static beads
- Each layer has independent physics
- Combine layers for realistic rain

## Application to Our Game
- Add rain/snow shader effects
- Create glass/water reflections
- Implement post-processing shaders
- Use offscreen canvas for pre-rendered backgrounds
