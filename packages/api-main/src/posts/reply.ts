import { type Posts } from '@atomone/dither-api-types';
import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';
import { useSharedQueries } from '../shared/useSharedQueries';

const sharedQueries = useSharedQueries();
import { notify } from '../shared/notify';
import { postToDiscord } from '../utility';

const statement = getDatabase()
    .insert(FeedTable)
    .values({
        author: sql.placeholder('author'),
        hash: sql.placeholder('hash'),
        message: sql.placeholder('message'),
        post_hash: sql.placeholder('post_hash'),
        quantity: sql.placeholder('quantity'),
        timestamp: sql.placeholder('timestamp'),
    })
    .onConflictDoNothing()
    .prepare('stmnt_reply');

const statementAddReplyCount = getDatabase()
    .update(FeedTable)
    .set({ replies: sql`${FeedTable.replies} + 1` })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_reply_count');

export async function Reply(body: typeof Posts.ReplyBody.static) {
    if (body.post_hash.length !== 64) {
        return { status: 400, error: 'Provided post_hash is not valid for reply' };
    }

    try {
        const result = await sharedQueries.doesPostExist(body.post_hash);
        if (result.status !== 200) {
            return { status: result.status, error: 'provided post_hash does not exist' };
        }

        const resultChanges = await statement.execute({
            author: body.from.toLowerCase(),
            hash: body.hash.toLowerCase(),
            message: body.msg,
            post_hash: body.post_hash.toLowerCase(),
            quantity: body.quantity,
            timestamp: new Date(body.timestamp),
        });

        if (typeof resultChanges.rowCount === 'number' && resultChanges.rowCount >= 1) {
            await statementAddReplyCount.execute({
                post_hash: body.post_hash,
            });

            await notify({
                post_hash: body.post_hash,
                hash: body.hash,
                type: 'reply',
                timestamp: new Date(body.timestamp),
                subcontext: body.msg.length >= 61 ? body.msg.slice(0, 61) + '...' : body.msg,
                actor: body.from,
            });
        }

        await postToDiscord(`${body.msg}`, `https://dither.chat/post/${body.hash.toLowerCase()}`);
        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
