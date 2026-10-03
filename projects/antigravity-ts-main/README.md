# 🛸 antigravity-ts — Antigravity Research Platform (TypeScript)

The TypeScript edition of the antigravity research simulator: a mission-control
dashboard (**GRAVITAS-X** node) with live telemetry, a theoretical physics
sandbox, classified documentary archives and a propulsion calculator.
Pure client-side React + Vite SPA — no backend, no keys needed.
Live demo (after Pages activation): https://imxforever.github.io/antigravity-ts/

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-FF6384?style=flat)

> Sibling repo: [`antigravity-lab`](https://github.com/ImXforever/antigravity-lab)
> — the JavaScript edition with a different visual theme.

## 📸 Screenshots

<img src="docs/shot-dashboard.jpg" width="700" alt="Control Center">

*Control Center — GMI/stability/density/excitation gauges, engine presets, spectral chart*

<img src="docs/shot-sandbox.jpg" width="700" alt="Theoretical Sandbox">

*Theoretical Sandbox — interactive physics simulator*

<img src="docs/shot-archives.jpg" width="700" alt="Classified Archives">

*Classified Archives — documentaries & blueprint browser*

## ✨ Features

| Tab | What it does |
|---|---|
| 🛰️ Control Center | Live gauges (GMI, stability, density, excitation), legendary engine presets (Electrogravitics, Quantum Levitation, Alcubierre…), wave-frequency spectral chart |
| ⚛️ Theoretical Sandbox | Interactive physics simulator with typed state |
| 🗄️ Classified Archives | Documentary & blueprint archive browser |
| 🧮 Propulsion Calculator | Formula console with downloadable reports |
| ⚙️ Settings & Export | Display modes + full-state JSON export |

## 🏗️ Architecture

```mermaid
flowchart TD
    A["App.tsx<br/>tab router"] --> S["constants.ts + types.ts<br/>typed models & presets"]
    A --> V1["Dashboard"]
    A --> V2["PhysicsSandbox"]
    A --> V3["ClassifiedArchives"]
    A --> V4["PropulsionCalculator"]
    A --> V5["SettingsExport"]
    V1 --> R["Recharts spectral feed"]
```

Fully typed (`types.ts`), zero backend calls.

## 🚀 Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |

Static hosting ready: relative asset paths (`base: './'`) — the `dist/`
output works on GitHub Pages (project path), any domain root, or `file://`.

## 📦 Project structure

```
├── src/
│   ├── App.tsx                # tab router + layout
│   ├── constants.ts           # engine presets & static data
│   ├── types.ts               # shared TypeScript models
│   └── components/            # Sidebar, Dashboard, PhysicsSandbox,
│                              # ClassifiedArchives, PropulsionCalculator,
│                              # SettingsExport
├── docs/                      # README screenshots
└── dist/                      # production build (git-ignored)
```

## 🛠️ Tech

React 19 · Vite 6 · TypeScript 5 · Tailwind CSS 4 · Recharts ·
Lucide icons — dark green terminal theme.

## 🔧 Polish notes

- **Pruned 4 unused dependencies** (`express`, `dotenv`, `@google/genai`,
  `motion` + `@types/express`) — leftover server/AI scaffolding with zero
  imports; manifest now matches the actual pure-frontend app
- **Branding:** package renamed `react-example` → `antigravity-ts` @ `0.1.0`,
  repo renamed `3d` → `antigravity-ts`, meta description, MIT license
- **Hygiene:** added missing `.gitignore`; portable `base: './'`, verified
  the production build loads with zero failed requests
- **QA:** `tsc` clean, `vite build` clean, headless run of 3 tabs with
  **0 console/page errors and 0 HTTP errors** ✅ · no secrets ✅

## 📜 License

MIT — see [LICENSE](LICENSE). © 2026 ImXforever.
