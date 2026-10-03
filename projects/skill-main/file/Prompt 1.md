Here are **5 interactive, single-file HTML/Three.js prompts** modeled after the first example. Each prompt tests different aspects of an AI model's code generation abilities—such as physics, procedural materials, lighting, dynamic weather, and mechanical animations.

---

### 1. Cyberpunk Neon Street & Sci-Fi Hover Car

> **Focus:** Tests bloom/emissive materials, atmospheric fog, dynamic lighting, and simple float physics.

```text
Build a complete, single-file HTML application using Three.js and OrbitControls to render an interactive cyberpunk street scene featuring a futuristic hover car.

Scene Requirements:
1. Environment: A wet asphalt street reflecting light, surrounded by tall dark skyscrapers with procedural glowing neon signs, glass windows, and dynamic atmospheric fog.
2. Main Subject: A detailed sci-fi hover car built purely from Three.js primitive geometries. It must feature glowing headlights, neon underglow, and an animated subtle floating/bobbing motion.
3. Lighting: High-contrast ambient lighting with colorful point lights (cyan and magenta) casting soft shadows across the ground and buildings.

Interactive UI & Controls:
- Top Title: "Cyberpunk Vehicle Lab"
- Left Panel: Sliders for "Hover Height", "Engine Power", "Neon Glow Intensity", and "Fog Density".
- Controls: Dropdown for camera angles (Cinematic, Driver View, Top-Down, Reset) and a toggle switch for "Night Lights / Day Mode".
- Right Panel: Simulated metrics displaying "FPS", "Polygons", "Draw Calls", and "Shader Passes".

Technical Rules:
- Must be a fully self-contained index.html file with internal CSS and JavaScript.
- All textures (wet road, neon grids) must be generated procedurally via HTML5 Canvas.

```

---

### 2. Medieval Armored Knight & Sword Training Dummy

> **Focus:** Tests character assembly from primitives, inverse kinematics/hierarchical animation, and metallic surface shaders.

```text
Create a self-contained, single-file HTML app using Three.js that renders an interactive medieval armory/training yard with an animated training dummy and a knight target.

Scene Requirements:
1. Environment: A cobblestone courtyard enclosed by stone fortress walls, wooden weapon racks, shields, and burning torches with point light flickering.
2. Main Subject: A medieval knight mannequin or training target clad in plate armor, built using metallic procedural materials. It should react with spring physics when hit.
3. Lighting: Warm firelight mixed with directional sunlight, casting soft dynamic shadows.

Interactive UI & Controls:
- Top Title: "Armory & Physics Test Workbench"
- Left Panel: Sliders for "Armor Reflectivity", "Impact Force", and "Torch Light Intensity".
- Buttons: A "Strike Target" button that triggers a physics-based hit animation with camera shake, and a "Reset Pose" button.
- Camera: OrbitControls enabled, plus preset view buttons (Close-up, Full Yard, Free Cam).
- Right Panel: Real-time UI metrics showing "FPS", "Mesh Count", "Shadow Map Resolution", and "Physics Delta".

Technical Rules:
- Single HTML file only. No external GLTF/OBJ assets.
- Metallic textures, wood grain, and stone patterns must be written procedurally in JavaScript.

```

---

### 3. Sci-Fi Mecha Hangar & Dynamic Charging Dock

> **Focus:** Tests complex robotic joint hierarchies, mechanical animation, and industrial lighting setups.

```text
Generate a complete, single-file HTML application using Three.js featuring an interactive 3D Sci-Fi Robot Mecha resting inside an industrial maintenance hangar.

Scene Requirements:
1. Environment: A dark sci-fi hangar bay with metal floor plating, warning stripes, hydraulic support arms, yellow industrial railings, and overhead spot lights.
2. Main Subject: A bipedal mecha robot composed of geometric parts with articulated joints (arms, legs, torso). Include animated mechanical parts like opening chest vents or rotating shoulder cannons.
3. Lighting: Moody volumetric-style lighting with multiple colored spotlights casting crisp directional shadows.

Interactive UI & Controls:
- Top Title: "Mecha Diagnostics & Rendering Lab"
- Left Panel: Sliders for "Joint Articulation", "Vent Opening %", "Spotlight Intensity", and "Paint Wear / Weathering".
- Actions: Buttons for "Startup Sequence" (triggers an animation of glowing eyes and moving arms) and "Emergency Blast".
- Right Panel: Diagnostics panel showing "Core Temp (Simulated)", "FPS", "Triangles", and "VRAM Usage".

Technical Rules:
- Everything contained within one index.html file.
- All industrial metals, hazard lines, and panel textures generated via code (Canvas API).

```

---

### 4. Pirate Ship on Dynamic Ocean Water

> **Focus:** Tests procedural vertex-shader water movement, ocean reflections, and multi-part ship rigging.

```text
Create a self-contained single-file HTML interactive 3D app using Three.js showcasing a wooden Pirate Galleon sailing on animated procedural sea water.

Scene Requirements:
1. Environment: An open ocean with dynamic, sine-wave animated water vertices, a stylized sky hemisphere, and a glowing sun on the horizon.
2. Main Subject: A detailed pirate ship built from wood primitives, featuring deck planks, cannons, masts, and billowing sails that gently sway with a wind simulation.
3. Lighting: Warm sunset lighting with specular reflections on the moving water surface and realistic shadow mapping.

Interactive UI & Controls:
- Top Title: "Maritime Physics & Ocean Test Lab"
- Left Panel: Sliders for "Wave Height", "Wind Speed (Sail Motion)", "Water Clarity/Color", and "Time of Day".
- Controls: A "Fire Cannons" button that emits particle smoke and knocks the ship back slightly, plus camera view options (Deck View, Crow's Nest, Orbit).
- Right Panel: Live stats displaying "FPS", "Vertex Count", "Wave Calculations/sec", and "Texture Memory".

Technical Rules:
- Single HTML file with embedded CSS and JS.
- No external image files allowed; water and wood textures must be code-generated.

```

---

### 5. Aircraft Runway & Jet Engine Simulation

> **Focus:** Tests particle systems (jet exhaust), high-speed camera tracking, and vast open terrain rendering.

```text
Develop a complete, single-file HTML 3D application using Three.js showcasing a modern fighter jet parked on an airport runway at dusk.

Scene Requirements:
1. Environment: A long asphalt runway with painted yellow/white line markings, edge lights, distance markers, and a distant mountain silhouette against a dusk sky.
2. Main Subject: A sleek fighter jet assembled from low-poly geometry with tinted cockpit glass, detailed wings, and an animated heat haze / particle engine exhaust effect.
3. Lighting: Low-angle dusk sunlight combined with glowing runway lights casting long, soft dynamic shadows.

Interactive UI & Controls:
- Top Title: "Aerodynamics & Jet Engine Test Bench"
- Left Panel: Sliders for "Throttle / Afterburner Intensity", "Cockpit Opacity", "Runway Light Brightness", and "Sun Elevation".
- Interactive Buttons: "Takeoff Run" (animates jet speeding down the runway), "Deploy Airbrake", and "Reset Position".
- Right Panel: Flight telemetry overlay showing "Simulated Mach", "FPS", "Particle Count", and "Draw Calls".

Technical Rules:
- Must be fully contained in one single index.html file.
- All asphalt textures, line markings, and exhaust particles generated procedurally in JavaScript.

```