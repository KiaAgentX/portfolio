# Skill: Three.js Exploration Game

**Source:** Fable Jazire.html (3D Island Quest Base)

## Core Techniques

### 1. Loading Screen with Progress
```javascript
// Show loading screen with progress bar
function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';
}
```

### 2. Fatal Error Handler
```javascript
window.addEventListener('error', (e) => {
    errorScreen.style.display = 'flex';
    errorCode.textContent = e.message;
});
```

### 3. Crystal/Collectible System
- Place collectibles at specific positions
- Raycaster detection on proximity
- Pickup animation (scale + float)
- Counter display in HUD

### 4. Touch Controls (Mobile)
- Virtual joystick for movement
- Action buttons for jump/interact
- Responsive layout detection
- Safe area insets

### 5. Performance Stats via GL Readback
```javascript
const pixels = new Uint8Array(4);
renderer.readPixels(x, y, 1, 1, renderer.RGBA, renderer.UNSIGNED_BYTE, pixels);
// Analyze brightness, color distribution
```

### 6. Frame Error Tracking
- Count frame errors per second
- Fatal threshold triggers error screen
- Performance degradation detection

### 7. Toast Notification System
```javascript
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}
```

## Application to Our Game
- Add loading screen with progress bar
- Implement collectible/crystal system
- Add touch controls for mobile
- Implement error handling and performance monitoring
