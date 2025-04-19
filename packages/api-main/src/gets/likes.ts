import { t } from 'elysia';

export const LikesQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    hash: t.String(),
    isReply: t.Optional(t.String()),
});

export async function Likes(query: typeof LikesQuery.static) {
    if (!query.hash) {
        return {
            status: 400,
            error: 'Malformed query, no hash provided',
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
        return { error: 'failed to read data from database' };
    }
}
