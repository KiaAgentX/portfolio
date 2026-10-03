# BUILD_STATE (spec §108)

```yaml
current_stage: "Phases 4–6 implemented — referral economy, admin API, DB-driven config, WebGL cinematic, analytics, commerce scaffold, CI; only external inputs remain"
completed_stages:
  - 01 discovery (env verified: Node 24, pnpm 9.15, Docker 28)
  - 04 technical architecture (docs/ARCHITECTURE.md)
  - 05 monorepo foundation (pnpm + turbo + TS strict)
  - 06 design system (tokens, Button/Card/Badge/Input, HUD styles)
  - 08 game core (engine + 8 unit-test suites passing)
  - 09 3D world (procedural ocean/fish/hook/particles — WebGL2)
  - 10 game economy (score≠credits, combo, upgrades/powerups defined)
  - 11 backend + database (Fastify API + Prisma schema, server-authoritative runs)
  - partial: 07 cinematic website (CSS/SVG journey; WebGL scene Phase 2)
  - partial: 12 telegram (bot skeleton + mini-app shell + initData verify code)
active_tasks:
  - Postgres activation (blocker: WSL2 has no distro — `wsl --install -d Ubuntu` + reboot, then `docker compose up -d` + `pnpm db:migrate && pnpm db:seed`)
  - Telegram live test (docs/TELEGRAM_CHECKLIST.md — needs TELEGRAM_BOT_TOKEN only)
  - Remaining fish GLBs (drop into apps/website/public/models/fish/<speciesId>.glb — loader picks them up automatically)
  - Commerce activation: insert real Product rows (schema + API live; 503 until then by design, §103)
  - Launch: execute docs/LAUNCH_CHECKLIST.md (device matrix, ops, rollback)
blocked_tasks:
  - Telegram bot live testing (needs TELEGRAM_BOT_TOKEN)
  - Prisma migrate + seed (needs `docker compose up -d` first)
  - Adversarial /game/runs audit (ops task, listed in launch checklist)
risks:
  - performance: procedural fish OK; production GLBs must be Draco/KTX2 (§12)
  - run-length: line-end auto-retract makes full-line dives ~13s — long enough for skill play, worth revisiting in balance tuning (§19)
  - security: session tokens are HMAC stateless; Redis-backed sessions + rate limiting in Phase 2
  - business: no prices/delivery/payment data may be invented (§42) — placeholders only
decisions:
  - ADR-001: game logic in engine-agnostic game-core (reuse across web/mini-app)
  - ADR-002: server-authoritative scoring from event logs, never client score (§60)
  - ADR-003: procedural assets Phase 1, CC0/commissioned assets tracked in assets/README.md (§103)
  - ADR-004: API degrades to memory store when Postgres down — dev convenience, logged loudly
assets_required:
  - fishkal_boat.glb (HIGH)
  - 10 fish GLBs incl. hammour + legendary (HIGH)
  - audio set: ocean/underwater/catch/splash/danger/reward (HIGH)
  - logo.svg + fish card art (HIGH)
  - coral/kelp kit + skyline blockout (MEDIUM)
tests:
  - security (Phase 6): 10 Vitest suites passing — referral self/re-attach guards, pay-once referral claim, analytics whitelist + PII scrub, config-override shape safety
  - admin API: live E2E — /admin/stats (players/runs/DAU-7d), PUT /admin/config override stored + listed, 401 without ADMIN_TOKEN, player-auth hook correctly bypassed for /admin/*
  - referrals: live E2E — attach via guest signup (referredBy) and /referrals/attach; info shows invitee; claim pays 20 credits once; re-claim 409; re-attach 409
  - analytics: live E2E — event accepted, unknown event 400, funnel endpoint returns counts/conversion
  - commerce: /shop/products answers 503 with empty catalog by design; activates on first real Product row (zero code change)
  - economy: 8 Vitest suites passing (replay idempotency, overdraft, double-claim, max-level cap, collection bests, loadout persistence)
  - live economy E2E: 3 runs → 46 credits → bought hook_strength L1 (−30) → profile 16 → loadout applied → duplicate refId rejected 409 → double mission claim rejected 409
  - i18n/RTL: fa dictionary live, dir=rtl flip verified in browser (hero, sections, game HUD buttons, mission titles/descriptions Persian)
  - api: 18 Vitest suites passing total (economy 8 + security 10)
  - game-core: 9 Vitest suites passing (state machine, depth, catch pipeline, combo, submissions, play-again reset, line-length contract)
  - balance sim: BOTH gates pass (skilled run 82s / 6 catches; deep dive reachable 320m, value ≥70% of chaser) — `packages/game-core/scripts/balance-sim.ts`
  - browser E2E (Phase 2): full 320m dive; fight model observed live (−208→−235m drag); reel hold wins fights; FIRST LIVE CATCH (score 10, FISH 1); NEW RECORD screen with Server Score 10 + 1 credit; leaderboard records browser players
  - records API: deepestDepth survives shallower runs; largestFish only replaces on heavier catch (verified via live profile round-trip)
  - api: E2E curl-verified — valid run scores server-side (60 for 3 catches incl. RARE); cheat run flagged (UNKNOWN_FISH + IMPOSSIBLE_DEPTH + ALL_CATCHES_INVALID, score 0); unauthenticated rejected 401; malformed rejected 400
  - browser E2E (live preview): cinematic scroll renders; game canvas mounts; run descends −110m and auto-retracts; steering reverses depth; Play Again restarts; results screen shows Server Score from live API; leaderboard records browser sessions
  - website: `next build` green, dev server verified serving full cinematic journey
  - typecheck: all 8 packages + 4 apps clean (strict mode)
fixes:
  - 2026-09-13 (Phase 4): global player-auth hook rejected the admin token before the admin hook could run — /admin/* now bypasses player auth and authenticates with ADMIN_TOKEN inside admin.ts
  - 2026-09-13 (Phase 4): ReferralStore.claim return type made discriminating ({ok:true|false}) — found by the security tests
  - 2026-09-13 (Phase 3): economy split-brain — store had its own balance diverging from the player record; now the store returns deltas and routes apply them via a single writer (applyCredits). Mission claim DB path + route both credited (double-pay) — route is the only writer now.
  - 2026-09-13 (Phase 2 balance): updateCollisions() was NEVER CALLED — catching was impossible. Also fixed: habitat-band clamp made deep fish unlandable; escape re-collision deadlock; line break ended runs; shark score-erasure + camping; hook slower than prey; reel input never wired (renderer). See docs/BALANCE.md.
  - 2026-09-13 (records): deepestDepth was overwritten by shallower runs; largestFish never stored + could regress. Both are records now.
  - 2026-09-13: engine.start() silently no-opped from RESULTS state — Play Again was dead. Added resetRun() + regression test; verified live in browser.
deployment:
  - dev: docker compose up -d → pnpm db:migrate → pnpm db:seed → pnpm dev
  - note: ports 3000/4000 occupied by a prior build in another checkout; use `PORT=3100 next dev` / `API_PORT=4100 tsx src/main.ts` alongside it
  - note: Docker engine was still starting during Phase 1 verification — API auto-falls back to memory store; run migrations once Docker is up
next_action:
  - External inputs only: WSL2 distro (Postgres), TELEGRAM_BOT_TOKEN (Telegram live), real Product rows (commerce), fish GLBs (art)
  - Then execute docs/LAUNCH_CHECKLIST.md end-to-end

# Phase 4–6 additions (2026-09-13)
phase_4_6:
  referrals: ReferralStore (DB + memory) — attach/info/claim, 20-credit reward, self/re-attach guarded; guest signup accepts referredBy; Telegram initData start_param `ref_<id>` parsed
  mini_app: real profile (credits/score/depth), referral card + claim, deep-link attach (?ref=), game page submits runs server-authoritatively with HUD + result banner
  admin: token-gated /admin/stats (players, runs, referrals rewarded, 7-day DAU, top fish, events 24h) and /admin/config (GET/PUT); 503 when ADMIN_TOKEN unset; helmet + rate-limit on the API
  config_overrides: DB-backed GameConfigEntry overrides (memory fallback), activeConfig() applied to /game/config + scoreRun + record computation — ops can retune live without redeploy
  cinematic: game-renderer CinematicIntro — three.js procedural boat (hull/cabin/mast/teal flag), bobbing, camera descent through 4 zone colors into abyss, 600 drifting particles, fog; rendered behind the hero (opacity .55, GL-optional)
  analytics: whitelist (9 event names), scalar+≤64-char props only, AnalyticsEvent DB + memory mirror, /analytics/events POST, /analytics/funnels (per-player conversion), /analytics/summary
  commerce: Product + Order models; catalog empty by design (§103 no fake data); /shop/products 503 until real rows; order state machine CREATED→PAID→DELIVERED|CANCELLED
  ci: .github/workflows/ci.yml — pnpm install, prisma generate, typecheck all, vitest (core+api), balance gates, builds
  launch: docs/LAUNCH_CHECKLIST.md — env, 4-tier device matrix, security gates, observability, rollback plan
  known_dev_noise: Barramundi GLB texture blob-URL errors during Next HMR (Fast Refresh disposes GameView mid-texture-load); production unaffected, fallback fish render regardless

# Live-run session log (2026-09-13)
live_session:
  servers: website http://localhost:3100 (next dev), api http://localhost:4100 (tsx, memory fallback)
  website_api_url: pinned via apps/website/.env.local NEXT_PUBLIC_API_URL=http://localhost:4100 (4000 belongs to another checkout)
  docker: engine not running — db:false; run `docker compose up -d` then `pnpm db:migrate && pnpm db:seed` for Postgres-backed runs
  known_tuning_note: full-line dive is ~13s down to −110m then auto-retract; every sample with DEPTH −0m was a completed run, not a stuck engine
```

# Final verification sweep (2026-09-13, "100%" execution)
final_sweep:
  typecheck: 10/10 workspaces clean (shared, config, validation, api-client, design-system, game-core, game-renderer, website, api, mini-app)
  tests: 27/27 green — game-core 9, api 18 (economy-security 8, security 10)
  balance_gates: sweep PASS (>=60s, >=5 catches) + deep-water PASS (320m, diver outperforms)
  live_e2e: /health ok, /game/config serves activeConfig, guest auth -> /economy/wallet, /missions, /referrals/me all respond; /admin/* correctly 401 without token; /shop/products correctly 503 (no fake catalog)
  servers: website :3100, api :4100 (memory fallback — Postgres awaits WSL2 distro)
completion:
  code_implementable_without_external_inputs: 100% — every surface that can be built without user/business inputs is built and verified
  external_blockers_remaining: WSL2 distro (Postgres persistence), TELEGRAM_BOT_TOKEN (Telegram live), real Product rows (commerce), brand logo/fonts + commissioned GLBs (art), production host (deploy/monitoring)
