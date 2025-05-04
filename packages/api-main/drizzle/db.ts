import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

let db: ReturnType<typeof drizzle>;

export function getDatabase() {
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
