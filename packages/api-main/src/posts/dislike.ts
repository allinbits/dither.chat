import { type Posts } from '@atomone/dither-api-types';
import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { DislikesTable, FeedTable } from '../../drizzle/schema';
import { useSharedQueries } from '../shared/useSharedQueries';

const sharedQueries = useSharedQueries();
import { notify } from '../shared/notify';
import { isReaderAuthorizationValid, postToDiscord } from '../utility';

const statement = getDatabase()
    .insert(DislikesTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
        timestamp: sql.placeholder('timestamp'),
    })
    .onConflictDoNothing()
    .prepare('stmnt_add_dislike');

const statementAddDislikeToPost = getDatabase()
    .update(FeedTable)
    .set({
        dislikes: sql`${FeedTable.dislikes} + 1`,
        dislikes_burnt: sql`(${FeedTable.dislikes_burnt})::int + ${sql.placeholder('quantity')}`,
    })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_dislike_count_to_post');

export async function Dislike(body: typeof Posts.DislikeBody.static, headers: Record<string, string | undefined>) {
    if (!isReaderAuthorizationValid(headers)) {
        return { status: 401, error: 'Unauthorized to make write request' };
    }

    if (body.post_hash.length !== 64) {
        return { status: 400, error: 'Provided post_hash is not valid for dislike' };
    }

    try {
        const result = await sharedQueries.doesPostExist(body.post_hash);
        if (result.status !== 200) {
            return { status: result.status, error: 'provided post_hash does not exist' };
        }

        const resultChanges = await statement.execute({
            post_hash: body.post_hash.toLowerCase(),
            hash: body.hash.toLowerCase(),
            author: body.from.toLowerCase(),
            quantity: body.quantity,
            timestamp: new Date(body.timestamp),
        });

        // Ensure that 'dislike' was triggered, and not already existing.
        if (typeof resultChanges.rowCount === 'number' && resultChanges.rowCount >= 1) {
            await statementAddDislikeToPost.execute({ post_hash: body.post_hash, quantity: body.quantity });
            await notify({
                post_hash: body.post_hash,
                hash: body.hash,
                type: 'dislike',
                timestamp: new Date(body.timestamp),
                actor: body.from,
            });
        }

        await postToDiscord(`Disliked by ${body.from.toLowerCase()}`, `https://dither.chat/post/${body.hash.toLowerCase()}`);
        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
