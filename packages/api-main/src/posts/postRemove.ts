import { t } from 'elysia';
import { FeedTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { eq, and } from 'drizzle-orm';

export const PostRemoveBody = t.Object({
    hash: t.String(),
    post_hash: t.String(),
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
        if (!hasOwnership) {
            return { status: 200, error: 'did not have ownership for post removal, ignored removal'}
        }


        const statement = getDatabase()
            .update(FeedTable)
            .set({
                removed_at: new Date(body.timestamp),
                removed_hash: body.hash,
                removed_by: body.from
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
