import { t } from 'elysia';
import { FeedTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { getTransferMessage } from '../utility';

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

    return await db
        .insert(FeedTable)
        .values({
            ...body,
            author: msgTransfer.from_address,
        })
        .onConflictDoNothing();
}
