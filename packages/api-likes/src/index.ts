import { Elysia } from 'elysia';
import node from '@elysiajs/node';
import { cors } from '@elysiajs/cors';
import { initDatabase, useDatabase } from './database';
import { useConfig } from './config';

const db = useDatabase();
const config = useConfig();

async function getPostLikes({ query }: { query: { hash: string} }) {
    try {
        if (!query.hash) {
            return {
                status: 400,
                error: 'Malformed query, no hash provided',
            };
        }

        const result = await db.likes.findOne(query.hash);

        if (!result) {
            return {
                status: 400,
                error: 'Unable to locate likes for post'
            }
        }

        return result;
    } catch (error) {
        console.error(error);
        return { error: 'failed to read data from database' };
    }
}

function getHealth() {
    return { status: 'ok' };
}

async function start() {
    await initDatabase();

    const app = new Elysia({ adapter: node() });
    app.use(cors());
    app.get('/post', getPostLikes);
    app.get('/health', getHealth);
    app.listen(config.PORT ?? 3939);
    console.log(`[API Feed] Running on ${config.PORT ?? 3939}`);
}

start();
