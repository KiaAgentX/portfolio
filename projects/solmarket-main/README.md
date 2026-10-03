# ⚡ solmarket — GQR Institutional V3.3 Trading Simulator

A login-gated React + Express trading simulator running the **GQR Institutional V3.3**
engine: a live simulated market with a 2-second ticker, an RL agent trading arena,
a Monte Carlo backtester, 14 TradingView indicators, a code explorer and a
Gemini-powered trading oracle with two personas.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat&logo=express&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-Oracle-8E75B2?style=flat&logo=googlegemini&logoColor=white)

## 📸 Screenshots

<img src="docs/shot-login.jpg" width="700" alt="Login gate">

*Login gate — demo credentials below*

<img src="docs/shot-arena.jpg" width="700" alt="Inference Arena">

*Inference Arena — live ticker, TradingView chart, neural signal vector, BUY/SELL co-pilot*

<img src="docs/shot-backtest.jpg" width="700" alt="Event Backtester">

*Event Backtester — Monte Carlo simulations over historical data*

<img src="docs/shot-indicators.jpg" width="700" alt="Indicator Toolkit">

*Indicator Toolkit — 14 GQR indicator scripts with code viewer*

> Screenshots are shared with the sibling repo `GQR-v3`: both apps are built from
> byte-identical `src/`, so they render pixel-identical UIs.

## ✨ Modules (8)

| Tab | What it does |
|---|---|
| ⚡ Inference Arena | RL agent simulator: live feed, TradingView chart, manual BUY/SELL with lot + TP/SL |
| 📚 Indicator Toolkit | 14 GQR indicators with Pine Script source viewer |
| 📈 Event Backtester | Monte Carlo backtests over bundled historical data |
| 💻 System Codebase | Interactive explorer of the engine's core files |
| 📖 Roadmap Manual | License + quick-start guide |
| 🔥 xAI Grok Reactor | "Elon mode" — Grok-persona market copilot (needs `GEMINI_API_KEY`) |
| ✨ UX Audit Forge | 100-rule UX diagnostic questionnaire |
| 🎛️ Admin Controller | Live server overrides: trend bias, volatility, tick speed |

## 🏗️ Architecture

```mermaid
flowchart LR
    U([Trader]) --> A["React 19 SPA<br/>8 modules · Tailwind 4"]
    A -->|REST fetch| E["Express server.ts<br/>:3000"]
    E --> T["2s market ticker<br/>prices · TP/SL + equity engine"]
    E --> P["Live price pollers<br/>with fallback source"]
    E --> G["Gemini oracle<br/>🏛️ Pythian · 𝕏 Grok"]
    E --> S["Frontend serving<br/>dev: Vite middleware<br/>prod: dist/ static"]
```

## 🔌 API endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Demo login (see credentials) |
| GET | `/api/market/state` | Full market snapshot (prices, positions, equity, logs) |
| POST | `/api/market/trade` | Open `BUY`/`SELL` with `lot`, `tp`, `sl` |
| POST | `/api/market/close` | Close a position by `id`, settle P&L |
| POST | `/api/market/reset` | Reset the $10,000 demo account |
| POST | `/api/market/config` | Admin tuning: `trendBias`, `volatility`, `tickIntervalMs` |
| POST | `/api/gemini/analyze` | Oracle report (live or backtest context, optional chart image) |

## 🚀 Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env   # then add your GEMINI_API_KEY (only needed for the oracle tabs)
npm run dev            # full-stack dev server on http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server (Express + Vite middleware via `tsx`) |
| `npm run build` | Build client to `dist/` + bundle server to `dist/server.cjs` |
| `npm start` | Run production build (`NODE_ENV=production`) |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |

**Demo login:** username `admin` · password `ImX`
(overridable in production via `ADMIN_USER` / `ADMIN_PASS`)

| Env var | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Enables the Pythian/Grok oracle; everything else works without it |
| `ADMIN_USER` / `ADMIN_PASS` | `admin` / `ImX` | Login credentials |
| `PORT` | `3000` | Server port |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Oracle model |
| `NODE_ENV` | — | `production` serves `dist/` statically |

> Note: this is a full-stack app (it needs its Node server), so it can't be hosted
> on static-only GitHub Pages — deploy the production build on any Node host.

## 📦 Project structure

```
├── server.ts              # Express API + market ticker + price pollers + Gemini oracle
├── src/
│   ├── App.tsx            # Login gate + 8-tab navigation terminal
│   ├── components/        # AgentSimulator, BacktestEngine, IndicatorExplorer,
│   │                      # CodebaseExplorer, AdminPanel, ElonGrokCouncil,
│   │                      # GqrTimeline, QuickStartGuide, UxAuditForge,
│   │                      # LoginGate, RlTrainingChart, TradingViewChart
│   └── data/              # historicalGold, indicators, codebase, uxQuestions
├── docs/                  # README screenshots
└── dist/                  # production build (git-ignored, not committed)
```

## 🛠️ Tech

React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · Express 4 · Recharts ·
`@google/genai` · Lucide icons · Motion — Greek-gold dark theme
(Cinzel / Cormorant Garamond / Inter / JetBrains Mono).

## 🔧 Polish notes

- **🚨 Leaked API key scrubbed:** `.env.example` contained a real `GEMINI_API_KEY`
  committed to the public repo — replaced with an empty template. The old key must
  be **revoked/regenerated in Google AI Studio** (it stays in git history; if it
  was ever abused, check the project's usage/quota)
- **Removed committed build artifacts:** `dist/` (~1.1 MB) was tracked in git —
  untracked via `git rm --cached` (builds are reproducible via `npm run build`)
- **Fixed production crash:** same ESM-only `import.meta` bug as `GQR-v3` killed
  `npm start` on boot — removed, smoke-tested prod (`GET / → 200`, live state ✅)
- **Security hygiene:** hardcoded `admin`/`ImX` → `ADMIN_USER`/`ADMIN_PASS` env vars
  (demo fallback + warning); expanded `.env.example` with all variables
- **Deployability:** `PORT` and `GEMINI_MODEL` env-configurable; fixed stale gold
  seed in `/api/market/reset`
- **Branding:** package renamed `react-example` → `solmarket` @ `3.3.0`, real page
  `<title>` + meta, full README with screenshots + architecture diagram
- **QA:** `tsc` clean, `vite build` clean (screenshots shared with `GQR-v3` —
  see note above — after the sandbox browser kept OOM-crashing)

## 📜 License

GQR Institutional V3.3 Software License Agreement — personal, educational and
demo-only use; no commercial trading or redistribution (see [LICENSE.txt](LICENSE.txt)).
© 2025 NexusDigitalArtShop / GQR Development Team.
