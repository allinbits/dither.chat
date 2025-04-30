import { t } from 'elysia';
import { FollowsTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { and, eq, isNull, sql } from 'drizzle-orm';

export const FollowersQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

const statementGetFollowers = getDatabase()
    .select({ address: FollowsTable.follower, hash: FollowsTable.hash })
    .from(FollowsTable)
    .where(and(eq(FollowsTable.following, sql.placeholder('following')), isNull(FollowsTable.deleted_at)))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .prepare('stmnt_get_followers');

export async function Followers(query: typeof FollowersQuery.static) {
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
        const results = await statementGetFollowers.execute({ limit, offset, following: query.address });
        return { status: 200, rows: results };
    } catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching followers' };
    }
}
