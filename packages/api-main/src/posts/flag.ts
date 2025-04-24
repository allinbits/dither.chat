import { t } from 'elysia';
import { FeedTable, FlagsTable, ReplyTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage, getTransferQuantities } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { eq, sql } from 'drizzle-orm';

export const FlagBody = t.Object({
    hash: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
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
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const quantity = getTransferQuantities(body.messages);
    const [post_hash] = extractMemoContent(body.memo, 'dither.Flag');
    if (!post_hash) {
        return { status: 400, error: 'memo must contain a like address for dither.Flag' };
    }

    try {
        await statement.execute({ post_hash, hash: body.hash, author: msgTransfer.from_address, quantity });
        if (body.isReply) {
            await statementAddFlagToReply.execute({ post_hash, quantity });
        } else {
            await statementAddFlagToPost.execute({ post_hash, quantity });
        }

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for flag, flag already exists' };
    }
}
