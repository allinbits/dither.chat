import { sql } from "drizzle-orm";
import { t } from "elysia";

import { getDatabase } from "../../drizzle/db";
import { FeedTable } from "../../drizzle/schema";

export const PostBody = t.Object({
    hash: t.String(),
    timestamp: t.String(),
    from: t.String(),
    msg: t.String(),
    quantity: t.String(),
});

const statement = getDatabase()
    .insert(FeedTable)
    .values({
        hash: sql.placeholder("hash"),
        timestamp: sql.placeholder("timestamp"),
        author: sql.placeholder("author"),
        message: sql.placeholder("message"),
        quantity: sql.placeholder("quantity"),
    })
    .onConflictDoNothing()
    .prepare("stmnt_post");

export async function Post(body: typeof PostBody.static) {
    try {
        await statement.execute({
            hash: body.hash,
            timestamp: new Date(body.timestamp),
            author: body.from,
            message: body.msg,
            quantity: body.quantity,
        });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: "failed to upsert data for post" };
    }
}
