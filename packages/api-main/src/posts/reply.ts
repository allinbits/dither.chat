import { t } from 'elysia';
import { FeedTable, ReplyTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage, getTransferQuantities } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { eq, sql } from 'drizzle-orm';

export const ReplyBody = t.Object({
    hash: t.String(),
    height: t.String(),
    timestamp: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

const statement = getDatabase()
    .insert(ReplyTable)
    .values({
        hash: sql.placeholder('hash'),
        post_hash: sql.placeholder('post_hash'),
        timestamp: sql.placeholder('timestamp'),
        author: sql.placeholder('author'),
        message: sql.placeholder('message'),
        quantity: sql.placeholder('quantity'),
    })
    .onConflictDoNothing()
    .prepare('stmnt_post');

const statementAddReplyCount = getDatabase()
    .update(FeedTable)
    .set({ replies: sql`${FeedTable.replies} + 1` })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_reply_count');

export async function Reply(body: typeof ReplyBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a reply' };
    }

    const [post_hash, message] = extractMemoContent(body.memo, 'dither.Reply');
    if (!post_hash) {
        return { status: 400, error: 'post_hash was not supplied' };
    }

    if (!message) {
        return { status: 400, error: 'post message contains no content' };
    }

    const quantity = getTransferQuantities(body.messages);

    try {
        await statement.execute({
            author: msgTransfer.from_address,
            hash: body.hash,
            message,
            post_hash,
            quantity,
            timestamp: new Date(body.timestamp),
        });

        await statementAddReplyCount.execute({
            post_hash,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
