import { t } from 'elysia';
import { UsersTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { eq, sql } from 'drizzle-orm';

export const UnfollowBody = t.Object({
    address: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

export async function Unfollow(body: typeof UnfollowBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const [follow_hash] = extractMemoContent(body.memo, 'dither.Unfollow');
    if (!follow_hash) {
        return { status: 400, error: 'memo must contain a follow hash for dither.Unfollow' };
    }

    try {
        // Remove the following from the executor
        await db
            .update(UsersTable)
            .set({
                following: sql`(
                    SELECT coalesce(jsonb_agg(author), '[]'::jsonb)
                    FROM jsonb_array_elements(${UsersTable.following}) AS author
                    WHERE NOT (author->>'address' LIKE ${follow_hash} || '%')
                )`,
            })
            .where(eq(UsersTable.address, msgTransfer.from_address));

        // Remove the executor from the target
        await db
            .update(UsersTable)
            .set({
                followers: sql`(
                    SELECT coalesce(jsonb_agg(author), '[]'::jsonb)
                    FROM jsonb_array_elements(${UsersTable.followers}) AS author
                    WHERE NOT (author->>'address' LIKE ${msgTransfer.from_address} || '%')
                )`,
            })
            .where(eq(UsersTable.address, follow_hash));

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to unfollow user, user may not exist' };
    }
}
