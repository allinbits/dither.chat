import { t } from 'elysia';

export const FollowersQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    address: t.String(),
});

export async function Followers(query: typeof FollowersQuery.static) {
    if (!query.address) {
        return {
            status: 400,
            error: 'malformed query, no address provided',
        };
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
        // return await db.
    } catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching followers' };
    }
}
