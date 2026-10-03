# Skill: Creative Game Concepts

**Source:** prompt 5.md (10 Creative Game/Simulator Prompts)

## Core Techniques

### 1. ASMR/Satisfying Game Design
- Car wash: particle-based water/foam, dirt removal
- Bubble pop: iridescent shaders, organic wobble
- Pizza making: object assembly, baking timer
- Focus on tactile satisfaction over challenge

### 2. Inventory System Pattern
```javascript
const inventory = {
    items: [],
    add(item) {
        const existing = this.items.find(i => i.id === item.id);
        if (existing) existing.count++;
        else this.items.push({ ...item, count: 1 });
    },
    remove(itemId) {
        const idx = this.items.findIndex(i => i.id === itemId);
        if (idx !== -1) this.items[idx].count--;
        if (this.items[idx].count <= 0) this.items.splice(idx, 1);
    },
    has(itemId) {
        return this.items.some(i => i.id === itemId && i.count > 0);
    }
};
```

### 3. Puzzle/Lock Mechanics
- Combination safes: number wheel interaction
- Hidden keys: raycaster search in environment
- Clue chains: item A unlocks area B which reveals item C
- Environmental puzzles: light, weight, sequence

### 4. Boids Flocking Algorithm
```javascript
function updateBoids(boids) {
    boids.forEach(boid => {
        let sep = new THREE.Vector3();  // Separation
        let ali = new THREE.Vector3();  // Alignment
        let coh = new THREE.Vector3();  // Cohesion
        let neighbors = 0;

        boids.forEach(other => {
            if (other === boid) return;
            const dist = boid.position.distanceTo(other.position);
            if (dist < perceptionRadius) {
                sep.add(boid.position.clone().sub(other.position).normalize().divideScalar(dist));
                ali.add(other.velocity);
                coh.add(other.position);
                neighbors++;
            }
        });

        if (neighbors > 0) {
            ali.divideScalar(neighbors).sub(boid.velocity).multiplyScalar(alignmentWeight);
            coh.divideScalar(neighbors).sub(boid.position).multiplyScalar(cohesionWeight);
            sep.divideScalar(neighbors).multiplyScalar(separationWeight);
        }

        boid.velocity.add(sep).add(ali).add(coh);
        boid.position.add(boid.velocity.clone().multiplyScalar(dt));
    });
}
```

### 5. Hierarchical Animation
- Parent-child gear relationships
- Rotation ratios based on gear teeth
- Exploded view mode for inspection

### 6. Camera Transitions
```javascript
function animateCamera(from, to, duration) {
    const start = Date.now();
    function update() {
        const t = Math.min((Date.now() - start) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        camera.position.lerpVectors(from.pos, to.pos, ease);
        controls.target.lerpVectors(from.target, to.target, ease);
        if (t < 1) requestAnimationFrame(update);
    }
    update();
}
```

### 7. The 10 Creative Concepts
| # | Type | Name | Feature |
|---|------|------|---------|
| 1 | Game | Car Wash | Particle water/foam |
| 2 | Game | Escape Room | Inventory + puzzles |
| 3 | Game | Pizza Chef | Assembly + timer |
| 4 | Game | Stacking Tower | Center of gravity |
| 5 | Game | Bubble Pop | Iridescent shaders |
| 6 | Tool | Electronics Board | Circuit simulation |
| 7 | Tool | Ecosystem | Boids AI |
| 8 | Tool | Mechanical Clock | Gear ratios |
| 9 | Tool | Treehouse | Procedural foliage |
| 10 | Tool | Museum Inspector | 360° rotation |

## Application to Our Game
- Add satisfying/ASMR elements (water, fire, particles)
- Implement inventory system for items
- Use boids for crowd/animal AI
- Add camera transitions for cinematic moments
