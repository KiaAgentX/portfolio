/**
 * ============================================================
 *  THREE_SCENE.JS - موتور سه‌بعدی کهکشانی با استفاده از Three.js
 * ============================================================
 */

// three.min.js is a UMD build (no ESM exports) loaded via <script defer>; use the global.
const THREE = window.THREE;

let scene, camera, renderer;
let cube, particles;
let mouseX = 0, mouseY = 0;

export function initScene() {
    if (!THREE) return; // WebGL lib failed to load: skip 3D background
    const container = document.getElementById('three-canvas');
    if (!container) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // ۱. صحنه و دوربین
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050c);
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1, 8);

    // ۲. رندرر
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ۳. نورپردازی
    const ambient = new THREE.AmbientLight(0x404060);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    // ۴. ایجاد مکعب سه‌بعدی
    createCube();

    // ۵. ایجاد کهکشان ذرات
    createGalaxy();

    // ۶. ردیابی موس
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ۷. تغییر سایز پنجره
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    // ۸. حلقه انیمیشن
    animate();
}

function createCube() {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.15, roughness: 0.3, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0xff2255, emissive: 0xff2255, emissiveIntensity: 0.15, roughness: 0.3, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.15, roughness: 0.3, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.15, roughness: 0.3, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.15, roughness: 0.3, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.15, roughness: 0.3, metalness: 0.8 })
    ];
    cube = new THREE.Mesh(geometry, materials);
    cube.position.set(0, 0, 0);
    scene.add(cube);
}

function createGalaxy() {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color1 = new THREE.Color(0x00ff88);
    const color2 = new THREE.Color(0xff2255);
    const color3 = new THREE.Color(0xffd700);

    for (let i = 0; i < count * 3; i += 3) {
        const radius = 3 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        positions[i] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i+1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i+2] = radius * Math.cos(theta);
        const rand = Math.random();
        const col = rand < 0.33 ? color1 : (rand < 0.66 ? color2 : color3);
        colors[i] = col.r;
        colors[i+1] = col.g;
        colors[i+2] = col.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function animate() {
    requestAnimationFrame(animate);
    if (cube) {
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.002;
        // حرکت نرم با موس (پارالاکس)
        cube.rotation.y += mouseX * 0.05;
        cube.rotation.x += mouseY * 0.05;
    }
    if (particles) particles.rotation.y += 0.0002;
    renderer.render(scene, camera);
}
