import { t } from 'elysia';
import { UsersTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { sql, eq } from 'drizzle-orm';

export const FollowBody = t.Object({
    hash: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

export async function hasAddress(address: string, type: 'followers' | 'following') {
    const results = await db
        .select()
        .from(UsersTable)
        .where(
            sql`EXISTS (
            SELECT 1
            FROM jsonb_array_elements(${UsersTable[type]}) AS element
            WHERE (element->>'address') LIKE ${address} || '%'
        )`
    );

    return results.length >= 1;
}

export async function Follow(body: typeof FollowBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const [follow_hash] = extractMemoContent(body.memo, 'dither.Follow');
    if (!follow_hash) {
        return { status: 400, error: 'memo must contain a follow address for dither.Follow' };
    }

    const followerUser = { hash: body.hash, address: msgTransfer.from_address };
    const followingUser = { hash: body.hash, address: follow_hash };

    try {
        // Handle adding the user to follow to the exector
        const fromUserExists = await db
            .select()
            .from(UsersTable)
            .where(eq(UsersTable.address, msgTransfer.from_address));

        if (fromUserExists.length <= 0) {
            await db.insert(UsersTable).values({
                address: msgTransfer.from_address,
                followers: [],
                following: [followingUser],
            });
        } else {
            const isFollowingAlready = await hasAddress(followingUser.address, 'following');

            if (!isFollowingAlready) {
                await db
                    .update(UsersTable)
                    .set({ following: sql`${UsersTable.following} || ${followingUser}::jsonb` })
                    .where(eq(UsersTable.address, msgTransfer.from_address));
            }
        }

        // Handle adding the exector to the user they want to follow
        const followerUserExists = await db
            .select()
            .from(UsersTable)
            .where(eq(UsersTable.address, followingUser.address));

        if (followerUserExists.length <= 0) {
            await db.insert(UsersTable).values({
                address: followingUser.address,
                followers: [followerUser],
                following: [],
            });
        } else {
            const isFollowingAlready = await hasAddress(followerUser.address, 'followers');

            if (!isFollowingAlready) {
                await db
                    .update(UsersTable)
                    .set({ followers: sql`${UsersTable.followers} || ${followerUser}::jsonb` })
                    .where(eq(UsersTable.address, followingUser.address));
            }
        }

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
