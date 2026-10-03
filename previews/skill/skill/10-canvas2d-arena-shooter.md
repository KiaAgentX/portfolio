# Skill: Canvas 2D Arena Shooter

**Source:** FastAmozesh_Game.html (NEON//VECTOR)

## Core Techniques

### 1. Pre-Rendered Glow Sprite Cache
```javascript
// Create glow sprites once
function createGlowSprite(color, size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return canvas;
}
```

### 2. Screen Shake System
```javascript
let shakeIntensity = 0;
function applyShake(ctx) {
    if (shakeIntensity > 0) {
        ctx.translate(
            (Math.random() - 0.5) * shakeIntensity,
            (Math.random() - 0.5) * shakeIntensity
        );
        shakeIntensity *= 0.9;
    }
}
```

### 3. HitStop / Time Dilation
```javascript
// On big moments (kills, explosions)
dt *= 0.15;  // Slow down time
// Gradually return to normal
timeScale += (1 - timeScale) * 0.1;
```

### 4. Combo/Chain Kill System
```javascript
let combo = 0;
let comboTimer = 0;
function onKill() {
    combo++;
    comboTimer = 2;  // seconds to maintain combo
    score += basePoints * combo;
}
function updateCombo(dt) {
    comboTimer -= dt;
    if (comboTimer <= 0) combo = 0;
}
```

### 5. State Machine
```javascript
const STATE = { MENU: 0, PLAY: 1, PAUSE: 2, DYING: 3, OVER: 4 };
let state = STATE.MENU;
function update(dt) {
    switch (state) {
        case STATE.MENU: updateMenu(dt); break;
        case STATE.PLAY: updatePlay(dt); break;
        // ...
    }
}
```

### 6. CSS Post-FX
```css
.scanlines {
    background: repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.15) 0px,
        rgba(0,0,0,0.15) 1px,
        transparent 1px,
        transparent 2px
    );
}
.vignette {
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%);
}
```

### 7. Wave-Based Enemy Spawning
```javascript
let wave = 1;
let enemiesPerWave = 5 + wave * 2;
let spawnRate = 2 - wave * 0.1;
function spawnEnemy() {
    // Spawn at random edge position
    // Increase speed/health per wave
}
```

## Application to Our Game
- Add screen shake on impacts
- Implement combo/chain kill system
- Use CSS post-processing for atmosphere
- Add wave-based enemy spawning
