import { type Gets } from '@atomone/dither-api-types';
import { and, count, desc, gte, isNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

const statement = getDatabase()
    .select()
    .from(FeedTable)
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .where(
        and(
            isNull(FeedTable.removed_at),
            isNull(FeedTable.post_hash),
            gte(FeedTable.quantity, sql.placeholder('minQuantity')),
        ),
    )
    .orderBy(desc(FeedTable.timestamp))
    .prepare('stmnt_get_feed');

export async function Feed(query: typeof Gets.FeedQuery.static) {
    if (query.count) {
        try {
            return await getDatabase().select({ count: count() }).from(FeedTable);
        }
        catch (err) {
            console.error(err);
            return { status: 400, error: 'failed to read data from database' };
        }
    }

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
        const results = await statement.execute({ offset, limit, minQuantity });
        return { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
