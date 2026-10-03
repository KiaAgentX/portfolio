/**
 * Economy security tests (roadmap Block D — §58–60, §17).
 * Exercises the in-memory path of EconomyStore directly: the same guards
 * (idempotent refIds, pay-once claims, overdraft rejection) wrap the DB path.
 */
import { describe, expect, it } from 'vitest';
import { EconomyStore } from './economy.js';

function store(): EconomyStore {
  return new EconomyStore(false); // force memory path
}

describe('EconomyStore (server-authoritative guards)', () => {
  it('rejects credit of non-positive or non-integer deltas', async () => {
    const s = store();
    expect(await s.credit('p1', 0, 'zero', null)).toBe(false);
    expect(await s.credit('p1', -5, 'negative', null)).toBe(false);
    expect(await s.credit('p1', 1.5, 'fraction', null)).toBe(false);
  });

  it('is idempotent per (reason, refId): replayed credit pays once', async () => {
    const s = store();
    expect(await s.credit('p1', 10, 'run_reward', 'run-1')).toBe(true);
    expect(await s.credit('p1', 10, 'run_reward', 'run-1')).toBe(false); // replay
    expect(await s.credit('p1', 10, 'run_reward', 'run-2')).toBe(true); // new ref ok
    const wallet = await s.getWallet('p1', 20);
    expect(wallet.ledger).toHaveLength(2);
  });

  it('purchase rejects unknown upgrade, overdraft, and duplicate refIds', async () => {
    const s = store();
    const unknown = await s.purchase('p1', 'nope', 'r1', 100);
    expect(unknown.ok).toBe(false);
    const broke = await s.purchase('p1', 'line_length', 'r1', 10);
    expect(!broke.ok && broke.code).toBe('INSUFFICIENT_CREDITS');

    const ok = await s.purchase('p1', 'line_length', 'r2', 100);
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.level).toBe(1);
      // line_length level 1 cost = 50 * 1.7^0 = 50 → delta -50
      expect(ok.delta).toBe(-50);
      expect(ok.loadout.lineLength).toBe(1);
    }
    // Same refId replays are rejected even with money available.
    const dup = await s.purchase('p1', 'hook_strength', 'r2', 100);
    expect(!dup.ok && dup.code).toBe('DUPLICATE');
  });

  it('purchase cost escalates by multiplier and stops at max level', async () => {
    const s = store();
    let credits = 10_000;
    let level = 0;
    // magnet_radius: maxLevel 5
    for (let i = 0; i < 5; i++) {
      const r = await s.purchase('p1', 'magnet_radius', `ref-${i}`, credits);
      if (!r.ok) throw new Error(`purchase ${i} failed: ${r.code}`);
      credits += r.delta;
      level = r.level;
    }
    expect(level).toBe(5);
    const capped = await s.purchase('p1', 'magnet_radius', 'ref-99', credits);
    expect(capped.ok).toBe(false);
    if (!capped.ok) expect(capped.code).toBe('MAX_LEVEL');
  });

  it('missions: claim requires completion and pays exactly once', async () => {
    const s = store();
    const early = await s.claimMission('p1', 'first_catch', 0);
    expect(!early.ok && early.code).toBe('NOT_COMPLETE');
    await s.addMissionProgress('p1', 'catches', 1);
    const claimed = await s.claimMission('p1', 'first_catch', 5);
    expect(claimed.ok).toBe(true);
    if (claimed.ok) expect(claimed.delta).toBe(10); // reward delta
    const again = await s.claimMission('p1', 'first_catch', 15);
    expect(!again.ok && again.code).toBe('ALREADY_CLAIMED');
  });

  it('progress is capped at the mission target', async () => {
    const s = store();
    await s.addMissionProgress('p1', 'depth', 5000);
    const missions = await s.getMissions('p1');
    const deep = missions.find((m) => m.kind === 'depth');
    expect(deep?.progress).toBe(deep?.target);
    expect(deep?.claimable).toBe(true);
  });

  it('collection records best score/depth per species', async () => {
    const s = store();
    const scores = new Map([['sardine', 10]]);
    await s.recordCollection('p1', [{ fishId: 'sardine', depth: 40 }], scores);
    await s.recordCollection('p1', [{ fishId: 'sardine', depth: 60 }], new Map([['sardine', 30]]));
    const coll = await s.getCollection('p1');
    expect(coll).toHaveLength(1);
    expect(coll[0]?.bestDepth).toBe(60);
    expect(coll[0]?.bestScore).toBe(30);
  });

  it('loadout levels persist across purchases', async () => {
    const s = store();
    await s.purchase('p1', 'reel_speed', 'a', 1000);
    await s.purchase('p1', 'reel_speed', 'b', 1000);
    const loadout = await s.getLoadout('p1');
    expect(loadout.reelSpeed).toBe(2);
    expect(loadout.lineLength).toBe(0); // untouched
  });
});
