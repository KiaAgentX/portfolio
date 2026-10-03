# FISHKAL — Architecture (Phase 1)

## Monorepo

```
apps/
  website/     Next.js 15 — cinematic marketing site + playable web game
  mini-app/    Next.js 15 — Telegram Mini App shell (game + leaderboard live)
  api/         Fastify  — auth, runs (server-authoritative), leaderboard, config
  bot/         grammY   — /start /game /leaderboard /help (token-gated)
packages/
  game-core/      engine-agnostic game simulation (no React/Three) — Vitest-covered
  game-renderer/  Three.js view of game-core (ocean, fish, hook/line, atmosphere)
  design-system/  brand tokens + UI primitives (CSS + React)
  api-client/     typed HTTP client with typed error model
  validation/     zod contracts shared by API + clients
  config/         balance data (fish, zones, upgrades, powerups, economy)
  database/       Prisma schema/client/seed (Postgres 16)
  shared/         domain types + brand constants
```

## Core flows

```
Cinematic scroll (website)
   └─ "PLAY NOW" ──▶ Deep Catch (client: game-core ↔ game-renderer)
                        └─ run ends ──▶ POST /game/runs (catch log only)
                                          ├─ zod validation
                                          ├─ plausibility checks (§59)
                                          ├─ catalog re-scoring (§60)
                                          └─ transactional commit (player + run + catches)
```

- **The client never reports score.** It reports `catches[]` + depth/time;
  the server recomputes score/credits from its own catalog and flags anomalies.
- **Game loop** runs at a fixed 60 Hz timestep inside the renderer's RAF,
  decoupled from React (§27). React only renders HUD/menus/overlays.
- **Graceful degradation** (§65/§88): API down → local provisional results;
  WebGL missing → 2D CSS/SVG fallback journey on the website.

## Data layer

`packages/database/prisma/schema.prisma` implements the Phase 1 slice of spec §61:
`User`, `TelegramAccount`, `Player`, `PlayerStats`, `PlayerCollection`,
`FishSpecies`, `GameConfigEntry`, `GameRun`, `GameCatch`, `LeaderboardEntry`,
`AnalyticsEvent`, `AuditLog`. Migrations via Prisma; seed pushes the balance
config into `FishSpecies` + `GameConfigEntry` (admin-driven config arrives in
Phase 2 reading the same shape — §44).

The API transparently falls back to an in-memory store when Postgres is
unreachable (dev convenience, clearly logged). Economy transactions use
Prisma `$transaction` (§62).

## Environments

- `docker-compose.yml`: Postgres 16 + Redis 7 (dev parity with prod shape).
- `.env.example` documents every variable; secrets stay out of git (§68).

## Deferred to later phases

Admin/CMS (§43), campaigns (§46), AI layer (§49), worker/queues (§66),
payments (§42 — never fabricated), full i18n/RTL (§85–86 — keys exist in
`@fishkal/shared`), Telegram initData verification is implemented but requires
a bot token to activate.
