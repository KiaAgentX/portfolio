/**
 * FISHKAL: DEEP CATCH — core engine (spec §16–27, §76).
 * No React, no Three.js. The renderer and UI subscribe to snapshots + events.
 * The host app calls update() from a fixed-timestep loop.
 */
import { FISHKAL_RARITY_WEIGHTS } from '@fishkal/config';
import type { GameConfig } from '@fishkal/config';
import type { FishSpeciesDef, Rarity, RunFishCatch } from '@fishkal/shared';
import { Rng } from './rng.js';
import type {
  FishSnapshot,
  GameEvent,
  GameState,
  HookSnapshot,
  HookState,
  PlayerLoadout,
  RunSnapshot,
} from './state.js';
import { DEFAULT_LOADOUT } from './state.js';

// ---- Tuning constants -------------------------------------------------------
const WORLD_HALF_WIDTH = 12;
// §18: the hook must outrun catchable fish (22–40) but not apex threats (44+).
const HOOK_MOVE_SPEED = 30;
const HOOK_HALF = 0.9;
const TENSION_PER_WEIGHT = 140;
const TENSION_PER_SPEED = 1.8;
const TENSION_DECAY = 26;
const REEL_BASE_SPEED = 30;
const DANGER_MS = 700;
const HIT_INVULN_MS = 1200;
const SPAWN_BASE_S = 0.9;
const MAX_FISH = 28;
const FLEE_RADIUS = 6;
const CHASE_RADIUS = 10;

const CATCH_BASE: Record<Rarity, number> = {
  COMMON: 0.9,
  UNCOMMON: 0.8,
  RARE: 0.65,
  EPIC: 0.5,
  LEGENDARY: 0.35,
};

interface FishEntity {
  entityId: number;
  species: FishSpeciesDef;
  x: number;
  depth: number;
  vX: number;
  vDepth: number;
  facing: -1 | 1;
  hooked: boolean;
  nextTurnAt: number;
  /** Reel-seconds left before this fish gives up (set on attach). */
  stamina: number;
}

export interface EngineOptions {
  config: GameConfig;
  loadout?: PlayerLoadout;
  seed?: number;
  onStateChange?: (state: GameState) => void;
  onEvent?: (event: GameEvent) => void;
}

export interface EngineStats {
  score: number;
  catches: number;
  maxCombo: number;
  maxDepth: number;
  elapsedMs: number;
  provisionalCredits: number;
}

export class FishkalEngine {
  readonly config: GameConfig;
  private loadout: PlayerLoadout;
  private readonly rng: Rng;
  private readonly onStateChange?: (s: GameState) => void;
  private readonly onEvent?: (e: GameEvent) => void;

  private state: GameState = 'READY';
  private hookState: HookState = 'READY';
  private hookX = 0;
  private inputX = 0;
  private hookDepth = 0;
  private tension = 0;
  private reeling = false;
  private brokenUntil = 0;
  private hitInvulnUntil = 0;
  private dangerUntil = 0;

  private fish: FishEntity[] = [];
  private nextEntityId = 1;
  private spawnTimer = 0.5;

  private score = 0;
  private credits = 0;
  private combo = 0;
  private maxCombo = 0;
  private comboExpireAt = 0;
  private catches: RunFishCatch[] = [];
  private maxDepth = 0;
  private notifiedDepth = 0;
  private currentZoneId = '';
  private elapsedMs = 0;
  private caughtFish: FishEntity | null = null;
  private caughtAtDepth = 0;
  /** How long the line has been slack during a fight (drives ESCAPE, §18). */
  private slackMs = 0;

  constructor(options: EngineOptions) {
    this.config = options.config;
    this.loadout = options.loadout ?? DEFAULT_LOADOUT;
    this.rng = new Rng(options.seed ?? 1);
    this.onStateChange = options.onStateChange;
    this.onEvent = options.onEvent;
    this.currentZoneId = this.zoneAt(0)?.id ?? '';
  }

  // ---- Public API ------------------------------------------------------------

  start(): void {
    if (this.state !== 'READY' && this.state !== 'RESULTS') return;
    if (this.state === 'RESULTS') this.resetRun();
    this.setState('PLAYING');
    this.hookState = 'DESCENDING';
  }

  /** Full run reset so Play Again starts a fresh dive from the surface. */
  private resetRun(): void {
    // Silent reset — the public setState('PLAYING') below is the single notification.
    this.state = 'READY';
    this.hookState = 'READY';
    this.hookX = 0;
    this.inputX = 0;
    this.hookDepth = 0;
    this.tension = 0;
    this.reeling = false;
    this.brokenUntil = 0;
    this.hitInvulnUntil = 0;
    this.dangerUntil = 0;
    this.fish = [];
    this.spawnTimer = 0.5;
    this.score = 0;
    this.credits = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboExpireAt = 0;
    this.catches = [];
    this.maxDepth = 0;
    this.notifiedDepth = 0;
    this.currentZoneId = this.zoneAt(0)?.id ?? '';
    this.elapsedMs = 0;
    this.caughtFish = null;
    this.caughtAtDepth = 0;
    this.slackMs = 0;
  }

  pause(): void {
    if (this.state === 'PLAYING') this.setState('PAUSED');
  }

  resume(): void {
    if (this.state === 'PAUSED') this.setState('PLAYING');
  }

  /** Horizontal input in [-1, 1]. Touch drag, mouse and keys all map here. */
  setInput(input: number): void {
    this.inputX = Math.max(-1, Math.min(1, input));
  }

  reel(): void {
    this.reeling = true;
  }

  /** Hot-apply an upgrade loadout (economy purchases, §60). Takes effect next run. */
  setLoadout(loadout: PlayerLoadout): void {
    this.loadout = { ...loadout };
  }

  stopReel(): void {
    this.reeling = false;
  }

  get elapsed(): number {
    return this.elapsedMs;
  }

  getState(): GameState {
    return this.state;
  }

  getHook(): HookSnapshot {
    return {
      x: this.hookX,
      depth: this.hookDepth,
      state: this.hookState,
      tensionRatio: Math.min(1, this.tension / this.tensionLimit()),
      hookedFishId: this.caughtFish?.species.id ?? null,
    };
  }

  getFish(): FishSnapshot[] {
    return this.fish.map((f) => ({
      entityId: f.entityId,
      speciesId: f.species.id,
      x: f.x,
      depth: f.depth,
      facing: f.facing,
      danger: f.species.danger,
      rarity: f.species.rarity,
      hooked: f.hooked,
    }));
  }

  getStats(): EngineStats {
    return {
      score: this.score,
      catches: this.catches.length,
      maxCombo: this.maxCombo,
      maxDepth: this.maxDepth,
      elapsedMs: this.elapsedMs,
      provisionalCredits: Math.floor(this.credits),
    };
  }

  getCatches(): RunFishCatch[] {
    return this.catches.map((c) => ({ ...c }));
  }

  getSnapshot(): RunSnapshot {
    return {
      state: this.state,
      hook: this.getHook(),
      fish: this.getFish(),
      score: this.score,
      combo: this.combo,
      comboMultiplier: this.comboMultiplier(),
      provisionalCredits: Math.floor(this.credits),
      catches: this.catches.length,
      elapsedMs: this.elapsedMs,
      maxDepth: this.maxDepth,
    };
  }

  /** Advance the simulation by dtSeconds (clamped). */
  update(dtSeconds: number): void {
    const dt = Math.min(dtSeconds, 0.1);
    if (this.state === 'DANGER' && this.elapsedMs >= this.dangerUntil) {
      this.setState('PLAYING');
    }
    if (this.state !== 'PLAYING' && this.state !== 'DANGER') return;

    this.elapsedMs += dt * 1000;
    this.updateHook(dt);
    this.updateFish(dt);
    this.updateSpawning(dt);
    this.updateCollisions();
    this.updateComboExpiry();
    this.clampHook();
    this.checkDepthEvents();
  }

  // ---- Hook ------------------------------------------------------------------

  private updateHook(dt: number): void {
    const speedFactor = this.hookState === 'CAUGHT' ? 0.5 : 1;
    this.hookX += this.inputX * HOOK_MOVE_SPEED * speedFactor * dt;

    switch (this.hookState) {
      case 'DESCENDING': {
        this.hookDepth += this.config.economy.hookDescendSpeed * dt;
        if (this.hookDepth >= this.lineLength()) {
          this.hookState = 'RETRACTING';
        }
        break;
      }
      case 'CAUGHT': {
        this.fightCaughtFish(dt);
        break;
      }
      case 'ESCAPING':
      case 'BROKEN': {
        // §18: a lost fish is a setback, not a run-ender — resume the dive.
        if (this.elapsedMs >= this.brokenUntil) this.hookState = 'DESCENDING';
        break;
      }
      case 'RETRACTING': {
        this.hookDepth -= this.reelSpeed() * dt;
        this.tension = Math.max(0, this.tension - TENSION_DECAY * dt);
        if (this.hookDepth <= 0) {
          this.endRun('surface');
        }
        break;
      }
      case 'READY':
      case 'CONTACT':
        break;
    }
  }

  private fightCaughtFish(dt: number): void {
    const f = this.caughtFish;
    if (!f) {
      this.hookState = 'RETRACTING';
      return;
    }
    const struggle =
      f.species.weight * TENSION_PER_WEIGHT + Math.abs(f.vX) * TENSION_PER_SPEED;

    // §18/§19 fight model: "stamina reel-off". Reeling drains the fish's
    // stamina in place (tension rises); resting lets tension fall but the fish
    // recovers a little. Win the reel-off → landed catch at your depth.
    if (this.reeling) {
      this.tension = Math.max(0, this.tension + (struggle * 0.35 - TENSION_DECAY) * dt);
      f.stamina -= dt;
      this.slackMs = 0;
    } else {
      this.tension = Math.max(0, this.tension + (struggle * 0.1 - TENSION_DECAY) * dt);
      f.stamina = Math.min(f.stamina + dt * 0.35, f.species.weight * 14 + 4);
      // Slack line: the fish eventually throws the hook (§18 ESCAPING).
      this.slackMs += dt * 1000;
      if (this.slackMs > 2200 + f.species.weight * 1500) {
        this.slackMs = 0;
        this.escapeCaught(f);
        return;
      }
    }

    if (f.stamina <= 0) {
      this.landCatch(f);
      return;
    }
    // The hook hangs in the fish's mouth: it follows the fight.
    this.hookDepth = f.depth;

    if (this.tension >= this.tensionLimit()) {
      this.breakLine(f);
      return;
    }
    // Landing is stamina-driven now (stamina <= 0 above) — no surface tow needed.
  }

  private escapeCaught(f: FishEntity): void {
    f.hooked = false;
    f.vX = f.facing * f.species.speed * 1.6;
    this.caughtFish = null;
    this.tension = 0;
    this.combo = 0;
    this.hookState = 'ESCAPING';
    this.brokenUntil = this.elapsedMs + 600;
    // Invulnerable window so the hook can descend past the escaped fish
    // instead of re-colliding with it every frame (§18).
    this.hitInvulnUntil = this.elapsedMs + 1000;
    this.emit({ kind: 'ESCAPE', atMs: this.elapsedMs, data: { fishId: f.species.id } });
  }

  private breakLine(f: FishEntity): void {
    f.hooked = false;
    f.vX = f.facing * f.species.speed * 1.5;
    this.caughtFish = null;
    this.tension = 0;
    this.combo = 0;
    this.hookState = 'BROKEN';
    this.brokenUntil = this.elapsedMs + DANGER_MS;
    this.enterDanger();
    this.emit({ kind: 'LINE_BREAK', atMs: this.elapsedMs, data: { fishId: f.species.id } });
  }

  private enterDanger(): void {
    this.dangerUntil = this.elapsedMs + DANGER_MS;
    this.hitInvulnUntil = this.elapsedMs + HIT_INVULN_MS;
    this.setState('DANGER');
  }

  private landCatch(f: FishEntity): void {
    const mult = this.comboMultiplier();
    const gainedScore = Math.round(f.species.score * mult);
    this.score += gainedScore;
    this.credits += f.species.creditReward * mult;
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboExpireAt = this.elapsedMs + this.config.economy.comboWindowsMs;
    this.catches.push({ fishId: f.species.id, depth: Math.round(this.caughtAtDepth), atMs: Math.round(this.elapsedMs) });
    this.emit({
      kind: 'CATCH',
      atMs: this.elapsedMs,
      data: { fishId: f.species.id, score: gainedScore, combo: this.combo, multiplier: mult },
    });
    if (this.combo >= 2) {
      this.emit({ kind: 'COMBO_UP', atMs: this.elapsedMs, data: { combo: this.combo, multiplier: mult } });
    }
    this.removeFish(f);
    this.caughtFish = null;
    this.tension = 0;
    this.hookState = 'DESCENDING';
  }

  private comboMultiplier(): number {
    const tiers = this.config.economy.comboMultipliers;
    const idx = Math.min(this.combo, tiers.length - 1);
    return tiers[idx] ?? 1;
  }

  private updateComboExpiry(): void {
    if (this.combo > 0 && this.elapsedMs > this.comboExpireAt) {
      this.combo = 0;
    }
  }

  private lineLength(): number {
    // Baseline 260m (config), +45m per line_length upgrade level (§19 balance).
    const base = this.config.economy.baselineLineLengthM ?? 260;
    return base + this.loadout.lineLength * 45;
  }

  private reelSpeed(): number {
    return REEL_BASE_SPEED + this.loadout.reelSpeed * 6;
  }

  private tensionLimit(): number {
    return this.config.economy.lineTensionLimit * (1 + this.loadout.lineStrength * 0.25);
  }

  // ---- Fish ------------------------------------------------------------------

  private updateFish(dt: number): void {
    for (const f of this.fish) {
      if (f.hooked) continue;
      this.applyBehavior(f, dt);

      f.x += f.vX * dt;
      f.depth += f.vDepth * dt;

      if (f.x > WORLD_HALF_WIDTH) {
        f.x = WORLD_HALF_WIDTH;
        f.vX = -Math.abs(f.vX);
      } else if (f.x < -WORLD_HALF_WIDTH) {
        f.x = -WORLD_HALF_WIDTH;
        f.vX = Math.abs(f.vX);
      }
      if (f.vX !== 0) f.facing = f.vX > 0 ? 1 : -1;

      const band = this.speciesBand(f.species);
      if (f.depth < band.min) {
        f.depth = band.min;
        f.vDepth = Math.abs(f.vDepth);
      } else if (f.depth > band.max) {
        f.depth = band.max;
        f.vDepth = -Math.abs(f.vDepth);
      }
    }

    // Despawn fish far behind the hook.
    this.fish = this.fish.filter((f) => f.hooked || f.depth > this.hookDepth - 45);
  }

  private applyBehavior(f: FishEntity, dt: number): void {
    const hookDx = this.hookX - f.x;
    const hookDd = this.hookDepth - f.depth;
    const dist = Math.hypot(hookDx, hookDd * 0.6);

    switch (f.species.behavior) {
      case 'SLOW': {
        if (this.elapsedMs >= f.nextTurnAt) {
          f.nextTurnAt = this.elapsedMs + this.rng.range(2000, 4500);
          f.vDepth = this.rng.range(-3, 3);
        }
        break;
      }
      case 'FAST': {
        if (this.elapsedMs >= f.nextTurnAt) {
          f.nextTurnAt = this.elapsedMs + this.rng.range(1200, 2200);
          f.vX *= this.rng.next() < 0.4 ? -1 : 1;
          f.vDepth = this.rng.range(-6, 6);
        }
        break;
      }
      case 'FLEE': {
        if (dist < FLEE_RADIUS) {
          f.vX = -Math.sign(hookDx) * f.species.speed * 1.3;
          f.vDepth = -Math.sign(hookDd) * f.species.speed * 0.4;
        } else if (this.elapsedMs >= f.nextTurnAt) {
          f.nextTurnAt = this.elapsedMs + this.rng.range(1800, 3600);
          f.vDepth = this.rng.range(-4, 4);
        }
        break;
      }
      case 'ZIGZAG': {
        if (this.elapsedMs >= f.nextTurnAt) {
          f.nextTurnAt = this.elapsedMs + this.rng.range(350, 700);
          f.vX = f.facing * -1 * f.species.speed;
          f.vDepth = this.rng.range(-8, 8);
        }
        break;
      }
      case 'HEAVY': {
        f.vDepth = 5 + f.species.weight * 6;
        break;
      }
      case 'PREDATOR': {
        if (dist < CHASE_RADIUS) {
          f.vX = Math.sign(hookDx) * f.species.speed * 1.2;
          f.vDepth = Math.sign(hookDd) * f.species.speed * 0.6;
        } else if (this.elapsedMs >= f.nextTurnAt) {
          f.nextTurnAt = this.elapsedMs + this.rng.range(1500, 3000);
          f.vDepth = this.rng.range(-5, 5);
        }
        break;
      }
      case 'SHARK': {
        if (this.elapsedMs < f.nextTurnAt) {
          // Knocked through recently: keep leaving, don't re-chase (§24 fairness).
        } else if (dist < CHASE_RADIUS * 1.4) {
          f.vX = Math.sign(hookDx) * f.species.speed * 1.35;
          f.vDepth = Math.sign(hookDd) * f.species.speed * 0.5;
        } else if (this.elapsedMs >= f.nextTurnAt) {
          f.nextTurnAt = this.elapsedMs + this.rng.range(2200, 3800);
          f.vX = (this.rng.next() < 0.5 ? -1 : 1) * f.species.speed * 0.6;
          f.vDepth = this.rng.range(-4, 4);
        }
        break;
      }
      case 'LEGENDARY': {
        if (this.elapsedMs >= f.nextTurnAt) {
          f.nextTurnAt = this.elapsedMs + this.rng.range(400, 900);
          f.vX = (this.rng.next() < 0.55 ? -1 : 1) * f.species.speed * (this.rng.next() < 0.3 ? 1.6 : 1);
          f.vDepth = this.rng.range(-10, 10);
        }
        break;
      }
    }
  }

  private updateSpawning(dt: number): void {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0 || this.fish.length >= MAX_FISH) return;
    this.spawnTimer = SPAWN_BASE_S * this.rng.range(0.7, 1.3);
    const species = this.pickSpecies();
    if (!species) return;
    this.spawnFish(species);
  }

  private pickSpecies(): FishSpeciesDef | null {
    const pool = this.config.fish.filter(
      (f) => this.hookDepth >= f.depthMin - 10 && this.hookDepth <= f.depthMax + 10,
    );
    if (pool.length === 0) return null;
    const weights = pool.map((f) => {
      let w = FISHKAL_RARITY_WEIGHTS[f.rarity];
      if (f.behavior === 'SHARK' && this.hookDepth < 80) w *= 0.2;
      if (f.rarity === 'LEGENDARY') {
        w *= this.hookDepth >= 300 && this.rng.next() < 0.25 ? 1 : 0;
      }
      return w;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0) return null;
    let roll = this.rng.next() * total;
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i] ?? 0;
      if (roll <= 0) return pool[i] ?? null;
    }
    return pool[pool.length - 1] ?? null;
  }

  private spawnFish(species: FishSpeciesDef): void {
    const fromLeft = this.rng.next() < 0.5;
    const band = this.speciesBand(species);
    const entity: FishEntity = {
      entityId: this.nextEntityId++,
      species,
      x: fromLeft ? -WORLD_HALF_WIDTH - 2 : WORLD_HALF_WIDTH + 2,
      depth: Math.max(band.min, Math.min(band.max, this.hookDepth + this.rng.range(-8, 12))),
      vX: (fromLeft ? 1 : -1) * species.speed,
      vDepth: 0,
      facing: fromLeft ? 1 : -1,
      hooked: false,
      nextTurnAt: this.elapsedMs + this.rng.range(500, 2000),
      stamina: 0,
    };
    this.fish.push(entity);
  }

  private removeFish(target: FishEntity): void {
    this.fish = this.fish.filter((f) => f !== target);
  }

  private speciesBand(s: FishSpeciesDef): { min: number; max: number } {
    return { min: s.depthMin, max: Math.max(s.depthMax, s.depthMin + 10) };
  }

  // ---- Collisions ------------------------------------------------------------

  private updateCollisions(): void {
    if (this.hookState !== 'DESCENDING') return;
    if (this.elapsedMs < this.hitInvulnUntil) return;

    for (const f of this.fish) {
      if (f.hooked) continue;
      const hitR = HOOK_HALF + f.species.size * 0.5;
      if (Math.abs(this.hookX - f.x) < hitR && Math.abs(this.hookDepth - f.depth) < hitR) {
        if (f.species.danger) {
          this.dangerHit(f);
        } else {
          this.tryAttach(f);
        }
        return;
      }
    }
  }

  private tryAttach(f: FishEntity): void {
    const p = this.catchProbability(f);
    if (this.rng.next() < p) {
      f.hooked = true;
      this.caughtFish = f;
      this.caughtAtDepth = f.depth;
      this.hookState = 'CAUGHT';
      this.tension = f.species.weight * 30;
      // Stamina = reel-seconds needed to land it (heavier = longer fight, §19).
      f.stamina = f.species.weight * 14 + 4;
    } else {
      this.hookState = 'ESCAPING';
      this.brokenUntil = this.elapsedMs + 300;
      this.hitInvulnUntil = this.elapsedMs + 800;
      f.vX = f.facing * f.species.speed * 1.8;
      this.emit({ kind: 'ESCAPE', atMs: this.elapsedMs, data: { fishId: f.species.id } });
    }
  }

  private catchProbability(f: FishEntity): number {
    const p =
      CATCH_BASE[f.species.rarity] -
      f.species.weight * 0.3 +
      this.loadout.hookStrength * 0.04;
    return Math.max(0.1, Math.min(0.95, p));
  }

  private dangerHit(f: FishEntity): void {
    // §24 danger: threatens line tension and combo — it never erases score.
    this.combo = 0;
    this.tension = Math.min(this.tensionLimit() * 0.9, this.tension + 30 + f.species.weight * 40);
    // Knock the predator through and past — no perma-camping on the hook.
    f.vX = Math.sign(f.x - this.hookX || 1) * f.species.speed * 2.2;
    f.vDepth = Math.sign(f.depth - this.hookDepth) * f.species.speed * 0.6;
    f.nextTurnAt = this.elapsedMs + 2500;
    this.enterDanger();
    this.emit({ kind: 'SHARK_HIT', atMs: this.elapsedMs, data: { fishId: f.species.id } });
  }

  // ---- World -----------------------------------------------------------------

  private clampHook(): void {
    this.hookX = Math.max(-WORLD_HALF_WIDTH, Math.min(WORLD_HALF_WIDTH, this.hookX));
    if (this.hookDepth < 0) this.hookDepth = 0;
  }

  private zoneAt(depth: number) {
    return (
      this.config.depthZones.find((z) => depth >= z.depthMin && depth < z.depthMax) ??
      this.config.depthZones[this.config.depthZones.length - 1]
    );
  }

  private checkDepthEvents(): void {
    if (this.hookDepth > this.maxDepth) {
      this.maxDepth = this.hookDepth;
      if (this.maxDepth - this.notifiedDepth >= 50) {
        this.notifiedDepth = this.maxDepth;
        this.emit({ kind: 'MAX_DEPTH', atMs: this.elapsedMs, data: { depth: Math.round(this.maxDepth) } });
      }
    }
    const zone = this.zoneAt(this.hookDepth);
    if (zone && zone.id !== this.currentZoneId) {
      this.currentZoneId = zone.id;
      this.emit({ kind: 'DEPTH_ZONE', atMs: this.elapsedMs, data: { zone: zone.id, name: zone.name } });
    }
  }

  private endRun(reason: string): void {
    this.hookState = 'READY';
    this.setState('RESULTS');
    this.emit({ kind: 'RUN_END', atMs: this.elapsedMs, data: { reason } });
  }

  private setState(s: GameState): void {
    this.state = s;
    this.onStateChange?.(s);
  }

  private emit(event: GameEvent): void {
    this.onEvent?.(event);
  }
}

export type { HookState } from './state.js';
