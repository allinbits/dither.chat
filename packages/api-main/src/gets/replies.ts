import { t } from 'elysia';
import { getDatabase } from '../../drizzle/db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { FeedTable } from '../../drizzle/schema';

export const RepliesQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    hash: t.String(),
});

const statement = getDatabase()
    .select()
    .from(FeedTable)
    .where(and(eq(FeedTable.hash, sql.placeholder('hash')), isNull(FeedTable.deleted_at)))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .prepare('stmnt_get_replies');

export async function Replies(query: typeof RepliesQuery.static) {
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
        const results = await statement.execute({ hash: query.hash, limit, offset });
        return { status: 200, rows: results };
    } catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching reply' };
    }
}
