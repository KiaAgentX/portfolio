/** Game state machine (spec §28) and hook states (spec §18). Engine-agnostic. */

export type GameState =
  | 'LOADING'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'CATCHING'
  | 'DANGER'
  | 'GAME_OVER'
  | 'RESULTS';

export type HookState =
  | 'READY'
  | 'DESCENDING'
  | 'CONTACT'
  | 'CAUGHT'
  | 'ESCAPING'
  | 'RETRACTING'
  | 'BROKEN';

export type GameEventKind =
  | 'CATCH'
  | 'ESCAPE'
  | 'LINE_BREAK'
  | 'SHARK_HIT'
  | 'COMBO_UP'
  | 'DEPTH_ZONE'
  | 'MAX_DEPTH'
  | 'RUN_END';

export interface GameEvent {
  kind: GameEventKind;
  atMs: number;
  /** Optional payload (fishId, zone name, combo level…). */
  data?: Record<string, unknown>;
}

export interface HookSnapshot {
  x: number;
  depth: number;
  state: HookState;
  tensionRatio: number;
  hookedFishId: string | null;
}

export interface FishSnapshot {
  entityId: number;
  speciesId: string;
  x: number;
  depth: number;
  facing: -1 | 1;
  danger: boolean;
  rarity: string;
  hooked: boolean;
}

export interface RunSnapshot {
  state: GameState;
  hook: HookSnapshot;
  fish: FishSnapshot[];
  score: number;
  combo: number;
  comboMultiplier: number;
  provisionalCredits: number;
  catches: number;
  elapsedMs: number;
  maxDepth: number;
}

/** Upgrade levels owned by the player (0-based). Costs are handled outside the engine. */
export interface PlayerLoadout {
  hookStrength: number;
  lineStrength: number;
  lineLength: number;
  reelSpeed: number;
  magnetRadius: number;
}

export const DEFAULT_LOADOUT: PlayerLoadout = {
  hookStrength: 0,
  lineStrength: 0,
  lineLength: 0,
  reelSpeed: 0,
  magnetRadius: 0,
};
