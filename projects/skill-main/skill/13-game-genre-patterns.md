# Skill: Game Genre Design Patterns

**Source:** Prompt 2.md (5 Game Genre Prompts)

## Core Techniques

### 1. Life Simulation (Sims-style)
- Click-to-move pathfinding
- Object interaction system
- Need bars (Hunger, Energy, Social, Fun)
- Day/night cycle affecting needs
- NPC mood system

### 2. Tower Defense
- Enemy pathfinding (A* or waypoint)
- Tower placement grid
- Wave system with increasing difficulty
- Projectile tracking (homing, ballistic)
- Tower upgrade system
- Resource management (gold)

### 3. FPS Zombie Survival
- PointerLockControls for aiming
- WASD + sprint + jump
- Raycaster shooting with hit detection
- Enemy AI: patrol → chase → attack
- Health/shield system
- Ammo management
- Wave survival with scoring

### 4. Endless Runner
- World scrolling (move world, not camera)
- Lane switching (3 lanes)
- Procedural obstacle spawning
- Power-up system
- Score = distance traveled
- Speed increases over time

### 5. Action RPG (Hack & Slash)
- Isometric camera (fixed angle)
- Combo attack system (click sequences)
- Enemy health bars
- Item drops (loot system)
- Experience/leveling
- Inventory management

### Key Tip from Source
> "Always emphasize `Single-file HTML` and include API names like `Raycaster` and `PointerLockControls` in the prompt — this forces the model to use correct input handling methods."

## Application to Our Game
- Implement tower defense mechanics in mansion
- Add zombie survival wave system
- Use endless runner spawning for enemies
- Add RPG inventory/leveling system
