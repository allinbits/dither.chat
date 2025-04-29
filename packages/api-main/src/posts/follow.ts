import { t } from 'elysia';
import { FollowsTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { sql } from 'drizzle-orm';

export const FollowBody = t.Object({
    hash: t.String(),
    from: t.String(),
    address: t.String(),
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
    try {
        await statementAddFollower.execute({
            follower: body.from,
            following: body.address,
            hash: body.hash,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to add follow, follow likely already exists' };
    }
}
