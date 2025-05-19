import { type Gets } from '@atomone/dither-api-types';
import { and, eq, isNull, sql, desc } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';

const statement = getDatabase()
    .select()
    .from(FeedTable)
    .where(and(eq(FeedTable.hash, sql.placeholder('hash')), isNull(FeedTable.removed_at)))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .orderBy(desc(FeedTable.timestamp))
    .prepare('stmnt_get_replies');

export async function Replies(query: typeof Gets.RepliesQuery.static) {
    let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
    const offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;

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
        const results = await statement.execute({ hash: query.hash, limit, offset });
        return { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching reply' };
    }
}
