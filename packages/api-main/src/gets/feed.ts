import { t } from 'elysia';
import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';
import { count } from 'drizzle-orm';

export const FeedQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

export async function Feed(query: typeof FeedQuery.static) {
    if (query.count) {
        try {
            return await getDatabase().select({ count: count() }).from(FeedTable);
        } catch (err) {
            console.error(err);
            return { status: 400, error: 'failed to read data from database' };
        }
    }

    let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
    let offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;

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
        const defaultSelection: { [K in keyof typeof FeedTable._.columns]: (typeof FeedTable)[K] } = {
            id: FeedTable.id,
            author: FeedTable.author,
            hash: FeedTable.hash,
            timestamp: FeedTable.timestamp,
            message: FeedTable.message,
        };

        const results = await getDatabase().select(defaultSelection).from(FeedTable).limit(limit).offset(offset);
        return { status: 200, rows: results };
    } catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
