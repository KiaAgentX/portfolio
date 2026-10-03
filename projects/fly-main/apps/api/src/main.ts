/**
 * FISHKAL API (Phase 1) — spec §63–64.
 * Auth: Telegram initData (§35) or guest sessions in dev.
 * Runs: server-authoritative scoring (§58–60).
 * Persistence: Postgres via Prisma when reachable; in-memory fallback so the
 * game is playable before `docker compose up` — clearly logged in both modes.
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createHmac, randomUUID } from 'node:crypto';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';
import { gameRunSubmitSchema, telegramAuthSchema } from '@fishkal/validation';
import type { FishSpeciesDef, GameRunSubmit } from '@fishkal/shared';
import { scoreRun, computeRarest } from './runs.js';
import { verifyInitData } from './telegram.js';
import { EconomyStore, ReferralStore, DEFAULT_MISSIONS } from './economy.js';
import { adminRoutes } from './admin.js';
import { setAdminDbAvailable } from './admin-state.js';
import { setOverridesDbAvailable, loadConfigOverrides, activeConfig } from './config-overrides.js';
import { trackEvent, funnel, eventsLast24h, ANALYTICS_EVENTS, setAnalyticsDbAvailable } from './analytics.js';
import { listProducts, createOrder, listOrders, setCommerceDbAvailable } from './commerce.js';

const PORT = Number(process.env.API_PORT ?? 4000);
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'dev_session_secret';

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: process.env.WEBSITE_ORIGIN?.split(',') ?? true });
await fastify.register(helmet);
await fastify.register(rateLimit, {
  global: true,
  max: Number(process.env.RATE_LIMIT_MAX ?? 120),
  timeWindow: '1 minute',
});

// ---- Session store (Redis in later phase; map is fine for Phase 1) ----------
interface Session {
  token: string;
  playerId: string;
  displayName: string | null;
}
const sessions = new Map<string, Session>();

function signToken(playerId: string): string {
  const payload = `${playerId}.${Date.now()}`;
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

function readToken(token: string): string | null {
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  const payload = Buffer.from(b64, 'base64url').toString();
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return expected === sig ? payload.split('.')[0] ?? null : null;
}

// ---- Player store: Prisma when reachable, memory otherwise ------------------
interface PlayerRecord {
  id: string;
  displayName: string | null;
  credits: number;
  level: number;
  totalScore: number;
  deepestDepth: number;
  largestFish: string | null;
}
const memoryPlayers = new Map<string, PlayerRecord>();
const memoryRuns: {
  id: string;
  playerId: string;
  score: number;
  maxDepth: number;
  durationMs: number;
  createdAt: Date;
}[] = [];
let dbAvailable = false;

async function tryDb(): Promise<boolean> {
  try {
    const { prisma } = await import('@fishkal/database');
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
    return true;
  } catch {
    dbAvailable = false;
    return false;
  }
}

const db = () => import('@fishkal/database').then((m) => m.prisma);

async function upsertPlayer(displayName: string | null, telegramId?: string): Promise<PlayerRecord> {
  if (dbAvailable) {
    try {
      const p = await db();
      const user = await p.user.create({
        data: {
          ...(telegramId
            ? { telegram: { create: { telegramId, displayName } } }
            : {}),
          player: { create: { displayName } },
        },
        include: { player: true },
      });
      const player = user.player;
      if (!player) throw new Error('player not created');
      return {
        id: player.id,
        displayName: player.displayName,
        credits: player.credits,
        level: player.level,
        totalScore: player.totalScore,
        deepestDepth: player.deepestDepth,
        largestFish: player.largestFish,
      };
    } catch (err) {
      fastify.log.warn({ err }, 'DB player create failed; using memory store');
      dbAvailable = false;
    }
  }
  const rec: PlayerRecord = {
    id: randomUUID(),
    displayName,
    credits: 0,
    level: 1,
    totalScore: 0,
    deepestDepth: 0,
    largestFish: null,
  };
  memoryPlayers.set(rec.id, rec);
  return rec;
}

async function getPlayer(playerId: string): Promise<PlayerRecord | null> {
  if (dbAvailable) {
    try {
      const p = await db();
      const player = await p.player.findUnique({ where: { id: playerId } });
      if (!player) return null;
      return {
        id: player.id,
        displayName: player.displayName,
        credits: player.credits,
        level: player.level,
        totalScore: player.totalScore,
        deepestDepth: player.deepestDepth,
        largestFish: player.largestFish,
      };
    } catch {
      dbAvailable = false;
    }
  }
  return memoryPlayers.get(playerId) ?? null;
}

async function commitRun(
  playerId: string,
  score: number,
  credits: number,
  maxDepth: number,
  durationMs: number,
  catches: GameRunSubmit['catches'],
  flags: string[],
  largestFishId: string | null,
): Promise<boolean> {
  if (dbAvailable) {
    try {
      const p = await db();
      await p.$transaction(async (tx) => {
        const player = await tx.player.findUniqueOrThrow({ where: { id: playerId } });
        await tx.gameRun.create({
          data: {
            playerId,
            score,
            credits,
            maxDepth,
            maxCombo: 0,
            durationMs,
            flags,
            catches: { create: catches.map((c) => ({ fishId: c.fishId, depth: c.depth, atMs: c.atMs })) },
          },
        });
        const configFish = DEFAULT_GAME_CONFIG.fish;
        const curLargest = player.largestFish ? configFish.find((f: FishSpeciesDef) => f.id === player.largestFish) : undefined;
        const nextLargest = largestFishId ? configFish.find((f: FishSpeciesDef) => f.id === largestFishId) : undefined;
        await tx.player.update({
          where: { id: playerId },
          data: {
            totalScore: { increment: score },
            credits: { increment: credits },
            deepestDepth: { set: Math.max(player.deepestDepth, maxDepth) },
            largestFish:
              nextLargest && (!curLargest || nextLargest.weight > curLargest.weight)
                ? { set: nextLargest.id }
                : undefined,
          },
        });
      });
      return true;
    } catch (err) {
      fastify.log.warn({ err }, 'DB commitRun failed; falling back to memory');
      dbAvailable = false;
    }
  }
  const rec = memoryPlayers.get(playerId);
  if (rec) {
    rec.totalScore += score;
    rec.credits += credits;
    rec.deepestDepth = Math.max(rec.deepestDepth, maxDepth);
    // largestFish is a record: only a heavier catch replaces it.
    if (largestFishId) {
      const cur = rec.largestFish ? DEFAULT_GAME_CONFIG.fish.find((f: FishSpeciesDef) => f.id === rec.largestFish) : undefined;
      const next = DEFAULT_GAME_CONFIG.fish.find((f: FishSpeciesDef) => f.id === largestFishId);
      if (next && (!cur || next.weight > cur.weight)) rec.largestFish = largestFishId;
    }
  }
  memoryRuns.push({ id: randomUUID(), playerId, score, maxDepth, durationMs, createdAt: new Date() });
  return false;
}

// ---- Routes -----------------------------------------------------------------

fastify.get('/health', async () => ({ ok: true, db: dbAvailable, stage: 'phase-1' }));

fastify.get('/game/config', async () => activeConfig());

fastify.post('/auth/guest', async (req) => {
  const body = (req.body ?? {}) as { displayName?: string; referredBy?: string };
  const player = await upsertPlayer(body.displayName?.slice(0, 40) ?? null);
  if (body.referredBy) await attachReferral(player.id, body.referredBy);
  const token = signToken(player.id);
  sessions.set(token, { token, playerId: player.id, displayName: player.displayName });
  return { token, profile: player };
});

fastify.post('/auth/telegram', async (req, reply) => {
  const parsed = telegramAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'initData required' });
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return reply.code(503).send({
      code: 'EXTERNAL_SERVICE_ERROR',
      message: 'Telegram bot token not configured; use guest auth in development.',
    });
  }
  const user = verifyInitData(parsed.data.initData, botToken);
  if (!user) {
    return reply.code(401).send({ code: 'AUTH_ERROR', message: 'Invalid Telegram initData' });
  }
  // Referral deep link: Telegram passes `ref_<playerId>` from a startapp payload.
  const startParam = user.start_param ?? null;
  const refMatch = /^ref_([A-Za-z0-9-]{6,64})$/.exec(startParam ?? '');
  const player = await upsertPlayer(user.first_name ?? user.username ?? null, String(user.id));
  if (refMatch?.[1]) await attachReferral(player.id, refMatch[1]);
  const token = signToken(player.id);
  sessions.set(token, { token, playerId: player.id, displayName: player.displayName });
  return { token, profile: player };
});

fastify.addHook('onRequest', async (req, reply) => {
  const url = req.routeOptions.url ?? '';
  const publicRoutes = new Set(['/auth/telegram', '/auth/guest', '/health', '/game/config', '/leaderboard']);
  // Admin routes authenticate with ADMIN_TOKEN inside admin.ts — skip player auth.
  if (publicRoutes.has(url) || url.startsWith('/admin')) {
    return;
  }
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.code(401).send({ code: 'AUTH_ERROR', message: 'Missing bearer token' });
  }
  const playerId = readToken(header.slice(7));
  if (!playerId) {
    return reply.code(401).send({ code: 'AUTH_ERROR', message: 'Invalid session token' });
  }
  (req as unknown as { playerId: string }).playerId = playerId;
});

fastify.post('/game/runs', async (req, reply) => {
  const playerId = (req as unknown as { playerId?: string }).playerId;
  if (!playerId) return reply.code(401).send({ code: 'AUTH_ERROR', message: 'Unauthorized' });

  const parsed = gameRunSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({
      code: 'VALIDATION_ERROR',
      message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    });
  }

  const { result } = scoreRun(parsed.data, activeConfig());
  const player = await getPlayer(playerId);
  if (!player) return reply.code(404).send({ code: 'NOT_FOUND', message: 'Player missing' });

  const previousBest = player.totalScore;
  const record = result.score > previousBest;
  // Largest valid catch: heaviest species in this run's valid catches (§26).
  const validCatches = result.flags.length === 0 ? parsed.data.catches : [];
  const cfgForRecords = activeConfig();
  const largestFishId = validCatches.reduce<string | null>((best, c) => {
    const sp = cfgForRecords.fish.find((f: FishSpeciesDef) => f.id === c.fishId);
    const bestSp = best ? cfgForRecords.fish.find((f: FishSpeciesDef) => f.id === best) : undefined;
    return sp && (!bestSp || sp.weight > bestSp.weight) ? sp.id : best;
  }, null);
  await commitRun(
    playerId,
    result.score,
    result.credits,
    result.flags.length === 0 ? parsed.data.maxDepth : 0,
    parsed.data.durationMs,
    validCatches,
    result.flags,
    largestFishId,
  );

  // Mission + collection progress (roadmap 3.2). Only valid catches count.
  if (result.flags.length === 0) {
    const cfg = activeConfig();
    const scoreByFish = new Map<string, number>();
    for (const c of validCatches) {
      const sp = cfg.fish.find((f: FishSpeciesDef) => f.id === c.fishId);
      scoreByFish.set(c.fishId, Math.max(scoreByFish.get(c.fishId) ?? 0, sp?.score ?? 0));
    }
    if (validCatches.length > 0) await economy.addMissionProgress(playerId, 'catches', validCatches.length);
    await economy.addMissionProgress(playerId, 'depth', Math.floor(parsed.data.maxDepth));
    await economy.addMissionProgress(playerId, 'score', result.score);
    await economy.recordCollection(playerId, validCatches, scoreByFish);
  }

  return {
    runId: randomUUID(),
    score: result.score,
    credits: result.credits,
    maxCombo: result.maxCombo,
    flags: result.flags,
    record,
    rarest: computeRarest(parsed.data.catches),
  };
});

fastify.get('/players/me', async (req, reply) => {
  const playerId = (req as unknown as { playerId?: string }).playerId;
  if (!playerId) return reply.code(401).send({ code: 'AUTH_ERROR', message: 'Unauthorized' });
  const player = await getPlayer(playerId);
  if (!player) return reply.code(404).send({ code: 'NOT_FOUND', message: 'Player missing' });
  return player;
});

fastify.get('/leaderboard', async (req) => {
  const query = req.query as { board?: string; limit?: string };
  const limit = Math.min(Number(query.limit ?? 20), 100);
  if (dbAvailable) {
    try {
      const p = await db();
      const rows = await p.player.findMany({
        orderBy: { totalScore: 'desc' },
        take: limit,
        select: { id: true, displayName: true, totalScore: true },
      });
      return rows.map((r, i) => ({
        playerId: r.id,
        displayName: r.displayName,
        score: r.totalScore,
        rank: i + 1,
      }));
    } catch {
      dbAvailable = false;
    }
  }
  return Array.from(memoryPlayers.values())
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
    .map((p, i) => ({ playerId: p.id, displayName: p.displayName, score: p.totalScore, rank: i + 1 }));
});

// ---- Economy (roadmap 3.1/3.2) ----------------------------------------------

const economy = new EconomyStore(dbAvailable);
const referrals = new ReferralStore(dbAvailable);

/** Attach `refereeId` under `referrerId` (idempotent, self-referral-safe). */
async function attachReferral(refereeId: string, referrerId: string): Promise<void> {
  const ok = await referrals.attach(refereeId, referrerId);
  if (ok) fastify.log.info({ refereeId, referrerId }, 'referral attached');
}

fastify.get('/economy/wallet', async (req) => {
  const playerId = reqPlayerId(req);
  const player = await getPlayer(playerId);
  if (!player) throw new Error('player missing');
  return economy.getWallet(playerId, player.credits);
});

fastify.get('/upgrades', async (req) => {
  const playerId = reqPlayerId(req);
  return economy.getUpgrades(playerId);
});

fastify.post('/upgrades/purchase', async (req, reply) => {
  const playerId = reqPlayerId(req);
  const body = (req.body ?? {}) as { upgradeId?: string; refId?: string };
  if (!body.upgradeId || !body.refId) {
    return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'upgradeId and refId required' });
  }
  const player = await getPlayer(playerId);
  if (!player) return reply.code(404).send({ code: 'NOT_FOUND', message: 'Player missing' });
  const result = await economy.purchase(playerId, body.upgradeId, body.refId, player.credits);
  if (!result.ok) {
    const status = result.code === 'UNKNOWN_UPGRADE' ? 404 : result.code === 'DUPLICATE' ? 409 : 400;
    return reply.code(status).send({ code: result.code, message: result.code });
  }
  await applyCredits(playerId, result.delta);
  const updated = await getPlayer(playerId);
  return { ok: true, credits: updated?.credits ?? player.credits + result.delta, level: result.level, loadout: result.loadout };
});

fastify.get('/players/me/loadout', async (req) => {
  const playerId = reqPlayerId(req);
  return economy.getLoadout(playerId);
});

fastify.get('/missions', async (req) => {
  const playerId = reqPlayerId(req);
  return economy.getMissions(playerId);
});

fastify.post('/missions/claim', async (req, reply) => {
  const playerId = reqPlayerId(req);
  const body = (req.body ?? {}) as { missionId?: string };
  if (!body.missionId) {
    return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'missionId required' });
  }
  const player = await getPlayer(playerId);
  if (!player) return reply.code(404).send({ code: 'NOT_FOUND', message: 'Player missing' });
  const result = await economy.claimMission(playerId, body.missionId, player.credits);
  if (!result.ok) {
    const status = result.code === 'UNKNOWN_MISSION' ? 404 : result.code === 'ALREADY_CLAIMED' ? 409 : 400;
    return reply.code(status).send({ code: result.code, message: result.code });
  }
  await applyCredits(playerId, result.delta);
  const updated = await getPlayer(playerId);
  return { ok: true, credits: updated?.credits ?? player.credits + result.delta, reward: result.reward };
});

// ---- Analytics (spec §30, roadmap 5) ----------------------------------------

fastify.post('/analytics/events', async (req, reply) => {
  const playerId = reqPlayerId(req);
  const body = (req.body ?? {}) as { name?: string; props?: Record<string, unknown> };
  if (!body.name || !(ANALYTICS_EVENTS as readonly string[]).includes(body.name)) {
    return reply.code(400).send({ code: 'VALIDATION_ERROR', message: `name must be one of: ${ANALYTICS_EVENTS.join(', ')}` });
  }
  try {
    await trackEvent(body.name, playerId, body.props);
  } catch {
    return reply.code(500).send({ code: 'INTERNAL_ERROR', message: 'event not recorded' });
  }
  return { ok: true };
});

fastify.get('/analytics/funnels', async (req) => {
  const query = req.query as { steps?: string; windowHours?: string };
  const steps = (query.steps ?? 'session_start,dive_start,dive_end,results_view')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => (ANALYTICS_EVENTS as readonly string[]).includes(s));
  const windowHours = Math.min(Math.max(Number(query.windowHours ?? 24), 1), 168);
  if (steps.length < 2) {
    return { funnel: steps, counts: steps.map(() => 0), conversion: 0 };
  }
  return funnel(steps, windowHours);
});

fastify.get('/analytics/summary', async () => ({ events24h: await eventsLast24h() }));

// ---- Commerce (spec §33) — data-gated, 503 until the business adds products ---

fastify.get('/shop/products', async (req, reply) => {
  const { available, products } = await listProducts();
  if (!available) {
    return reply.code(503).send({ code: 'EXTERNAL_SERVICE_ERROR', message: 'Catalog not configured yet' });
  }
  return { products };
});

fastify.post('/shop/orders', async (req, reply) => {
  const playerId = reqPlayerId(req);
  const body = (req.body ?? {}) as { productId?: string; quantity?: number; contact?: string };
  if (!body.productId || !Number.isInteger(body.quantity) || (body.quantity ?? 0) < 1 || (body.quantity ?? 0) > 10) {
    return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'productId and quantity (1–10) required' });
  }
  const result = await createOrder(playerId, body.productId, body.quantity ?? 1, body.contact?.slice(0, 120) ?? null);
  if (!result.ok) {
    const status = result.code === 'CATALOG_EMPTY' ? 503 : result.code === 'UNKNOWN_PRODUCT' ? 404 : 409;
    return reply.code(status).send({ code: result.code, message: result.code });
  }
  return result;
});

fastify.get('/shop/orders', async (req) => {
  const playerId = reqPlayerId(req);
  return listOrders(playerId);
});

fastify.get('/collection', async (req) => {
  const playerId = reqPlayerId(req);
  return economy.getCollection(playerId);
});

// ---- Referrals (spec §52) ----------------------------------------------------

fastify.get('/referrals/me', async (req) => {
  const playerId = reqPlayerId(req);
  return referrals.info(playerId);
});

fastify.post('/referrals/attach', async (req, reply) => {
  const playerId = reqPlayerId(req);
  const body = (req.body ?? {}) as { referrerId?: string };
  if (!body.referrerId) {
    return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'referrerId required' });
  }
  const ok = await referrals.attach(playerId, body.referrerId);
  if (!ok) return reply.code(409).send({ code: 'CONFLICT', message: 'Referral not attachable' });
  return { ok: true };
});

fastify.post('/referrals/claim', async (req, reply) => {
  const playerId = reqPlayerId(req);
  const result = await referrals.claim(playerId);
  if (!result.ok) {
    return reply.code(409).send({ code: 'CONFLICT', message: 'Nothing to claim' });
  }
  await applyCredits(playerId, result.reward);
  const updated = await getPlayer(playerId);
  return { ok: true, credits: updated?.credits ?? result.reward, reward: result.reward };
});

function reqPlayerId(req: unknown): string {
  return (req as unknown as { playerId: string }).playerId;
}

/** Single writer for balance changes outside run commits (economy deltas). */
async function applyCredits(playerId: string, delta: number): Promise<void> {
  if (dbAvailable) {
    try {
      const p = await db();
      await p.player.update({ where: { id: playerId }, data: { credits: { increment: delta } } });
      return;
    } catch {
      dbAvailable = false;
    }
  }
  const rec = memoryPlayers.get(playerId);
  if (rec) rec.credits = Math.max(0, rec.credits + delta);
}

// ---- Admin (spec §29, roadmap 4b) -------------------------------------------

await fastify.register(adminRoutes, { memoryPlayers, memoryRuns });

// ---- Boot -------------------------------------------------------------------

const started = await tryDb();
economy.setDbAvailable(started);
referrals.setDbAvailable(started);
setAdminDbAvailable(started);
setOverridesDbAvailable(started);
setAnalyticsDbAvailable(started);
setCommerceDbAvailable(started);
if (started) await loadConfigOverrides();
fastify.log.info(
  started
    ? 'Postgres reachable — runs persist to database.'
    : 'Postgres not reachable — using in-memory store. Run `docker compose up -d` + `pnpm db:migrate` for persistence.',
);
fastify.log.info(`Admin surface: ${process.env.ADMIN_TOKEN ? 'enabled (ADMIN_TOKEN set)' : 'disabled (no ADMIN_TOKEN)'}.`);

await fastify.listen({ port: PORT, host: '0.0.0.0' });
