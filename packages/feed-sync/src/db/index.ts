import type { Pool } from 'pg';

import pg from 'pg';

import { useConfig } from '../config';

let pool: Pool;

async function getClient(): Promise<pg.PoolClient> {
  if (!pool) {
    const config = useConfig();
    pool = new pg.Pool({
      connectionString: config.PG_URI,
      max: 150,
      connectionTimeoutMillis: 0,
      idleTimeoutMillis: 1000,
    });
  }

  return pool.connect();
}

async function createReplicationSlot(slotName: string): Promise<void> {
  try {
    const client = await getClient();

    const { rows } = await client.query(`SELECT pg_create_physical_replication_slot($1);`, [slotName]);
    if (rows && rows.length > 0) {
      console.log(`Successfully created replication slot: ${slotName}`);
    }
  } catch (error: pg.DatabaseError) {
    if (error.code === '42710') {
      // Slot already exists, ignore the error
      return;
    }

    throw error;
  }
}

export const db = {
  getClient,
  createReplicationSlot,
};
