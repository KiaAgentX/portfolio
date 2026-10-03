<div align="center">

# 🐘 DropAgentX

**A production-grade Telegram marketplace bot with an AI engine, e-commerce wallet, referral system, gamification, and a full web app — ready to deploy on VPS or Railway.**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.10%2B-3776AB?logo=python&logoColor=white)
![aiogram](https://img.shields.io/badge/aiogram-3.x-2CA5E0)
![FastAPI](https://img.shields.io/badge/FastAPI-gateway-009688?logo=fastapi)
![Tests](https://img.shields.io/badge/tests-100%20passed-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

**English · [فارسی](README.fa.md)** *(coming soon)*

</div>

---

## ✨ Overview

DropAgentX is an all-in-one **Telegram commerce platform** that lets you run a full digital marketplace directly inside Telegram: sellers publish products, buyers browse and check out with an in-bot wallet, and an embedded **AI assistant** helps users chat, discover, and even create listings.

It is built as a **monorepo** — bot, web dashboard, AI engine, and gateway are packaged together and deploy with a **single command** on your own VPS (Docker) or serverless on Railway.

> **🆕 v1.0.0** — Full release: a glassmorphism **platform links hub** (`/links`) with animated buttons for every platform address (user + admin), PWA shortcuts, CSV export alias fix, and 100/100 tests passing. See [CHANGELOG-1.0.0.md](CHANGELOG-1.0.0.md).

---

## 📸 Screenshots

![Platform links hub — all addresses in one place](docs/shot-links.jpg)

*The glassmorphism links hub (`links.html`) — every platform address in one place.*

![Persian landing page with particle globe](docs/shot-landing.jpg)

*Landing page (`landing.html`) with an animated particle globe and live stats.*

![3D product showcase built with Three.js](docs/shot-showcase3d.jpg)

*3D product showcase (`showcase3d.html`) — products on a rotating 3D carousel.*

---

## 🚀 Key Features

### 🤖 Telegram Marketplace
- **Product catalog** with category browsing, search, and a 5-step seller wizard
- **In-bot wallet** with credits, deposits, withdrawals, and a full transaction ledger
- **Atomic purchases** — credits, platform fee, and referral commission are debited in one transaction (no double-spend)
- **Instant delivery** via Telegram file ID with disk fallback and safe 10/1024 size caps
- **In-bot rating & reviews** with averages surfaced in seller analytics

### 🧠 AI Assistant (Hermes Engine)
- Multi-modal chat with **memory** (weighted, decayed, optional LLM extraction)
- **Identity reinforcement learning** (Q-learning, 7 behavioral tags) personalizes replies
- Secret-safe prompt assembly — credentials never leak to the model
- **Skills library** — 12 built-in seller/creator skills (sales psychology, pricing, SEO, content calendars, and more)

### 👥 Growth & Retention
- **Referral system** — unique links, lucky boxes, and commission payouts
- **Daily bonus streaks** and campaign **promo codes**
- **Quests & XP** — self-calculating, level-based gamification
- **Auto-giveaways** and **win-back** messages for idle users
- **Leaderboard** with 4 tabs and per-user analytics

### 🛡️ Moderation & Admin
- **Anti-scam filter** — flags "guaranteed profit", prohibited tokens, etc. before publishing (default ON, 20 seed phrases, editable)
- 23-button admin panel — role management, credit top-ups, bans, tickets, reports
- **Analytics dashboard** — users, sellers, product health, revenue, CSV backups
- **Anti-spam rate limiting** that respects reverse proxies (X-Forwarded-For trust)

### 🌐 Full Web Presence
- Responsive **PWA** storefront (installable, offline-capable)
- **3D product showcase** built with Three.js
- **Glassmorphism links hub** (`/links`) with animated buttons for every platform address (user + admin)
- Live **SSE dashboard** (`/live`) and admin web panel
- **i18n** — Persian & English locales

### 🔒 Security (v0.6.0 audit +)
- Upload **path-traversal** hardening
- Atomic, race-safe credit updates (`MAX(0, credits + ?)`)
- Sandboxed local execution locked behind `SANDBOX_ALLOW_LOCAL` (no token leak to children)
- **Fail-closed** admin auth — without `WEB_SECRET`/`BOT_TOKEN` logins return `503`
- Password rotation **revokes all stale admin tokens**
- Stable `blake2b` identity hashing across restarts
- Static assets exempted from rate limits; proxy-aware rate limiting

---

## 🏗 Architecture

```
        user
         │
         ▼
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │   gateway    │ ──▶ │  bot + web  │ ──▶ │   hermes    │ (A2A/MCP)
   │ (single door)│ ──▶ │   aiogram   │ ──▶ │   agent     │
   └─────────────┘      └─────────────┘      └─────────────┘
        │   /v1  │ /dashboard │ /agent.json
        └──────▶ ROUTER_BASE_URL ──▶ LLM router (multi-fallback, quota, token savings)
```

| Module | Responsibility |
|---|---|
| `bot.py` | Entry point — dispatcher, 3-layer error middleware, observability hooks |
| `config.py` | All settings from environment (typed dataclass) |
| `database.py` | Data layer (30+ tables, auto-migrations, atomic transactions) |
| `handlers/` | 15 bot routers — marketplace, wallet, AI, referrals, quests, admin… |
| `hermes_engine.py` | AI brain — multi-model, secret redaction, dynamic settings |
| `memory2.py` | 7-tier weighted memory with decay & optional LLM extraction |
| `identity_rl.py` | Q-learning identity (7 tags) |
| `observability.py` | JSON logs, `app_logs`, error-capture middleware |
| `gateway/` + `shared/` | Monorepo — LLM router, context compressor, skills guard |

---

## 📦 Getting Started

### Prerequisites
- Python **3.10+**
- A Telegram **Bot Token** from [@BotFather](https://t.me/botfather)

### 1. Clone & configure
```bash
git clone https://github.com/ImXforever/0.6.0.git
cd 0.6.0

cp .env.example .env
# fill in: BOT_TOKEN, ADMIN_IDS, WEB_PASSWORD, WEB_SECRET ...
```

### 2. Install & run locally
```bash
pip install -r requirements-dev.txt

pytest                 # 100 tests pass
python bot.py          # bot + web + A2A + MCP (if ports are set)
```

### 3. Run the gateway separately (optional)
```bash
python -m uvicorn gateway.gateway:app --host 0.0.0.0 --port 8080
```

### 4. Deploy: one command (Docker / VPS)
```bash
cd deploy
docker compose -f docker-compose.v3.yml up -d --build
```

Or deploy on **Railway** with the included [`railway.json`](railway.json) — the unified [`run.py`](run.py) launcher auto-detects the environment.

---

## 🔑 Environment Variables (all optional except as noted)

| Variable | Required | Purpose |
|---|---|---|
| `BOT_TOKEN` | ✅ | Telegram bot token |
| `ADMIN_IDS` | ✅ | Comma-separated admin Telegram IDs |
| `WEB_PASSWORD` / `WEB_SECRET` | ✅ (prod) | Admin panel auth (fail-closed) |
| `ROUTER_BASE_URL` | | URL to an LLM router (e.g. `http://router:20128`) |
| `GEMINI_API_KEY` | | Image generation (free tier) |
| `A2A_TOKEN` | prod | A2A/MCP auth (fail-closed) |
| `SANDBOX_ALLOW_LOCAL` | | Opt-in to local code execution in the sandbox |

---

## 🧪 Testing & QA

```bash
pytest            # 100 tests passed
ruff check .      # lint
```

- **100/100 tests** pass (incremental suites added with each release)
- Full `compileall` passes with no errors
- Load-tested at **8,000 concurrent users / 500 MB** (~195 MB real, ~409 MB AI-heavy)
- 45 concurrent static requests without a single `429`

---

## 📚 Documentation

| Document | Description |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Module map, data flow, key contracts |
| [`docs/COMMANDS-REFERENCE.md`](docs/COMMANDS-REFERENCE.md) | Full user & admin command reference |
| [`docs/SCHEMA-REFERENCE.md`](docs/SCHEMA-REFERENCE.md) | Database schema |
| [`docs/DEPLOY-VPS-RAILWAY-FA.md`](docs/DEPLOY-VPS-RAILWAY-FA.md) | Deployment guide (VPS + Railway) |
| [`docs/DEVELOPER-GUIDE-FA.md`](docs/DEVELOPER-GUIDE-FA.md) | Developer guide |
| [`CHANGELOG-1.0.0.md`](CHANGELOG-1.0.0.md) | Recent releases & history |

---

## 🗺 Roadmap Highlights
- Multi-language locale expansion (beyond fa/en)
- Additional payment gateway integrations
- Web UI parity with the full bot feature set

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE).

---

<div align="center">
Made with 💙 for the Telegram commerce community.
</div>
