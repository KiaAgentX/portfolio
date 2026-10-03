# FISHKAL — ROADMAP TO 100%

**Definition of 100%:** every checkbox in spec §101 (50 acceptance criteria) is checked, and every
feature satisfies §102 (code + test + validation + documentation + integration).

**Method (spec §100):** each stage ends with implementation → validation → tests → documentation →
checkpoint. No stage is "done" on code existence alone.

Current state: Phase 1 complete (~45% of full spec). See `BUILD_STATE.md`.

---

## PHASE 2 — Make it real: persistence, assets, balance *(Stages 09+11 finish)*

Goal: nothing is fake anymore — runs survive restarts, real models replace procedural stand-ins.

| # | Step | Output | Validation gate |
|---|---|---|---|
| 2.1 | Postgres up: `docker compose up -d`, `prisma migrate dev`, seed | Migrated DB + seeded fish/zones | API `/health` shows `db:true`; run survives API restart — **BLOCKED: WSL2 has no distro; needs `wsl --install -d Ubuntu` + reboot (user action)** |
| 2.2 | ✅ DONE: record semantics fixed (deepestDepth, largestFish) in both DB + memory paths; DB-backed store was already implemented in Phase 1 | Correct player records | Live round-trip: deepest 120m survives shallow run; largest only upgrades |
| 2.3 | ✅ STARTED: Khronos BarramundiFish (CC0, 2.4MB) installed as grouper; intake path proven | First real GLB served | Valid glTF verified; rest of species pending (Quaternius pack / commissioned) |
| 2.4 | ✅ DONE: procedural WebAudio SFX (catch/escape/break/danger/zone/record/splash) + HUD mute | `game-renderer/src/sfx.ts` | Sounds play on events; mute toggle in HUD |
| 2.5 | ✅ DONE: collisions call restored, stamina fight model, 320m line, hook 30 m/s, fair sharks — `docs/BALANCE.md` | Balance gates in CI-runnable sim | **SIM GATES PASS: 82s / 6 catches / 320m reachability / deep value 77%** |
| 2.6 | ✅ DONE: `glb-fish.ts` loader (normalize, rarity tint, cache) + procedural fallback per species | GLB pipeline live | grouper renders from GLB; missing files fall back silently |

**Exit criteria (§101):** ocean, boat, fish, collision, depth, legendary, fallback — checked; DB persistence real.
**External dependency:** none (CC0 assets downloadable).

---

## PHASE 3 — Economy + Telegram *(Stages 10, 12, 08 finish)*

| # | Step | Validation gate |
|---|---|---|
| 3.1 | ✅ DONE: credits wallet + CreditLedger, idempotent by refId | Replay/double-spend rejected (8 security tests) |
| 3.2 | ✅ DONE: upgrades purchase + equip via loadout API | Live E2E: 46cr → hook L1 → 16cr, engine loadout applied |
| 3.3 | ⏳ deferred to balance pass with powerups UI (engine defs exist) | Unit-tested effects |
| 3.4 | ✅ DONE: missions engine + claim (pay-once) | Progress from real runs; double-claim 409 |
| 3.5 | ✅ DONE: collection book + UI panel | Best depth/score per species kept |
| 3.6 | ✅ DONE (web): profile + wallet + ledger panel; mini-app profile in Phase 4 | Matches server records |
| 3.7 | 🔶 READY: initData flow + checklist done — awaiting TELEGRAM_BOT_TOKEN | Real Telegram client completes a run |
| 3.8 | 🔶 TABLE+PARSER READY: Referral model + deep-link parse — wiring to rewards when token lands | Self-referral blocked |

**Exit criteria (§101):** credits, upgrades, powerups, missions, collection, leaderboard, profile, rewards, Telegram auth/mini-app/bot, referrals.
**External dependency:** `TELEGRAM_BOT_TOKEN` from business.

---

## PHASE 4 — Admin + Cinematic *(Stages 13, 07 finish)* — ✅ IMPLEMENTED (2026-09-13)

| # | Step | Validation gate | Status |
|---|---|---|---|
| 4.1 | Admin token auth (`ADMIN_TOKEN`, 401/503 semantics) | Non-admin → 401 | ✅ verified live |
| 4.2 | Admin stats: players, runs, referrals rewarded, 7-day DAU, top fish, events 24h | `/admin/stats` | ✅ verified live |
| 4.3 | DB-driven game config overrides — `activeConfig()` feeds /game/config, scoring, records; memory fallback | Admin edit reaches game on refresh | ✅ (live-tune ready; persistence needs Postgres) |
| 4.4 | Mission editor / content admin | Admin-created mission appears in game | ⬜ deferred — missions are data-driven already |
| 4.5 | WebGL cinematic: procedural boat + flag, camera dive through 4 zone colors, 600 particles, fog, GL-optional fallback | Renders behind hero (opacity .55) | ✅ verified live |
| 4.6 | Wire GLB boat/skyline + audio into journey | §101 cinematic criteria | 🔶 pipeline ready; commissioned GLBs pending |

**Exit criteria (§101):** admin works; config DB-driven; full cinematic journey — ✅ minus mission editor + commissioned art.
**External dependency:** brand logo + fonts.

---

## PHASE 5 — Commerce + Growth + AI *(Stages 14, 15, 16, 02)* — 🔶 ARCHITECTURE COMPLETE, ACTIVATION GATED

| # | Step | Validation gate | Status |
|---|---|---|---|
| 5.1 | PRODUCT.md / REQUIREMENTS.md filled with real business data | Nothing invented | ⬜ business input |
| 5.2 | Commerce: Product + Order models, catalog/order state machine, /shop endpoints | Cart→order flow in staging | ✅ built; **503 until real rows** (verified live) |
| 5.3 | Payment — gated on credentials + explicit business approval | Architecture ready; activation blocked | ✅ architecture ready; **blocked on approval** |
| 5.4 | Analytics: whitelisted event ingestion (9 names, scalar props), per-player funnels, 24h summary | All key actions queryable | ✅ verified live |
| 5.5 | AI support/recommendations/insights behind approval gates (§16) | No ungated AI action | ⬜ deferred (schema-ready, no ungated surface) |

**Exit criteria (§101):** products, cart, orders, analytics, AI support architecture.
**External dependency:** business data + payment credentials + approval.

---

## PHASE 6 — Harden, integrate, launch *(Stages 17–20)*

| # | Step | Validation gate |
|---|---|---|
| 6.1 | ✅ DONE: adversarial security tests (18 api tests: replay, overdraft, double-claim, max-level, referral guards, admin auth, event whitelist) + helmet + rate-limit | All tests green |
| 6.2 | Perf + mobile matrix (low-end Android → iPhone → desktop) | FPS/memory targets on low-end |
| 6.3 | ✅ DONE (web): en/fa + RTL flip, verified live | §101 RTL checked |
| 6.4 | ✅ DONE (verified live): auth→run→score→credits→missions→collection→referrals→leaderboard→admin→analytics all wired on one API | Zero disconnected components |
| 6.5 | ✅ PARTIAL: CI workflow (.github/workflows/ci.yml) + launch docs; production deploy/monitoring pending a host | CI green |
| 6.6 | ✅ DONE: docs/LAUNCH_CHECKLIST.md (env, 4-tier device matrix, security gates, observability, rollback) | Execute at launch |

---

## Dependency & blocker map

| Blocker | Blocks | Owner |
|---|---|---|
| Docker engine staying up | 2.1–2.2 | Local machine |
| `TELEGRAM_BOT_TOKEN` | 3.7–3.8 | Business |
| Real business data (prices, delivery, KPIs) | 5.1, 5.2 activation | Business |
| Payment credentials + approval | 5.3 | Business (spec requires explicit approval) |
| Brand logo + fonts | 4.6 polish | Business / designer |
| Commissioned GLBs (if CC0 insufficient) | 2.3 quality | Business decision |

Phases 2→3→4 strictly ordered; Phase 5 non-payment tracks may overlap Phase 4; Phase 6 last.
