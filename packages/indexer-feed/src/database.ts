import pg from 'pg';
import { useConfig } from './config';
import { Action } from '@atomone/chronostate/dist/types';
import { Message, Post } from './types';

const { Pool } = pg;

const config = useConfig();
const pool = new Pool({
    connectionString: config.PG_URI,
});

async function createPostgrestRole(client: pg.PoolClient) {
    const checkRoleQuery = `
        SELECT 1
            FROM pg_roles
            WHERE rolname = 'web_anon'
    `;

    const res = await client.query(checkRoleQuery);
    if (res.rowCount === 0) {
        await client.query(`
            CREATE ROLE web_anon NOLOGIN;
                GRANT USAGE ON SCHEMA public TO web_anon;
                GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_anon;
        `);

        await client.query(`
            GRANT SELECT ON TABLE public.posts TO web_anon;
        `);
    }
}

export async function initDatabase() {
    const client = await pool.connect();

    // Create last_block table
    await client.query(`
            CREATE TABLE IF NOT EXISTS last_block (
                id INT PRIMARY KEY,
                block TEXT NOT NULL
            );
        `
    );

    // Create posts table
    await client.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                hash TEXT UNIQUE NOT NULL,
                message TEXT NOT NULL,
                "from" TEXT NOT NULL,
                amounts JSONB NOT NULL,
                timestamp TEXT NOT NULL
            );
        `
    );

    // Create replies table
    await client.query(`
            CREATE TABLE IF NOT EXISTS replies (
                id SERIAL PRIMARY KEY,
                post_hash TEXT REFERENCES posts(hash) ON DELETE CASCADE,
                message TEXT NOT NULL,
                "from" TEXT NOT NULL,
                amounts JSONB NOT NULL,
                hash TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );
        `
    );

    // Insert default row for last_block if missing
    await client.query(
        `INSERT INTO last_block (id, block)
             VALUES (0, $1)
             ON CONFLICT (id) DO NOTHING`,
        [config.START_BLOCK]
    );

    await createPostgrestRole(client);

    client.release();
}

export function useDatabase() {
    return {
        posts: {
            insert: async (actionData: Action, msg: string) => {
                const { from, amounts, hash, timestamp } = actionData;
                await pool.query(
                    `INSERT INTO posts (message, "from", amounts, hash, timestamp)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (hash) DO NOTHING`,
                    [msg, from, JSON.stringify(amounts), hash, timestamp]
                );
            },
        },
        replies: {
            insert: async (actionData: Action, postHash: string, msg: string) => {
                const { from, amounts, hash, timestamp } = actionData;

                // Check if the parent post exists
                const postCheck = await pool.query('SELECT 1 FROM posts WHERE hash = $1', [postHash]);
                if (postCheck.rowCount === 0) return;

                await pool.query(
                    `INSERT INTO replies (post_hash, message, "from", amounts, hash, timestamp)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [postHash, msg, from, JSON.stringify(amounts), hash, timestamp]
                );
            },
        },
        lastBlock: {
            select: async () => {
                const result = await pool.query('SELECT block FROM last_block WHERE id = 0');
                return result.rows[0]?.block ?? config.START_BLOCK;
            },
            update: async (newBlock: string) => {
                await pool.query(`UPDATE last_block SET block = $1 WHERE id = 0`, [newBlock]);
            },
        },
    };
}
