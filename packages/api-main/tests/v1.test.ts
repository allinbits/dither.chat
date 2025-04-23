import '../src/index';
import { it, expect, describe, assert } from 'vitest';
import { db } from '../drizzle/db';
import { sql } from 'drizzle-orm';
import { tables } from '../drizzle/schema';
import { createHash, randomBytes } from 'crypto';
import { bech32 } from 'bech32';

let lastHeight = 1_000_000;

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
        console.log(await response?.json());
        return null;
    }

    return (await response.json()) as T;
}

function getSha256Hash(input: string): string {
    const hash = createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

function getAtomOneAddress(): string {
    const randomData = randomBytes(32);
    const hash = createHash('sha256').update(randomData).digest();
    const addressBytes = hash.slice(0, 20);
    const encodedAddress = bech32.encode('atone', bech32.toWords(addressBytes));
    return encodedAddress;
}

function generateFakeData(memo: string, from_address: string, to_address: string) {
    lastHeight++;

    return {
        hash: getSha256Hash(randomBytes(256).toString()),
        height: lastHeight.toString(),
        timestamp: '2025-04-16T19:46:42Z', // Doesn't matter, just need to store some timestamps
        memo,
        messages: [
            {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: from_address,
                to_address: to_address,
                amount: [{ denom: 'uatone', amount: '1' }],
            },
        ],
    };
}

describe('v1', { sequential: true }, () => {
    const addressReceiver = getAtomOneAddress();
    const addressUserA = getAtomOneAddress();
    const genericPostMessage =
        'hello world, this is a really intereresting post $@!($)@!()@!$21,4214,12,42142,14,12,421,';

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
        const response = await post(
            `post`,
            generateFakeData(`dither.Post("${genericPostMessage}")`, addressUserA, addressReceiver)
        );
        expect(response?.status === 200, 'response was not okay');
    });

    it('GET - /feed', async () => {
        const response = await get<Array<any>>(`feed`);
        expect(response, 'failed to fetch feed data');
        expect(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        expect(Array.isArray(response) && response[0].author === addressUserA, 'author address did not match poster');
        expect(
            Array.isArray(response) && response[0].message === genericPostMessage,
            'message did not match original post'
        );
    });

    it('GET - /posts', async () => {
        const response = await get<Array<any>>(`posts?address=${addressUserA}`);
        expect(response, 'failed to fetch posts data');
        expect(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
    });

    it('POST - /like', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        expect(response, 'failed to fetch posts data');
        expect(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const likeResponse = await post(
            `like`,
            generateFakeData(`dither.Like("${response[0].hash}")`, addressUserA, addressReceiver)
        );

        expect(likeResponse != null);
        expect(likeResponse && likeResponse.status === 200, 'response was not okay');
    });

    it('GET - /likes', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        expect(response, 'failed to fetch posts data');
        expect(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const responseLikes = await get<Array<{ hash: string }>>(`likes?hash=${response[0].hash}`);
        expect(responseLikes, 'failed to fetch posts data');
        expect(Array.isArray(responseLikes) && responseLikes.length >= 1, 'feed result was not an array type');
    });
});
