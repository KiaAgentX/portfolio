/**
 * DB-backed game-config overrides (roadmap 4c).
 * Scalar dotted-path overrides applied over DEFAULT_GAME_CONFIG — ops can
 * retune the live game without a redeploy (spec §29). Falls back to an
 * in-memory map when Postgres is unreachable; the active config is rebuilt
 * after every change so scoring and clients converge on one truth.
 */
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';
import type { GameConfig } from '@fishkal/config';

export interface ConfigOverrideEntry {
  path: string;
  value: unknown;
  updatedBy: string | null;
  updatedAt: string;
}

const overridesMem = new Map<string, ConfigOverrideEntry>();
let useDb = false;

export function setOverridesDbAvailable(v: boolean): void {
  useDb = v;
}

const db = () => import('@fishkal/database').then((m) => m.prisma);

/** Set one scalar override; DB-backed when available, memory otherwise. */
export async function setConfigOverride(path: string, value: unknown, updatedBy: string | null = 'admin'): Promise<ConfigOverrideEntry> {
  const entry: ConfigOverrideEntry = { path, value, updatedBy, updatedAt: new Date().toISOString() };
  if (useDb) {
    try {
      const p = await db();
      await p.gameConfigEntry.upsert({
        where: { key: path },
        create: { key: path, valueJson: value as object },
        update: { valueJson: value as object },
      });
    } catch {
      useDb = false;
    }
  }
  overridesMem.set(path, entry);
  return entry;
}

export async function getConfigOverrides(): Promise<ConfigOverrideEntry[]> {
  if (useDb) {
    try {
      const p = await db();
      const rows = await p.gameConfigEntry.findMany({ orderBy: { key: 'asc' } });
      return rows.map((r) => ({ path: r.key, value: r.valueJson, updatedBy: null, updatedAt: r.updatedAt.toISOString() }));
    } catch {
      useDb = false;
    }
  }
  return [...overridesMem.values()];
}

/** Load persisted overrides from DB into the memory map (boot). */
export async function loadConfigOverrides(): Promise<void> {
  if (!useDb) return;
  try {
    const p = await db();
    const rows = await p.gameConfigEntry.findMany();
    for (const r of rows) {
      overridesMem.set(r.key, { path: r.key, value: r.valueJson, updatedBy: null, updatedAt: r.updatedAt.toISOString() });
    }
  } catch {
    useDb = false;
  }
}

/** Apply all scalar overrides over a config copy; unknown paths are ignored. */
export function applyOverrides(base: GameConfig = DEFAULT_GAME_CONFIG): GameConfig {
  const out: GameConfig = structuredClone(base);
  for (const { path, value } of overridesMem.values()) {
    const parts = path.split('.');
    if (parts.length === 0) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = out;
    let ok = true;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (seg !== undefined && node && typeof node === 'object' && seg in node) {
        node = node[seg];
      } else {
        ok = false;
        break;
      }
    }
    const last = parts[parts.length - 1];
    if (ok && last !== undefined && node && typeof node === 'object' && last in node) {
      // Never let an override change a value's type.
      if (typeof node[last] === typeof value) node[last] = value;
    }
  }
  return out;
}

/** The live config used for scoring and served to clients. */
export function activeConfig(): GameConfig {
  return applyOverrides();
}
