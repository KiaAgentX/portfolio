/**
 * Server-authoritative economy (spec §60, roadmap 3.1–3.2).
 * All credit mutations flow through the CreditLedger inside transactions.
 * Works on Postgres when available; falls back to in-memory maps otherwise
 * (same pattern as the Phase 1 store) so dev never blocks on Docker.
 */
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';
import type { PlayerLoadout } from '@fishkal/game-core';
import { DEFAULT_LOADOUT } from '@fishkal/game-core';

export interface WalletView {
  credits: number;
  ledger: { delta: number; reason: string; refId: string | null; createdAt: string }[];
}

export interface UpgradeView {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  nextCost: number | null;
}

export interface MissionView {
  id: string;
  titleKey: string;
  descriptionKey: string;
  kind: string;
  target: number;
  progress: number;
  rewardCredits: number;
  claimable: boolean;
  claimed: boolean;
}

const db = () => import('@fishkal/database').then((m) => m.prisma);

// ---- In-memory fallback stores ---------------------------------------------

interface EconPlayer {
  credits: number;
  upgrades: Map<string, number>;
  loadout: PlayerLoadout;
  missions: Map<string, { progress: number; claimedAt: Date | null }>;
  ledger: { delta: number; reason: string; refId: string | null; createdAt: string }[];
  ledgerRefs: Set<string>;
}

export class EconomyStore {
  private mem = new Map<string, EconPlayer>();
  private dbAvailable: boolean;

  constructor(dbAvailable: boolean) {
    this.dbAvailable = dbAvailable;
  }

  setDbAvailable(v: boolean): void {
    this.dbAvailable = v;
  }

  private memPlayer(playerId: string): EconPlayer {
    let p = this.mem.get(playerId);
    if (!p) {
      p = {
        credits: 0,
        upgrades: new Map(),
        loadout: { ...DEFAULT_LOADOUT },
        missions: new Map(),
        ledger: [],
        ledgerRefs: new Set(),
      };
      this.mem.set(playerId, p);
    }
    return p;
  }

  // ---- Costing ----------------------------------------------------------------

  /** Cost of buying `level` (the level being purchased, 1-based). */
  static upgradeCost(upgradeId: string, level: number): number {
    const def = DEFAULT_GAME_CONFIG.upgrades.find((u) => u.id === upgradeId);
    if (!def) throw new Error(`unknown upgrade ${upgradeId}`);
    return Math.round(def.baseCost * Math.pow(def.costMultiplier, level - 1));
  }

  // ---- Loadout ----------------------------------------------------------------

  static loadoutFromLevels(u: { hookStrength: number; lineStrength: number; lineLength: number; reelSpeed: number; magnetRadius: number }): PlayerLoadout {
    return { ...u };
  }

  async getLoadout(playerId: string): Promise<PlayerLoadout> {
    if (this.dbAvailable) {
      try {
        const p = await db();
        const rows = await p.playerUpgrade.findMany({ where: { playerId } });
        const levels = { ...DEFAULT_LOADOUT };
        for (const r of rows) {
          if (r.upgradeId in levels) levels[r.upgradeId as keyof PlayerLoadout] = r.level;
        }
        return levels;
      } catch {
        this.dbAvailable = false;
      }
    }
    return { ...this.memPlayer(playerId).loadout };
  }

  // ---- Wallet -----------------------------------------------------------------

  async getWallet(playerId: string, currentCredits: number): Promise<WalletView> {
    if (this.dbAvailable) {
      try {
        const p = await db();
        const rows = await p.creditLedger.findMany({
          where: { playerId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        return {
          credits: currentCredits,
          ledger: rows.map((r) => ({
            delta: r.delta,
            reason: r.reason,
            refId: r.refId,
            createdAt: r.createdAt.toISOString(),
          })),
        };
      } catch {
        this.dbAvailable = false;
      }
    }
    const mem = this.memPlayer(playerId);
    return { credits: currentCredits, ledger: mem.ledger.slice(0, 20) };
  }

  /** Credit a ledger row. `refId` makes it idempotent (replay-safe, §59). */
  async credit(playerId: string, delta: number, reason: string, refId: string | null): Promise<boolean> {
    if (delta <= 0 || !Number.isInteger(delta)) return false;
    if (this.dbAvailable) {
      try {
        const p = await db();
        const dup = refId
          ? await p.creditLedger.findFirst({ where: { playerId, reason, refId } })
          : null;
        if (dup) return false;
        await p.$transaction(async (tx) => {
          await tx.creditLedger.create({ data: { playerId, delta, reason, refId } });
          await tx.player.update({ where: { id: playerId }, data: { credits: { increment: delta } } });
        });
        return true;
      } catch {
        this.dbAvailable = false;
      }
    }
    const mem = this.memPlayer(playerId);
    if (refId && mem.ledgerRefs.has(`${reason}:${refId}`)) return false;
    // Balance itself lives in the caller's player record (single source of truth);
    // the store owns the ledger + replay protection only.
    mem.ledger.unshift({ delta, reason, refId, createdAt: new Date().toISOString() });
    if (refId) mem.ledgerRefs.add(`${reason}:${refId}`);
    return true;
  }

  // ---- Upgrades ---------------------------------------------------------------

  async getUpgrades(playerId: string): Promise<UpgradeView[]> {
    const levels = await this.getLevels(playerId);
    return DEFAULT_GAME_CONFIG.upgrades.map((def) => {
      const level = levels[def.id as keyof PlayerLoadout] ?? 0;
      const nextCost = level < def.maxLevel ? EconomyStore.upgradeCost(def.id, level + 1) : null;
      return { id: def.id, name: def.name, description: def.description, level, maxLevel: def.maxLevel, nextCost };
    });
  }

  async getLevels(playerId: string): Promise<PlayerLoadout> {
    return this.getLoadout(playerId);
  }

  /**
   * Purchase the next level of an upgrade. Idempotent by refId.
   * Returns the balance DELTA — the caller owns the authoritative balance
   * (single writer; the split-brain bug this fixes is documented in BUILD_STATE).
   */
  async purchase(
    playerId: string,
    upgradeId: string,
    refId: string,
    currentCredits: number,
  ): Promise<
    | { ok: true; delta: number; level: number; loadout: PlayerLoadout }
    | { ok: false; code: 'UNKNOWN_UPGRADE' | 'MAX_LEVEL' | 'INSUFFICIENT_CREDITS' | 'DUPLICATE' }
  > {
    const def = DEFAULT_GAME_CONFIG.upgrades.find((u) => u.id === upgradeId);
    if (!def) return { ok: false, code: 'UNKNOWN_UPGRADE' };

    if (this.dbAvailable) {
      try {
        const p = await db();
        const dup = await p.creditLedger.findFirst({ where: { playerId, reason: 'upgrade_purchase', refId } });
        if (dup) return { ok: false, code: 'DUPLICATE' };
        const result = await p.$transaction(async (tx) => {
          const player = await tx.player.findUniqueOrThrow({ where: { id: playerId } });
          const row = await tx.playerUpgrade.upsert({
            where: { playerId_upgradeId: { playerId, upgradeId } },
            create: { playerId, upgradeId, level: 0 },
            update: {},
          });
          if (row.level >= def.maxLevel) return { ok: false as const, code: 'MAX_LEVEL' as const };
          const cost = EconomyStore.upgradeCost(upgradeId, row.level + 1);
          if (player.credits < cost) return { ok: false as const, code: 'INSUFFICIENT_CREDITS' as const };
          await tx.player.update({
            where: { id: playerId },
            data: { credits: { decrement: cost } },
          });
          await tx.playerUpgrade.update({
            where: { playerId_upgradeId: { playerId, upgradeId } },
            data: { level: { increment: 1 } },
          });
          await tx.creditLedger.create({
            data: { playerId, delta: -cost, reason: 'upgrade_purchase', refId },
          });
          return { ok: true as const, level: row.level + 1, delta: -cost };
        });
        if (!result.ok) return { ok: false, code: result.code };
        const loadout = await this.getLoadout(playerId);
        return { ok: true, delta: result.delta, level: result.level, loadout };
      } catch {
        this.dbAvailable = false;
      }
    }

    // Memory path — same guarantees.
    const mem = this.memPlayer(playerId);
    const refKey = `upgrade_purchase:${refId}`;
    if (mem.ledgerRefs.has(refKey)) return { ok: false, code: 'DUPLICATE' };
    const cur = mem.upgrades.get(upgradeId) ?? 0;
    if (cur >= def.maxLevel) return { ok: false, code: 'MAX_LEVEL' };
    const cost = EconomyStore.upgradeCost(upgradeId, cur + 1);
    // currentCredits (caller's authoritative balance) decides affordability.
    if (currentCredits < cost) return { ok: false, code: 'INSUFFICIENT_CREDITS' };
    mem.upgrades.set(upgradeId, cur + 1);
    applyUpgradeToLoadout(mem.loadout, upgradeId, cur + 1);
    mem.ledger.unshift({ delta: -cost, reason: 'upgrade_purchase', refId, createdAt: new Date().toISOString() });
    mem.ledgerRefs.add(refKey);
    return { ok: true, delta: -cost, level: cur + 1, loadout: { ...mem.loadout } };
  }

  // ---- Missions ---------------------------------------------------------------

  async getMissions(playerId: string): Promise<MissionView[]> {
    if (this.dbAvailable) {
      try {
        const p = await db();
        const defs = await p.missionDef.findMany({ where: { active: true } });
        const progress = await p.missionProgress.findMany({ where: { playerId } });
        const byId = new Map(progress.map((m) => [m.missionId, m]));
        return defs.map((d) => {
          const pr = byId.get(d.id);
          const prog = pr?.progress ?? 0;
          return {
            id: d.id,
            titleKey: d.titleKey,
            descriptionKey: d.descriptionKey,
            kind: d.kind,
            target: d.target,
            progress: prog,
            rewardCredits: d.rewardCredits,
            claimable: prog >= d.target && !pr?.claimedAt,
            claimed: !!pr?.claimedAt,
          };
        });
      } catch {
        this.dbAvailable = false;
      }
    }
    const mem = this.memPlayer(playerId);
    return DEFAULT_MISSIONS.map((d) => {
      const pr = mem.missions.get(d.id);
      const prog = pr?.progress ?? 0;
      return {
        id: d.id,
        titleKey: d.titleKey,
        descriptionKey: d.descriptionKey,
        kind: d.kind,
        target: d.target,
        progress: prog,
        rewardCredits: d.rewardCredits,
        claimable: prog >= d.target && !pr?.claimedAt,
        claimed: !!pr?.claimedAt,
      };
    });
  }

  /** Advance progress (max target) for all active missions of a kind. */
  async addMissionProgress(playerId: string, kind: string, amount: number): Promise<void> {
    if (this.dbAvailable) {
      try {
        const p = await db();
        const defs = await p.missionDef.findMany({ where: { active: true, kind } });
        for (const d of defs) {
          const row = await p.missionProgress.upsert({
            where: { playerId_missionId: { playerId, missionId: d.id } },
            create: { playerId, missionId: d.id, progress: Math.min(amount, d.target) },
            update: { progress: { increment: amount } },
          });
          if (row.progress > d.target) {
            await p.missionProgress.update({ where: { id: row.id }, data: { progress: d.target } });
          }
        }
        return;
      } catch {
        this.dbAvailable = false;
      }
    }
    const mem = this.memPlayer(playerId);
    for (const d of DEFAULT_MISSIONS.filter((m) => m.kind === kind)) {
      const cur = mem.missions.get(d.id) ?? { progress: 0, claimedAt: null };
      cur.progress = Math.min(d.target, cur.progress + amount);
      mem.missions.set(d.id, cur);
    }
  }

  /** Claim mission reward — pay-once guaranteed by claimedAt guard + ledger refId.
   * Returns the positive DELTA; the caller owns the authoritative balance. */
  async claimMission(
    playerId: string,
    missionId: string,
    currentCredits: number,
  ): Promise<{ ok: true; delta: number; reward: number } | { ok: false; code: 'UNKNOWN_MISSION' | 'NOT_COMPLETE' | 'ALREADY_CLAIMED' }> {
    const def =
      DEFAULT_MISSIONS.find((m) => m.id === missionId);
    if (!def) return { ok: false, code: 'UNKNOWN_MISSION' };

    if (this.dbAvailable) {
      try {
        const p = await db();
        const dbDef = await p.missionDef.findUnique({ where: { id: missionId } });
        if (!dbDef) return { ok: false, code: 'UNKNOWN_MISSION' };
        const result = await p.$transaction(async (tx) => {
          const row = await tx.missionProgress.upsert({
            where: { playerId_missionId: { playerId, missionId } },
            create: { playerId, missionId, progress: 0 },
            update: {},
          });
          if (row.claimedAt) return { ok: false as const, code: 'ALREADY_CLAIMED' as const };
          if (row.progress < dbDef.target) return { ok: false as const, code: 'NOT_COMPLETE' as const };
          await tx.missionProgress.update({ where: { id: row.id }, data: { claimedAt: new Date() } });
          await tx.creditLedger.create({
            data: { playerId, delta: dbDef.rewardCredits, reason: `mission:${missionId}`, refId: missionId },
          });
          return { ok: true as const, reward: dbDef.rewardCredits, delta: dbDef.rewardCredits };
        });
        if (!result.ok) return { ok: false, code: result.code };
        return { ok: true, delta: result.delta, reward: result.reward };
      } catch {
        this.dbAvailable = false;
      }
    }

    const mem = this.memPlayer(playerId);
    const pr = mem.missions.get(missionId) ?? { progress: 0, claimedAt: null };
    if (pr.claimedAt) return { ok: false, code: 'ALREADY_CLAIMED' };
    if (pr.progress < def.target) return { ok: false, code: 'NOT_COMPLETE' };
    pr.claimedAt = new Date();
    mem.missions.set(missionId, pr);
    mem.ledger.unshift({ delta: def.rewardCredits, reason: `mission:${missionId}`, refId: missionId, createdAt: new Date().toISOString() });
    mem.ledgerRefs.add(`mission:${missionId}`);
    return { ok: true, delta: def.rewardCredits, reward: def.rewardCredits };
  }

  // ---- Collection ---------------------------------------------------------------

  async getCollection(playerId: string): Promise<{ fishId: string; bestScore: number; bestDepth: number; caughtAt: string }[]> {
    if (this.dbAvailable) {
      try {
        const p = await db();
        const rows = await p.playerCollection.findMany({ where: { playerId } });
        return rows.map((r) => ({
          fishId: r.fishId,
          bestScore: r.bestScore,
          bestDepth: r.bestDepth,
          caughtAt: r.caughtAt.toISOString(),
        }));
      } catch {
        this.dbAvailable = false;
      }
    }
    return collectionMem.get(playerId) ?? [];
  }

  /** Record discovered species (§25 collection). Best score/depth kept per fish. */
  async recordCollection(playerId: string, catches: { fishId: string; depth: number }[], scoreByFish: Map<string, number>): Promise<void> {
    if (catches.length === 0) return;
    if (this.dbAvailable) {
      try {
        const p = await db();
        for (const c of catches) {
          const existing = await p.playerCollection.findUnique({
            where: { playerId_fishId: { playerId, fishId: c.fishId } },
          });
          const bestScore = Math.max(existing?.bestScore ?? 0, scoreByFish.get(c.fishId) ?? 0);
          const bestDepth = Math.max(existing?.bestDepth ?? 0, c.depth);
          await p.playerCollection.upsert({
            where: { playerId_fishId: { playerId, fishId: c.fishId } },
            create: { playerId, fishId: c.fishId, bestDepth, bestScore },
            update: { bestDepth, bestScore },
          });
        }
        return;
      } catch {
        this.dbAvailable = false;
      }
    }
    const list = collectionMem.get(playerId) ?? [];
    for (const c of catches) {
      const ex = list.find((e) => e.fishId === c.fishId);
      const score = scoreByFish.get(c.fishId) ?? 0;
      if (ex) {
        ex.bestScore = Math.max(ex.bestScore, score);
        ex.bestDepth = Math.max(ex.bestDepth, c.depth);
      } else {
        list.push({ fishId: c.fishId, bestScore: score, bestDepth: c.depth, caughtAt: new Date().toISOString() });
      }
    }
    collectionMem.set(playerId, list);
  }
}

// ---- Referrals (spec §52) ---------------------------------------------------

export interface ReferralInfo {
  referrerId: string | null;
  invited: { playerId: string; displayName: string | null; rewarded: boolean }[];
  rewardCredits: number;
  claimed: boolean;
  claimable: boolean;
}

export const REFERRAL_REWARD_CREDITS = 20;
const referralMem = new Map<string, { referrerId: string; rewarded: boolean }>();

export class ReferralStore {
  /** Idempotent: first referrer wins; self-referral rejected. */
  async attach(refereeId: string, referrerId: string): Promise<boolean> {
    if (refereeId === referrerId) return false;
    if (this.dbAvailable) {
      try {
        const p = await db();
        const created = await p.referral.createMany({
          data: [{ referrerId, refereeId }],
          skipDuplicates: true,
        });
        return created.count > 0;
      } catch {
        this.dbAvailable = false;
      }
    }
    if (referralMem.has(refereeId)) return false;
    referralMem.set(refereeId, { referrerId, rewarded: false });
    return true;
  }

  async info(refereeId: string): Promise<ReferralInfo> {
    if (this.dbAvailable) {
      try {
        const p = await db();
        const rows = await p.referral.findMany({ where: { referrerId: refereeId } });
        const names = await p.player.findMany({
          where: { id: { in: rows.map((r) => r.refereeId) } },
          select: { id: true, displayName: true },
        });
        const nameOf = new Map(names.map((n) => [n.id, n.displayName]));
        return {
          referrerId: null,
          invited: rows.map((r) => ({
            playerId: r.refereeId,
            displayName: nameOf.get(r.refereeId) ?? null,
            rewarded: r.rewarded,
          })),
          rewardCredits: REFERRAL_REWARD_CREDITS,
          claimed: rows.length > 0 && rows.every((r) => r.rewarded),
          claimable: rows.length > 0 && rows.some((r) => !r.rewarded),
        };
      } catch {
        this.dbAvailable = false;
      }
    }
    const invited = [...referralMem.entries()]
      .filter(([, v]) => v.referrerId === refereeId)
      .map(([k, v]) => ({ playerId: k, displayName: null, rewarded: v.rewarded }));
    return {
      referrerId: null,
      invited,
      rewardCredits: REFERRAL_REWARD_CREDITS,
      claimed: invited.length > 0 && invited.every((i) => i.rewarded),
      claimable: invited.length > 0 && invited.some((i) => !i.rewarded),
    };
  }

  /** Mark all un-rewarded invitees as rewarded; returns the total delta to apply. */
  async claim(refereeId: string): Promise<{ ok: true; reward: number } | { ok: false; code: 'NOTHING_TO_CLAIM' }> {
    if (this.dbAvailable) {
      try {
        const p = await db();
        const upd = await p.referral.updateMany({
          where: { referrerId: refereeId, rewarded: false },
          data: { rewarded: true },
        });
        if (upd.count === 0) return { ok: false, code: 'NOTHING_TO_CLAIM' };
        return { ok: true, reward: upd.count * REFERRAL_REWARD_CREDITS };
      } catch {
        this.dbAvailable = false;
      }
    }
    let count = 0;
    for (const v of referralMem.values()) {
      if (v.referrerId === refereeId && !v.rewarded) {
        v.rewarded = true;
        count += 1;
      }
    }
    if (count === 0) return { ok: false, code: 'NOTHING_TO_CLAIM' };
    return { ok: true, reward: count * REFERRAL_REWARD_CREDITS };
  }

  setDbAvailable(v: boolean): void {
    this.dbAvailable = v;
  }

  constructor(private dbAvailable: boolean) {}
}

// ---- In-memory collection store (used when DB is down) ------------------------

interface CollectionEntry {
  fishId: string;
  bestScore: number;
  bestDepth: number;
  caughtAt: string;
}
const collectionMem = new Map<string, CollectionEntry[]>();

// ---- Loadout helper -----------------------------------------------------------

function applyUpgradeToLoadout(loadout: PlayerLoadout, upgradeId: string, level: number): void {
  switch (upgradeId) {
    case 'hook_strength':
      loadout.hookStrength = level;
      break;
    case 'line_strength':
      loadout.lineStrength = level;
      break;
    case 'line_length':
      loadout.lineLength = level;
      break;
    case 'reel_speed':
      loadout.reelSpeed = level;
      break;
    case 'magnet_radius':
      loadout.magnetRadius = level;
      break;
  }
}

// ---- Default missions (admin/DB can override later, §44) ------------------------

export const DEFAULT_MISSIONS = [
  { id: 'first_catch', titleKey: 'missions.first.title', descriptionKey: 'missions.first.desc', kind: 'catches', target: 1, rewardCredits: 10 },
  { id: 'ten_catches', titleKey: 'missions.ten.title', descriptionKey: 'missions.ten.desc', kind: 'catches', target: 10, rewardCredits: 30 },
  { id: 'deep_200', titleKey: 'missions.depth.title', descriptionKey: 'missions.depth.desc', kind: 'depth', target: 200, rewardCredits: 40 },
  { id: 'score_500', titleKey: 'missions.score.title', descriptionKey: 'missions.score.desc', kind: 'score', target: 500, rewardCredits: 50 },
] as const;
