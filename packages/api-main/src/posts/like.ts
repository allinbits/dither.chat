import { eq, sql } from 'drizzle-orm';
import { t } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, LikesTable } from '../../drizzle/schema';

export const LikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    postHash: t.String(),
    quantity: t.String(),
    timestamp: t.String(),
});

const statement = getDatabase()
    .insert(LikesTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
        timestamp: sql.placeholder('timestamp'),
    })
    .prepare('stmnt_add_like');

const statementAddLikeToPost = getDatabase()
    .update(FeedTable)
    .set({
        likes: sql`${FeedTable.likes} + 1`,
        likes_burnt: sql`${FeedTable.likes_burnt} + ${sql.placeholder('quantity')}`,
    })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_like_count_to_post');

export async function Like(body: typeof LikeBody.static) {
    try {
        await statement.execute({
            post_hash: body.postHash,
            hash: body.hash,
            author: body.from,
            quantity: body.quantity,
            timestamp: new Date(body.timestamp),
        });

        await statementAddLikeToPost.execute({ post_hash: body.postHash, quantity: body.quantity });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for like, like already exists' };
    }
}
