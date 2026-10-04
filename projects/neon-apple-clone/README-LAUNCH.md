# 🌃 Neon Apple — Dark Neon Apple.com Clone (Fullstack)

کلون کامل وب‌سایت apple.com با تم دارک نئون — فول‌استک با Next.js 16، TypeScript، Prisma و SQLite.

> Full-stack Apple.com clone with a dark neon theme — Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma + SQLite.

---

## 🚀 Launch (3 commands)

### With Bun (recommended — fastest)
```bash
bun install
bun run db:push && bun prisma/seed.ts
bun run dev
```
➡ Open **http://localhost:3000**

> ⚡️ The database file (`db/custom.db`) is already seeded — you can skip step 2 and go straight to `bun run dev` if it exists.

### With Node.js / npm
```bash
npm install
npx prisma db push && npx prisma db generate && npx tsx prisma/seed.ts
npm run dev
```

### Production build
```bash
bun run build   # or: npm run build
bun run start   # serves on port 3000
```

---

## ✨ Features

### Frontend (Apple.com structure, 100% complete)
| Section | Details |
|---|---|
| 📢 Announcement bar | Infinite neon marquee of product news |
| 🧭 Glass navbar | Sticky, blur, neon hover underlines, live **search sheet** (debounced API search + add-to-bag from results), bag badge |
| 🖼 7 Hero segments | One per product — iPhone 18 Pro, iPhone Duo, Watch Series 12, MacBook Neo, iPad Pro X, AirPods Pro 3, Vision Pro 2 — aurora glows, gradient taglines, animated float |
| 🛍 Product grid | Category filter tabs, neon cards, badges (NEW / PRE-ORDER) |
| 📦 Product dialog | **Learn more** anywhere → full details: image, description, highlights, tech-specs table, quantity stepper, add-to-bag with success state |
| 🚚 Apple Store difference | Free delivery / Trade In / Personal Setup / Financing cards |
| 🎬 Entertainment | Apple Music, TV+, Arcade, iCloud+, Fitness+, News+ tiles + Apple One bundle strip |
| 📊 Live stats ticker | Real numbers straight from SQLite (visits, products, bag additions, members) |
| ✉️ Newsletter | Async subscribe with validation + success/error feedback |
| 🦶 Apple-style footer | 5 link columns, neon divider, legal bar |

### Backend (REST API routes)
| Endpoint | Methods | Description |
|---|---|---|
| `/api/products` | GET | List products — supports `?category=`, `?featured=true`, `?slug=`, `?q=` (search) |
| `/api/newsletter` | POST / GET | Subscribe (zod-validated, upsert) / subscriber count |
| `/api/bag` | GET / POST / PATCH / DELETE | Cookie-session shopping bag: fetch, add, change qty, remove — with totals |
| `/api/stats` | GET | Live counters (increments visits) |

### Database (Prisma + SQLite)
- `Product` — slug, tagline, price, image, category, accent color, badge, hero flag, **specs JSON**, **highlights JSON**, sort order
- `Subscriber` — unique emails
- `BagItem` — session-scoped cart lines (unique per session+product)
- `Stat` — key/value counters (visits, newsletter, bagAdditions)

7 AI-generated cyberpunk product images ship in `public/images/` (no copyrighted Apple assets).

---

## 🗂 Project structure
```
src/
  app/
    page.tsx                 # Home — server component, renders everything
    layout.tsx               # Root layout (metadata: "Neon Apple")
    globals.css              # Neon theme: glow utilities, aurora/marquee keyframes
    api/
      products/route.ts      # GET list + search + filters
      newsletter/route.ts    # POST subscribe, GET count
      bag/route.ts           # Full cart CRUD (cookie session)
      stats/route.ts         # Live counters
  components/neon/           # All UI sections (navbar, heroes, grid, dialog…)
  store/                     # Zustand: bag-store, product-dialog-store
  lib/                       # db client, shared types, price formatting
prisma/
  schema.prisma              # Product / Subscriber / BagItem / Stat
  seed.ts                    # Seeds 7 products with specs + highlights
db/custom.db                 # Pre-seeded SQLite database
```

## ⚙️ Environment
`.env` (already included, relative path works anywhere):
```
DATABASE_URL=file:./db/custom.db
```

## 🧰 Tech stack
Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui (New York) · Framer Motion · Zustand · Prisma ORM + SQLite · Lucide icons

## 📝 Notes
- All product names/prices are inspired by Apple's public marketing pages; imagery is AI-generated — for demo/portfolio use.
- Licensed for personal & educational use.
