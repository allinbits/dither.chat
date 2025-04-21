import { t } from 'elysia';
import { UsersTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { sql } from 'drizzle-orm';

export const FollowBody = t.Object({
    address: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

export async function Follow(body: typeof FollowBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const [follow_hash] = extractMemoContent(body.memo, 'dither.Follow');

    try {
        // Add follow to the executor
        await db
            .insert(UsersTable)
            .values({
                address: msgTransfer.from_address,
                followersCount: 0,
                followingCount: 0,
                followers: [],
                following: [follow_hash],
            })
            .onConflictDoUpdate({
                target: UsersTable.address,
                set: {
                    following: sql`${UsersTable.following} || ARRAY[${follow_hash}]`,
                    followingCount: sql`${UsersTable.followingCount} + 1`,
                },
            });

        // Add executor to the target
        await db
            .insert(UsersTable)
            .values({
                address: follow_hash,
                followersCount: 0,
                followingCount: 0,
                followers: [msgTransfer.from_address],
                following: [],
            })
            .onConflictDoUpdate({
                target: UsersTable.address,
                set: {
                    followers: sql`${UsersTable.followers} || ARRAY[${msgTransfer.from_address}]`,
                    followersCount: sql`${UsersTable.followersCount} + 1`,
                },
            });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
