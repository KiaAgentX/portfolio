این هم **۱۰ پرامپت تعاملی (Interactive)** برای ساخت ابزارها، شبیه‌سازها و محیط‌های سه بعدیِ کارآمد.

این پرامپت‌ها برعکس بازی، روی **تست مکانیزم‌های فیزیکی، شبیه‌سازی‌های علمی، گرافیک صنعتی، ابزارهای تعاملی و ویژوالایزرها** تمرکز دارند. تمام آن‌ها برای خروجی **Single-file HTML** با Three.js طراحی شده‌اند:

---

### ۱. شبیه‌ساز انباشت و فیزیک زنجیره‌ای (Interactive Domino & Physics Lab)

> **تست:** فیزیک برخورد اجسام (Rigid Body Collision)، گرانش، چیدن اجسام در مسیرهای پیچیده و ضبط حرکت.

```text
Build a complete, single-file HTML 3D Interactive Dominoes Physics Lab using Three.js and Cannon.js (or built-in physics).

Interactive Features & Environment:
1. Environment: A polished wooden table inside a studio room, bounded by table edges.
2. Placement Tool:
   - Click and drag on the table surface to draw a custom path of 3D domino blocks.
   - A "Spacing" slider determines how close dominoes are placed to each other.
3. Physics Interaction:
   - Click a "Push First Domino" button to trigger the chain reaction with realistic gravity and momentum.
   - Add obstacles like ramps, swinging pendulums, and bridges that dominoes can trigger.
4. Interactive UI:
   - Sliders for "Gravity Force", "Domino Mass", and "Friction".
   - Buttons: "Topple", "Reset Board", and "Clear All".
   - Camera: OrbitControls with camera focus presets (Top View, Free Cam, Follow Lead Domino).

```

---

### ۲. استودیوی تعاملی نورپردازی و متریال ماشین (Interactive Car Showroom & Lighting Studio)

> **تست:** سنجش کیفیت بازتاب نور (PBR Materials)، تغییر رنگ بدنه، جابه‌جایی منابع نور و سایه‌های واقع‌گرایانه.

```text
Create a self-contained, single-file HTML 3D Interactive Car Showroom and Shader Testing Studio using Three.js.

Interactive Features & Environment:
1. Environment: A high-end dark showroom with a reflective epoxy floor, circular turntable, and customizable overhead studio light rigs.
2. Material & Color Customizer:
   - Color Picker UI to change car body paint (Metallic, Matte, Pearlescent, Glossy).
   - Sliders for "Roughness", "Metalness", and "Clearcoat".
   - Toggle options for Tinted Glass, Carbon Fiber Trim, and Chrome Accents.
3. Studio Lighting Controls:
   - Drag-and-drop interactive 3D spotlight fixtures around the room to adjust lighting angles.
   - Sliders for "Key Light Intensity", "Fill Light Color", and "Shadow Softness".
4. Interactive UI:
   - Turntable "Auto-Rotate Speed" slider.
   - Camera presets: Front Quarter, Rear Detail, Interior View, and Bird's Eye.

```

---

### ۳. آزمایشگاه تعاملی جاذبه و منظومه شمسی (3D Orbital Mechanics & Planet Lab)

> **تست:** فرمول‌های ریاضیِ شبیه‌سازی جاذبه، خطوط مسیر حرکت (Orbits) و برهم‌کنش اجرام آسمانی.

```text
Develop a complete single-file HTML 3D Interactive Planet & Gravity Simulator using Three.js.

Interactive Features & Environment:
1. Environment: Deep space skybox with procedural starfield background.
2. Physics Mechanics:
   - Real-time gravitational attraction physics where larger masses pull smaller celestial bodies.
   - Planet Creator: Click in space to spawn a new planet, then drag a vector line to set its initial velocity and direction.
3. Interactive Tools:
   - Sliders for "G-Constant (Gravity Strength)", "Time Warp Speed (1x, 5x, 10x)", and "Collision Merge vs. Explode".
   - Toggleable "Orbital Tail/Traces" showing the historical motion paths of each planet.
4. UI & Analytics:
   - Panel displaying number of active bodies, fastest moving planet, and total system mass.
   - Reset button and preset system templates (e.g., "Earth-Moon System", "Three-Body Problem", "Binary Star").

```

---

### ۴. شبیه‌ساز تعاملی موج و سیالات (Dynamic Ocean Wave & Fluid Lab)

> **تست:** تغییر الگوریتمیِ شیدر ورتکس (Vertex Shader Animation)، شناوری اجسام و سطح آب تعاملی.

```text
Create an interactive, single-file HTML 3D Ocean Wave & Buoyancy Simulator using Three.js.

Interactive Features & Environment:
1. Environment: An open ocean surface using dynamic custom procedural shaders with subsurface scattering simulation.
2. Mouse Interaction:
   - Clicking or dragging on the water surface creates realistic expanding circular ripples and waves.
3. Buoyancy & Objects:
   - Drop interactive floating 3D objects (Wooden Crate, Rubber Duck, Metal Sphere) into the water.
   - Objects naturally bob, tilt, and drift based on local wave height and object density/mass.
4. Interactive UI:
   - Sliders for "Wave Amplitude/Height", "Wind Speed", "Water Clarity/Color", and "Fluid Density".
   - Toggle wireframe mode to inspect the underlying dynamic mesh geometry in real-time.

```

---

### ۵. سازنده و شبیه‌ساز پارچه و باد (Interactive 3D Cloth Physics Simulation)

> **تست:** ساختاربندی ذرات و فنرها (Mass-Spring System)، فیزیک باد، برخورد پارچه با اجسام صلب.

```text
Build a complete, single-file HTML 3D Interactive Cloth Simulation using Three.js and a custom particle-spring system.

Interactive Features & Environment:
1. Environment: A minimalist testing grid with a central 3D sphere/pole.
2. Cloth Interaction:
   - A realistic cloth mesh pinned at corner points.
   - Mouse Interaction: Click and drag anywhere on the cloth to stretch, pull, or tear it.
   - Drop a solid sphere or box onto the cloth to test collision and draping behavior.
3. Interactive UI:
   - Sliders for "Wind Speed & Direction", "Gravity", "Cloth Stiffness/Stretch", and "Particle Friction".
   - Material Selector: Silk (light/smooth), Denim (stiff/heavy), or Rubber.
   - Action Buttons: "Cut Pins", "Reset Cloth", and "Toggle Wind Blast".

```

---

### ۶. کنسول تعاملی ذرات و انفجار (Interactive 3D Particle & FX Lab)

> **تست:** رندرینگ همزمان هزاران ذره (GPU Instanced Particles)، فیزیک نیروهای جاذبه/دافعه و سیستم‌های نوردهی.

```text
Generate a self-contained single-file HTML 3D Interactive Particle FX Studio using Three.js.

Interactive Features & Environment:
1. Environment: Dark space environment with subtle floor grid reflections.
2. Particle Emitter Mechanics:
   - High-performance particle engine generating 50,000+ interactive particles.
   - Mouse Interaction: Moving the mouse acts as a Force Attractor or Repeller, pulling or pushing particles dynamically in 3D space.
3. FX Presets & Customization:
   - Presets dropdown: "Black Hole Vortex", "Firework Explosion", "Solar Flare", and "Galaxy Spiral".
   - Sliders for "Particle Count", "Emission Rate", "Life Span", "Turbulence", and "Color Gradient Spectrum".
4. Technical Features: Custom ShaderMaterial using additive blending for vibrant glowing particle effects.

```

---

### ۷. استودیوی مجسمه‌سازی و تغییر فرم سه بعدی (Interactive 3D Mesh Sculpting Tool)

> **تست:** دستکاری ورتکس‌ها در زمان واقعی (Real-time Mesh Deform)، الگوریتم‌های تغییر شکل و برس‌ها.

```text
Develop a complete single-file HTML 3D Interactive Clay/Mesh Sculpting application using Three.js.

Interactive Features & Environment:
1. Environment: A clean 3D CAD/Design workspace with floor grid and focal lighting.
2. Sculpting Tools:
   - Base 3D Mesh (Sphere or Cube) positioned in the center.
   - Sculpting Brushes: "Push/Pull" (extrude or indent vertices), "Smooth" (average surrounding vertex heights), and "Flatten".
   - Mouse Interaction: Click and drag directly on the 3D model surface to sculpt it in real-time.
3. Interactive UI:
   - Sliders for "Brush Radius/Size", "Brush Intensity/Strength", and "Mesh Subdivision Level".
   - Material Toggles: Clay Material, Wireframe View, Smooth Normal Shading vs. Flat Shading.
   - Action Buttons: "Undo", "Reset Mesh", and "Export OBJ (Simulated)".

```

---

### ۸. ژنراتور و ابزار تعاملی ساخت شهر (Interactive Procedural City Generator)

> **تست:** ساخت الگوریتمی ساختارها (Procedural Generation)، چیدمان شبکه جاده‌ها، تنوع ارتفاع برج‌ها.

```text
Create a complete single-file HTML 3D Interactive Procedural City Builder using Three.js.

Interactive Features & Environment:
1. Environment: An expansive terrain grid that transforms into a bustling 3D metropolis.
2. Generation Controls:
   - Click "Regenerate City" to build a brand new procedural city layout instantly.
   - Interactive Sliders: "Building Density", "Max Building Height", "Park/Green Zone Ratio", and "Road Grid Complexity".
3. Interactive Inspection:
   - Click any individual building to view its details in a UI side panel (e.g., "Floors: 42", "Building Type: Commercial", "Energy Usage").
   - Toggle "Night Mode" to switch on glowing window textures and street lights.
4. Camera & FX: Free-fly OrbitControls with tilt and zoom, atmospheric urban fog, and directional soft shadow sunlight.

```

---

### ۹. آزمایشگاه نوری، بازتاب و شکست نور (3D Interactive Optics & Laser Lab)

> **تست:** محاسبات دقیق خطی (Ray-casting/Vector Math)، بازتاب از آینه و شکست نور در منشور.

```text
Build a self-contained, single-file HTML 3D Optics & Laser Physics Laboratory using Three.js.

Interactive Features & Environment:
1. Environment: An optical bench table with grid measurements and dark laboratory surroundings.
2. Interactive Equipment Placement:
   - Drag and place equipment onto the bench: Laser Emitters, Flat Mirrors, Convex Lenses, Triangular Prisms, and Targets.
   - Rotate any object in 3D space to change its angle.
3. Ray Tracing Physics:
   - Lasers project physical light beams that accurately reflect off mirrors (Angle of Incidence = Angle of Reflection) and refract/bend through glass prisms based on Snell's Law.
   - Split light beams into rainbow spectra when passing through prisms.
4. Interactive UI:
   - Sliders for "Laser Color/Wavelength", "Glass Refractive Index (IOR)", and "Beam Intensity".
   - Metrics Panel showing total light reflections, refractive angles, and target hits.

```

---

### ۱۰. ویژوالایزر صوتی تعاملی ۳ بعدی (Interactive 3D Audio Visualizer Studio)

> **تست:** آنالیزفرکانس صدا در زمان واقعی (Web Audio API / Fast Fourier Transform)، همگام‌سازی شکل‌های سه بعدی با بیس صدا.

```text
Create a complete single-file HTML 3D Interactive Audio Visualizer using Three.js and Web Audio API.

Interactive Features & Environment:
1. Environment: A futuristic neon music stage/grid that pulses to the rhythm of sound.
2. Audio Mechanics:
   - Includes a drag-and-drop area for MP3 files or a "Use Microphone Input" button to analyze live audio frequencies in real-time using FFT (Fast Fourier Transform).
3. 3D Visual Modes (User Selectable):
   - Mode A: "Bar Equalizer" – A circular grid of 3D towers that extrude and jump based on bass/treble frequencies.
   - Mode B: "Deforming Fluid Sphere" – A organic 3D sphere that morphs its vertices and expands on heavy bass hits.
   - Mode C: "Tunnel Flythrough" – A geometric light tunnel that speeds up according to track tempo.
4. Interactive UI:
   - Controls for "Visual Sensitivity", "Color Scheme Spectrum", "Bloom Glow Intensity", and Play/Pause controls.

```