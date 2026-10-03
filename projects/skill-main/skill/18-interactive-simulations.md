# Skill: Interactive Simulation Prompts

**Source:** Prompt 4.md (10 Three.js Tool/Simulator Prompts)

## Core Techniques

### 1. Mouse Interaction Patterns
```javascript
// Click-to-place
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObject(ground);
if (intersects.length > 0) placeObject(intersects[0].point);

// Drag-to-draw
if (isDragging) {
    const point = intersects[0].point;
    linePoints.push(point);
    lineGeometry.setFromPoints(linePoints);
}

// Force attractor/repeller
function applyForce(particle, center, strength) {
    const dir = center.clone().sub(particle.position);
    const dist = dir.length();
    dir.normalize().multiplyScalar(strength / (dist * dist));
    particle.velocity.add(dir);
}
```

### 2. Physics Simulation Architecture
- Gravity: `velocity.y -= 9.8 * dt`
- Collision: AABB or sphere intersection
- Buoyancy: upward force proportional to submerged volume
- Cloth: mass-spring particle system with constraints

### 3. Real-Time Mesh Manipulation
```javascript
// Vertex sculpting
function sculptMesh(geometry, point, radius, strength) {
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
        const dist = vertex.distanceTo(point);
        if (dist < radius) {
            const factor = 1 - dist / radius;
            positions.setY(i, positions.getY(i) + strength * factor);
        }
    }
    positions.needsUpdate = true;
}
```

### 4. Procedural City Generation
```javascript
function generateCity(width, depth, density) {
    const blocks = [];
    for (let x = -width/2; x < width/2; x += blockSize) {
        for (let z = -depth/2; z < depth/2; z += blockSize) {
            if (Math.random() < density) {
                const height = 5 + Math.random() * 45;
                createBuilding(x, z, blockSize, height);
            }
        }
    }
}
```

### 5. Audio Visualizer (FFT)
```javascript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const dataArray = new Uint8Array(analyser.frequencyBinCount);

function visualize() {
    analyser.getByteFrequencyData(dataArray);
    for (let i = 0; i < bars.length; i++) {
        bars[i].scale.y = dataArray[i] / 255 * maxHeight;
    }
    requestAnimationFrame(visualize);
}
```

### 6. The 10 Simulations
| # | Simulation | Domain |
|---|-----------|--------|
| 1 | Domino Physics | Rigid body collision |
| 2 | Car Showroom | PBR materials |
| 3 | Orbital Mechanics | Gravitational physics |
| 4 | Ocean Waves | Vertex shader animation |
| 5 | Cloth Physics | Mass-spring system |
| 6 | Particle FX Lab | GPU instanced particles |
| 7 | Mesh Sculpting | Vertex manipulation |
| 8 | Procedural City | Algorithmic generation |
| 9 | Optics & Laser | Ray-casting, Snell's Law |
| 10 | Audio Visualizer | Web Audio FFT |

## Application to Our Game
- Implement physics-based interactions
- Add procedural generation for levels
- Use audio-reactive features for atmosphere
- Build interactive tools for level editing
