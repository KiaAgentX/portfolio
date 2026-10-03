/**
 * Analytics ingestion + funnels (spec §30, §61, roadmap 5).
 * Clients POST named events with scalar props; the API persists them to
 * AnalyticsEvent (memory fallback mirrors every write) and ops compute
 * funnels/dashboards from GET /analytics/funnels.
 * Event names are whitelisted to keep the table queryable and PII-free.
 */
import { randomUUID } from 'node:crypto';

const db = () => import('@fishkal/database').then((m) => m.prisma);

export const ANALYTICS_EVENTS = [
  'session_start',
  'dive_start',
  'dive_end',
  'fish_caught',
  'shop_open',
  'upgrade_purchased',
  'mission_claimed',
  'referral_claimed',
  'results_view',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

interface MemEvent {
  id: string;
  name: string;
  playerId: string | null;
  props: Record<string, unknown> | null;
  createdAt: Date;
}

const memEvents: MemEvent[] = [];
let useDb = false;

export function setAnalyticsDbAvailable(v: boolean): void {
  useDb = v;
}

export async function trackEvent(
  name: string,
  playerId: string | null,
  props: Record<string, unknown> | undefined,
): Promise<void> {
  if (!(ANALYTICS_EVENTS as readonly string[]).includes(name)) {
    throw new Error(`unknown event: ${name}`);
  }
  // PII guard: only scalar props, no long strings.
  const clean: Record<string, unknown> | undefined = props
    ? Object.fromEntries(
        Object.entries(props)
          .filter(([, v]) => ['number', 'boolean', 'string'].includes(typeof v) && !(typeof v === 'string' && v.length > 64))
          .slice(0, 12),
      )
    : undefined;
  if (useDb) {
    try {
      const p = await db();
      await p.analyticsEvent.create({ data: { name, playerId, propsJson: (clean ?? undefined) as object | undefined } });
      return;
    } catch {
      useDb = false;
    }
  }
  memEvents.push({ id: randomUUID(), name, playerId, props: clean ?? null, createdAt: new Date() });
  if (memEvents.length > 10_000) memEvents.shift();
}

export interface FunnelResult {
  funnel: string[];
  counts: number[];
  conversion: number;
}

/** Compute a funnel over recent events (steps must be a subset of ANALYTICS_EVENTS). */
export async function funnel(steps: string[], windowHours = 24): Promise<FunnelResult> {
  const since = new Date(Date.now() - windowHours * 3600_000);
  let rows: { name: string; playerId: string | null }[];
  if (useDb) {
    try {
      const p = await db();
      rows = await p.analyticsEvent.findMany({
        where: { createdAt: { gte: since }, name: { in: steps } },
        select: { name: true, playerId: true },
      });
    } catch {
      useDb = false;
      rows = memEvents.filter((e) => e.createdAt >= since && steps.includes(e.name));
    }
  } else {
    rows = memEvents.filter((e) => e.createdAt >= since && steps.includes(e.name));
  }

  const counts = steps.map(
    (s) => new Set(rows.filter((r) => r.name === s).map((r) => r.playerId ?? 'anon')).size,
  );
  const first = counts[0] ?? 0;
  const last = counts[counts.length - 1] ?? 0;
  return { funnel: steps, counts, conversion: first > 0 ? last / first : 0 };
}

export async function eventsLast24h(): Promise<{ name: string; count: number }[]> {
  const since = new Date(Date.now() - 86400_000);
  if (useDb) {
    try {
      const p = await db();
      const rows = await p.analyticsEvent.groupBy({
        by: ['name'],
        where: { createdAt: { gte: since } },
        _count: { name: true },
      });
      return rows.map((r) => ({ name: r.name, count: r._count.name }));
    } catch {
      useDb = false;
    }
  }
  const counts = new Map<string, number>();
  for (const e of memEvents) {
    if (e.createdAt >= since) counts.set(e.name, (counts.get(e.name) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}
