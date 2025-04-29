import { t } from 'elysia';
import { FollowsTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { and, eq, sql } from 'drizzle-orm';

export const UnfollowBody = t.Object({
    hash: t.String(),
    from: t.String(),
    address: t.String(),
});

const statementRemoveFollowing = getDatabase()
    .delete(FollowsTable)
    .where(
        and(
            eq(FollowsTable.follower, sql.placeholder('follower')),
            eq(FollowsTable.following, sql.placeholder('following'))
        )
    )
    .prepare('stmnt_remove_follower');

export async function Unfollow(body: typeof UnfollowBody.static) {
    try {
        await statementRemoveFollowing.execute({ follower: body.from, following: body.address });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to unfollow user, user may not exist' };
    }
}
