import { t } from 'elysia';
import { ReplyTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { sql } from 'drizzle-orm';

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
    })
    .onConflictDoNothing()
    .prepare('stmnt_post');

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

    try {
        await statement.execute({
            hash: body.hash,
            post_hash: post_hash,
            timestamp: new Date(body.timestamp),
            author: msgTransfer.from_address,
            message,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
