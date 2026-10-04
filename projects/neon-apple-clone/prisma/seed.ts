import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "iphone-18-pro",
    name: "iPhone 18 Pro",
    tagline: "Pro further.",
    description:
      "Forged in titanium. Powered by the A20 Pro chip with a 6-core GPU built for neural magic. The 48MP Fusion camera system sees what others can't — even in the dark.",
    price: 1199,
    image: "/images/iphone-pro.png",
    category: "iPhone",
    accentColor: "#ff2ec4",
    badge: "New",
    featured: true,
    hero: true,
    sortOrder: 1,
    specs: JSON.stringify([
      { label: "Display", value: '6.9" Super Retina XDR, 120Hz ProMotion' },
      { label: "Chip", value: "A20 Pro, 6-core GPU, 16-core Neural Engine" },
      { label: "Camera", value: "48MP Fusion + 48MP Ultra Wide + 12MP 5x Tele" },
      { label: "Battery", value: "Up to 33 hours video playback" },
      { label: "Build", value: "Grade 5 Titanium, Ceramic Shield 3" },
      { label: "Storage", value: "256GB / 512GB / 1TB" },
    ]),
    highlights: JSON.stringify([
      "Titanium frame with neon-anodized finish",
      "Night mode that actually sees in the dark",
      "USB-C 3.2 — 20x faster transfers",
      "Apple Intelligence built into every app",
    ]),
  },
  {
    slug: "iphone-duo",
    name: "iPhone Duo",
    tagline: "Hello, hello.",
    description:
      "Two phones. One soul. iPhone Duo folds the future in half — an adaptive 8-inch flexible OLED that bends light to your will.",
    price: 1499,
    image: "/images/iphone-duo.png",
    category: "iPhone",
    accentColor: "#ffb03a",
    badge: "Pre-order",
    featured: true,
    hero: true,
    sortOrder: 2,
    specs: JSON.stringify([
      { label: "Display", value: '8" adaptive flexible OLED, 1-120Hz' },
      { label: "Chip", value: "A20 Duo, dual-cluster CPU" },
      { label: "Hinge", value: "600,000-fold tested titanium flex" },
      { label: "Battery", value: "Dual-cell, 28 hours combined" },
      { label: "Build", value: "Titanium + woven glass back" },
      { label: "Storage", value: "512GB / 1TB / 2TB" },
    ]),
    highlights: JSON.stringify([
      "World's first adaptive 8-inch folding OLED",
      "Dual-app mode — two apps, one glow",
      "Selfie camera works on both screens",
      "Crease-free display guarantee",
    ]),
  },
  {
    slug: "apple-watch-series-12",
    name: "Apple Watch Series 12",
    tagline: "Every heartbeat, illuminated.",
    description:
      "The most accurate heart rate sensor we've ever built. A retina-bright display that glows like a neon sign, and blood pressure insights on your wrist.",
    price: 429,
    image: "/images/watch.png",
    category: "Watch",
    accentColor: "#39ff14",
    badge: "New",
    featured: true,
    hero: true,
    sortOrder: 3,
    specs: JSON.stringify([
      { label: "Display", value: 'LTPO3 OLED, 3000 nits peak' },
      { label: "Sensor", value: "4th-gen optical HR + ECG + BP trend" },
      { label: "Battery", value: "36 hours, 72 in Low Power" },
      { label: "Chip", value: "S12 SiP with 4-core Neural Engine" },
      { label: "Water", value: "100m swim-proof, WR50" },
      { label: "Cases", value: "42mm / 46mm, Titanium or Aluminum" },
    ]),
    highlights: JSON.stringify([
      "Most accurate heart rate sensor ever",
      "Blood pressure trends on your wrist",
      "Sleep Score with neon night mode",
      "Double tap + Siren safety features",
    ]),
  },
  {
    slug: "macbook-neo",
    name: "MacBook Neo",
    tagline: "Light. Years ahead.",
    description:
      "Under a kilogram. All-day battery. The M6 chip with a 16-core Neural Engine turns your ideas into neon-lit reality at 120Hz on Liquid XDR.",
    price: 1399,
    image: "/images/macbook.png",
    category: "Mac",
    accentColor: "#b026ff",
    featured: true,
    hero: true,
    sortOrder: 4,
    specs: JSON.stringify([
      { label: "Display", value: '13.6" Liquid XDR, 120Hz, 1600 nits' },
      { label: "Chip", value: "M6, 10-core CPU, 16-core Neural Engine" },
      { label: "Memory", value: "16GB / 24GB / 32GB unified" },
      { label: "Battery", value: "24 hours, fastest charge yet" },
      { label: "Weight", value: "0.98 kg — lightest Mac ever" },
      { label: "Ports", value: "2x Thunderbolt 5, MagSafe, HDMI" },
    ]),
    highlights: JSON.stringify([
      "Lightest MacBook ever built",
      "24-hour battery — a full day, twice",
      "Fanless silent design",
      "Liquid XDR with nano-texture option",
    ]),
  },
  {
    slug: "ipad-pro-x",
    name: "iPad Pro X",
    tagline: "Thinpossible.",
    description:
      "Impossibly thin. Absurdly powerful. Tandem OLED with a nano-texture glow, plus Apple Pencil Pro for strokes of electric genius.",
    price: 999,
    image: "/images/ipad.png",
    category: "iPad",
    accentColor: "#00e5ff",
    featured: true,
    hero: true,
    sortOrder: 5,
    specs: JSON.stringify([
      { label: "Display", value: '13" Tandem OLED, nano-texture option' },
      { label: "Chip", value: "M6, 9-core CPU, 10-core GPU" },
      { label: "Pencil", value: "Apple Pencil Pro, haptic + squeeze" },
      { label: "Camera", value: "12MP Wide + LiDAR scanner" },
      { label: "Thickness", value: "5.1mm — thinner than a pencil" },
      { label: "Storage", value: "256GB up to 4TB" },
    ]),
    highlights: JSON.stringify([
      "Thinnest Apple product ever",
      "Tandem OLED — perfect blacks, neon brightness",
      "Apple Pencil Pro with haptic feedback",
      "Studio-quality mics and speakers",
    ]),
  },
  {
    slug: "airpods-pro-3",
    name: "AirPods Pro 3",
    tagline: "Silence, amplified.",
    description:
      "The world's best in-ear Active Noise Cancellation. Adaptive Audio that fades your world to black — or blasts it full neon.",
    price: 279,
    image: "/images/airpods.png",
    category: "AirPods",
    accentColor: "#00ffd5",
    featured: true,
    hero: true,
    sortOrder: 6,
    specs: JSON.stringify([
      { label: "ANC", value: "2x better than AirPods Pro 2" },
      { label: "Audio", value: "H3 chip, Adaptive EQ, Personalized Spatial" },
      { label: "Battery", value: "8h + 24h with case" },
      { label: "Health", value: "Heart-rate sensing, Hearing Aid mode" },
      { label: "Water", value: "IP57 sweat and water resistant" },
      { label: "Fit", value: "5 ear tip sizes, foam-infused" },
    ]),
    highlights: JSON.stringify([
      "World's best in-ear noise cancellation",
      "Live Translation in 12 languages",
      "Heart-rate sensing during workouts",
      "Hearing Test + Clinical-grade Hearing Aid",
    ]),
  },
  {
    slug: "vision-pro-2",
    name: "Apple Vision Pro 2",
    tagline: "Welcome to spatial neon.",
    description:
      "Your apps live in your room. A micro-OLED canvas with 23 million pixels, wrapped in a luminescent band of pure possibility.",
    price: 3799,
    image: "/images/vision.png",
    category: "Vision",
    accentColor: "#8a2be2",
    badge: "New",
    featured: true,
    hero: true,
    sortOrder: 7,
    specs: JSON.stringify([
      { label: "Display", value: "23M pixels micro-OLED, 92% DCI-P3" },
      { label: "Chip", value: "M6 + R3 dual-chip architecture" },
      { label: "Tracking", value: "12 cameras, 5 sensors, 6 mics" },
      { label: "Battery", value: "3.5h external pack, all-day plugged" },
      { label: "Weight", value: "450g with Dual Knit Band" },
      { label: "Audio", value: "Personalized Spatial Audio" },
    ]),
    highlights: JSON.stringify([
      "23 million pixels. Your room is the screen.",
      "M6 + R3 chips render in 12ms",
      "Eye, hand and voice — no controllers",
      "visionOS 27 with infinite canvas apps",
    ]),
  },
];

async function main() {
  console.log("Seeding database...");

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        specs: product.specs,
        highlights: product.highlights,
        hero: product.hero,
        tagline: product.tagline,
        description: product.description,
      },
      create: product,
    });
  }

  const statCount = await prisma.stat.count();
  if (statCount === 0) {
    await prisma.stat.createMany({
      data: [
        { key: "visits", value: 1284093 },
        { key: "newsletter", value: 0 },
        { key: "bagAdditions", value: 0 },
      ],
    });
  }

  console.log("Seed complete! Products:", await prisma.product.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
