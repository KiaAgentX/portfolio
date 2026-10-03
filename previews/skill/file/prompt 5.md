این هم **۱۰ ایده‌ی جذاب و خلاقانه** شامل ترکیبی از **محیط‌های تعاملی جدید** و **بازی‌های سه‌بعدی** که می‌توانید برای تست مدل‌های هوش مصنوعی (مثل Claude، Gemini و GPT) استفاده کنید.

تمام این پرامپت‌ها برای خروجی یک‌فایلی (`Single-file HTML`) طراحی شده‌اند و جزییات بالایی دارند:

---

### 🎮 بخش اول: ۵ ایده‌ی بازی جذاب و متفاوت

#### ۱. بازی مدیریت کارواش و اسپرت خودرو (3D Interactive Car Wash & Tuning)

> **سبک:** شبیه‌ساز/گیم‌پلی تعاملی
> **تست:** افکت کفی شدن، شستشو، تغییر بدنه و انیمیشن‌های ذرات آب.

```text
Build a complete, single-file HTML 3D Car Wash and Auto Detailer Game using Three.js and OrbitControls.

Gameplay & Interactions:
1. Environment: A bright, modern service garage with epoxy floors and equipment bays.
2. The Muddy Car: A modern sports car arrives covered in procedural mud/dirt particles.
3. Interactive Tools:
   - Pressure Washer Tool: Click and spray water particles to wash off mud from specific body panels dynamically.
   - Foam Cannon: Cover the car in fluffy white soap particles.
   - Polisher / Sponge: Click and rub to reveal a high-gloss reflective paint job.
4. Customization Station: Once clean, unlock a UI menu to change wheel rims, paint colors (Matte, Metallic, Chrome), and add neon underglow.
5. UI & Economy: Earn "Cash" for each clean/customized car to unlock new tools and upgrades.

Technical: Self-contained index.html file with embedded CSS and JS. Dynamic particle effects for water/foam and procedural dirt textures.

```

#### ۲. بازی کارآگاهی و حل معما در اتاق (3D Mystery Escape Room)

> **سبک:** فکری / اول شخص
> **تست:** پیدا کردن آیتم‌ها، پازل‌های تعاملی، باز کردن قفل‌ها و اینونتوری.

```text
Develop a fully playable, single-file HTML 3D Escape Room Puzzle Game using Three.js and PointerLockControls.

Gameplay & Interactions:
1. Environment: A detailed 3D study room/office with a locked exit door, bookshelf, desk, safe, and paintings. Bright ambient room lighting with a desk lamp.
2. Interactive Puzzles:
   - Clickable Drawers: Click to pull drawers open and search for items.
   - Interactive Safe: Enter a 4-digit combination code via a 3D keypad to unlock it.
   - Clues: A book on the shelf that opens when clicked, revealing a hidden key or sequence.
3. Inventory System: Bottom HUD displaying collected items (e.g., Key, Magnifying Glass, Code Note). Selecting an item from the inventory allows using it on objects in the room (e.g., Key on Exit Door).
4. UI & Game State: Crosshair, interactive tooltips ("Press [E] to Inspect"), Timer overlay, and Victory Escape screen.

Technical: Strictly enclosed room geometry, procedural wood/paper textures, self-contained HTML.

```

#### ۳. بازی آشپزی و ساخت پیتزا (3D Interactive Pizza Chef)

> **سبک:** شبیه‌ساز / اکشن آرکید
> **تست:** قرار دادن اجسام روی هم، تغییر فیزیک مواد (پختن)، تایمر و انیمیشن فر.

```text
Create a complete single-file HTML 3D Pizza Chef Simulator game using Three.js.

Gameplay & Interactions:
1. Environment: A cozy Italian kitchen counter with a traditional brick pizza oven in the background.
2. Pizza Creation Assembly:
   - Dough Base: Interactive flat dough on the counter.
   - Sauce & Cheese: Click/Drag to spread red tomato sauce and sprinkle cheese.
   - Toppings: Clickable tray containing Pepperoni, Mushrooms, Olives, and Bell Peppers. Click to place them onto the pizza grid.
3. Baking Mechanics:
   - Drag the prepared pizza into the wood-fired brick oven.
   - Watch the pizza cook in real-time with glowing embers and animated procedural melting/browning textures over a 10-second timer.
4. UI & Customers: Incoming customer order cards (e.g., "1x Pepperoni & Mushroom Pizza"). Serve the pizza to get a score rating and tip coins.

Technical: Single index.html, procedural food textures, particle smoke from the oven.

```

#### ۴. بازی تعادل و برج‌سازی فیزیکی (3D Physics Stacking Tower)

> **سبک:** فیزیکی / آرکید
> **تست:** جرم اجسام، مرکز ثقل، سقوط فیزیکی و دقت کلیک.

```text
Build an interactive, single-file HTML 3D Physics Block Stacking Game using Three.js and built-in rigid body physics math.

Gameplay & Interactions:
1. Environment: A minimalist indoor studio with a central platform surrounded by a safety net boundary.
2. Mechanics:
   - A moving mechanical crane arm hovers back and forth overhead carrying various 3D shapes (Boxes, Cylinders, L-shapes, Spheres).
   - Click or Press Spacebar to drop the block onto the platform.
3. Physics Simulation: Blocks must land smoothly, balance against gravity, and build up a tall stable tower. Wobbling or unbalanced stacks will cause blocks to tumble off the platform.
4. UI & Scoring: Live height meter tracking current tower height, High Score memory, Lives counter (3 strikes for dropped blocks), and Restart button.

Technical: Real-time collision detection, impulse physics, camera that smoothly climbs upward as the tower grows.

```

#### ۵. بازی حباب‌ساز و انفجار صابونی (3D Bubble Pop & Liquid Physics)

> **سبک:** کژوال / ریلکس‌کننده
> **تست:** شیدر انکسار نور روی صابون (Iridescence)، ترکیدن حباب و ذرات.

```text
Generate a self-contained single-file HTML 3D Relaxing Bubble Popper Game using Three.js.

Gameplay & Interactions:
1. Environment: A serene sunny garden courtyard with floating iridescent soap bubbles reflecting sunlight.
2. Interactive Bubbles:
   - Procedurally generated soap bubbles float upward with realistic organic wobble physics and rainbow reflection shaders.
   - Click on bubbles to POP them with dynamic liquid splash particles and satisfying pop visual effects.
   - Giant Bubbles require multiple clicks to split into smaller bubbles before popping.
3. Wand Tool: Move the mouse wand through the air to generate continuous streams of new floating bubbles.
4. UI & HUD: Bubble Pop Counter, Combo Streak Multiplier, and Background Music Visualizer mode.

Technical: Custom ShaderMaterial for rainbow soap refraction, high-performance particle system, single HTML file.

```

---

### 🏛️ بخش دوم: ۵ محیط تعاملی و شبیه‌ساز جالب

#### ۶. آزمایشگاه الکترونیک و مدارسازی ۳ بعدی (3D Interactive Electronics Breadboard)

> **تست:** اتصالات منطقی (Logic Graph)، روشن شدن LED، جریان سیم‌ها و سوئیچ‌ها.

```text
Build a complete single-file HTML 3D Interactive Electronics Workbench using Three.js and OrbitControls.

Interactive Features:
1. Environment: An engineer's desk with a central 3D breadboard, battery power supply, and multimeter.
2. Interactive Components: Drag and place 3D electronic parts onto the breadboard grid:
   - Power Sources (9V Battery), Switches (Toggle/Pushbutton), Resistors, and colored LEDs (Red, Green, Blue).
3. Circuit Simulation:
   - Connect components by drawing interactive 3D jumper wires between pins.
   - Toggling a switch closes the circuit, causing the LED to glow brightly and display voltage metrics on the Multimeter display.
4. UI Overlay: Component selection tray, "Clear Breadboard" button, and circuit safety warnings (e.g., "Overvoltage! LED Burnt Out").

Technical: Self-contained index.html, procedural plastic and copper wire geometry.

```

#### ۷. گلخانه و آکواریوم تعاملی اکوسیستم (3D Ecosystem Vivarium)

> **تست:** شبیه‌سازی حیات زنده، حرکت ماهی‌ها/حشرات، تغییرات آب‌وهوایی و نورپرداری تراریوم.

```text
Create a self-contained single-file HTML 3D Interactive Glass Vivarium/Aquarium simulator using Three.js.

Interactive Features:
1. Environment: A detailed cylindrical glass tank filled with dynamic water, aquatic plants, underwater rocks, and swimming fish.
2. Interactive Mechanics:
   - Click inside the tank to drop Fish Food flakes and watch the fish swim toward the food particles.
   - Click plants to trim or grow them.
   - Temperature & Lighting Controls: Sliders for "Water Temperature", "Filter Bubbler Intensity", and "Day/Night UV Light Cycles".
3. Glass Shaders: Glass refraction, underwater caustics light patterns on the sand floor, and floating air bubbles.
4. Camera: OrbitControls allowing 360-degree rotation and close-up zoom into individual sea creatures.

Technical: Flocking AI algorithm (Boids) for fish movement, procedural underwater lighting, single HTML file.

```

#### ۸. ساعت مکانیکی ۳ بعدی و چرخ‌دنده‌ها (Interactive 3D Mechanical Skeleton Clock)

> **تست:** پیوند والدی/فرزندی (Hierarchical Animation)، محاسبات دقیق ریاضی چرخش و زاویه.

```text
Develop an interactive single-file HTML 3D Mechanical Skeleton Clock Demonstrator using Three.js.

Interactive Features:
1. Environment: A workshop table displaying a fully visible 3D clock mechanism built from brass and steel gears, pendulum, escapement wheel, and hands.
2. Mechanical Simulation:
   - All gears interact with precise rotational ratios (e.g., 12:1 gear ratio between hour and minute mechanics).
   - Animated swinging pendulum driving the escapement tick-tock mechanism.
3. Interactive Controls:
   - Time Slider: Drag a timeline slider to manually fast-forward or rewind time and see all interlocking gears spin realistically in synchronization.
   - Exploded View Toggle: A button that smoothly expands all gears outward along the Z-axis so the inner mechanics can be inspected.
   - Material Toggles: Switch between Polished Brass, Dark Steel, or Sci-Fi Transparent Glass materials.

Technical: Exact mathematical rotation linking, procedural metal textures, smooth camera controls.

```

#### ۹. خانه درختی فوق مدرن (Interactive Luxury Treehouse Experience)

> **تست:** رندر گیاهان، نور آفتاب ردشده از برگ‌ها (Volumetric Sunlight)، دکوراسیون و جزییات معماری.

```text
Generate a complete single-file HTML 3D Interactive Architectural Treehouse Tour using Three.js and OrbitControls.

Interactive Features:
1. Environment: A stunning multi-level modern luxury treehouse wrapped around a massive procedural Redwood tree in a lush forest.
2. Exploration & Interactions:
   - Clickable view hotspots (Living Deck, Telescope Observatory, Suspension Bridge, Bedroom Loft) that smoothly animate the camera between rooms.
   - Toggleable Amenities: Click to light the firepit (animated flame particles), open glass sliding doors, or turn on fairy lights hanging from branches.
3. Time of Day Controls:
   - Interactive slider for Time of Day (Golden Hour Sunset, Bright Noon with sunbeams, Starry Night with glowing cabin lights).
4. UI Overlay: Architectural floor plan panel and lighting mode switches.

Technical: Procedural bark and foliage textures, dynamic soft shadows, single index.html file.

```

#### ۱۰. موزه و نمایشگاه تعاملی اشیاء باستانی (3D Museum & Artifact Inspector)

> **تست:** نورپردازی موزه، بازرسی ۳۶۰ درجه اشیاء، ذرات گرد و غبار، و UI توضیحات.

```text
Build a self-contained, single-file HTML 3D Interactive Museum Gallery using Three.js.

Interactive Features:
1. Environment: A sleek, dark museum hall with polished marble floors, spotlights, and velvet barrier ropes.
2. Display Pedestals:
   - 3 Central Pedestals featuring procedural historical artifacts (e.g., Ancient Golden Crown, Sculpted Marble Bust, Sci-Fi Relic).
3. Interaction:
   - Click on any artifact to zoom the camera smoothly into "Inspection Mode".
   - In Inspection Mode, players can rotate the artifact 360 degrees, turn on an interactive magnifying flashlight, or toggle a Wireframe/UV Inspector shader.
4. UI Info Cards: Selecting an object opens a stylized glassmorphism side panel detailing the object's fictional history, material composition, and origin date.

Technical: Smooth camera transitions (GSAP/Tween style in vanilla JS), realistic museum spotlighting, single HTML file.

```