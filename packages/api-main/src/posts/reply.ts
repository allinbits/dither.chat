import { eq, sql } from "drizzle-orm";
import { t } from "elysia";

import { getDatabase } from "../../drizzle/db";
import { FeedTable } from "../../drizzle/schema";

export const ReplyBody = t.Object({
    hash: t.String(),
    postHash: t.String(),
    timestamp: t.String(),
    from: t.String(),
    msg: t.String(),
    quantity: t.String(),
});

const statement = getDatabase()
    .insert(FeedTable)
    .values({
        author: sql.placeholder("author"),
        hash: sql.placeholder("hash"),
        message: sql.placeholder("message"),
        post_hash: sql.placeholder("post_hash"),
        quantity: sql.placeholder("quantity"),
        timestamp: sql.placeholder("timestamp"),
    })
    .onConflictDoNothing()
    .prepare("stmnt_reply");

const statementAddReplyCount = getDatabase()
    .update(FeedTable)
    .set({ replies: sql`${FeedTable.replies} + 1` })
    .where(eq(FeedTable.hash, sql.placeholder("post_hash")))
    .prepare("stmnt_add_reply_count");

export async function Reply(body: typeof ReplyBody.static) {
    try {
        await statement.execute({
            author: body.from,
            hash: body.hash,
            message: body.msg,
            post_hash: body.postHash,
            quantity: body.quantity,
            timestamp: new Date(body.timestamp),
        });

        await statementAddReplyCount.execute({
            post_hash: body.postHash,
        });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: "failed to upsert data for post" };
    }
}
