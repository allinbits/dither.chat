import { t } from 'elysia';

export const RepliesQuery = t.Object({
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    hash: t.String(),
});

export async function Replies(query: typeof RepliesQuery.static) {
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
        // return await db.
    } catch (error) {
        console.error(error);
        return { error: 'failed to read data from database' };
    }
}
