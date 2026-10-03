# Skill: Advanced Game Prototype Prompts

**Source:** Prompt 3.md (10 Three.js Game Prompts)

## Core Techniques

### 1. Complete Game Loop Specification
Every prompt defines:
- Menu → Gameplay → Win/Lose → Restart
- Clear win/lose conditions
- Score/progress tracking

### 2. World Boundary Design
| Boundary Type | Use Case |
|--------------|----------|
| Walls | Indoor arenas, dungeons |
| Water | Island, naval games |
| Fog | Open world, horror |
| Invisible | Endless runners |

### 3. Camera Constraint Systems
```javascript
// OrbitControls with limits
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = Math.PI / 2.2;

// Follow camera with pitch limits
camera.position.y = Math.max(camera.position.y, 3);
```

### 4. Progressive Difficulty
- Wave system with increasing enemy count
- Speed multiplier over time
- Unlock new abilities/areas
- Boss encounters at milestones

### 5. Economy Systems
- Gold/currency drops from enemies
- Market stalls for trading
- Crafting with resource combinations
- Inventory management UI

### 6. The 10 Game Types
| # | Game | Unique Challenge |
|---|------|-----------------|
| 1 | Night Racer | Car physics, tire smoke |
| 2 | WW2 Dogfight | 3-axis flight controls |
| 3 | Dungeon Crawler | Multi-room, locked doors |
| 4 | Farm Simulator | Time system, grid placement |
| 5 | Island Survival | Crafting, hunger/thirst |
| 6 | Mini-Golf | Ball collision, friction |
| 7 | 3D Platformer | Moving platforms, double-jump |
| 8 | Precision Parking | Steering ratios, hitbox |
| 9 | Planet Defender | Spherical coordinates |
| 10 | Naval Battleship | Buoyancy, arc projectiles |

## Application to Our Game
- Implement wave-based enemy system
- Add economy/crafting mechanics
- Use camera constraint systems
- Design progressive difficulty curves
