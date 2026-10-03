# FISHKAL: DEEP CATCH — Balance Model (spec §19)

Validated by `packages/game-core/scripts/balance-sim.ts` (20 seeds × 2 strategies).
Run it after any tuning change: `cd packages/game-core && npx tsx scripts/balance-sim.ts`

## Validated gates (2026-09-13)

| Gate | Target | Measured |
|---|---|---|
| Skilled run duration (median) | ≥ 60s | **82s** |
| Skilled catches per run (median) | ≥ 5 | **6** |
| Dive reachability (straight-down, no steering) | ≥ 250m | **320m** (full line) |
| Deep-water value (blind diver vs chaser) | ≥ 70% of chaser score | **100 / 130** |

## Core numbers (`packages/config/src/game.ts`)

| Parameter | Value | Rationale |
|---|---|---|
| `hookDescendSpeed` | 9 m/s | Slow enough to see/react to fish |
| `baselineLineLengthM` | 320 | ≈ 35.5s dive + fights + retract ≈ 60–90s runs |
| Line length upgrade | +45m/level (10 levels → 770m) | Legendary (300–500m) needs upgrades — real progression axis |
| `HOOK_MOVE_SPEED` | 30 | Outruns catchable fish (22–40), not apex threats (44+) |
| `HOOK_HALF` | 0.9 | Generous catch radius |
| `SPAWN_BASE_S` / `MAX_FISH` | 0.9s / 28 | Dense water |
| `TENSION_PER_SPEED` | 1.8 | Fights winnable |
| `REEL_BASE_SPEED` | 30 m/s | Punchy retract |

## Fight model (§18): stamina reel-off

- Attach sets fish **stamina** = `weight × 14 + 4` reel-seconds.
- **Reeling**: drains stamina, tension rises (`struggle×0.35 − 26/s`).
- **Resting**: tension falls, fish recovers stamina slightly; >2.2–3.3s of slack → **ESCAPE**.
- Tension ≥ limit → **LINE_BREAK** (danger, combo reset — *not* run over).
- Stamina ≤ 0 → **CATCH lands at depth** (no surface tow; deep zones stay valuable).
- Wins require **pump-and-reel** (alternate reel/rest to shed tension).

## Danger model (§24)

- Shark/barracuda hits: **combo reset + tension spike** — never score loss.
- Hit grants knock-through + 2.5s no-re-chase + 1.2s hook invulnerability (no camping).

## Anti-patterns removed (bugs this pass fixed)

1. `updateCollisions()` was never called — the game could not catch anything at all.
2. Habitat-band clamp during fights made every fish with `depthMin > 0.5` unlandable.
3. Escaped fish re-collided instantly (no invulnerability window) → descent deadlock.
4. Line break ended the run (retract to surface) → runs died at ~10s.
5. Score −15 per shark hit + chase-at-59m/s → deep diving was a score trap.
6. Hook slower than every fish → catching by chasing was impossible.
