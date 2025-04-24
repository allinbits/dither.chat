import { t } from 'elysia';
import { FollowsTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { and, eq, sql } from 'drizzle-orm';

export const UnfollowBody = t.Object({
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
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
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const [followingHash] = extractMemoContent(body.memo, 'dither.Unfollow');
    if (!followingHash) {
        return { status: 400, error: 'memo must contain a follow hash for dither.Unfollow' };
    }

    try {
        await statementRemoveFollowing.execute({ follower: msgTransfer.from_address, following: followingHash });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to unfollow user, user may not exist' };
    }
}
