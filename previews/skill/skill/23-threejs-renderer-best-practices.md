# Skill: Three.js Renderer Best Practices

**Source:** Synthesized from all HTML game files

## Core Techniques

### 1. Optimal Renderer Configuration
```javascript
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

### 2. Dynamic Shadow Setup
```javascript
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 80;
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
// Shadow frustum follows player
dirLight.target.position.copy(player.position);
dirLight.shadow.camera.updateProjectionMatrix();
```

### 3. CDN Fallback Chain
```javascript
const CDN_CHAIN = [
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
    'https://unpkg.com/three@0.160.0/build/three.module.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js'
];
```

### 4. Adaptive Pixel Ratio
```javascript
const isTouch = 'ontouchstart' in window;
renderer.setPixelRatio(isTouch ? 1.5 : Math.min(devicePixelRatio, 2));
```

### 5. Performance Monitoring
```javascript
function getStats() {
    return {
        fps: Math.round(1 / clock.getDelta()),
        triangles: renderer.info.render.triangles,
        drawCalls: renderer.info.render.calls,
        textures: renderer.info.memory.textures,
        geometries: renderer.info.memory.geometries
    };
}
```

### 6. Error Handling
```javascript
let frameErrors = 0;
const FATAL_THRESHOLD = 30;

window.addEventListener('error', () => {
    frameErrors++;
    if (frameErrors > FATAL_THRESHOLD) {
        showErrorScreen();
    }
});

function animate() {
    try {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        frameErrors = 0;
    } catch (e) {
        frameErrors++;
    }
}
```

## Application to Our Game
- Use optimal renderer settings for performance
- Implement dynamic shadows that follow player
- Add CDN fallback for Three.js loading
- Monitor performance and handle errors gracefully
