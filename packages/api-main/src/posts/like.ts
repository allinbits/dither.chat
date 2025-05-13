import { type Posts } from '@atomone/dither-api-types';
import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, LikesTable } from '../../drizzle/schema';

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

export async function Like(body: typeof Posts.LikeBody.static) {
    try {
        await statement.execute({
            post_hash: body.post_hash,
            hash: body.hash,
            author: body.from,
            quantity: body.quantity,
            timestamp: new Date(body.timestamp),
        });

        await statementAddLikeToPost.execute({ post_hash: body.post_hash, quantity: body.quantity });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for like, like already exists' };
    }
}
