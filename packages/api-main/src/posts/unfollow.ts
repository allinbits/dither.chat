import { and, eq, sql } from 'drizzle-orm';
import { t } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { FollowsTable } from '../../drizzle/schema';

export const UnfollowBody = t.Object({
    hash: t.String(),
    from: t.String(),
    address: t.String(),
    timestamp: t.String(),
});

const statementRemoveFollowing = getDatabase()
    .update(FollowsTable)
    .set({ removed_at: sql.placeholder('removed_at') as never }) // Drizzle Type Issue atm.
    .where(
        and(
            eq(FollowsTable.follower, sql.placeholder('follower')),
            eq(FollowsTable.following, sql.placeholder('following')),
        ),
    )
    .prepare('stmnt_remove_follower');

export async function Unfollow(body: typeof UnfollowBody.static) {
    try {
        await statementRemoveFollowing.execute({ follower: body.from, following: body.address, removed_at: new Date(body.timestamp) });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to unfollow user, user may not exist' };
    }
}
