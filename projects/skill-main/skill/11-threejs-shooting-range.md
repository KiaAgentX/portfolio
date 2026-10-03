# Skill: Three.js Shooting Range + Telegram Bridge

**Source:** Opus.html (DEADLINE) + Qwen.html (MIDNIGHT RANGE)

## Core Techniques

### 1. Telegram WebApp Integration
```javascript
// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#1a1a2e');
    tg.setBackgroundColor('#0a0a0a');
    // Haptic feedback
    tg.HapticFeedback.notificationOccurred('success');
}
```

### 2. Weapon Pose System
```javascript
const POSE_IDLE = { x: 0, y: -0.3, z: -0.5 };
const POSE_ADS = { x: 0, y: -0.15, z: -0.3 };

function updateWeapon(dt) {
    const target = isAiming ? POSE_ADS : POSE_IDLE;
    weapon.position.lerp(target, dt * 8);
    // Add sway based on mouse movement
    weapon.rotation.z = Math.sin(Date.now() * 0.003) * 0.02;
}
```

### 3. Tracer Rounds
```javascript
function createTracer(start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 });
    const tracer = new THREE.Line(geometry, material);
    scene.add(tracer);
    // Fade out over time
    setTimeout(() => { tracer.material.opacity = 0; }, 100);
}
```

### 4. Shell Casing Physics
```javascript
function updateCasings(dt) {
    casings.forEach(casing => {
        casing.velocity.y -= 9.8 * dt;
        casing.position.add(casing.velocity.clone().multiplyScalar(dt));
        casing.rotation.x += dt * 10;
        casing.rotation.z += dt * 5;
        // Bounce on floor
        if (casing.position.y < 0.1) {
            casing.velocity.y *= -0.3;
            casing.position.y = 0.1;
        }
    });
}
```

### 5. Muzzle Flash
```javascript
function createMuzzleFlash() {
    const flash = new THREE.PointLight(0xffaa00, 5, 10);
    flash.position.copy weaponBarrel.position;
    scene.add(flash);
    setTimeout(() => scene.remove(flash), 50);
}
```

### 6. Slow-Motion Effect
```javascript
let timeScale = 1;
function triggerSlowMo() {
    timeScale = 0.3;
}
function update(dt) {
    const scaledDt = dt * timeScale;
    timeScale += (1 - timeScale) * dt * 2.2;
    // Use scaledDt for game logic
}
```

### 7. Adaptive Camera FOV
```javascript
function updateCameraFOV() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.fov = aspect > 1.7 ? 75 : aspect > 1.3 ? 70 : 65;
    camera.updateProjectionMatrix();
}
```

## Application to Our Game
- Add weapon system with ADS mechanic
- Implement tracer rounds and shell casings
- Add muzzle flash effects
- Integrate Telegram WebApp for mobile play
