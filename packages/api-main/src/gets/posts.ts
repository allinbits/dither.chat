import { t } from 'elysia';

export const PostsQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    address: t.String(),
});

export async function Posts(query: typeof PostsQuery.static) {
    if (!query.address) {
        return {
            status: 400,
            error: 'Malformed query, no address provided',
        };
    }

    let limit = Number(query.limit) || 100;
    let offset = Number(query.offset) || 0;

    if (limit > 100) {
        limit = 100;
    }

    if (limit <= 0) {
        limit = 1;
    }

    if (offset < 0) {
        offset = 0;
    }

    try {
        // return await db.
    } catch (error) {
        console.error(error);
        return { error: 'failed to read data from database' };
    }
}
