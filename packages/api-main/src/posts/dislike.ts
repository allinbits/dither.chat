import { t } from 'elysia';
import { DislikesTable, FeedTable, ReplyTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { eq, sql } from 'drizzle-orm';

export const DislikeBody = t.Object({
    hash: t.String(),
    from: t.String(),
    postHash: t.String(),
    quantity: t.String(),
    isReply: t.Optional(t.Boolean()),
});

const statement = getDatabase()
    .insert(DislikesTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
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

const statementAddDislikeToReply = getDatabase()
    .update(ReplyTable)
    .set({
        likes: sql`${ReplyTable.likes} + 1`,
        dislikes_burnt: sql`${FeedTable.dislikes_burnt} + ${sql.placeholder('quantity')}`,
    })
    .where(eq(ReplyTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_flag_count_to_reply');

export async function Dislike(body: typeof DislikeBody.static) {
    try {
        await statement.execute({
            post_hash: body.postHash,
            hash: body.hash,
            author: body.from,
            quantity: body.quantity,
        });

        if (body.isReply) {
            await statementAddDislikeToReply.execute({ post_hash: body.postHash, quantity: body.quantity });
        } else {
            await statementAddDislikeToPost.execute({ post_hash: body.postHash, quantity: body.quantity });
        }

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
