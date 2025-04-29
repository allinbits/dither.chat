import { t } from 'elysia';
import { FeedTable, FlagsTable, ReplyTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { eq, sql } from 'drizzle-orm';

export const FlagBody = t.Object({
    hash: t.String(),
    from: t.String(),
    postHash: t.String(),
    quantity: t.String(),
    isReply: t.Optional(t.Boolean()),
});

const statement = getDatabase()
    .insert(FlagsTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
    })
    .prepare('stmnt_add_flag');

const statementAddFlagToPost = getDatabase()
    .update(FeedTable)
    .set({
        flags: sql`${FeedTable.flags} + 1`,
        flags_burnt: sql`${FeedTable.flags_burnt} + ${sql.placeholder('quantity')}`,
    })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_flag_count_to_post');

const statementAddFlagToReply = getDatabase()
    .update(ReplyTable)
    .set({
        likes: sql`${ReplyTable.likes} + 1`,
        flags_burnt: sql`${FeedTable.flags_burnt} + ${sql.placeholder('quantity')}`,
    })
    .where(eq(ReplyTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_flag_count_to_reply');

export async function Flag(body: typeof FlagBody.static) {
    try {
        await statement.execute({
            post_hash: body.postHash,
            hash: body.hash,
            author: body.from,
            quantity: body.quantity,
        });
        
        if (body.isReply) {
            await statementAddFlagToReply.execute({ post_hash: body.postHash, quantity: body.quantity });
        } else {
            await statementAddFlagToPost.execute({ post_hash: body.postHash, quantity: body.quantity });
        }

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for flag, flag already exists' };
    }
}
