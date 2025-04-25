import { t } from 'elysia';
import { FollowsTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { sql } from 'drizzle-orm';

export const FollowBody = t.Object({
    hash: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

const statementAddFollower = getDatabase()
    .insert(FollowsTable)
    .values({
        follower: sql.placeholder('follower'),
        following: sql.placeholder('following'),
        hash: sql.placeholder('hash'),
    })
    .prepare('stmnt_add_follower');

export async function Follow(body: typeof FollowBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const [following_address] = extractMemoContent(body.memo, 'dither.Follow');
    if (!following_address) {
        return { status: 400, error: 'memo must contain a follow address for dither.Follow' };
    }

    try {
        await statementAddFollower.execute({
            follower: msgTransfer.from_address,
            following: following_address,
            hash: body.hash,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to add follow, follow likely already exists' };
    }
}
