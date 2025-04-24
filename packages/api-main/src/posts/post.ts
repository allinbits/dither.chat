import { t } from 'elysia';
import { FeedTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage, getTransferQuantities } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { sql } from 'drizzle-orm';

export const PostBody = t.Object({
    hash: t.String(),
    height: t.String(),
    timestamp: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

const statement = getDatabase()
    .insert(FeedTable)
    .values({
        hash: sql.placeholder('hash'),
        timestamp: sql.placeholder('timestamp'),
        author: sql.placeholder('author'),
        message: sql.placeholder('message'),
        quantity: sql.placeholder('quantity')
    })
    .onConflictDoNothing()
    .prepare('stmnt_post');

export async function Post(body: typeof PostBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const [message] = extractMemoContent(body.memo, 'dither.Post');
    if (!message) {
        return { status: 400, error: 'post message contains no content' };
    }

    const quantity = getTransferQuantities(body.messages);

    try {
        await statement.execute({
            hash: body.hash,
            timestamp: new Date(body.timestamp),
            author: msgTransfer.from_address,
            message,
            quantity
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
