/**
 * @deprecated Use scripts/supabase-seed-catalog.ts (loads env from .env, no keys in repo).
 *
 *   npx tsx scripts/supabase-seed-catalog.ts --wipe
 *
 * Apply migration first: server/migrations/006_currency_eur.sql in Supabase SQL editor.
 */
console.error('Use: npx tsx scripts/supabase-seed-catalog.ts');
process.exit(1);
