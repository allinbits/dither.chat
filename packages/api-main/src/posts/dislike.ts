import { eq, sql } from 'drizzle-orm';
import { t } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { DislikesTable, FeedTable } from '../../drizzle/schema';

export const DislikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    postHash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

const statement = getDatabase()
    .insert(DislikesTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
        timestamp: sql.placeholder('timestamp'),
    })
    .prepare('stmnt_add_dislike');

const statementAddDislikeToPost = getDatabase()
    .update(FeedTable)
    .set({
        dislikes: sql`${FeedTable.dislikes} + 1`,
        dislikes_burnt: sql`${FeedTable.dislikes_burnt} + ${sql.placeholder('quantity')}`,
    })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_dislike_count_to_post');

export async function Dislike(body: typeof DislikeBody.static) {
    try {
        await statement.execute({
            post_hash: body.postHash,
            hash: body.hash,
            author: body.from,
            quantity: body.quantity,
            timestamp: new Date(body.timestamp),
        });

        await statementAddDislikeToPost.execute({ post_hash: body.postHash, quantity: body.quantity });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
