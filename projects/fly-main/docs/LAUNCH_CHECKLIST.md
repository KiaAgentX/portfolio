# FISHKAL: DEEP CATCH — Launch Checklist (spec §20, roadmap 6)

## 1. External prerequisites (owner: business)

- [ ] `wsl --install -d Ubuntu` + reboot → `docker compose up -d && pnpm db:migrate && pnpm db:seed` (activates Postgres persistence; everything is coded and waiting)
- [ ] `TELEGRAM_BOT_TOKEN` from BotFather → execute `docs/TELEGRAM_CHECKLIST.md`
- [ ] `ADMIN_TOKEN` set in the API environment (closes/opens `/admin/*`)
- [ ] Real product rows in the `Product` table (activates `/shop/*`; spec §103 forbids fake data)
- [ ] Real CC0/purchased GLB fish models dropped into `apps/website/public/models/fish/` per `assets/README.md`

## 2. Configuration

- [ ] `DATABASE_URL`, `SESSION_SECRET` (32+ random chars), `WEBSITE_ORIGIN`, `MINIAPP_ORIGIN`, `RATE_LIMIT_MAX` in production env
- [ ] Config overrides reviewed (`GET /admin/config`) — live game tuning is DB-backed
- [ ] Leaderboard boards confirmed (`global`, `weekly`)

## 3. Device matrix (test each before go-live)

| Tier | Devices | Perf mode expectation |
|---|---|---|
| Desktop | Chrome / Edge / Firefox / Safari ≥ 16 | FULL, 60 fps |
| Mobile high | iPhone 12+, Pixel 7+, Galaxy S22+ | HIGH (DPR cap 1.5) |
| Mobile low | iPhone SE 2, Galaxy A-series, Redmi | MEDIUM (particles ≤ 120, shadows off) |
| Telegram webview | iOS + Android in-app browsers | AUTO → HIGH/MEDIUM |

Checks per tier: 30 fps minimum sustained, audio starts after first tap, HUD legible, controls (A/D + hold-to-reel) reachable one-handed, RTL layout correct in fa.

## 4. Security gates

- [x] Replayed run submissions pay once (test)
- [x] Overdraft / double-claim / max-level enforced (tests)
- [x] Referral self-attach & re-attach rejected (tests)
- [x] Analytics whitelist + PII scrub (tests)
- [x] helmet + rate-limit on API
- [ ] Adversarial audit of `/game/runs` replay window (ops, pre-launch)
- [ ] Session secret rotation procedure documented for ops

## 5. Observability & ops

- [ ] `/health` green with `db:true` in production
- [ ] `/admin/stats` shows DAU/runs/events
- [ ] `/analytics/funnels?steps=session_start,dive_start,dive_end,results_view` reviewed
- [ ] Backups: `pg_dump` nightly, restore drill once before launch

## 6. Rollback plan

1. Website/mini-app are static — redeploy previous build.
2. API: previous image/container; config overrides are in DB — clear `GameConfigEntry` to return to shipped defaults.
3. Database: restore from nightly dump; ledger is append-only so no balance reconstruction is needed.
