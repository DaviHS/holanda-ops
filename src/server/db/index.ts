import { drizzle } from 'drizzle-orm/node-postgres'; // ou 'drizzle-orm/postgres-js' / '@libsql/client'
import { Pool } from 'pg';

import * as schema from './schema'; 

const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const conn =
  globalForDb.conn ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn;

export const db = drizzle(conn, { schema });