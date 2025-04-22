import { t } from 'elysia';
import { UsersTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { sql } from 'drizzle-orm';

export const FollowBody = t.Object({
    hash: t.String(),
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
    if (!follow_hash) {
        return { status: 400, error: 'memo must contain a follow address for dither.Follow' };
    }

    try {
        // Add follow to the executor
        const followingUser = { hash: body.hash, address: follow_hash };
        await db
            .insert(UsersTable)
            .values({
                address: msgTransfer.from_address,
                followers: [],
                following: [followingUser],
            })
            .onConflictDoUpdate({
                target: UsersTable.address,
                set: {
                    following: sql`${UsersTable.following} || ${followingUser}::jsonb`,
                },
            });

        // Add executor to the target
        const followerUser = { hash: body.hash, address: msgTransfer.from_address };
        await db
            .insert(UsersTable)
            .values({
                address: follow_hash,
                followers: [followerUser],
                following: [],
            })
            .onConflictDoUpdate({
                target: UsersTable.address,
                set: {
                    followers: sql`${UsersTable.followers} || ${followerUser}::jsonb`,
                },
            });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
