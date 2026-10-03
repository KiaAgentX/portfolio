/** Shared game domain types (spec §14, §17, §21). Engine-agnostic. */

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export const RARITY_ORDER: readonly Rarity[] = [
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
];

export type BehaviorKind =
  | 'SLOW'
  | 'FLEE'
  | 'FAST'
  | 'ZIGZAG'
  | 'HEAVY'
  | 'PREDATOR'
  | 'SHARK'
  | 'LEGENDARY';

export interface Vec2 {
  x: number;
  y: number;
}

/** Static definition of a fish species (config/database-driven, spec §17). */
export interface FishSpeciesDef {
  id: string;
  name: string;
  rarity: Rarity;
  /** Depth band this species lives in, metres. */
  depthMin: number;
  depthMax: number;
  speed: number;
  turnRate: number;
  /** Reward + scoring. Server validates final rewards (spec §60). */
  score: number;
  creditReward: number;
  behavior: BehaviorKind;
  /** 0..1 — contributes to line tension when hooked. */
  weight: number;
  /** World radius for collision. */
  size: number;
  danger: boolean;
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  /** Cost of level n is baseCost * costMultiplier^n (n starts at 0). */
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
}

export interface PowerupDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  durationMs: number;
  cooldownMs: number;
}

export interface RunFishCatch {
  fishId: string;
  depth: number;
  atMs: number;
}

/** Client-submitted run summary. The server re-validates everything (spec §58–60). */
export interface GameRunSubmit {
  maxDepth: number;
  durationMs: number;
  catches: RunFishCatch[];
  clientSeed: number;
}

/** Server-computed authoritative result. */
export interface GameRunResult {
  score: number;
  credits: number;
  maxCombo: number;
  largestFish: { fishId: string; weight: number } | null;
  rarestFish: { fishId: string; rarity: Rarity } | null;
  flags: string[];
}
