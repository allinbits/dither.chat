import '../src/index';
import { it, expect, describe, assert } from 'vitest';
import { db } from '../drizzle/db';
import { sql } from 'drizzle-orm';
import { tables } from '../drizzle/schema';
import { generateFakeData, get, getAtomOneAddress, post } from './shared';

describe('v1', { sequential: true }, () => {
    const addressReceiver = getAtomOneAddress();
    const addressUserA = getAtomOneAddress();
    const addressUserB = getAtomOneAddress();
    const genericPostMessage =
        'hello world, this is a really intereresting post $@!($)@!()@!$21,4214,12,42142,14,12,421,';

    it('EMPTY ALL TABLES', async () => {
        for (let tableName of tables) {
            await db.execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
        }
    });

    // Posts
    it('GET - /feed (Check Empty)', async () => {
        const response = await get<Array<any>>(`feed`);
        assert.isOk(response, 'failed to fetch feed data');
        assert.isOk(Array.isArray(response) && response.length <= 0, 'feed result was not an array type');
    });

    it('POST - /post', async () => {
        const response = await post(
            `post`,
            generateFakeData(`dither.Post("${genericPostMessage}")`, addressUserA, addressReceiver)
        );
        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('GET - /feed', async () => {
        const response = await get<Array<any>>(`feed`);
        assert.isOk(response, 'failed to fetch feed data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        assert.isOk(Array.isArray(response) && response[0].author === addressUserA, 'author address did not match poster');
        assert.isOk(
            Array.isArray(response) && response[0].message === genericPostMessage,
            'message did not match original post'
        );
    });

    it('GET - /posts', async () => {
        const response = await get<Array<any>>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
    });

    // Likes
    it('POST - /like', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const likeResponse = await post(
            `like`,
            generateFakeData(`dither.Like("${response[0].hash}")`, addressUserA, addressReceiver)
        );

        assert.isOk(likeResponse != null);
        assert.isOk(likeResponse && likeResponse.status === 200, 'response was not okay');
    });

    it('GET - /likes', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const responseLikes = await get<Array<{ hash: string }>>(`likes?hash=${response[0].hash}`);
        assert.isOk(responseLikes, 'failed to fetch posts data');
        assert.isOk(Array.isArray(responseLikes) && responseLikes.length >= 1, 'feed result was not an array type');
    });

    // Dislikes
    it('POST - /dislike', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const dislikeResponse = await post(
            `dislike`,
            generateFakeData(`dither.Dislike("${response[0].hash}")`, addressUserA, addressReceiver)
        );

        assert.isOk(dislikeResponse != null);
        assert.isOk(dislikeResponse && dislikeResponse.status === 200, 'response was not okay');
    });

    it('GET - /dislikes', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const responseDislikes = await get<Array<{ hash: string }>>(`dislikes?hash=${response[0].hash}`);
        assert.isOk(responseDislikes, 'failed to fetch posts data');
        assert.isOk(Array.isArray(responseDislikes) && responseDislikes.length >= 1, 'feed result was not an array type');
    });

    // Flags
    it('POST - /flag', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const flagResponse = await post(
            `flag`,
            generateFakeData(`dither.Flag("${response[0].hash}")`, addressUserA, addressReceiver)
        );

        assert.isOk(flagResponse != null);
        assert.isOk(flagResponse && flagResponse.status === 200, 'response was not okay');
    });

    it('GET - /flags', async () => {
        const response = await get<Array<{ hash: string }>>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response) && response.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        const responseFlags = await get<Array<{ hash: string }>>(`flags?hash=${response[0].hash}`);
        assert.isOk(responseFlags, 'failed to fetch posts data');
        assert.isOk(Array.isArray(responseFlags) && responseFlags.length >= 1, 'feed result was not an array type');
    });

    // Follows
    it('POST - /follow', async () => {
        const response = await post(
            `follow`,
            generateFakeData(`dither.Follow("${addressUserB}")`, addressUserA, addressReceiver)
        );
        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('GET - /followers', async () => {
        const response = await get<
            Array<{
                followers: Array<{ hash: string; address: string }>;
            }>
        >(`followers?address=${addressUserB}`);
        assert.isOk(response && Array.isArray(response), 'followers response was not an array');
        assert.isOk(response && response[0].followers.find((x) => x.address === addressUserA));
    });

    it('GET - /following', async () => {
        const response = await get<
            Array<{
                following: Array<{ hash: string; address: string }>;
            }>
        >(`following?address=${addressUserA}`);
        assert.isOk(response && Array.isArray(response), 'followers response was not an array');
        assert.isOk(response && response[0].following.find((x) => x.address === addressUserB));
    });
});
