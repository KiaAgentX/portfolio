
### ۱. سبک The Sims (شبیه‌ساز زندگی / ساخت‌وساز)

> **تست:** مکانیزم کلیک روی محیط (Raycasting)، انتخاب و جابه‌جایی وسایل، مدیریت نوار نیازها (Hunger/Energy) و حرکت ایزومتریک/آزاد.

```text
Build a complete, single-file HTML interactive 3D mini-Sims style game using Three.js and OrbitControls.

Game Mechanics & Rules:
1. Environment: An expandable interior room floor grid with procedural wooden flooring and walls.
2. Character & Objects: Include a simple procedural 3D avatar and selectable furniture items (Bed, Refrigerator, Sofa, Desk) built from Three.js primitives.
3. Interactions:
   - Click-to-Move: Clicking anywhere on the floor makes the character pathfind/walk to that spot.
   - Object Interaction: Clicking on the Refrigerator increases a "Hunger" bar; clicking on the Bed increases an "Energy" bar (animates sleeping).
4. UI Overlay:
   - Top Bar: Game Title "Mini Sims 3D Prototype".
   - Status Bars: Visual bars for "Hunger" and "Energy" that slowly deplete over time.
   - Build Menu Panel: Buttons to spawn new furniture onto the grid.

Technical Guidelines:
- Everything MUST be self-contained in a single index.html file (HTML, CSS, JS).
- Use Three.js Raycaster for mouse click interactions on 3D objects.
- All textures must be generated procedurally via Canvas2D.
- Dynamic lighting with soft shadows enabled.

```

---

### ۲. سبک Tower Defense (دفاع از قلعه ۳ بعدی)

> **تست:** ساخت هوش مصنوعی پایه برای دشمنان (Pathfollowing)، شلیک پرتابه‌ها، برجک‌های دفاعی و سیستم موج دشمنان (Wave System).

```text
Create a fully functional single-file HTML 3D Tower Defense game using Three.js.

Game Mechanics & Rules:
1. Environment: A 3D terrain grid with a winding dirt path, grass surroundings, and a Castle at the end of the path.
2. Gameplay Loop:
   - Enemies (simple colored 3D spheres/robots) spawn at the start of the path and move along grid waypoints toward the Castle.
   - Castle Health: Reaching the castle decreases "Castle HP".
3. Tower Placement:
   - Player can click empty grass tiles to place interactive Defense Turrets (built from cylinders and boxes).
   - Turrets automatically track and fire laser projectiles at the nearest enemy within range.
4. UI & Controls:
   - HUD displaying "Gold", "Castle HP", and "Current Wave".
   - A "Next Wave" button and a Turret Store menu (costs Gold to place turrets).

Technical Guidelines:
- Single index.html file with embedded CSS and JavaScript.
- Implement distance checking and linear interpolation for enemy movement and targeting.
- Include simple particle explosions when enemies are destroyed.

```

---

### ۳. سبک FPS / Zombie Survival (اول شخص بقا)

> **تست:** قفل شدن ماوس (Pointer Lock API)، کنترل حرکت WASD، تیراندازی، اسکریپت اسپاون دشمن و سیستم آسیب‌دیدگی.

```text
Develop a complete, single-file HTML 3D First-Person Shooter (FPS) Zombie Survival game using Three.js and PointerLockControls.

Game Mechanics & Rules:
1. Environment: A dark, atmospheric abandoned warehouse or arena with procedural concrete pillars, metal crates, and dim flickering spotlights.
2. Controls & Movement:
   - Click screen to lock mouse look.
   - Standard WASD keys for player movement and Jump (Spacebar).
   - Left Mouse Click to fire weapon (includes gun recoil animation and muzzle flash light effect).
3. Enemies:
   - Simple 3D Zombie models spawn continuously outside the arena and move directly toward the player.
   - Raycast shooting: Aiming at zombies and clicking damages/destroys them and awards points.
4. UI Overlay:
   - Crosshair in screen center.
   - Bottom HUD showing "Health", "Ammo / Reload", and "Zombies Eliminated / Score".

Technical Guidelines:
- Must be fully functional within one self-contained index.html file.
- Smooth basic collision detection between player and walls/objects.
- Code-generated textures for floor and obstacles.

```

---

### ۴. سبک Endless Runner (دونده بی‌انتها / مثل Subway Surfers)

> **تست:** حرکت مداوم دنیا (World Scrolling)، پرش/غلت زدن، تولید تصادفی مانع‌ها و افزایش تدریجی سرعت.

```text
Build an interactive, single-file HTML 3D Endless Runner game using Three.js.

Game Mechanics & Rules:
1. Environment: A 3-lane futuristic highway/tunnel with neon lane dividers and dynamic moving background light pillars.
2. Player Control:
   - A sleek 3D vehicle/character strictly moving between 3 lanes using Left/Right Arrow keys (A/D).
   - Up Arrow key to Jump over low obstacles.
3. Obstacles & Collectibles:
   - Procedural obstacles (barricades, floating beams) and golden coins continually spawn ahead and move toward the player at increasing speed.
   - Collision Detection: Hitting an obstacle causes "Game Over" with a restart screen. Collecting coins increases "Score".
4. UI & Controls:
   - Dynamic HUD showing "Score", "Distance Traveled", and "Speed Multiplier".
   - Overlay modal screen for "Game Over - Press Space to Restart".

Technical Guidelines:
- Single index.html file containing all CSS and JavaScript.
- Use smooth interpolation (lerp) for switching between lanes.
- High-frame-rate game loop using requestAnimationFrame.

```

---

### ۵. سبک Action RPG / Hack and Slash (ایزومتریک)

> **تست:** زاویه دوربین Top-down، حمله چندبخشی (Combo)، سیستم نوار سلامتی دشمنان و اسپاون ایتم‌ها.

```text
Generate a complete, self-contained single-file HTML 3D Action-RPG mini-game using Three.js.

Game Mechanics & Rules:
1. Environment: An isometric 3D dungeon room made of stone tile floors, broken pillars, and glowing torch braziers.
2. Player Character:
   - Controlled via WASD or Arrow Keys with a fixed isometric camera angle following from above.
   - Spacebar triggers a 3D sword swing or magical AoE (Area of Effect) attack wave.
3. Combat Logic:
   - Enemy goblins/monsters spawn in the dungeon and move toward the player.
   - Hitting enemies reduces their health bars (displayed above their heads) and knocks them back.
4. UI Overlay:
   - Health Globe (Red) and Mana Globe (Blue) at the bottom left.
   - Kill counter and Experience/Level bar at the top.

Technical Guidelines:
- Delivered strictly as a single index.html file.
- Procedural textures for stone, metal, and magic particle effects.
- Dynamic point lighting from player spells and torch sources.

```

---

### 💡 کلید موفقیت برای گرفتن کد سالم از مدل‌ها:

1. **عبارت Single-file HTML:** حتماً تاکید کنید که تمام بخش‌های CSS، JS و Three.js باید در یک فایل HTML باشد.
2. **استفاده از Raycaster و Pointer Lock:** برای بازی‌های کلیکی (مثل سيمز یا استراتژیک) کلمه‌ی `Raycaster` و برای بازی‌های اول‌شخص کلمه‌ی `PointerLockControls` را در پرامپت نگه دارید؛ این کار باعث می‌شود مدل حتماً متدهای درست ورودی ورودی‌های ماوس را بنویسد.