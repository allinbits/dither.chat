import { t } from 'elysia';

export const FeedQuery = t.Object({ limit: t.Optional(t.String()), offset: t.Optional(t.String()) });

export async function Feed(query: typeof FeedQuery.static) {
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
    } catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
