# Skill: UI/UX Design Styles Reference

**Source:** UI Templates V1.1.html (80+ Design Styles)

## Core Techniques

### 1. Glassmorphism
```css
.glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
}
```

### 2. Neumorphism
```css
.neumorphic {
    background: #e0e0e0;
    box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
    border-radius: 16px;
}
```

### 3. Claymorphism
```css
.clay {
    background: #ff6b6b;
    border-radius: 16px;
    box-shadow: 8px 8px 16px rgba(0,0,0,0.2),
                inset 2px 2px 4px rgba(255,255,255,0.3);
}
```

### 4. Cyberpunk/Neon
```css
.cyber {
    background: #0a0a0a;
    border: 2px solid #00ffff;
    box-shadow: 0 0 10px #00ffff, inset 0 0 10px rgba(0,255,255,0.1);
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}
```

### 5. Dark/Light Mode Toggle
```css
[data-chrome="dark"] { --bg: #1a1a1a; --text: #ffffff; }
[data-chrome="light"] { --bg: #ffffff; --text: #1a1a1a; }
```

### 6. Scroll-Snap Navigation
```css
.nav { scroll-snap-type: x mandatory; }
.section { scroll-snap-align: start; }
```

### 7. CSS color-mix() for Dynamic Colors
```css
.primary { background: color-mix(in srgb, var(--base) 70%, black); }
```

### 8. The 80 Design Styles
Glassmorphism, Neumorphism, Claymorphism, Skeuomorphism, Neo-Brutalism, Material, Cyberpunk, Bauhaus, Risograph, Windows 95, and 70+ more...

## Application to Our Game
- Apply glassmorphism to game HUD/menus
- Use cyberpunk style for sci-fi elements
- Implement dark/light mode toggle
- Use CSS clip-path for angular UI elements
