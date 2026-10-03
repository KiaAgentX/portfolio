# FISHKAL: DEEP CATCH — Game Design (Phase 1)

## Core loop (spec §16)

The hook descends continuously. The player steers it horizontally
(drag / swipe / mouse / A-D / arrows) to:

1. **Catch** — touch a fish → probability roll → hooked → fight (tension) → land it.
2. **Avoid** — sharks and barracuda are danger entities: hit = score loss + tension spike + combo reset.
3. **Descend** — deeper zones hold rarer, more valuable fish.
4. **Return** — reaching line end triggers retract; hooked fish must be reeled up (hold to reel).

## Systems

- **Depth zones** (§17): Shallow 0–50m (common) → Mid 50–150m → Deep 150–300m → Abyss 300–500m (epic/legendary). Zones are data (`@fishkal/config`), not code.
- **Line tension** (§19): rises with fish weight × speed while reeling; breaks at limit (upgradeable). Broken line = lost fish + combo reset + short danger state.
- **Catch probability** (§20): rarity-based base (90% → 35%) minus weight penalty plus Hook Strength upgrade. Escape ≠ frustration: fish speeds off, hook continues.
- **Combo** (§24): consecutive quick catches multiply score (1× → 3×, tiers from config); expires after 2.5s without a catch; resets on danger/break.
- **Score vs Credits** (§21): score = leaderboard competition; credits = economy currency. They are separate fields end-to-end.
- **Behaviors** (§15): SLOW, FAST, FLEE, ZIGZAG, HEAVY (pulls down), PREDATOR (chases hook), SHARK (intercepts, dangerous), LEGENDARY (erratic bursts).

## Roster (Phase 1, Dubai-market flavored)

| Fish | Rarity | Depth | Behavior | Score | Credits |
|---|---|---|---|---|---|
| Sardine | COMMON | 0–80 | SLOW | 10 | 1 |
| Mackerel | COMMON | 10–120 | FAST | 15 | 1 |
| Hammour (Grouper) | UNCOMMON | 30–200 | SLOW | 40 | 4 |
| Golden Trevally | UNCOMMON | 40–220 | ZIGZAG | 45 | 4 |
| Red Snapper | RARE | 80–280 | FLEE | 90 | 9 |
| Barracuda ⚠ | RARE | 60–300 | PREDATOR | 0 | 0 |
| Reef Shark ⚠ | RARE | 50–400 | SHARK | 0 | 0 |
| Lanternfish | EPIC | 250–480 | ZIGZAG | 220 | 22 |
| Gulper Eel | EPIC | 280–500 | HEAVY | 260 | 25 |
| Royal Dhow Grouper | LEGENDARY | 300–500 | LEGENDARY | 600 | 60 |

⚠ = danger entity. All values live in `packages/config/src/game.ts`
(DB-driven override lands with the admin in Phase 2 — §44).

## Upgrades & powerups (§22–23)

Defined in config (hook/line strength, line length, reel speed, magnet) with
cost curves; purchase flow + persistence arrive with profile economy in Phase 2.
The engine already accepts the loadout object, so upgrades plug in without
engine changes.

## Results (§29)

Max depth, fish caught, best combo, duration, provisional credits — plus
**server-validated score/credits** and record detection. Validation flags are
shown if the server flagged anything (transparency, §59 spirit).

## Anti-cheat (§58–60)

Client submits only the event log. Server:
- validates shape with zod,
- rejects unknown fish ids / habitat-depth mismatches / future timestamps,
- caps plausible catch rate and descent speed,
- recomputes score/credits from its own catalog,
- stores flags per run for review.
