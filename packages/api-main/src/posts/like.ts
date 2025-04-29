import { t } from 'elysia';
import { FeedTable, ReplyTable, LikesTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { eq, sql } from 'drizzle-orm';

export const LikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    postHash: t.String(),
    quantity: t.String(),
    isReply: t.Optional(t.Boolean()),
});

const statement = getDatabase()
    .insert(LikesTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
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

const statementAddLikeToReply = getDatabase()
    .update(ReplyTable)
    .set({
        likes: sql`${ReplyTable.likes} + 1`,
        likes_burnt: sql`${FeedTable.likes_burnt} + ${sql.placeholder('quantity')}`,
    })
    .where(eq(ReplyTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_like_count_to_reply');

export async function Like(body: typeof LikeBody.static) {
    try {
        await statement.execute({
            post_hash: body.postHash,
            hash: body.hash,
            author: body.from,
            quantity: body.quantity,
        });

        if (body.isReply) {
            await statementAddLikeToReply.execute({ post_hash: body.postHash, quantity: body.quantity });
        } else {
            await statementAddLikeToPost.execute({ post_hash: body.postHash, quantity: body.quantity });
        }

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for like, like already exists' };
    }
}
