type Query = { query: { limit: string; offset: string, address: string } };

export async function post({ query }: Query) {
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
