import { t } from 'elysia';

export const FlagsQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
    isReply: t.Optional(t.String()),
});

export async function Flags(query: typeof FlagsQuery.static) {
    if (!query.hash) {
        return {
            status: 400,
            error: 'malformed query, no hash provided',
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
        return { status: 400, error: 'failed to read data from database' };
    }
}
