# Skill: Spring Physics Assembly

**Source:** Fable Berger.html (3D Burger Builder)

## Core Techniques

### 1. Spring Physics for Stacking
```javascript
// Spring constant and damping
const K = 120;  // Spring stiffness
const C = 8.5;  // Damping coefficient

// Apply spring force to layer position
velocity += (targetY - currentY) * K * dt;
velocity *= (1 - C * dt);
position += velocity * dt;
```

### 2. Squash & Stretch Animation
- Scale Y inversely proportional to velocity
- Scale X/Z proportionally to maintain volume
- Apply on spring bounce for organic feel

### 3. Hard Floor Collision
- Prevent tunneling between stacked layers
- Check overlap and resolve penetration
- Sub-stepped physics loop for stability

### 4. Procedural Food Textures
- Bun: sesame seeds via random dots
- Patty: char/grill marks via gradient
- Cheese: bubble pattern via noise
- Tomato: seed chambers via concentric circles
- Lettuce: vein patterns via fractal lines
- Bacon: fat streaks via alternating bands

### 5. LatheGeometry for Organic Shapes
- Create revolution profiles for buns, patty
- Vertex displacement along normals using FBM noise
- `MeshPhysicalMaterial` with clearcoat for realism

### 6. OrbitControls with Auto-Rotate
- Smooth camera orbit around assembly
- Auto-rotate when idle
- Zoom limits for inspection

### 7. Value Noise + FBM
```javascript
function fbm(x, y) {
    let value = 0;
    let amplitude = 0.5;
    for (let i = 0; i < 4; i++) {
        value += amplitude * noise(x, y);
        x *= 2; y *= 2;
        amplitude *= 0.5;
    }
    return value;
}
```

## Application to Our Game
- Implement spring physics for interactive objects
- Add squash/stretch for character animations
- Use procedural textures for all game assets
- Apply FBM noise for terrain/texture generation
