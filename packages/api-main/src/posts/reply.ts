import { type Posts } from '@atomone/dither-api-types';
import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';
import { useSharedQueries } from '../shared/useSharedQueries';

const sharedQueries = useSharedQueries();

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
        const doesExit = await sharedQueries.doesPostExist(body.post_hash);
        if (!doesExit) {
            return { status: 404, error: 'Provided post_hash was not found' };
        }

        await statement.execute({
            author: body.from.toLowerCase(),
            hash: body.hash.toLowerCase(),
            message: body.msg,
            post_hash: body.post_hash.toLowerCase(),
            quantity: body.quantity,
            timestamp: new Date(body.timestamp),
        });

        await statementAddReplyCount.execute({
            post_hash: body.post_hash,
        });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
