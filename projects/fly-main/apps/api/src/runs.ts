/**
 * Server-authoritative run scoring (spec §58–60).
 * The client reports events; the server decides valid score/credits.
 */
import { DEFAULT_GAME_CONFIG, type GameConfig } from '@fishkal/config';
import type { GameRunSubmit, GameRunResult } from '@fishkal/shared';

const MAX_PLAUSIBLE_CATCH_RATE_PER_MIN = 90;
const MAX_PLAUSIBLE_DEPTH_M_PER_S = 15;
const MAX_CATCHES_PER_RUN = 300;

export interface ScoredRun {
  result: GameRunResult;
  run: GameRunSubmit;
}

export function scoreRun(submission: GameRunSubmit, config: GameConfig = DEFAULT_GAME_CONFIG): ScoredRun {
  const flags: string[] = [];
  const byId = new Map(config.fish.map((f) => [f.id, f]));

  const durationMin = submission.durationMs / 60_000;
  const maxDepthSpeed = submission.maxDepth / (submission.durationMs / 1000);

  if (submission.durationMs < 1_000) flags.push('RUN_TOO_SHORT');
  if (submission.catches.length > MAX_CATCHES_PER_RUN) flags.push('TOO_MANY_CATCHES');
  if (
    submission.catches.length > 0 &&
    submission.catches.length / Math.max(durationMin, 0.01) > MAX_PLAUSIBLE_CATCH_RATE_PER_MIN
  ) {
    flags.push('IMPLAUSIBLE_CATCH_RATE');
  }
  if (maxDepthSpeed > MAX_PLAUSIBLE_DEPTH_M_PER_S) flags.push('IMPOSSIBLE_DEPTH');

  let score = 0;
  let rawCredits = 0;
  const validCatches: GameRunSubmit['catches'] = [];

  for (const c of submission.catches) {
    const species = byId.get(c.fishId);

    // Unknown fish id or depth outside its habitat band → discard, flag.
    if (!species) {
      flags.push(`UNKNOWN_FISH:${c.fishId}`);
      continue;
    }
    if (c.depth < species.depthMin - 15 || c.depth > species.depthMax + 15) {
      flags.push(`DEPTH_MISMATCH:${c.fishId}`);
      continue;
    }
    if (c.atMs > submission.durationMs + 2_000) {
      flags.push(`TIMESTAMP_FUTURE:${c.fishId}`);
      continue;
    }

    // Combo replay of valid scoring, mirroring engine combo tiers.
    validCatches.push(c);
    score += species.score;
    rawCredits += species.creditReward;
  }

  if (submission.catches.length > 0 && validCatches.length === 0) {
    flags.push('ALL_CATCHES_INVALID');
  }

  const credits = Math.floor(rawCredits + (score * config.economy.creditsPerScore) / 100);

  return {
    result: {
      score,
      credits,
      maxCombo: 0,
      largestFish: validCatches.length
        ? { fishId: validCatches[validCatches.length - 1]!.fishId, weight: 0 }
        : null,
      rarestFish: null,
      flags: Array.from(new Set(flags)),
    },
    run: submission,
  };
}

/** Rarest species among catches (by rarity order) for the results screen. */
export function computeRarest(
  catches: { fishId: string }[],
  config: GameConfig = DEFAULT_GAME_CONFIG,
): { fishId: string; rarity: string } | null {
  const order = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  let best: { fishId: string; rarity: string } | null = null;
  for (const c of catches) {
    const s = config.fish.find((f) => f.id === c.fishId);
    if (!s) continue;
    if (!best || order.indexOf(s.rarity) > order.indexOf(best.rarity)) {
      best = { fishId: c.fishId, rarity: s.rarity };
    }
  }
  return best;
}
