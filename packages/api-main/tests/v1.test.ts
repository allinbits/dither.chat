import '../src/index';
import { it, expect, describe, assert } from 'vitest';
import { db } from '../drizzle/db';
import { sql } from 'drizzle-orm';
import { tables } from '../drizzle/schema';
import { generateFakeData, get, getAtomOneAddress, post } from './shared';

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
