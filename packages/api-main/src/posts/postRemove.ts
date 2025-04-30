import { t } from 'elysia';
import { FeedTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { eq, and } from 'drizzle-orm';

export const PostRemoveBody = t.Object({
    hash: t.String(),
    post_hash: t.String(),
    reason: t.String(),
    from: t.String(),
    timestamp: t.String(),
});

export async function PostRemove(body: typeof PostRemoveBody.static) {
    try {
        const selectResults = await getDatabase()
            .select()
            .from(FeedTable)
            .where(and(eq(FeedTable.hash, body.post_hash), eq(FeedTable.author, body.from)));
        const hasOwnership = selectResults.length >= 1;

        const statement = getDatabase()
            .update(FeedTable)
            .set({
                deleted_at: new Date(body.timestamp),
                deleted_hash: body.hash,
                deleted_reason: hasOwnership ? 'deleted by author' : 'moderator deleted - ' + body.post_hash,
            })
            .where(eq(FeedTable.hash, body.post_hash))
            .returning();

        await statement.execute();

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to delete post, maybe invalid' };
    }
}
