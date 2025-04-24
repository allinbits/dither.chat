import '../src/index';
import { it, describe, assert } from 'vitest';
import { getDatabase } from '../drizzle/db';
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
            await getDatabase().execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
        }
    });

    // Posts
    it('GET - /feed (Check Empty)', async () => {
        const response = await get<{ status: number; rows: { hash: string }[] }>(`feed`);
        assert.isOk(response, 'failed to fetch feed data');
        assert.isOk(
            response && Array.isArray(response.rows) && response.rows.length <= 0,
            'feed result was not an array type'
        );
    });

    it('POST - /post', async () => {
        const response = await post(
            `post`,
            generateFakeData(`dither.Post("${genericPostMessage}")`, addressUserA, addressReceiver)
        );
        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('GET - /feed', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `feed`
        );
        assert.isOk(response, 'failed to fetch feed data');
        assert.isOk(
            response && Array.isArray(response.rows) && response.rows.length >= 1,
            'feed result was not an array type'
        );

        assert.isOk(response.rows[0].author === addressUserA, 'author address did not match poster');
        assert.isOk(response.rows[0].message === genericPostMessage, 'message did not match original post');
    });

    it('GET - /posts', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `posts?address=${addressUserA}`
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(
            response && Array.isArray(response.rows) && response.rows.length >= 1,
            'feed result was not an array type'
        );
    });

    // Likes
    it('POST - /like', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `posts?address=${addressUserA}`
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        for (let i = 0; i < 50; i++) {
            const likeResponse = await post(
                `like`,
                generateFakeData(`dither.Like("${response.rows[0].hash}")`, addressUserA, addressReceiver)
            );

            assert.isOk(likeResponse != null);
            assert.isOk(likeResponse && likeResponse.status === 200, 'response was not okay');
        }
    });

    it('GET - /likes', async () => {
        const response = await get<{ status: number; rows: { hash: string; likes: number }[] }>(
            `posts?address=${addressUserA}`
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        assert.isOk(response && response.rows[0].likes >= 50, 'likes were not incremented on post');

        const getResponse = await get<{ status: number; rows: Array<{ hash: string }> }>(
            `likes?hash=${response.rows[0].hash}`
        );
        assert.isOk(getResponse, 'failed to fetch posts data');
        assert.isOk(getResponse.status == 200, 'likes result was not valid');
        assert.isOk(
            getResponse && Array.isArray(getResponse.rows) && getResponse.rows.length >= 50,
            'feed result was not an array type'
        );
    });

    // Dislikes
    it('POST - /dislike', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `posts?address=${addressUserA}`
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');

        for (let i = 0; i < 50; i++) {
            const dislikeResponse = await post(
                `dislike`,
                generateFakeData(`dither.Dislike("${response.rows[0].hash}")`, addressUserA, addressReceiver)
            );

            assert.isOk(dislikeResponse != null);
            assert.isOk(dislikeResponse && dislikeResponse.status === 200, 'response was not okay');
        }
    });

    it('GET - /dislikes', async () => {
        const response = await get<{
            status: number;
            rows: { hash: string; author: string; message: string; dislikes: number }[];
        }>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        assert.isOk(response && response.rows[0].dislikes >= 50, 'likes were not incremented on post');

        const getResponse = await get<{ status: number; rows: Array<{ hash: string }> }>(
            `dislikes?hash=${response.rows[0].hash}`
        );
        assert.isOk(getResponse, 'failed to fetch posts data');
        assert.isOk(getResponse.status == 200, 'dislikes result was not valid');
        assert.isOk(
            getResponse && Array.isArray(getResponse.rows) && getResponse.rows.length >= 50,
            'feed result was not an array type'
        );
    });

    // Flags
    it('POST - /flag', async () => {
        const response = await get<{ status: number; rows: { hash: string; author: string; message: string }[] }>(
            `posts?address=${addressUserA}`
        );
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        if (!response) {
            assert.fail('Failed to obtain a response from posts query');
        }

        for (let i = 0; i < 50; i++) {
            const flagResponse = await post(
                `flag`,
                generateFakeData(`dither.Flag("${response.rows[0].hash}")`, addressUserA, addressReceiver)
            );

            assert.isOk(flagResponse != null);
            assert.isOk(flagResponse && flagResponse.status === 200, 'response was not okay');
        }
    });

    it('GET - /flags', async () => {
        const response = await get<{
            status: number;
            rows: { hash: string; author: string; message: string; flags: number }[];
        }>(`posts?address=${addressUserA}`);
        assert.isOk(response, 'failed to fetch posts data');
        assert.isOk(Array.isArray(response.rows) && response.rows.length >= 1, 'feed result was not an array type');
        assert.isOk(response && response.rows[0].flags >= 50, 'likes were not incremented on post');

        const getResponse = await get<{ status: number; rows: Array<{ hash: string }> }>(
            `flags?hash=${response.rows[0].hash}`
        );
        assert.isOk(getResponse, 'failed to fetch posts data');
        assert.isOk(getResponse.status == 200, 'flags result was not valid');
        assert.isOk(
            getResponse && Array.isArray(getResponse.rows) && getResponse.rows.length >= 50,
            'feed result was not an array type'
        );
    });

    // Follows
    it('POST - /follow', async () => {
        const response = await post(
            `follow`,
            generateFakeData(`dither.Follow("${addressUserB}")`, addressUserA, addressReceiver)
        );

        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('POST - /follow - no duplicates', async () => {
        const response = await post(
            `follow`,
            generateFakeData(`dither.Follow("${addressUserB}")`, addressUserA, addressReceiver)
        );

        assert.isOk(response?.status === 400, 'additional follow was allowed somehow');
    });

    it('GET - /following', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `following?address=${addressUserA}`
        );

        assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
        assert.isOk(response && response.rows.find((x) => x.address === addressUserB));
    });

    it('GET - /followers', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `followers?address=${addressUserB}`
        );

        assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
        assert.isOk(response && response.rows.find((x) => x.address === addressUserA));
    });

    // Unfollow
    it('POST - /unfollow', async () => {
        const response = await post(
            `unfollow`,
            generateFakeData(`dither.Unfollow("${addressUserB}")`, addressUserA, addressReceiver)
        );
        assert.isOk(response?.status === 200, 'response was not okay');
    });

    it('GET - /followers', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `followers?address=${addressUserB}`
        );
        assert.isOk(response && Array.isArray(response.rows), 'followers response was not an array');
        assert.isOk(response && response.rows.length <= 0, 'did not unfollow all users');
    });

    it('GET - /following', async () => {
        const response = await get<{ status: number; rows: { hash: string; address: string }[] }>(
            `following?address=${addressUserA}`
        );
        assert.isOk(response && Array.isArray(response.rows), 'following response was not an array');
        assert.isOk(response && response.rows.length <= 0, 'did not unfollow all users');
    });
});
