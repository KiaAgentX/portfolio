/**
 * Default game balance configuration (spec §17, §22, §23).
 * Phase 1 ships this as code; the DB-driven admin override (spec §44) plugs in later
 * through the same GameConfig shape.
 */
import type {
  FishSpeciesDef,
  PowerupDef,
  Rarity,
  UpgradeDef,
} from '@fishkal/shared';

export interface DepthZone {
  id: string;
  name: string;
  depthMin: number;
  depthMax: number;
  /** Background/fog tint at this depth (hex). */
  tint: string;
  rarities: Rarity[];
}

export interface GameConfig {
  depthZones: DepthZone[];
  fish: FishSpeciesDef[];
  upgrades: UpgradeDef[];
  powerups: PowerupDef[];
  economy: {
    /** Credits granted per 100 score at run end. */
    creditsPerScore: number;
    comboWindowsMs: number;
    comboMultipliers: number[];
    lineTensionLimit: number;
    hookDescendSpeed: number;
    /** Baseline line length in metres before upgrades (§19 balance). */
    baselineLineLengthM?: number;
  };
}

export const FISHKAL_RARITY_WEIGHTS: Record<Rarity, number> = {
  COMMON: 62,
  UNCOMMON: 24,
  RARE: 10,
  EPIC: 3.5,
  LEGENDARY: 0.5,
};

export const DEFAULT_GAME_CONFIG: GameConfig = {
  depthZones: [
    { id: 'shallow', name: 'Shallow', depthMin: 0, depthMax: 50, tint: '#2FB5C9', rarities: ['COMMON'] },
    { id: 'mid', name: 'Mid Water', depthMin: 50, depthMax: 150, tint: '#16607F', rarities: ['COMMON', 'UNCOMMON'] },
    { id: 'deep', name: 'Deep', depthMin: 150, depthMax: 300, tint: '#0B3550', rarities: ['UNCOMMON', 'RARE'] },
    { id: 'abyss', name: 'Abyss', depthMin: 300, depthMax: 500, tint: '#071C30', rarities: ['RARE', 'EPIC', 'LEGENDARY'] },
  ],
  fish: [
    { id: 'sardine', name: 'Sardine', rarity: 'COMMON', depthMin: 0, depthMax: 80, speed: 26, turnRate: 3.4, score: 10, creditReward: 1, behavior: 'SLOW', weight: 0.05, size: 0.5, danger: false },
    { id: 'mackerel', name: 'Mackerel', rarity: 'COMMON', depthMin: 10, depthMax: 120, speed: 34, turnRate: 3.0, score: 15, creditReward: 1, behavior: 'FAST', weight: 0.1, size: 0.6, danger: false },
    { id: 'grouper', name: 'Hammour (Grouper)', rarity: 'UNCOMMON', depthMin: 30, depthMax: 200, speed: 22, turnRate: 2.2, score: 40, creditReward: 4, behavior: 'SLOW', weight: 0.35, size: 1.0, danger: false },
    { id: 'trevally', name: 'Golden Trevally', rarity: 'UNCOMMON', depthMin: 40, depthMax: 220, speed: 40, turnRate: 3.6, score: 45, creditReward: 4, behavior: 'ZIGZAG', weight: 0.2, size: 0.8, danger: false },
    { id: 'snapper', name: 'Red Snapper', rarity: 'RARE', depthMin: 80, depthMax: 280, speed: 30, turnRate: 2.6, score: 90, creditReward: 9, behavior: 'FLEE', weight: 0.3, size: 0.9, danger: false },
    { id: 'barracuda', name: 'Barracuda', rarity: 'RARE', depthMin: 60, depthMax: 300, speed: 48, turnRate: 4.0, score: 110, creditReward: 10, behavior: 'PREDATOR', weight: 0.3, size: 1.0, danger: true },
    { id: 'lanternfish', name: 'Lanternfish', rarity: 'EPIC', depthMin: 250, depthMax: 480, speed: 36, turnRate: 3.2, score: 220, creditReward: 22, behavior: 'ZIGZAG', weight: 0.2, size: 0.7, danger: false },
    { id: 'gulper', name: 'Gulper Eel', rarity: 'EPIC', depthMin: 280, depthMax: 500, speed: 24, turnRate: 2.0, score: 260, creditReward: 25, behavior: 'HEAVY', weight: 0.55, size: 1.1, danger: false },
    { id: 'shark', name: 'Reef Shark', rarity: 'RARE', depthMin: 50, depthMax: 400, speed: 44, turnRate: 3.0, score: 0, creditReward: 0, behavior: 'SHARK', weight: 0.8, size: 1.6, danger: true },
    { id: 'royal_dhow', name: 'Royal Dhow Grouper', rarity: 'LEGENDARY', depthMin: 300, depthMax: 500, speed: 38, turnRate: 2.8, score: 600, creditReward: 60, behavior: 'LEGENDARY', weight: 0.7, size: 1.5, danger: false },
  ],
  upgrades: [
    { id: 'hook_strength', name: 'Hook Strength', description: 'Higher catch probability', baseCost: 30, costMultiplier: 1.6, maxLevel: 8 },
    { id: 'line_strength', name: 'Line Strength', description: 'Raises tension limit', baseCost: 40, costMultiplier: 1.6, maxLevel: 8 },
    { id: 'line_length', name: 'Line Length', description: 'Dive deeper before the reel stops', baseCost: 50, costMultiplier: 1.7, maxLevel: 10 },
    { id: 'reel_speed', name: 'Reel Speed', description: 'Faster ascent between catches', baseCost: 35, costMultiplier: 1.5, maxLevel: 6 },
    { id: 'magnet_radius', name: 'Fish Magnet', description: 'Slightly attracts nearby fish', baseCost: 60, costMultiplier: 1.8, maxLevel: 5 },
  ],
  powerups: [
    { id: 'fish_magnet', name: 'Fish Magnet', description: 'Strong attraction radius for 10s', cost: 25, durationMs: 10_000, cooldownMs: 30_000 },
    { id: 'slow_time', name: 'Slow Time', description: 'Fish move at 50% speed for 8s', cost: 30, durationMs: 8_000, cooldownMs: 45_000 },
    { id: 'strong_line', name: 'Strong Line', description: 'Tension limit x2 for 12s', cost: 20, durationMs: 12_000, cooldownMs: 40_000 },
    { id: 'shield', name: 'Shield', description: 'Shark encounters are shrugged off once', cost: 40, durationMs: 0, cooldownMs: 60_000 },
  ],
  economy: {
    creditsPerScore: 0.1,
    comboWindowsMs: 2500,
    comboMultipliers: [1, 1.2, 1.5, 2, 3],
    lineTensionLimit: 100,
    // §19 balance: gentler sink for catch windows; 320m baseline ≈ 35.5s dive
    // + stamina fights + retract ≈ 60–90s runs. Deeper fish are worth more (§23).
    hookDescendSpeed: 9,
    baselineLineLengthM: 320,
  },
};
