/**
 * Admin surface (spec §29, roadmap 4b) — token-gated, ops-only.
 * GET  /admin/stats  → aggregate KPIs (players, runs, DAU, top fish, events)
 * PUT  /admin/config → DB-backed game-config override (single path=value per call)
 *
 * ADMIN_TOKEN is read once at boot; when unset the routes answer 503 so the
 * surface is closed by default in every environment.
 */
import type { FastifyInstance } from 'fastify';
import { setAdminDbAvailable, adminDbAvailable } from './admin-state.js';

const db = () => import('@fishkal/database').then((m) => m.prisma);

interface AdminStats {
  db: boolean;
  players: number;
  runs: number;
  referralsRewarded: number;
  dailyActive: { day: string; players: number; runs: number }[];
  topFish: { fishId: string; catches: number }[];
  events24h: { name: string; count: number }[];
}

export function adminRoutes(
  fastify: FastifyInstance,
  opts: {
    memoryPlayers: Map<string, { id: string; totalScore: number; displayName: string | null }>;
    memoryRuns: { playerId: string; createdAt: Date }[];
  },
): void {
  fastify.addHook('onRequest', async (req, reply) => {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) {
      return reply.code(503).send({ code: 'EXTERNAL_SERVICE_ERROR', message: 'ADMIN_TOKEN not configured' });
    }
    const header = req.headers.authorization;
    const provided = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!provided || provided !== expected) {
      return reply.code(401).send({ code: 'AUTH_ERROR', message: 'Invalid admin token' });
    }
  });

  fastify.get('/admin/stats', async (): Promise<AdminStats> => {
    if (adminDbAvailable()) {
      const p = await db();
      const since = new Date(Date.now() - 7 * 86400_000);
      const [players, runs, referrals, runWindows, catchRows, eventRows] = await Promise.all([
        p.player.count(),
        p.gameRun.count(),
        p.referral.count({ where: { rewarded: true } }),
        p.gameRun.findMany({ where: { createdAt: { gte: since } }, select: { playerId: true, createdAt: true } }),
        p.gameRun.findMany({
          where: { createdAt: { gte: since } },
          select: { catches: { select: { fishId: true } } },
        }),
        p.analyticsEvent.groupBy({
          by: ['name'],
          where: { createdAt: { gte: new Date(Date.now() - 86400_000) } },
          _count: { name: true },
        }),
      ]);

      const byDay = new Map<string, { players: Set<string>; runs: number }>();
      for (let d = 6; d >= 0; d--) {
        const day = new Date(Date.now() - d * 86400_000).toISOString().slice(0, 10);
        byDay.set(day, { players: new Set(), runs: 0 });
      }
      for (const r of runWindows) {
        const key = r.createdAt.toISOString().slice(0, 10);
        const slot = byDay.get(key);
        if (slot) {
          slot.players.add(r.playerId);
          slot.runs += 1;
        }
      }

      const fishCount = new Map<string, number>();
      for (const row of catchRows) {
        for (const c of row.catches) fishCount.set(c.fishId, (fishCount.get(c.fishId) ?? 0) + 1);
      }

      return {
        db: true,
        players,
        runs,
        referralsRewarded: referrals,
        dailyActive: [...byDay.entries()].map(([day, v]) => ({ day, players: v.players.size, runs: v.runs })),
        topFish: [...fishCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([fishId, catches]) => ({ fishId, catches })),
        events24h: eventRows.map((e) => ({ name: e.name, count: e._count.name })),
      };
    }

    // In-memory fallback mirrors main.ts stores.
    const byDay = new Map<string, { players: Set<string>; runs: number }>();
    for (let d = 6; d >= 0; d--) {
      const day = new Date(Date.now() - d * 86400_000).toISOString().slice(0, 10);
      byDay.set(day, { players: new Set(), runs: 0 });
    }
    for (const r of opts.memoryRuns) {
      const key = r.createdAt.toISOString().slice(0, 10);
      const slot = byDay.get(key);
      if (slot) {
        slot.players.add(r.playerId);
        slot.runs += 1;
      }
    }
    return {
      db: false,
      players: opts.memoryPlayers.size,
      runs: opts.memoryRuns.length,
      referralsRewarded: 0,
      dailyActive: [...byDay.entries()].map(([day, v]) => ({ day, players: v.players.size, runs: v.runs })),
      topFish: [],
      events24h: [],
    };
  });

  fastify.put('/admin/config', async (req, reply) => {
    const body = (req.body ?? {}) as { path?: string; value?: unknown };
    if (!body.path || body.path.length > 64 || !/^[\w.]+$/.test(body.path)) {
      return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'path must be a dotted config path (e.g. engine.hookMoveSpeed)' });
    }
    if (body.value === undefined || body.value === null || typeof body.value === 'object') {
      return reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'value must be a scalar' });
    }
    const { setConfigOverride } = await import('./config-overrides.js');
    await setConfigOverride(body.path, body.value);
    fastify.log.info({ path: body.path, value: body.value }, 'config override set');
    return { ok: true, overrides: await listOverrides() };
  });

  fastify.get('/admin/config', async () => ({ overrides: await listOverrides() }));

  async function listOverrides() {
    const { getConfigOverrides } = await import('./config-overrides.js');
    return getConfigOverrides();
  }
}
