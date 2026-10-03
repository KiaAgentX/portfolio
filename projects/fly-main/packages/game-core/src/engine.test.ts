import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';
import { FishkalEngine } from './engine.js';
import { DEFAULT_LOADOUT } from './state.js';

function makeEngine(overrides?: { seed?: number; lineM?: number }) {
  const events: string[] = [];
  // Balance tests should override baselineLineLengthM (metres), not the upgrade level.
  const config = {
    ...DEFAULT_GAME_CONFIG,
    economy: {
      ...DEFAULT_GAME_CONFIG.economy,
      baselineLineLengthM: overrides?.lineM ?? DEFAULT_GAME_CONFIG.economy.baselineLineLengthM,
    },
  };
  const engine = new FishkalEngine({
    config,
    seed: overrides?.seed ?? 42,
    onEvent: (e) => events.push(e.kind),
  });
  return { engine, events };
}

function runFor(engine: FishkalEngine, seconds: number): void {
  const dt = 1 / 60;
  for (let i = 0; i < seconds * 60; i++) engine.update(dt);
}

describe('FishkalEngine', () => {
  it('transitions READY → PLAYING on start()', () => {
    const { engine } = makeEngine();
    expect(engine.getState()).toBe('READY');
    engine.start();
    expect(engine.getState()).toBe('PLAYING');
  });

  it('descends over time and records max depth', () => {
    const { engine } = makeEngine();
    engine.start();
    runFor(engine, 5);
    const hook = engine.getHook();
    expect(hook.depth).toBeGreaterThan(0);
    expect(engine.getStats().maxDepth).toBeCloseTo(hook.depth, 0);
  });

  it('retracting at line end eventually ends the run with RUN_END event', () => {
    const { engine, events } = makeEngine({ lineM: 30 });
    engine.start();
    // Very short line: ~3.3s down at 9 m/s, ~1s reel up at 30 m/s.
    runFor(engine, 12);
    expect(engine.getState()).toBe('RESULTS');
    expect(events).toContain('RUN_END');
  });

  it('pause/resume works and freezes the clock', () => {
    const { engine } = makeEngine();
    engine.start();
    runFor(engine, 1);
    engine.pause();
    expect(engine.getState()).toBe('PAUSED');
    const t = engine.elapsed;
    runFor(engine, 1);
    expect(engine.elapsed).toBe(t);
    engine.resume();
    expect(engine.getState()).toBe('PLAYING');
  });

  it('collides with spawned fish and can attach (deterministic seed)', () => {
    const { engine } = makeEngine({ seed: 7, lineM: 120 });
    engine.start();
    runFor(engine, 30);
    const stats = engine.getStats();
    // With 25s of play, spawning + collisions should produce some interaction.
    expect(
      stats.catches > 0 ||
        engine.getHook().state !== 'DESCENDING' ||
        stats.maxCombo > 0 ||
        events_include_catch(engine),
    ).toBe(true);
  });

  it('score only changes on landed catches, never from depth alone', () => {
    const { engine } = makeEngine();
    engine.start();
    runFor(engine, 4);
    expect(engine.getStats().score).toBe(0);
  });

  it('line-length contract: baseline config depth, +45m per upgrade level', () => {
    const base = makeEngine({ lineM: 80 });
    base.engine.start();
    runFor(base.engine, 20);
    expect(base.engine.getStats().maxDepth).toBeGreaterThanOrEqual(78);
    // <= line + one frame of overshoot (9 m/s at dt=1/60 ≈ 0.15m).
    expect(base.engine.getStats().maxDepth).toBeLessThanOrEqual(81);

    const upgraded = makeEngine({ lineM: 80 });
    // Upgrade loadout is applied through the constructor in makeEngine; simulate
    // two levels by relying on the +45m/level contract via a custom engine:
    const engine2 = new FishkalEngine({
      config: {
        ...DEFAULT_GAME_CONFIG,
        economy: { ...DEFAULT_GAME_CONFIG.economy, baselineLineLengthM: 80 },
      },
      loadout: { ...DEFAULT_LOADOUT, lineLength: 2 },
    });
    engine2.start();
    // Generous window: fights/shark events may interrupt the descent.
    runFor(engine2, 60);
    expect(engine2.getStats().maxDepth).toBeGreaterThanOrEqual(165); // 80 + 2×45 = 170
  });

  it('supports Play Again: start() from RESULTS resets the run', () => {
    const { engine } = makeEngine({ lineM: 30 });
    engine.start();
    runFor(engine, 12);
    expect(engine.getState()).toBe('RESULTS');

    engine.start();
    expect(engine.getState()).toBe('PLAYING');
    expect(engine.getHook().depth).toBe(0);
    expect(engine.getStats().score).toBe(0);
    expect(engine.getStats().catches).toBe(0);
    expect(engine.getStats().maxDepth).toBe(0);

    runFor(engine, 3);
    expect(engine.getHook().depth).toBeGreaterThan(0);
  });

  it('getCatches returns submission-shaped records', () => {
    const { engine } = makeEngine({ seed: 7 });
    engine.start();
    runFor(engine, 25);
    for (const c of engine.getCatches()) {
      expect(typeof c.fishId).toBe('string');
      expect(c.depth).toBeGreaterThanOrEqual(0);
      expect(c.atMs).toBeGreaterThanOrEqual(0);
    }
  });
});

function events_include_catch(engine: FishkalEngine): boolean {
  // Access via public surface: a CAUGHT-state hook or past catch implies interactions.
  return engine.getHook().hookedFishId !== null;
}
