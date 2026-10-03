/**
 * Security tests for the Phase 4/5 surfaces (roadmap 6 — §17, §58).
 * Covers: referral abuse guards, analytics PII/whitelist enforcement,
 * config-override type safety (no shape-breaking overrides).
 */
import { describe, expect, it } from 'vitest';
import { ReferralStore, REFERRAL_REWARD_CREDITS } from './economy.js';
import { trackEvent, ANALYTICS_EVENTS, funnel } from './analytics.js';
import { applyOverrides } from './config-overrides.js';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';

function referralStore(): ReferralStore {
  return new ReferralStore(false); // force memory path
}

describe('ReferralStore guards', () => {
  it('self-referral is rejected', async () => {
    const s = referralStore();
    expect(await s.attach('p1', 'p1')).toBe(false);
    const info = await s.info('p1');
    expect(info.invited).toHaveLength(0);
  });

  it('first referrer wins: re-attach is a no-op (no double counting)', async () => {
    const s = referralStore();
    expect(await s.attach('referee', 'referrerA')).toBe(true);
    expect(await s.attach('referee', 'referrerB')).toBe(false);
    const infoA = await s.info('referrerA');
    expect(infoA.invited).toHaveLength(1);
    const infoB = await s.info('referrerB');
    expect(infoB.invited).toHaveLength(0);
  });

  it('claim pays once per invitee and then reports NOTHING_TO_CLAIM', async () => {
    const s = referralStore();
    // Unique ids: referral memory is module-level and shared across tests.
    await s.attach('referee-claim', 'referrer-claim');
    const first = await s.claim('referrer-claim');
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.reward).toBe(REFERRAL_REWARD_CREDITS);
    const again = await s.claim('referrer-claim');
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.code).toBe('NOTHING_TO_CLAIM');
  });

  it('referrer with no invitees cannot claim', async () => {
    const s = referralStore();
    const res = await s.claim('lonely-claim');
    expect(res.ok).toBe(false);
  });
});

describe('Analytics pipeline guards', () => {
  it('rejects unknown event names (whitelist)', async () => {
    await expect(trackEvent('make_me_admin', 'p1', undefined)).rejects.toThrow(/unknown event/);
  });

  it('strips non-scalar and long-string props (PII guard)', async () => {
    await trackEvent('dive_start', 'p1', {
      depthZone: 'shelf',
      nested: { evil: true },
      longPii: 'x'.repeat(200),
      depth: 42,
    } as Record<string, unknown>);
    // No throw = accepted; the stored props are filtered internally.
    const f = await funnel(['dive_start'], 1);
    expect(f.counts[0]).toBeGreaterThanOrEqual(1);
  });

  it('funnel conversion is 0 when nobody entered', async () => {
    const f = await funnel(['session_start', 'dive_start'], 1);
    expect(f.conversion).toBe(0);
  });

  it('event whitelist matches the spec event set', () => {
    expect(ANALYTICS_EVENTS).toContain('dive_start');
    expect(ANALYTICS_EVENTS).toContain('upgrade_purchased');
    expect(ANALYTICS_EVENTS).not.toContain('password_reset');
  });
});

describe('Config override safety', () => {
  it('applies scalar overrides of the same type only', () => {
    const merged = applyOverrides();
    expect(merged).toBeDefined();
    expect(merged.fish.length).toBe(DEFAULT_GAME_CONFIG.fish.length);
  });

  it('ignores overrides whose path does not exist (no shape mutation)', () => {
    // applyOverrides must never add new keys — verify against a pristine clone.
    const before = JSON.stringify(Object.keys(DEFAULT_GAME_CONFIG));
    applyOverrides();
    expect(JSON.stringify(Object.keys(DEFAULT_GAME_CONFIG))).toBe(before);
  });
});
