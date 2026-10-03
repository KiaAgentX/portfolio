این هم **۱۰ پرامپت حرفه‌ای و کامل** برای ساخت بازی‌های ۳ بعدی مختلف در قالب **یک فایل HTML منفرد (Single-file HTML)**.

در تمام این پرامپت‌ها، مرزبندی محیط، محدودیت‌های دوربین، گرافیک پروسیجرال و چرخه کامل بازی (منو، گیم‌پلی، باخت/برد) لحاظ شده تا خروجی دقیق و واقعی بگیری:

---

### ۱. بازی رالی و دریفت شبانه (Cyberpunk Night Racer)

> **تست:** فیزیک ماشین، کنترل با کیبورد، ذرات دود لاستیک و مرزهای جاده.

```text
Build a complete, single-file HTML 3D Night Racing game using Three.js and OrbitControls/FollowCamera.

Game Mechanics & World Boundaries:
1. Environment: A closed-circuit asphalt racetrack set at night, enclosed on all sides by glowing neon city skyscrapers and crash barriers to prevent driving out of bounds.
2. Vehicle Controls: Drive a low-poly sports car using WASD/Arrow keys with smooth acceleration, steering, braking, and drift mechanics (with particle smoke from tires).
3. Objectives: Complete 3 laps against a countdown timer. Checkpoints along the track add bonus time.
4. UI & HUD: Speedometer (KM/H), Lap Counter, Current Time / High Score, and a Start Menu / Game Over screen.
5. Technical: Procedural wet asphalt and neon light textures generated in code. Camera smoothly follows behind the vehicle with pitch/zoom limits.

```

---

### ۲. شبیه‌ساز پرواز اکشن (WW2 Dogfight Combat)

> **تست:** حرکت آزادی ۳ محوره (Pitch/Roll/Yaw)، سیستم شلیک تیر، اسپاون هواپیماهای دشمن و ابرهای پروسیجرال.

```text
Create a fully functional single-file HTML 3D WWII Airplane Combat game using Three.js.

Game Mechanics & World Boundaries:
1. Environment: An ocean arena bounded by distant stormy clouds and volumetric procedural islands. Flying too high or too far triggers a "Return to Combat Zone" warning screen before turning the player around.
2. Controls: Flight simulator controls (Mouse or WASD to control Pitch/Roll, Speed Throttle with W/S). Spacebar fires machine guns with tracer bullets.
3. Mechanics: Enemy bomber aircraft spawn and move across the sky. The player must lock on, shoot them down, and dodge incoming AAA ground fire.
4. UI & HUD: Flight cockpit HUD with Horizon Indicator, Crosshair, Health Bar, Enemy Radar/Minimap, and Score.
5. Technical: Single index.html file. Particle smoke for damaged engines and explosions.

```

---

### ۳. بازی سیاهچاله و سیاه‌چاله‌پیمایی (Dungeon Crawler Action-RPG)

> **تست:** دوربین ایزومتریک، برخورد با دیوارهای تمیز، ضربات شمشیر و هوش مصنوعی غول آخر.

```text
Develop a complete, single-file HTML 3D Dungeon Crawler RPG using Three.js.

Game Mechanics & World Boundaries:
1. Environment: A enclosed, multi-room stone dungeon bounded by thick dungeon walls and locked doors (no void/floating edges). Torch lights illuminate corridors.
2. Player & Combat: Control a knight character with WASD movement and Left-Click to slash a sword. Include an enemy aggro mechanic where skeletons attack when player gets close.
3. Progression: Collect keys to open doors, find health potions, and fight a Boss Monster in the final locked chamber.
4. UI & HUD: Health & Mana bars, Inventory Slots (Keys/Potions), Boss HP Bar, and Victory/Defeat modal overlays.
5. Technical: Strict camera bounds following the player, raycast collision with walls, and procedural stone/iron textures.

```

---

### ۴. شبیه‌ساز کشاورزی و اقتصاد (3D Cozy Farm Simulator)

> **تست:** شبیه‌سازی سیستم زمان، انتخاب و کاشت در شبکه (Grid-based Placement)، رشد گیاهان و انیمیشن.

```text
Generate a self-contained single-file HTML 3D Farming Simulator game using Three.js.

Game Mechanics & World Boundaries:
1. Environment: A cozy, enclosed farm yard bounded by wooden fences, a barn, and dense pine forests preventing player exit.
2. Farming Mechanics: 
   - Player can walk around and interact with dirt plots.
   - Click to Till soil, Plant seeds (Wheat/Carrots), Water crops, and Harvest when fully grown.
   - Plants have 3 distinct 3D visual growth stages over time.
3. Economy & UI: Gold counter, Inventory for Seeds/Harvested crops, Day/Night cycle clock with ambient light changes, and a Market Stall to sell crops for Gold.
4. Technical: Smooth third-person movement, procedural dirt and plant textures, and full OrbitControls camera with zoom limits.

```

---

### ۵. بقا در جزیره ناشناخته (3D Wilderness Survival)

> **تست:** سیستم ساخت‌وساز (Crafting)، نوار گرسنگی و تشنگی، جمع‌آوری منابع و چرخه روز/شب.

```text
Build a complete, single-file HTML 3D First-Person Island Survival game using Three.js and PointerLockControls.

Game Mechanics & World Boundaries:
1. Environment: A lush tropical island surrounded by deep water with sharks (acting as natural map boundaries). Features trees, rocks, and a sandy beach.
2. Controls: First-person view with Mouse Look, WASD movement, and Jump.
3. Survival Mechanics: 
   - Left-Click to chop trees for Wood and mine rocks for Stone.
   - Crafting menu (Key 'E') to build a Campfire (provides warmth/light at night) or a Wooden Shelter.
   - Depleting Hunger/Thirst bars require finding coconut palms or freshwater.
4. UI & HUD: Dynamic Health, Hunger, Thirst, and Temperature bars. Crafting UI Overlay.
5. Technical: Dynamic sun position for Day/Night cycle, procedural wood/bark textures, single index.html file.

```

---

### ۶. بازی مینی‌گلف ۳ بعدی (Interactive Mini-Golf Physics)

> **تست:** فیزیک دقیق برخورد توپ (Collision)، کنترل نیروی پرتاب (Power Bar)، زاویه دوربین و موانع متحرک.

```text
Create a complete single-file HTML 3D Mini-Golf game using Three.js with realistic physics simulation.

Game Mechanics & World Boundaries:
1. Environment: A series of 3 distinct enclosed mini-golf courses built with green felt paths, wooden borders (preventing ball from falling out), windmills, ramps, and water hazards.
2. Mechanics:
   - Click and drag backward from the ball to aim and set Shot Power (aiming line indicator).
   - Release to hit the ball with friction, wall bounces, and slope acceleration.
3. Game Rules: Complete all 3 holes in as few strokes as possible.
4. UI & HUD: Scorecard (Par vs. Current Strokes), Power Meter, Reset Ball button, and Level Completion screens.
5. Technical: Smooth sphere collision response with walls and terrain, OrbitControls centered on the ball with strict camera angle limits.

```

---

### ۷. ماجراجویی پلاتفرمر سه بعدی (3D Platformer Adventure)

> **تست:** فیزیک پرش و جاذبه، سکوهای متحرک، جمع‌آوری سکه‌ها و ریست‌شدن در صورت سقوط.

```text
Develop a self-contained single-file HTML 3D Platformer game using Three.js.

Game Mechanics & World Boundaries:
1. Environment: A ancient temple ruin featuring moving stone platforms, rotating hazard blades, and lava below (bottom map boundary that resets player on fall).
2. Player Controls: Control a low-poly adventurer with WASD and Spacebar to Double-Jump and Dodge-Roll.
3. Mechanics: Jump across moving and crumbling platforms, collect 10 Golden Idols, and reach the finish altar.
4. UI & HUD: Lives Counter (3 Hearts), Collected Idols counter, Timer, and Game Over / Victory screen.
5. Technical: Precise AABB collision detection between player box and moving platform meshes, procedural stone and lava shader/texture.

```

---

### ۸. پارکینگ و شبیه‌ساز پارک ماشین (3D Precision Parking Challenge)

> **تست:** زاویه چرخش فرمان، برخورد دقیق فیزیکی (Hitboxes)، تشخیص زاویه پارک و تایمر.

```text
Build a complete single-file HTML 3D Precision Car Parking game using Three.js.

Game Mechanics & World Boundaries:
1. Environment: A realistic multi-level concrete parking lot enclosed by concrete barriers, parked NPC cars, and pillars.
2. Mechanics: Drive a car (WASD/Arrows) with realistic steering ratios and reverse gear (R key toggle). Park the car inside designated yellow parking bays within tight spots.
3. Win/Lose Condition: Parking correctly (aligned within lines) wins the level. Hitting obstacles or NPC cars reduces "Car Health" and fails the level.
4. UI & HUD: Steering wheel angle indicator, Gear state (Drive/Reverse), Damage Bar, Timer, and Level Select.
5. Technical: OrbitControls with constrained angles to keep view clear, procedural concrete and road markings.

```

---

### ۹. بازی فضایی پدافند سیاره‌ای (3D Planet Defender Shooter)

> **تست:** چرخش دوربین دور یک کره (Spherical World)، شلیک هدفمند و اسپاون شهاب‌سنگ‌ها.

```text
Create a complete single-file HTML 3D Arcade Planet Defender game using Three.js.

Game Mechanics & World Boundaries:
1. Environment: A stylized 3D planet in the center of space, surrounded by starry skybox and incoming asteroids/alien ships from deep space.
2. Controls: Rotate turrets positioned around the planet using Mouse/Keyboard, firing lasers into outer space to intercept targets before they hit the planet surface.
3. Mechanics: Asteroids have varying sizes and speeds. Destroying them earns points; asteroids hitting the planet reduce Planet Health.
4. UI & HUD: Planet Health Globe, Score Multiplier, Upgrade Menu (Upgrade Laser Speed / Shield Generator), and Wave Survival Timer.
5. Technical: Spherical coordinate math for targeting, particle explosions, single index.html file without external assets.

```

---

### ۱۰. نبرد ناوهای جنگی (3D Naval Battleship Arcade)

> **تست:** فیزیک شناوری روی آب، قوس پرتابه توپ، سیستم دود و آتش و مرزهای دریا.

```text
Generate a complete single-file HTML 3D Naval Warship Combat game using Three.js.

Game Mechanics & World Boundaries:
1. Environment: An ocean arena enclosed by rocky fjords and fog boundaries preventing out-of-bounds sailing.
2. Controls: Command a battleship using A/D to steer and W/S for engine speed (Full Ahead, Stop, Reverse). Aim side cannons with mouse and Left-Click to fire a broadside volley.
3. Mechanics: Shells follow arc trajectories. Enemy warships patrol the waters, firing back when in range.
4. UI & HUD: Ship Hull Integrity, Cannon Reload Cooldown bars, Compass, Minimap showing enemy positions, and Victory Overlay.
5. Technical: Dynamic water vertex animation, cannon smoke and water splash particle effects, code-generated iron and ocean textures.

```

---

### 💡 یک پیشنهاد برای گرفتن خروجی بهتر:

هر کدام از پرامپت‌های بالا که توجهت را جلب کرد، می‌توانی به هوش مصنوعی بدهی و در صورت نیاز بگویی:

> *"کد این بازی را بنویس و برای کنترل‌ها، گزینه‌ای هم بگذار که هم با **کیبورد** کار کند هم با **دکمه‌های لمسی روی صفحه (Touch Controls)** تا روی موبایل هم قابل بازی باشد."*