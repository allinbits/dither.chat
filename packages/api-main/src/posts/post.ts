import { t } from 'elysia';
import { FeedTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';

export const PostBody = t.Object({
    hash: t.String(),
    height: t.String(),
    timestamp: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

export async function Post(body: typeof PostBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const [message] = extractMemoContent(body.memo, 'dither.Post');

    try {
        await db
            .insert(FeedTable)
            .values({
                hash: body.hash,
                timestamp: new Date(body.timestamp),
                author: msgTransfer.from_address,
                message,
            })
            .onConflictDoNothing();

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
