import { t } from 'elysia';
import { UsersTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { eq } from 'drizzle-orm';

export const FollowersQuery = t.Object({
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    address: t.String(),
});

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
        return await db
            .select({ followers: UsersTable.followers })
            .from(UsersTable)
            .where(eq(UsersTable.address, query.address))
            .limit(limit)
            .offset(offset);
    } catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching followers' };
    }
}
