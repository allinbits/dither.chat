import { type Gets } from '@atomone/dither-api-types';
import { and, desc, eq, gte, isNotNull, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

const statement = getDatabase()
    .select()
    .from(FeedTable)
    .where(and(
        eq(FeedTable.post_hash, sql.placeholder('hash')),
        isNull(FeedTable.removed_at),
        gte(FeedTable.quantity, sql.placeholder('minQuantity')),
    ))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .orderBy(desc(FeedTable.timestamp))
    .prepare('stmnt_get_replies');

export async function Replies(query: typeof Gets.RepliesQuery.static) {
    let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
    const offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;
    const minQuantity = typeof query.minQuantity !== 'undefined' ? query.minQuantity : BigInt(0);

    if (limit > 100) {
        limit = 100;
    }

    if (limit <= 0) {
        return { status: 400, error: 'limit must be at least 1' };
    }

    if (offset < 0) {
        return { status: 400, error: 'offset must be at least 0' };
    }

    try {
        const results = await statement.execute({ hash: query.hash, limit, offset, minQuantity });
        return { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching reply' };
    }
}

const feed = FeedTable;
const parentFeed = alias(FeedTable, 'parent');

const getUserRepliesWithParent = getDatabase()
    .select({
        reply: feed,
        parent: parentFeed,
    })
    .from(feed)
    .innerJoin(parentFeed, eq(feed.post_hash, parentFeed.hash))
    .where(and(eq(feed.author, sql.placeholder('author')), isNotNull(feed.post_hash)))
    .orderBy(desc(feed.timestamp))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .prepare('stmnt_get_user_replies_with_parents');

export async function UserReplies(query: typeof Gets.UserRepliesQuery.static, store: { userAddress: string }) {
    let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
    const offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;
    const minQuantity = typeof query.minQuantity !== 'undefined' ? query.minQuantity : BigInt(0);

    if (limit > 100) {
        limit = 100;
    }

    if (limit <= 0) {
        return { status: 400, error: 'limit must be at least 1' };
    }

    if (offset < 0) {
        return { status: 400, error: 'offset must be at least 0' };
    }

    try {
        const results = await getUserRepliesWithParent.execute({ author: store.userAddress, limit, offset });
        return { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find user replies' };
    }
}
