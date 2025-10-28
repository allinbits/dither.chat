import { Pool } from 'pg';

import { useConfig } from '../config';

let pool: Pool;

async function getClient() {
  if (!pool) {
    const config = useConfig();
    pool = new Pool({
      connectionString: config.PG_URI,
      max: 150,
      connectionTimeoutMillis: 0,
      idleTimeoutMillis: 1000,
    });
  }

  return pool.connect();
}

export const db = { getClient };
