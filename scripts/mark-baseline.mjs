import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL não definida (use o arquivo .env).');

const journal = JSON.parse(readFileSync('drizzle/meta/_journal.json', 'utf8'));
const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )`);

  const { rows: applied } = await client.query(
    'SELECT hash FROM drizzle.__drizzle_migrations',
  );
  const known = new Set(applied.map((row) => row.hash));

  for (const entry of journal.entries) {
    const sql = readFileSync(`drizzle/${entry.tag}.sql`, 'utf8');
    const hash = createHash('sha256').update(sql).digest('hex');
    if (known.has(hash)) {
      console.log(`já registrada: ${entry.tag}`);
      continue;
    }
    await client.query(
      'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
      [hash, entry.when],
    );
    console.log(`registrada: ${entry.tag}`);
  }
} finally {
  await client.end();
}
