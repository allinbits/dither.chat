import process from 'node:process';

import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

dotenv.config();

export type DbClient = ReturnType<typeof drizzle>;

const { Pool } = pg;

let db: DbClient;

export function getDatabase(): DbClient {
  if (!db) {
    const client = new Pool({
      connectionString: process.env.PG_URI!,
      max: 150,
      connectionTimeoutMillis: 0,
      idleTimeoutMillis: 1000,
    });
    db = drizzle(client);
  }

  return db;
}
