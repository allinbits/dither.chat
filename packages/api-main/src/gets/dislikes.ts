import { t } from 'elysia';

export const DislikesQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    isReply: t.Optional(t.String()),
});

export async function Dislikes(query: typeof DislikesQuery.static) {
    if (!query.hash) {
        return {
            status: 400,
            error: 'Malformed query, no hash provided',
        };
    }

    let limit = Number(query.limit) ?? 100;
    let offset = Number(query.offset) ?? 0;

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
        return 'hi';
        // return await db.
    } catch (error) {
        console.error(error);
        return { error: 'failed to read data from database' };
    }
}
