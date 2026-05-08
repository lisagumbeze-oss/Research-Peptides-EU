import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const migrationsDir = path.join(__dirname, '../migrations');
    const files = (await fs.readdir(migrationsDir))
      .filter((f) => /^\d+.*\.sql$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (files.length === 0) {
      console.log('No migration files found.');
      await client.query('COMMIT');
      return;
    }

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM public.schema_migrations WHERE filename = $1 LIMIT 1',
        [file]
      );
      if (rows.length > 0) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const migrationPath = path.join(migrationsDir, file);
      const sql = await fs.readFile(migrationPath, 'utf-8');
      console.log(`Applying ${file}...`);
      await client.query(sql);
      await client.query(
        'INSERT INTO public.schema_migrations (filename) VALUES ($1)',
        [file]
      );
    }

    await client.query('COMMIT');
    console.log('Migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
