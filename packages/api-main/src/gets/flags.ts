import { eq, sql } from "drizzle-orm";
import { t } from "elysia";

import { getDatabase } from "../../drizzle/db";
import { FlagsTable } from "../../drizzle/schema";
import { getJsonbArrayCount } from "../utility";

export const FlagsQuery = t.Object({
    hash: t.String(),
    limit: t.Optional(t.Number()),
    offset: t.Optional(t.Number()),
    count: t.Optional(t.Boolean()),
});

const statement = getDatabase()
    .select()
    .from(FlagsTable)
    .where(eq(FlagsTable.post_hash, sql.placeholder("post_hash")))
    .limit(sql.placeholder("limit"))
    .offset(sql.placeholder("offset"))
    .prepare("stmnt_get_flags");

export async function Flags(query: typeof FlagsQuery.static) {
    if (!query.hash) {
        return {
            status: 400,
            error: "malformed query, no hash provided",
        };
    }

    let limit = typeof query.limit !== "undefined" ? Number(query.limit) : 100;
    const offset = typeof query.offset !== "undefined" ? Number(query.offset) : 0;

    if (limit > 100) {
        limit = 100;
    }

    if (limit <= 0) {
        return { status: 400, error: "limit must be at least 1" };
    }

    if (offset < 0) {
        return { status: 400, error: "offset must be at least 0" };
    }

    try {
        if (query.count) {
            return await getJsonbArrayCount(query.hash, FlagsTable._.name);
        }

        const results = await statement.execute({ post_hash: query.hash, limit, offset });
        return { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { error: "failed to read data from database" };
    }
}
