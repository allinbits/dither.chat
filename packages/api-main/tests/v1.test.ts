import { it, expect, describe } from 'vitest';
import '../src/index';
import { db } from '../drizzle/db';
import { sql } from 'drizzle-orm';
import { tables } from '../drizzle/schema';

async function get<T>(endpoint: string, port: 'WRITE' | 'READ' = 'READ') {
    const response = await fetch(`http://localhost:${port === 'WRITE' ? 3001 : 3000}/v1/${endpoint}`).catch((err) => {
        console.error(err);
        return null;
    });

    if (!response?.ok) {
        return null;
    }

    return (await response.json()) as T;
}

async function post<T = { status: number }>(endpoint: string, body: any, port: 'WRITE' | 'READ' = 'WRITE') {
    const response = await fetch(`http://localhost:${port === 'WRITE' ? 3001 : 3000}/v1/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body }),
    }).catch((err) => {
        console.error(err);
        return null;
    });

    if (!response?.ok) {
        return null;
    }

    return (await response.json()) as T;
}

describe('v1', { sequential: true }, () => {
    it('EMPTY ALL TABLES', async () => {
        for (let tableName of tables) {
            await db.execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
        }
    });

    it('GET - /feed (Check Empty)', async () => {
        const response = await get<Array<any>>(`feed`);
        expect(response, 'failed to fetch feed data');
        expect(Array.isArray(response) && response.length <= 0, 'feed result was not an array type');
    });

    it('POST - /post', async () => {
        const response = await post(`post`, {
            hash: '2447B2E9614A10523357F38B49ED2C322F35B901ADD61987CC3F1A42EB6F2443',
            height: '42412412',
            timestamp: '2025-04-16T19:46:42Z',
            memo: 'dither.Post("hello world")',
            messages: [
                {
                    '@type': '/cosmos.bank.v1beta1.MsgSend',
                    from_address: 'atone16k0xnxqr48qdwxreu6rgcghg0xp9hn7vpn06nm',
                    to_address: 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep',
                    amount: [{ denom: 'uatone', amount: '1' }],
                },
            ],
        });

        expect(response?.status === 200, 'response was not okay');
    });

    it('GET - /feed', async () => {
        const response = await get<Array<any>>(`feed`);
        expect(response, 'failed to fetch feed data');
        expect(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
    });
});
