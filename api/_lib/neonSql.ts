import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cached: NeonQueryFunction<false, false> | null = null;

/** Serverless SQL client for Vercel api/* routes (Neon). */
export function getNeonSql() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured (Neon). Set DATABASE_URL in Vercel / .env for api routes.',
    );
  }
  if (!cached) cached = neon(databaseUrl);
  return cached;
}
