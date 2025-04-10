import { Elysia } from 'elysia';
import node from '@elysiajs/node';
import { cors } from '@elysiajs/cors';
import { initDatabase, useDatabase } from './database';
import { useConfig } from './config';

const db = useDatabase();
const config = useConfig();

async function getPosts({ query }: { query: { limit: string; page: string } }) {
    try {
        let limit = Number(query.limit) || 100;
        let page = Number(query.page) || 0;

        if (limit > 100) {
            limit = 100;
        }

        if (limit <= 0) {
            limit = 1;
        }

        if (page < 0) {
            page = 0;
        }

        return await db.posts.findPaginated(page, limit);
    } catch (error) {
        console.error(error);
        return { error: 'failed to read data from database' };
    }
}

async function getPost({ query }: { query: { hash: string } }) {
    try {
        if (!query.hash) {
            return {
                status: 400,
                error: 'Malformed query',
            };
        }

        return await db.posts.findOne(query.hash);
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
    app.get('/posts', getPosts);
    app.get('/post', getPost);
    app.get('/health', getHealth);
    app.listen(config.PORT ?? 3939);
    console.log(`[API Feed] Running on ${config.PORT ?? 3939}`);
}

start();
