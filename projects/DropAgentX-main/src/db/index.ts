import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function getPool(): Pool {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  globalForDb.__arenaNextJsPostgresqlPool ??= new Pool({
    connectionString: databaseUrl,
  });
  return globalForDb.__arenaNextJsPostgresqlPool;
}

// Lazily-initialized client: importing this module must never throw, so `next
// build` (page-data collection) and tooling can load API routes without a live
// database. The first real query throws a clear error when DATABASE_URL is missing.
type Db = NodePgDatabase;
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(drizzle(getPool()), prop, receiver);
  },
});
