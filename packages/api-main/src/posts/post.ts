import { type Posts } from '@atomone/dither-api-types';
import { desc, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AuditTable, FeedTable } from '../../drizzle/schema';

const statement = getDatabase()
    .insert(FeedTable)
    .values({
        hash: sql.placeholder('hash'),
        timestamp: sql.placeholder('timestamp'),
        author: sql.placeholder('author'),
        message: sql.placeholder('message'),
        quantity: sql.placeholder('quantity'),
    })
    .onConflictDoNothing()
    .prepare('stmnt_post');

export async function Post(body: typeof Posts.PostBody.static) {
    try {
        if (body.msg.length >= 512) {
            return { status: 401, error: 'message is too long'};
        }

        await statement.execute({
            hash: body.hash.toLowerCase(),
            timestamp: new Date(body.timestamp),
            author: body.from.toLowerCase(),
            message: body.msg,
            quantity: body.quantity,
        });

        await removePostIfBanned(body);
        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}

async function removePostIfBanned(body: typeof Posts.PostBody.static) {
    const [lastAuditOnUser] = await getDatabase()
        .select()
        .from(AuditTable)
        .where(eq(AuditTable.user_address, body.from))
        .orderBy(desc(AuditTable.created_at))
        .limit(1);
    // If there are not action over the user of they were restored (unbanned), do nothing
    if (!lastAuditOnUser || lastAuditOnUser.restored_at) {
        return;
    }

    const statement = getDatabase()
        .update(FeedTable)
        .set({
            removed_at: new Date(body.timestamp),
            removed_by: lastAuditOnUser.created_by,
        })
        .where(eq(FeedTable.hash, body.hash))
        .returning();

    await statement.execute();

    return lastAuditOnUser;
}
